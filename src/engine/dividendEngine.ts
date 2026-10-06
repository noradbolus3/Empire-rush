import { Asset, Holding } from '../types/marketAsset';
import { TradeRecord } from '../types/market';

export type DividendPayment = {
  id: string;
  assetId: string;
  symbol: string;
  name: string;
  shares: number;
  perShare: number;
  amount: number;
  quarter: string;
  paymentAt: number;
};

export function dividendQuarter(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getUTCFullYear()}-Q${Math.floor(date.getUTCMonth() / 3) + 1}`;
}

export function dividendPerShare(asset: Pick<Asset, 'price' | 'dividend' | 'kind'>): number {
  if (asset.kind !== 'STOCK' || !Number.isFinite(asset.dividend) || asset.dividend <= 0) return 0;
  return Number((asset.price * (asset.dividend / 100) / 4).toFixed(6));
}

export function processQuarterlyDividends(
  assets: Asset[],
  holdings: Record<string, Holding>,
  lastPaidQuarter: string | undefined,
  now: number,
): { quarter: string; payout: number; payments: DividendPayment[]; records: TradeRecord[] } {
  const quarter = dividendQuarter(now);
  if (!lastPaidQuarter || lastPaidQuarter === quarter) return { quarter, payout: 0, payments: [], records: [] };
  const payments = assets.flatMap(asset => {
    const shares = Math.max(0, Number(holdings[asset.id]?.shares || 0));
    const perShare = dividendPerShare(asset);
    if (shares <= 0 || perShare <= 0) return [];
    const amount = Number((shares * perShare).toFixed(2));
    return [{ id: `dividend-${quarter}-${asset.id}`, assetId: asset.id, symbol: asset.symbol, name: asset.name, shares, perShare, amount, quarter, paymentAt: now }];
  });
  const records: TradeRecord[] = payments.map(payment => ({
    id: payment.id,
    assetId: payment.assetId,
    symbol: payment.symbol,
    name: payment.name,
    side: 'BUY',
    quantity: payment.shares,
    price: payment.perShare,
    notional: payment.amount,
    realizedPnl: payment.amount,
    timestamp: now,
    source: 'MARKET',
    transactionType: 'DIVIDEND',
  }));
  return { quarter, payout: Number(payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)), payments, records };
}
