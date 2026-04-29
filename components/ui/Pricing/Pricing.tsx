'use client';

import Button from '@/components/ui/Button';
import type { Tables } from '@/types_db';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import { User } from '@supabase/supabase-js';
import cn from 'classnames';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = 'lifetime' | 'year' | 'month';

function QueueHeroGraphic() {
  // Abstract: concentric arcs + flowing dots, representing the queue
  return (
    <svg
      viewBox="0 0 600 300"
      className="w-full h-full"
      aria-hidden="true"
      style={{ maxHeight: 280 }}
    >
      <defs>
        <linearGradient id="pq-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="oklch(0.88 0.19 125)" stopOpacity="0" />
          <stop offset="40%" stopColor="oklch(0.88 0.19 125)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="oklch(0.88 0.19 125)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="pq-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="oklch(0.88 0.19 125)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="oklch(0.88 0.19 125)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Concentric arcs pulsing out from the "now-serving" point */}
      <circle cx="520" cy="150" r="110" fill="url(#pq-glow)" />
      {[40, 80, 130, 185, 245].map((r, i) => (
        <circle
          key={r}
          cx="520"
          cy="150"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}
      {/* The queue flow line */}
      <line
        x1="40"
        y1="150"
        x2="520"
        y2="150"
        stroke="url(#pq-fade)"
        strokeWidth="1"
      />
      {/* Dots representing people in queue, moving toward the node */}
      {[60, 120, 180, 240, 310, 390, 460].map((x, i) => (
        <g key={x}>
          <circle
            cx={x}
            cy="150"
            r={i === 6 ? 6 : 3.5}
            fill={i === 6 ? 'oklch(0.88 0.19 125)' : 'rgba(255,255,255,0.55)'}
          />
          <text
            x={x}
            y="175"
            textAnchor="middle"
            fill="rgba(255,255,255,0.35)"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
            letterSpacing="0.1em"
          >
            {String(i + 1).padStart(2, '0')}
          </text>
        </g>
      ))}
      {/* Now-serving big dot */}
      <circle cx="520" cy="150" r="10" fill="oklch(0.88 0.19 125)" />
      <circle
        cx="520"
        cy="150"
        r="16"
        fill="none"
        stroke="oklch(0.88 0.19 125)"
        strokeOpacity="0.45"
      />
      <text
        x="520"
        y="110"
        textAnchor="middle"
        fill="oklch(0.88 0.19 125)"
        fontSize="9"
        fontFamily="JetBrains Mono, monospace"
        letterSpacing="0.16em"
      >
        NOW SERVING
      </text>
    </svg>
  );
}

export default function Pricing({ user, products, subscription }: Props) {
  const intervals = Array.from(
    new Set(
      products.flatMap((product) =>
        product?.prices?.map((price) => price?.interval)
      )
    )
  );
  const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signin/signup');
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  return (
    <section>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pq-grid-bg pointer-events-none" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-24 pb-12 relative">
          <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 items-center">
            <div className="pq-fade-up min-w-0">
              <div className="pq-eyebrow mb-5">Virtual queue infrastructure</div>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl"
                style={{
                  fontWeight: 600,
                  letterSpacing: '-0.035em',
                  lineHeight: 1.02,
                  color: 'var(--pq-ink-0)'
                }}
              >
                Restore time.
                <br />
                <span style={{ color: 'var(--pq-ink-2)' }}>
                  Replace the line.
                </span>
              </h1>
              <p
                className="mt-6 max-w-md"
                style={{ color: 'var(--pq-ink-2)', fontSize: 16, lineHeight: 1.6 }}
              >
                Partiqle turns waiting rooms, lobbies, and street queues into a
                ticket on your customer&apos;s phone. Call the next in line with one
                tap.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#plans" className="pq-btn pq-btn-primary">
                  Start free
                  <span aria-hidden>→</span>
                </a>
                <a href="#how" className="pq-btn pq-btn-ghost">
                  See how it works
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-6 pq-mono" style={{ color: 'var(--pq-ink-3)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                <span>01 · Scan QR</span>
                <span>02 · Wait off-site</span>
                <span>03 · Get called</span>
              </div>
            </div>
            <div className="pq-fade-up" style={{ animationDelay: '120ms' }}>
              <div
                className="pq-card relative p-4"
                style={{ aspectRatio: '5 / 3' }}
              >
                <QueueHeroGraphic />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div id="plans" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 flex-wrap gap-4">
          <div className="min-w-0">
            <div className="pq-eyebrow mb-3">Pricing</div>
            <h2
              className="break-words"
              style={{
                fontSize: 'clamp(24px, 5vw, 32px)',
                fontWeight: 600,
                letterSpacing: '-0.025em',
                color: 'var(--pq-ink-0)'
              }}
            >
              Simple plans. No per-seat math.
            </h2>
          </div>
          {products.length > 0 && (
            <div
              className="relative inline-flex p-1 rounded-lg"
              style={{
                background: 'var(--pq-surface-1)',
                border: '1px solid var(--pq-border)'
              }}
            >
              {intervals.includes('month') && (
                <button
                  onClick={() => setBillingInterval('month')}
                  type="button"
                  className="px-4 py-1.5 rounded-md transition-all pq-mono"
                  style={{
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    background:
                      billingInterval === 'month' ? 'var(--pq-surface-3)' : 'transparent',
                    color:
                      billingInterval === 'month'
                        ? 'var(--pq-ink-0)'
                        : 'var(--pq-ink-2)'
                  }}
                >
                  Monthly
                </button>
              )}
              {intervals.includes('year') && (
                <button
                  onClick={() => setBillingInterval('year')}
                  type="button"
                  className="px-4 py-1.5 rounded-md transition-all pq-mono"
                  style={{
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    background:
                      billingInterval === 'year' ? 'var(--pq-surface-3)' : 'transparent',
                    color:
                      billingInterval === 'year'
                        ? 'var(--pq-ink-0)'
                        : 'var(--pq-ink-2)'
                  }}
                >
                  Yearly
                </button>
              )}
            </div>
          )}
        </div>

        {!products.length ? (
          <div
            className="pq-card p-8 text-center"
            style={{ color: 'var(--pq-ink-1)' }}
          >
            <div className="pq-eyebrow mb-3" style={{ justifyContent: 'center' }}>
              Setup required
            </div>
            <p style={{ fontSize: 18 }}>
              No pricing plans found. Create them in your{' '}
              <a
                style={{
                  color: 'var(--pq-accent)',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3
                }}
                href="https://dashboard.stripe.com/products"
                rel="noopener noreferrer"
                target="_blank"
              >
                Stripe Dashboard
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {products.map((product, idx) => {
              const price = product?.prices?.find(
                (price) => price.interval === billingInterval
              );
              if (!price) return null;
              const priceString = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: price.currency!,
                minimumFractionDigits: 0
              }).format((price?.unit_amount || 0) / 100);
              const isActive = subscription
                ? product.name === subscription?.prices?.products?.name
                : product.name === 'Freelancer';
              return (
                <div
                  key={product.id}
                  className={cn('pq-card pq-card-hover relative p-6 flex flex-col')}
                  style={
                    isActive
                      ? {
                          borderColor: 'var(--pq-accent)',
                          boxShadow:
                            '0 0 0 1px var(--pq-accent), 0 20px 60px -20px oklch(0.88 0.19 125 / 0.25)'
                        }
                      : undefined
                  }
                >
                  {isActive && (
                    <div
                      className="absolute top-4 right-4 pq-chip pq-chip-live"
                      style={{ fontSize: 10 }}
                    >
                      Current
                    </div>
                  )}
                  <div className="pq-eyebrow mb-4">
                    Plan · {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: 'var(--pq-ink-0)',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {product.name}
                  </h3>
                  {product.description && (
                    <p
                      className="mt-2 min-h-[48px]"
                      style={{ color: 'var(--pq-ink-2)', fontSize: 14, lineHeight: 1.55 }}
                    >
                      {product.description}
                    </p>
                  )}
                  <div className="mt-6 flex items-baseline gap-2">
                    <span
                      className="pq-ticket-number"
                      style={{
                        fontSize: 48,
                        color: 'var(--pq-ink-0)'
                      }}
                    >
                      {priceString}
                    </span>
                    <span
                      className="pq-mono"
                      style={{ color: 'var(--pq-ink-3)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                    >
                      /{billingInterval}
                    </span>
                  </div>
                  <div className="pq-divider my-6" />
                  <Button
                    variant="slim"
                    type="button"
                    loading={priceIdLoading === price.id}
                    onClick={() => handleStripeCheckout(price)}
                    className={cn(
                      'w-full',
                      isActive ? '' : ''
                    )}
                    style={
                      isActive
                        ? {
                            background: 'var(--pq-accent)',
                            color: 'var(--pq-accent-ink)',
                            borderColor: 'transparent',
                            fontWeight: 600
                          }
                        : undefined
                    }
                  >
                    {subscription ? 'Manage' : 'Subscribe'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How it works */}
      <div id="how" className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="pq-eyebrow mb-4">How it works</div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              k: '01',
              t: 'Create a line',
              d: 'Spin up a virtual queue for any counter, service, or check-in point in seconds.'
            },
            {
              k: '02',
              t: 'Share the QR',
              d: 'Customers scan, enter a name, and get a live position — no apps, no account.'
            },
            {
              k: '03',
              t: 'Call the next',
              d: 'One tap serves the next person. They see their ticket update instantly.'
            }
          ].map((step) => (
            <div key={step.k} className="pq-card p-6">
              <div className="pq-mono" style={{ color: 'var(--pq-accent)', fontSize: 11, letterSpacing: '0.16em' }}>
                {step.k}
              </div>
              <h4
                className="mt-4"
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--pq-ink-0)',
                  letterSpacing: '-0.015em'
                }}
              >
                {step.t}
              </h4>
              <p className="mt-2" style={{ color: 'var(--pq-ink-2)', fontSize: 14, lineHeight: 1.55 }}>
                {step.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
