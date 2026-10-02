import { Asset, Holding } from '../types/marketAsset';
import { LimitOrderSide } from '../types/market';
import { buyHolding, sellHolding } from './portfolioEngine';

export const TRADE_QUANTITY_PRESETS = [1, 10, 100] as const;
export const LARGE_ORDER_CASH_RATIO = 0.5;

export function isDuplicateTrade(last: { assetId: string; side: LimitOrderSide; quantity: number; at: number } | undefined, assetId: string, side: LimitOrderSide, quantity: number, now: number, windowMs = 500): boolean {
  return Boolean(last && last.assetId === assetId && last.side === side && last.quantity === quantity && now - last.at < windowMs);
}

export function normalizeTradeQuantity(asset: Asset, quantity: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0) return 0;
  return asset.kind === 'CRYPTO' ? Number(quantity.toFixed(8)) : Math.floor(quantity);
}

export function quantityFromCashPercent(asset: Asset, cash: number, percent: 0.25 | 0.5 | 0.75 | 1): number {
  const budget = Math.max(0, cash) * percent;
  let quantity = normalizeTradeQuantity(asset, budget / Math.max(asset.price, 0.00000001));
  for (let attempt = 0; attempt < 1_000 && quantity > 0 && executionPrice(asset, 'BUY', quantity) * quantity > budget; attempt += 1) {
    quantity = normalizeTradeQuantity(asset, asset.kind === 'CRYPTO' ? quantity * 0.9995 : quantity - 1);
  }
  return quantity;
}

export function quantityFromHoldingPercent(asset: Asset, holding: Holding | undefined, percent: 0.25 | 0.5 | 0.75 | 1): number {
  return normalizeTradeQuantity(asset, Math.max(0, holding?.shares || 0) * percent);
}

export function estimatePriceImpact(asset: Asset, quantity: number): number {
  const normalized = normalizeTradeQuantity(asset, quantity);
  const threshold = asset.kind === 'CRYPTO' ? 5 : 100;
  if (normalized <= threshold) return 0;
  const depth = asset.kind === 'CRYPTO' ? 250 : Math.max(1000, asset.maxShares ? asset.maxShares * 0.05 : 10000);
  return Math.min(0.03, ((normalized - threshold) / depth) * 0.04);
}

export function executionPrice(asset: Asset, side: LimitOrderSide, quantity: number): number {
  const impact = estimatePriceImpact(asset, quantity);
  const direction = side === 'BUY' ? 1 : -1;
  return Number(Math.max(asset.kind === 'CRYPTO' ? 0.01 : 0.01, asset.price * (1 + direction * impact)).toFixed(8));
}

export type TradePreview = {
  side: LimitOrderSide;
  quantity: number;
  price: number;
  total: number;
  cashAfter: number;
  expectedPnl: number;
  priceImpactPct: number;
  valid: boolean;
  reason?: string;
};

export function previewTrade(asset: Asset, side: LimitOrderSide, quantity: number, cash: number, holding?: Holding): TradePreview {
  const safeQuantity = normalizeTradeQuantity(asset, quantity);
  const price = executionPrice(asset, side, safeQuantity);
  const total = Number((price * safeQuantity).toFixed(2));
  const cashAfter = side === 'BUY' ? Number((cash - total).toFixed(2)) : Number((cash + total).toFixed(2));
  const expectedPnl = side === 'SELL' && holding ? Number(((price - holding.avgPrice) * safeQuantity).toFixed(2)) : 0;
  const valid = safeQuantity > 0 && (side === 'BUY' ? cash >= total && cashAfter >= 0 : Boolean(holding && holding.shares >= safeQuantity));
  return { side, quantity: safeQuantity, price, total, cashAfter, expectedPnl, priceImpactPct: estimatePriceImpact(asset, safeQuantity) * 100, valid, reason: safeQuantity <= 0 ? 'Choose a positive quantity.' : side === 'BUY' && cash < total ? 'Not enough available cash.' : side === 'SELL' && (!holding || holding.shares < safeQuantity) ? 'You do not hold enough units.' : undefined };
}

export function applyTrade(asset: Asset, side: LimitOrderSide, quantity: number, cash: number, holding?: Holding): { cash: number; holding: Holding; realizedPnl: number; price: number; total: number } | null {
  const preview = previewTrade(asset, side, quantity, cash, holding);
  if (!preview.valid) return null;
  if (side === 'BUY') return { cash: Math.max(0, Number((cash - preview.total).toFixed(2))), holding: buyHolding(holding, preview.quantity, preview.price), realizedPnl: 0, price: preview.price, total: preview.total };
  const sold = sellHolding(holding!, preview.quantity, preview.price);
  return { cash: Math.max(0, Number((cash + preview.total).toFixed(2))), holding: sold.holding, realizedPnl: sold.realizedPnl, price: preview.price, total: preview.total };
}
