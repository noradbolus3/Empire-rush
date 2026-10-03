import { createSeededHistory } from '../engine/marketEngine';

export type CryptoCategory = 'LAYER_1' | 'DEFI' | 'MEME' | 'AI' | 'GAMING';
export interface CryptoDefinition { id: string; symbol: string; name: string; category: CryptoCategory; price: number; volatility: number; description: string; logo: number; }
export const CRYPTO_CATALOG: CryptoDefinition[] = [
  { id: 'btc', symbol: 'BTR', name: 'Bitron', category: 'LAYER_1', price: 42381.2, volatility: .026, description: 'Large-cap settlement network with capped supply.', logo: require('../../assets/crypto/bitron.webp') },
  { id: 'eth', symbol: 'ETX', name: 'EtheriumX', category: 'LAYER_1', price: 3240.5, volatility: .03, description: 'Programmable network for contracts and applications.', logo: require('../../assets/crypto/etheriumx.webp') },
  { id: 'sol', symbol: 'SLX', name: 'Solaxis', category: 'LAYER_1', price: 148.2, volatility: .035, description: 'High-throughput chain for consumer applications.', logo: require('../../assets/crypto/solaxis.webp') },
  { id: 'doge', symbol: 'DMX', name: 'DogeMax', category: 'MEME', price: 0.42, volatility: .055, description: 'Community token with highly reactive sentiment.', logo: require('../../assets/crypto/dogemax.webp') },
  { id: 'poly', symbol: 'PLY', name: 'Polymera', category: 'DEFI', price: 2.85, volatility: .045, description: 'Liquidity and cross-network settlement protocol.', logo: require('../../assets/crypto/polymera.webp') },
  { id: 'neon', symbol: 'NEON', name: 'Neon Protocol', category: 'AI', price: 12.5, volatility: .05, description: 'Machine-learning coordination layer for digital services.', logo: require('../../assets/crypto/neon.webp') },
  { id: 'arcade', symbol: 'ARCX', name: 'Arcade Ledger', category: 'GAMING', price: 4.2, volatility: .052, description: 'In-game ownership and creator economy protocol.', logo: require('../../assets/crypto/arcade.webp') },
  { id: 'unidex', symbol: 'UNX', name: 'UniDex', category: 'DEFI', price: 8.75, volatility: .042, description: 'Permissionless exchange routing and liquidity tools.', logo: require('../../assets/crypto/unidex.webp') },
  { id: 'luna', symbol: 'LUP', name: 'LunaPrime', category: 'AI', price: 1.18, volatility: .048, description: 'Compute credits for distributed inference markets.', logo: require('../../assets/crypto/luna.webp') },
  { id: 'vault', symbol: 'VLT', name: 'VaultMesh', category: 'DEFI', price: 24.6, volatility: .038, description: 'Collateral and risk-management primitives for digital assets.', logo: require('../../assets/crypto/vault.webp') },
  { id: 'matic', symbol: 'MTC', name: 'MatrixArc', category: 'LAYER_1', price: 0.72, volatility: .04, description: 'Scaling network for low-cost application settlement.', logo: require('../../assets/crypto/unidex.webp') },
  { id: 'avax', symbol: 'AVX', name: 'AvalancheX', category: 'LAYER_1', price: 36, volatility: .045, description: 'Modular chain for application-specific networks.', logo: require('../../assets/crypto/luna.webp') },
];
export const CRYPTO_LOGO_IDS = CRYPTO_CATALOG.map(item => item.id);
export const cryptoCatalogAsset = (item: CryptoDefinition) => ({ id: item.id, symbol: item.symbol, name: item.name, kind: 'CRYPTO' as const, price: item.price, change: 0, dividend: 0, volatility: item.volatility, sector: 'CRYPTO' as const, logo: item.logo, history: createSeededHistory(item.id, item.price, item.volatility) });
