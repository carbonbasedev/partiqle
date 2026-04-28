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
      setPushState('unsupported');
      return;
    }
    setPushState('subscribing');
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushState(permission === 'denied' ? 'denied' : 'idle');
        return;
      }
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
      if (!res.ok) throw new Error('subscribe failed');
      setPushState('subscribed');
    } catch (e) {
      setPushState('idle');
    }
  };

  // Screen wake lock — best-effort, re-acquire on visibility return.
  useEffect(() => {
    const acquire = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request(
            'screen'
          );
        }
      } catch {}
    };
    acquire();
    const onVis = () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        acquire();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, []);

  // Realtime subscription for this ticket + the line as a whole.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`ticket:${positionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'positions',
          filter: `id=eq.${positionId}`
        },
        (payload: any) => {
          const newStatus = payload?.new?.status;
          if (
            newStatus === 'called' &&
            lastStatusRef.current !== 'called'
          ) {
            fireAlert(audioCtxRef.current);
            setFlash(true);
            window.setTimeout(() => setFlash(false), 6000);
          }
          if (newStatus) lastStatusRef.current = newStatus;
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'positions',
          filter: `line_id=eq.${lineId}`
        },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lines',
          filter: `id=eq.${lineId}`
        },
        () => router.refresh()
      )
      .subscribe();
    return () => {
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

  return (
    <>
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
