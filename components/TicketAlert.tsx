'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type WakeLockSentinel = { release: () => Promise<void> } | null;

export default function TicketAlert({
  positionId,
  lineId,
  initialStatus
}: {
  positionId: string;
  lineId: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const lastStatusRef = useRef(initialStatus);
  const wakeLockRef = useRef<WakeLockSentinel>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [armed, setArmed] = useState(false);
  const [flash, setFlash] = useState(false);
  const [pushState, setPushState] = useState<
    'idle' | 'subscribing' | 'subscribed' | 'denied' | 'unsupported'
  >('idle');
  const [wakeState, setWakeState] = useState<
    'inactive' | 'active' | 'unsupported' | 'failed'
  >('inactive');

  // Prime audio context on first tap (required by mobile browsers).
  const arm = () => {
    if (armed) return;
    try {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new Ctor();
      // Play an inaudible blip so the context is unlocked.
      const ctx = audioCtxRef.current!;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      g.gain.value = 0.0001;
      osc.connect(g).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.01);
    } catch {}
    setArmed(true);
    try {
      sessionStorage.setItem('ticketAlertArmed', '1');
    } catch {}
  };

  useEffect(() => {
    try {
      if (sessionStorage.getItem('ticketAlertArmed') === '1') setArmed(true);
    } catch {}
  }, []);

  // Detect existing push subscription on mount
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      setPushState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setPushState('denied');
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (sub) setPushState('subscribed');
      })
      .catch(() => {});
  }, []);

  const subscribePush = async () => {
    if (
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    ) {
      console.warn('[TicketAlert] push not supported on this browser');
      setPushState('unsupported');
      return;
    }
    // Ask for permission FIRST, while the user gesture is still active.
    // Awaiting service-worker setup before this consumes the gesture and
    // Chrome silently swallows the prompt.
    let permission: NotificationPermission;
    try {
      permission = await Notification.requestPermission();
    } catch (e) {
      console.error('[TicketAlert] requestPermission threw', e);
      setPushState('idle');
      return;
    }
    console.log('[TicketAlert] permission =', permission);
    if (permission === 'denied') {
      setPushState('denied');
      return;
    }
    if (permission !== 'granted') {
      setPushState('idle');
      return;
    }

    setPushState('subscribing');
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          ) as BufferSource
        });
      }
      const json = sub.toJSON();
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ positionId, subscription: json })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`subscribe failed: ${res.status} ${text}`);
      }
      console.log('[TicketAlert] subscription stored');
      setPushState('subscribed');
    } catch (e) {
      console.error('[TicketAlert] subscribe error', e);
      setPushState('idle');
    }
  };

  // Screen wake lock — best-effort, re-acquire on visibility return.
  // Wake Lock requires a user gesture on some browsers, so we expose a
  // manual button too. Falls back to a silent looping video for browsers
  // that don't support the Wake Lock API.
  const acquireWakeLock = async () => {
    if (!('wakeLock' in navigator)) {
      setWakeState('unsupported');
      return;
    }
    try {
      const sentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockRef.current = sentinel as any;
      sentinel.addEventListener?.('release', () => {
        console.log('[TicketAlert] wake lock released by system');
        setWakeState('inactive');
        wakeLockRef.current = null;
      });
      console.log('[TicketAlert] wake lock acquired');
      setWakeState('active');
    } catch (e) {
      console.warn('[TicketAlert] wake lock request failed', e);
      setWakeState('failed');
    }
  };

  useEffect(() => {
    void acquireWakeLock();
    const onVis = () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        void acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime subscription. We listen to all position changes on this line
  // (single handler, since stacking multiple postgres_changes filters on the
  // same channel is unreliable in some realtime client versions).
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`ticket:${positionId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'positions',
          filter: `line_id=eq.${lineId}`
        },
        (payload: any) => {
          const row = payload?.new || payload?.old;
          if (row && String(row.id) === String(positionId)) {
            const newStatus = payload?.new?.status;
            if (newStatus === 'called' && lastStatusRef.current !== 'called') {
              fireAlert(audioCtxRef.current);
              setFlash(true);
              window.setTimeout(() => setFlash(false), 6000);
            }
            if (newStatus) lastStatusRef.current = newStatus;
          }
          router.refresh();
        }
      )
      .subscribe();

    // Defense-in-depth: poll every 8s in case realtime drops.
    const pollId = window.setInterval(() => router.refresh(), 8000);

    return () => {
      window.clearInterval(pollId);
      supabase.removeChannel(channel);
    };
  }, [positionId, lineId, router]);

  const showArm = !armed;
  const showPush =
    armed &&
    pushState !== 'subscribed' &&
    pushState !== 'denied' &&
    pushState !== 'unsupported';

  const onClick = () => {
    if (!armed) {
      arm();
      // Try to subscribe push immediately while we have the user gesture.
      void subscribePush();
      return;
    }
    void subscribePush();
  };

  const label = showArm
    ? '🔔 Enable alerts'
    : pushState === 'subscribing'
      ? 'Subscribing…'
      : '🔔 Notify on lock screen';

  const wakeBadgeLabel =
    wakeState === 'active'
      ? '● Screen will stay on'
      : wakeState === 'failed'
        ? '⚠ Tap to keep screen on'
        : wakeState === 'unsupported'
          ? '⚠ Auto-lock will happen on this browser'
          : null;

  return (
    <>
      {wakeBadgeLabel && (
        <button
          type="button"
          onClick={() => void acquireWakeLock()}
          disabled={wakeState === 'active' || wakeState === 'unsupported'}
          className="pq-mono"
          style={{
            position: 'fixed',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 55,
            padding: '6px 12px',
            borderRadius: 999,
            border:
              wakeState === 'active'
                ? '1px solid oklch(0.88 0.19 125 / 0.4)'
                : '1px solid var(--pq-border-strong)',
            background:
              wakeState === 'active'
                ? 'oklch(0.88 0.19 125 / 0.08)'
                : 'rgba(0,0,0,0.55)',
            color:
              wakeState === 'active' ? 'var(--pq-accent)' : 'var(--pq-ink-2)',
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            cursor:
              wakeState === 'active' || wakeState === 'unsupported'
                ? 'default'
                : 'pointer',
            backdropFilter: 'blur(8px)'
          }}
        >
          {wakeBadgeLabel}
        </button>
      )}
      {(showArm || showPush) && (
        <button
          type="button"
          onClick={onClick}
          disabled={pushState === 'subscribing'}
          className="pq-mono"
          style={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            padding: '10px 18px',
            borderRadius: 999,
            border: '1px solid oklch(0.88 0.19 125 / 0.55)',
            background: 'oklch(0.88 0.19 125 / 0.10)',
            color: 'var(--pq-accent)',
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            cursor: pushState === 'subscribing' ? 'wait' : 'pointer',
            boxShadow: '0 6px 24px rgba(0,0,0,0.45)'
          }}
        >
          {label}
        </button>
      )}
      {flash && <CalledFlash />}
    </>
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function CalledFlash() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        pointerEvents: 'none',
        animation: 'pq-flash 6s ease-out forwards',
        background:
          'radial-gradient(800px 600px at 50% 40%, oklch(0.88 0.19 125 / 0.55), transparent 70%)'
      }}
    >
      <style>{`
        @keyframes pq-flash {
          0% { opacity: 0; }
          10% { opacity: 1; }
          40% { opacity: 0.7; }
          70% { opacity: 0.35; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function fireAlert(ctx: AudioContext | null) {
  // Vibration — Android only; iOS Safari ignores.
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 120, 300, 120, 600, 120, 300]);
    }
  } catch {}

  // Audio chime — uses the AudioContext that was unlocked during arm().
  try {
    const audioCtx =
      ctx ||
      new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const tones = [
      { freq: 880, start: 0, duration: 0.22 },
      { freq: 1320, start: 0.24, duration: 0.22 },
      { freq: 880, start: 0.5, duration: 0.22 },
      { freq: 1320, start: 0.72, duration: 0.4 }
    ];
    tones.forEach(({ freq, start, duration }) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.45, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + start + duration
      );
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.05);
    });
  } catch {}
}
