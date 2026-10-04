import { createSeededHistory } from '../engine/marketEngine';
export type CryptoCategory = 'LAYER_1' | 'DEFI' | 'MEME' | 'AI' | 'GAMING';
export interface CryptoDefinition { id:string; symbol:string; name:string; category:CryptoCategory; price:number; volatility:number; description:string; logo:number; }
export const CRYPTO_CATALOG: CryptoDefinition[] = [
 {id:'btc',symbol:'BTR',name:'Bitron',category:'LAYER_1',price:72481.2,volatility:.026,description:'Large-cap settlement network with capped supply.',logo:require('../../assets/crypto/bitron.webp')},
 {id:'eth',symbol:'ETX',name:'EtheriumX',category:'LAYER_1',price:3421.6,volatility:.03,description:'Programmable network for contracts and applications.',logo:require('../../assets/crypto/etheriumx.webp')},
 {id:'sol',symbol:'SLX',name:'Solaxis',category:'LAYER_1',price:182.4,volatility:.035,description:'High-throughput chain for consumer applications.',logo:require('../../assets/crypto/solaxis.webp')},
 {id:'doge',symbol:'DGM',name:'DogeMax',category:'MEME',price:.2841,volatility:.055,description:'Community token with highly reactive sentiment.',logo:require('../../assets/crypto/dogemax.webp')},
 {id:'poly',symbol:'PYM',name:'Polymera',category:'DEFI',price:.7521,volatility:.045,description:'Liquidity and cross-network settlement protocol.',logo:require('../../assets/crypto/polymera.webp')},
 {id:'neon',symbol:'NEON',name:'Neon Protocol',category:'AI',price:6.214,volatility:.05,description:'Machine-learning coordination layer for digital services.',logo:require('../../assets/crypto/neon.webp')},
 {id:'arcade',symbol:'ARCL',name:'Arcade Ledger',category:'GAMING',price:4.2,volatility:.052,description:'In-game ownership and creator economy protocol.',logo:require('../../assets/crypto/arcade.webp')},
 {id:'unidex',symbol:'UDX',name:'UniDex',category:'DEFI',price:8.75,volatility:.042,description:'Permissionless exchange routing and liquidity tools.',logo:require('../../assets/crypto/unidex.webp')},
 {id:'luna',symbol:'LNP',name:'LunaPrime',category:'AI',price:87.11,volatility:.048,description:'Compute credits for distributed inference markets.',logo:require('../../assets/crypto/luna.webp')},
 {id:'vault',symbol:'VLM',name:'VaultMesh',category:'DEFI',price:24.6,volatility:.038,description:'Collateral and risk-management primitives for digital assets.',logo:require('../../assets/crypto/vault.webp')},
 {id:'matic',symbol:'CDX',name:'CardanoX',category:'LAYER_1',price:1.42,volatility:.04,description:'Low-cost application settlement and network scaling.',logo:require('../../assets/round25/crypto-cardanox.webp')},
 {id:'rippleon',symbol:'RPLN',name:'Rippleon',category:'LAYER_1',price:2.18,volatility:.044,description:'Fast cross-border settlement for digital commerce.',logo:require('../../assets/round25/crypto-rippleon.webp')},
 {id:'shibanova',symbol:'SHNV',name:'ShibaNova',category:'MEME',price:.0184,volatility:.06,description:'High-sentiment community network with social momentum.',logo:require('../../assets/round25/crypto-shibanova.webp')},
 {id:'avax',symbol:'AVX',name:'AvalonX',category:'LAYER_1',price:36,volatility:.045,description:'Modular chain for application-specific networks.',logo:require('../../assets/round25/crypto-avalonx.webp')},
];
export const CRYPTO_LOGO_IDS = CRYPTO_CATALOG.map(item=>item.id);
export const cryptoCatalogAsset = (item:CryptoDefinition) => ({id:item.id,symbol:item.symbol,name:item.name,kind:'CRYPTO' as const,price:item.price,change:0,dividend:0,volatility:item.volatility,sector:'CRYPTO' as const,logo:item.logo,history:createSeededHistory(item.id,item.price,item.volatility)});
