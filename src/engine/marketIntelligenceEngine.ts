import { Asset } from '../types/marketAsset';
import { AlertEvaluation, PriceAlert, TechnicalSnapshot } from '../types/marketIntelligence';

const finite = (value: number | null): number | null => value !== null && Number.isFinite(value) ? Number(value.toFixed(4)) : null;

export function simpleMovingAverage(values: number[], period: number): number | null {
  if (values.length < period || period <= 0) return null;
  return finite(values.slice(-period).reduce((sum, value) => sum + value, 0) / period);
}

export function exponentialMovingAverage(values: number[], period: number): number | null {
  if (values.length < period || period <= 0) return null;
  const multiplier = 2 / (period + 1);
  let ema = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  for (const value of values.slice(period)) ema = (value - ema) * multiplier + ema;
  return finite(ema);
}

export function relativeStrengthIndex(values: number[], period = 14): number | null {
  if (values.length <= period || period <= 0) return null;
  const changes = values.slice(1).map((value, index) => value - values[index]);
  let gains = changes.slice(0, period).filter(change => change > 0).reduce((sum, change) => sum + change, 0) / period;
  let losses = changes.slice(0, period).filter(change => change < 0).reduce((sum, change) => sum - change, 0) / period;
  for (const change of changes.slice(period)) {
    gains = (gains * (period - 1) + Math.max(0, change)) / period;
    losses = (losses * (period - 1) + Math.max(0, -change)) / period;
  }
  if (losses === 0) return 100;
  return finite(100 - 100 / (1 + gains / losses));
}

export function bollingerBands(values: number[], period = 20, deviations = 2): { upper: number | null; lower: number | null } {
  if (values.length < period) return { upper: null, lower: null };
  const window = values.slice(-period);
  const mean = window.reduce((sum, value) => sum + value, 0) / period;
  const variance = window.reduce((sum, value) => sum + (value - mean) ** 2, 0) / period;
  const spread = Math.sqrt(variance) * deviations;
  return { upper: finite(mean + spread), lower: finite(mean - spread) };
}

export function technicalSnapshot(values: number[]): TechnicalSnapshot {
  const sma20 = simpleMovingAverage(values, 20);
  const ema12 = exponentialMovingAverage(values, 12);
  const ema26 = exponentialMovingAverage(values, 26);
  const macd = ema12 !== null && ema26 !== null ? Number((ema12 - ema26).toFixed(4)) : null;
  const macdSeries: number[] = [];
  for (let index = 0; index < values.length; index += 1) {
    const prefix = values.slice(0, index + 1);
    const fast = exponentialMovingAverage(prefix, 12);
    const slow = exponentialMovingAverage(prefix, 26);
    if (fast !== null && slow !== null) macdSeries.push(fast - slow);
  }
  const signal9 = exponentialMovingAverage(macdSeries, 9);
  const histogram = macd !== null && signal9 !== null ? Number((macd - signal9).toFixed(4)) : null;
  const bands = bollingerBands(values);
  const last = values[values.length - 1];
  const trend = ema12 !== null && ema26 !== null ? ema12 > ema26 ? 'UPTREND' : ema12 < ema26 ? 'DOWNTREND' : 'RANGE' : 'RANGE';
  return { sma20, ema12, ema26, rsi14: relativeStrengthIndex(values), macd, signal9, histogram, bollingerUpper: bands.upper, bollingerLower: bands.lower, trend };
}

export function evaluatePriceAlert(alert: PriceAlert, asset: Pick<Asset, 'price'>, now: number): AlertEvaluation {
  const price = asset.price;
  const movePct = alert.baselinePrice > 0 ? (price - alert.baselinePrice) / alert.baselinePrice * 100 : 0;
  const triggered = alert.condition === 'ABOVE' ? price >= alert.target : alert.condition === 'BELOW' ? price <= alert.target : Math.abs(movePct) >= Math.abs(alert.target);
  const reason = alert.condition === 'PCT_MOVE' ? `${movePct >= 0 ? '+' : ''}${movePct.toFixed(2)}% move from ${alert.baselinePrice.toFixed(2)}` : `price ${price.toFixed(2)} ${alert.condition === 'ABOVE' ? 'reached' : 'fell to'} target ${alert.target.toFixed(2)}`;
  return { alert, triggered, reason: triggered ? reason : '' };
}

export function evaluateAlerts(alerts: PriceAlert[], assets: Asset[], now: number): { alerts: PriceAlert[]; triggered: AlertEvaluation[] } {
  const triggered: AlertEvaluation[] = [];
  const next = alerts.map(alert => {
    if (!alert.enabled || alert.triggeredAt) return alert;
    const asset = assets.find(item => item.id === alert.assetId);
    if (!asset) return alert;
    const result = evaluatePriceAlert(alert, asset, now);
    if (!result.triggered) return alert;
    triggered.push(result);
    return { ...alert, enabled: false, triggeredAt: now };
  });
  return { alerts: next, triggered };
}
