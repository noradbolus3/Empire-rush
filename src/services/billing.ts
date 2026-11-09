import { Platform } from 'react-native';
import { PRODUCT_IDS, ProductId } from '../config/monetization';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IapModule = any;
let mod: IapModule | null | undefined;
let connected = false;

function iap(): IapModule | null {
  if (mod === undefined) {
    try { mod = require('react-native-iap') as IapModule; } catch { mod = null; }
  }
  return mod;
}
const isKnown = (id: string): id is ProductId => (PRODUCT_IDS as readonly string[]).includes(id);

export async function connectBilling(): Promise<boolean> {
  const m = iap();
  if (!m) return false;
  if (connected) return true;
  try { connected = Boolean(await m.initConnection()); } catch { connected = false; }
  return connected;
}

/** Localized prices straight from Google Play (null entries = product not available). */
export async function loadPrices(): Promise<Partial<Record<ProductId, string>>> {
  const m = iap();
  if (!m || !(await connectBilling())) return {};
  try {
    const products = await m.fetchProducts({ skus: [...PRODUCT_IDS], type: 'in-app' });
    const out: Partial<Record<ProductId, string>> = {};
    for (const p of (products ?? []) as Array<{ id: string; displayPrice: string }>) if (isKnown(p.id)) out[p.id] = p.displayPrice;
    return out;
  } catch { return {}; }
}

/** Listen for completed purchases; grants entitlement first, then acknowledges the purchase with Google Play. */
export function startPurchaseListeners(onGrant: (id: ProductId) => void, onMessage: (message: string) => void): () => void {
  const m = iap();
  if (!m) return () => undefined;
  const updated = m.purchaseUpdatedListener(async (purchase: any) => {
    const id = purchase.productId;
    if (!isKnown(id)) return;
    if (purchase.purchaseState === 'pending') { onMessage('Your purchase is pending. The reward unlocks once Google Play confirms payment.'); return; }
    if (purchase.purchaseState !== 'purchased') return;
    onGrant(id);
    try { await m.finishTransaction({ purchase, isConsumable: false }); } catch { /* retried on next restore */ }
    onMessage('Purchase complete. Thank you for supporting BuildBoss!');
  });
  const failed = m.purchaseErrorListener((error: unknown) => {
    const code = String((error as { code?: string }).code ?? '').toLowerCase();
    if (code.includes('cancel')) return;
    onMessage('Purchase not completed. You were not charged. Please try again.');
  });
  return () => { updated.remove(); failed.remove(); };
}

export async function startPurchase(id: ProductId): Promise<'started' | 'cancelled' | 'failed'> {
  const m = iap();
  if (!m || !(await connectBilling())) return 'failed';
  try {
    await m.requestPurchase({ request: Platform.OS === 'ios' ? { apple: { sku: id } } : { google: { skus: [id] } }, type: 'in-app' });
    return 'started' as const;
  } catch (error) {
    const code = String((error as { code?: string })?.code ?? '').toLowerCase();
    if (code.includes('cancel')) return 'cancelled' as const;
    return 'failed' as const;
  }
}

/** Re-applies (and acknowledges) everything the player already owns on Google Play. Returns restored IDs. */
export async function restorePurchases(onGrant: (id: ProductId) => void): Promise<ProductId[] | null> {
  const m = iap();
  if (!m || !(await connectBilling())) return null;
  const restored: ProductId[] = [];
  try {
    const owned = await m.getAvailablePurchases();
    for (const purchase of owned ?? []) {
      if (!isKnown(purchase.productId) || purchase.purchaseState !== 'purchased') continue;
      onGrant(purchase.productId);
      restored.push(purchase.productId);
      const ack = (purchase as { isAcknowledgedAndroid?: boolean | null }).isAcknowledgedAndroid;
      if (ack === false) { try { await m.finishTransaction({ purchase, isConsumable: false }); } catch { /* retry next launch */ } }
    }
  } catch { return null; /* offline or Play unavailable */ }
  return restored;
}
