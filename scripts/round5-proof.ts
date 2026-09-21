declare const require: any;
const assert = require('assert').strict;
import { createSeededHistory } from '../src/engine/marketEngine';

const histories = ['sunpeak', 'btc', 'eth', 'sol'].map(id => createSeededHistory(id, id === 'btc' ? 67500 : 100, 0.03));
assert.equal(histories.every(history => history.length === 18), true);
assert.equal(new Set(histories.map(history => history.join(','))).size, histories.length, 'each asset must have a distinct seeded path');
assert.equal(Math.max(...histories[0]) !== Math.max(...histories[1]), true);
console.log(JSON.stringify({ distinctHistoryCount: new Set(histories.map(history => history.join(','))).size, btcSeedEnd: histories[1].at(-1), assetsChecked: histories.length }, null, 2));
