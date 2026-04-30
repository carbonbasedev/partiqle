/**
 * One-shot backfill: pulls every active product + price from Stripe and
 * upserts them into Supabase via the same helpers the webhook uses.
 *
 * Run:
 *   npx tsx scripts/backfill-stripe.ts
 *
 * Required env (loaded from .env.local automatically):
 *   STRIPE_SECRET_KEY (or STRIPE_SECRET_KEY_LIVE)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import fs from 'fs';
import path from 'path';

for (const file of ['.env.local', '.env']) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m) continue;
    const [, key, raw] = m;
    if (process.env[key]) continue;
    let v = raw;
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    process.env[key] = v;
  }
}

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import type { Database, Tables } from '../types_db';

type Product = Tables<'products'>;
type Price = Tables<'prices'>;

const TRIAL_PERIOD_DAYS = 0;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

const stripeKey =
  process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('Missing STRIPE_SECRET_KEY (or STRIPE_SECRET_KEY_LIVE)');
  process.exit(1);
}

const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

const stripe = new Stripe(stripeKey, {
  // @ts-ignore — match the project's config
  apiVersion: null
});

const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey);

async function upsertProduct(product: Stripe.Product) {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata
  };
  const { error } = await supabaseAdmin.from('products').upsert([productData]);
  if (error) throw new Error(`Product upsert failed (${product.id}): ${error.message}`);
  console.log(`  product upserted: ${product.id} — ${product.name}`);
}

async function upsertPrice(price: Stripe.Price) {
  const priceData: Price = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    description: '',
    metadata: '',
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? TRIAL_PERIOD_DAYS
  };
  const { error } = await supabaseAdmin.from('prices').upsert([priceData]);
  if (error) throw new Error(`Price upsert failed (${price.id}): ${error.message}`);
  console.log(
    `    price upserted: ${price.id} — ${price.unit_amount ?? '–'} ${price.currency}` +
      (price.recurring ? ` / ${price.recurring.interval}` : '')
  );
}

async function main() {
  console.log('Backfilling Stripe → Supabase (active products + prices)…\n');

  let productCount = 0;
  let priceCount = 0;

  for await (const product of stripe.products.list({ active: true, limit: 100 })) {
    productCount++;
    await upsertProduct(product);

    for await (const price of stripe.prices.list({
      product: product.id,
      active: true,
      limit: 100
    })) {
      priceCount++;
      await upsertPrice(price);
    }
  }

  console.log(`\nDone. Upserted ${productCount} products, ${priceCount} prices.`);
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
