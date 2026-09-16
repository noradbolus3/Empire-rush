(function () {
  "use strict";

  const Game = window.EmpireGameState;
  if (!Game) return;

  const companies = [
    { id: "aurora", symbol: "AUR", name: "Aurora Systems", sector: "Tech", price: 820, volatility: 0.035, dividend: 0.012 },
    { id: "quantum", symbol: "QNT", name: "Quantum Grid", sector: "Tech", price: 540, volatility: 0.045, dividend: 0.008 },
    { id: "surya", symbol: "SUR", name: "Surya Energy", sector: "Energy", price: 410, volatility: 0.028, dividend: 0.018 },
    { id: "medix", symbol: "MDX", name: "Medix Labs", sector: "Pharma", price: 690, volatility: 0.032, dividend: 0.014 },
    { id: "vahana", symbol: "VAH", name: "Vahana Motors", sector: "Auto", price: 275, volatility: 0.05, dividend: 0.006 },
    { id: "bharat", symbol: "BHB", name: "Bharat Bank", sector: "Banking", price: 355, volatility: 0.022, dividend: 0.02 },
    { id: "orbit", symbol: "ORB", name: "Orbit Mobility", sector: "Auto", price: 190, volatility: 0.055, dividend: 0.004 },
    { id: "terra", symbol: "TER", name: "Terra Renewables", sector: "Energy", price: 625, volatility: 0.038, dividend: 0.011 }
  ];

  const properties = [
    { id: "apartment", name: "Residential Apartments", kind: "Residential", price: 8500000, rent: 95000, maintenance: 15000, appreciation: 0.065 },
    { id: "shop", name: "Commercial Shops", kind: "Commercial", price: 12500000, rent: 155000, maintenance: 26000, appreciation: 0.075 },
    { id: "warehouse", name: "Logistics Warehouse", kind: "Industrial", price: 22000000, rent: 235000, maintenance: 42000, appreciation: 0.085 },
    { id: "land", name: "Prime Land Parcel", kind: "Land", price: 35000000, rent: 0, maintenance: 12000, appreciation: 0.12 },
    { id: "tower", name: "Office Tower", kind: "Commercial", price: 90000000, rent: 980000, maintenance: 185000, appreciation: 0.10 }
  ];

  const seed = () => {
    const state = Game.getState();
    state.financialMarkets ||= { tick: 0, news: [], stocks: {}, portfolio: {}, dividends: 0, ipo: [] };
    state.realEstate ||= { holdings: [], mortgages: [] };
    companies.forEach((c) => {
      state.financialMarkets.stocks[c.id] ||= { ...c, history: [c.price] };
    });
    Game.save();
    return state;
  };

  const money = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
  const state = () => seed();
  const player = () => state().player;
  const emit = () => window.dispatchEvent(new CustomEvent("EmpireGameStateChanged", { detail: { type: "markets", state: state() } }));

  function tickMarket() {
    const s = state();
    s.financialMarkets.tick += 1;
    const events = [
      ["Tech regulation announced", ["aurora", "quantum"], -0.08],
      ["Monsoon demand lifts energy and banking", ["surya", "bharat"], 0.06],
      ["New drug approval boosts pharma", ["medix"], 0.11],
      ["Auto supply chain disruption", ["vahana", "orbit"], -0.07],
      ["Renewables policy accelerates clean energy", ["terra", "surya"], 0.09]
    ];
    let headline = "Markets open steady";
    if (s.financialMarkets.tick % 4 === 0) {
      const event = events[Math.floor(Math.random() * events.length)];
      headline = event[0];
      event[1].forEach((id) => { s.financialMarkets.stocks[id].price *= 1 + event[2]; });
      s.financialMarkets.news.unshift({ day: s.world.day, headline, impact: event[2] });
    }
    Object.values(s.financialMarkets.stocks).forEach((stock) => {
      const move = (Math.random() - 0.48) * stock.volatility;
      stock.price = Math.max(10, stock.price * (1 + move));
      stock.history.push(Math.round(stock.price));
      stock.history = stock.history.slice(-24);
    });
    if (s.financialMarkets.tick % 30 === 0) payDividends();
    Game.save(); emit();
    return headline;
  }

  function payDividends() {
    const s = state();
    let paid = 0;
    Object.entries(s.financialMarkets.portfolio).forEach(([id, holding]) => {
      const stock = s.financialMarkets.stocks[id];
      const amount = (holding.shares || 0) * stock.price * stock.dividend;
      paid += amount;
    });
    if (paid > 0) {
      player().cash += paid;
      s.financialMarkets.dividends += paid;
      s.financialMarkets.news.unshift({ day: s.world.day, headline: `Quarterly dividends paid: ${money(paid)}`, impact: 0 });
    }
  }

  function trade(id, shares) {
    const s = state();
    const stock = s.financialMarkets.stocks[id];
    shares = Math.floor(Number(shares));
    if (!stock || !shares) return { ok: false, message: "Enter a share quantity." };
    const total = stock.price * Math.abs(shares);
    const holding = s.financialMarkets.portfolio[id] ||= { shares: 0, averageBuy: 0 };
    if (shares > 0) {
      if (!Game.money.spend(total, `Bought ${shares} ${stock.symbol} shares`)) return { ok: false, message: "Insufficient wallet balance." };
      holding.averageBuy = ((holding.averageBuy * holding.shares) + total) / (holding.shares + shares);
      holding.shares += shares;
    } else {
      const sell = Math.min(Math.abs(shares), holding.shares);
      if (!sell) return { ok: false, message: "No shares available to sell." };
      holding.shares -= sell;
      Game.money.add(stock.price * sell, `Sold ${sell} ${stock.symbol} shares`);
    }
    Game.save(); emit(); return { ok: true, message: shares > 0 ? `Bought ${shares} ${stock.symbol}` : `Sold ${Math.abs(shares)} ${stock.symbol}` };
  }

  function launchIPO(companyId) {
    const s = state();
    const company = (s.companies || []).find((c) => c.id === companyId) || (s.companies || [])[0];
    if (!company || Number(company.valuation) < 50000000) return { ok: false, message: "A subsidiary must reach ₹5Cr valuation before IPO." };
    s.financialMarkets.ipo ||= [];
    if (s.financialMarkets.ipo.some((x) => x.companyId === company.id)) return { ok: false, message: "This company is already listed." };
    const stock = { id: `ipo_${company.id}`, symbol: (company.name || "PLAYER").replace(/[^A-Z]/gi, "").slice(0, 4).toUpperCase() || "PLAY", name: company.name, sector: "Player Company", price: Math.max(100, Number(company.valuation) / 100000), volatility: 0.06, dividend: 0.005, history: [Math.max(100, Number(company.valuation) / 100000)] };
    s.financialMarkets.stocks[stock.id] = stock;
    s.financialMarkets.ipo.push({ companyId: company.id, stockId: stock.id, day: s.world.day });
    Game.save(); emit(); return { ok: true, message: `${company.name} is now publicly listed as ${stock.symbol}.` };
  }

  function buyProperty(id, financed) {
    const s = state();
    const p = properties.find((x) => x.id === id);
    if (!p) return { ok: false, message: "Property unavailable." };
    if (s.realEstate.holdings.some((x) => x.propertyId === id)) return { ok: false, message: "You already own this property." };
    const down = financed ? p.price * 0.2 : p.price;
    if (!Game.money.spend(down, `${financed ? "Down payment" : "Purchase"}: ${p.name}`)) return { ok: false, message: "Insufficient wallet balance." };
    const holding = { propertyId: id, value: p.price, acquiredDay: s.world.day, financed: !!financed };
    s.realEstate.holdings.push(holding);
    if (financed) s.realEstate.mortgages.push({ propertyId: id, principal: p.price * 0.8, balance: p.price * 0.8, emi: Math.round((p.price * 0.8 * 0.0125) + p.price * 0.8 / 120), monthsPaid: 0 });
    Game.save(); emit(); return { ok: true, message: `${p.name} added to your property portfolio.` };
  }

  function renderChart(history) {
    const min = Math.min(...history), max = Math.max(...history), range = Math.max(1, max - min);
    return history.map((v, i) => `${Math.round((i / Math.max(1, history.length - 1)) * 220)},${Math.round(80 - ((v - min) / range) * 70)}`).join(" ");
  }

  function open(tab = "markets") {
    state();
    if (!document.getElementById("erFinanceStyles")) {
      const style = document.createElement("style");
      style.id = "erFinanceStyles";
      style.textContent = `
        #erFinanceOverlay { position: fixed; inset: 0; z-index: 12000; color: #e8f0fb; font-family: Inter, system-ui, sans-serif; }
        .er-finance-backdrop { position: absolute; inset: 0; background: rgba(2, 8, 18, .72); backdrop-filter: blur(8px); }
        .er-finance-panel { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(760px, calc(100vw - 24px)); max-height: min(86vh, 760px); overflow: auto; padding: 24px; border: 1px solid rgba(255,255,255,.14); border-radius: 24px; background: linear-gradient(145deg, #0d1827, #111f31); box-shadow: 0 24px 80px rgba(0,0,0,.45); }
        .er-finance-close { position: absolute; right: 14px; top: 12px; width: 34px; height: 34px; border: 0; border-radius: 50%; background: rgba(255,255,255,.1); color: #fff; font-size: 22px; cursor: pointer; }
        .er-finance-kicker { color: #91df45; font-size: 10px; letter-spacing: 2px; font-weight: 900; }
        .er-finance-panel h2 { margin: 5px 0 16px; font-size: 28px; }
        .er-finance-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
        .er-finance-tabs button, .er-stock-bottom button, .er-property-actions button, .er-refresh-market { border: 0; border-radius: 10px; padding: 9px 11px; background: #223754; color: #e8f0fb; font-weight: 800; cursor: pointer; }
        .er-finance-tabs button:first-child, .er-refresh-market { background: #8fe84f; color: #102000; }
        .er-finance-summary { display: flex; justify-content: space-between; gap: 12px; padding: 13px 0 17px; border-bottom: 1px solid rgba(255,255,255,.1); color: #98a9bd; font-size: 12px; }
        .er-finance-summary b { color: #fff; font-size: 16px; }
        .er-stock-list, .er-property-grid { display: grid; gap: 10px; margin-top: 16px; }
        .er-stock, .er-property { padding: 14px; border: 1px solid rgba(255,255,255,.1); border-radius: 16px; background: rgba(255,255,255,.045); }
        .er-stock-top, .er-stock-bottom, .er-property-actions { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .er-stock-top b { color: #8fe84f; margin-right: 8px; font-size: 17px; }
        .er-stock-top span, .er-stock-top small { display: block; color: #9cadc0; font-size: 11px; }
        .er-stock-top strong { font-size: 18px; }
        .er-stock svg { display: block; width: 220px; height: 90px; margin: 5px auto; }
        .er-stock-bottom { color: #91a4b8; font-size: 11px; }
        .er-stock-bottom div, .er-property-actions { display: flex; gap: 6px; }
        .er-news { margin: 15px 0; color: #cbd7e5; font-size: 12px; line-height: 1.7; }
        .er-news b { color: #ffca66; font-size: 10px; margin-right: 5px; }
        .er-property h3 { margin: 4px 0; font-size: 17px; }
        .er-property p { margin: 0 0 4px; color: #8fe84f; font-weight: 800; }
        .er-property small { display: block; color: #9cadc0; margin-bottom: 12px; }
        .er-property-kind { color: #7e93aa; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900; }
        .er-finance-table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 12px; }
        .er-finance-table th, .er-finance-table td { padding: 11px 8px; border-bottom: 1px solid rgba(255,255,255,.1); text-align: left; }
        .er-finance-table th { color: #8fa1b5; font-size: 10px; text-transform: uppercase; }
        .up { color: #8fe84f; } .down { color: #ff7d7d; }
        @media (max-width: 520px) { .er-finance-panel { padding: 18px 14px; } .er-stock-bottom { align-items: flex-end; flex-direction: column; } .er-finance-tabs { overflow-x: auto; } }
      `;
      document.head.appendChild(style);
    }
    let root = document.getElementById("erFinanceOverlay");
    if (!root) { root = document.createElement("div"); root.id = "erFinanceOverlay"; document.body.appendChild(root); }
    root.innerHTML = `<div class="er-finance-backdrop" data-close-finance="1"></div><section class="er-finance-panel"><button class="er-finance-close" data-close-finance="1">×</button><div class="er-finance-kicker">CAPITAL & PROPERTY</div><h2>Empire Finance</h2><div class="er-finance-tabs"><button data-finance-tab="markets">Stock Exchange</button><button data-finance-tab="portfolio">Portfolio</button><button data-finance-tab="realestate">Real Estate</button></div><div id="erFinanceContent"></div></section>`;
    root.querySelectorAll("[data-close-finance]").forEach((el) => el.addEventListener("click", () => root.remove()));
    root.querySelectorAll("[data-finance-tab]").forEach((el) => el.addEventListener("click", () => renderTab(el.dataset.financeTab)));
    renderTab(tab);

    function renderTab(active) {
      const s = state(); const content = root.querySelector("#erFinanceContent");
      if (active === "realestate") {
        content.innerHTML = `<div class="er-finance-summary"><b>Wallet ${money(player().cash)}</b><span>${s.realEstate.holdings.length} properties · ${s.realEstate.mortgages.length} mortgages</span></div><div class="er-property-grid">${properties.map((p) => `<article class="er-property"><div class="er-property-kind">${p.kind}</div><h3>${p.name}</h3><p>${money(p.price)} · rent ${money(p.rent)}/mo</p><small>Maintenance ${money(p.maintenance)} · appreciation ${(p.appreciation * 100).toFixed(1)}%/yr</small><div class="er-property-actions"><button data-buy-property="${p.id}" data-financed="0">Buy</button><button data-buy-property="${p.id}" data-financed="1">20% down + EMI</button></div></article>`).join("")}</div>`;
        root.querySelectorAll("[data-buy-property]").forEach((b) => b.addEventListener("click", () => { const r = buyProperty(b.dataset.buyProperty, b.dataset.financed === "1"); alert(r.message); renderTab("realestate"); })); return;
      }
      if (active === "portfolio") {
        const rows = Object.entries(s.financialMarkets.portfolio).filter(([, h]) => h.shares > 0).map(([id, h]) => { const stock = s.financialMarkets.stocks[id]; const pnl = (stock.price - h.averageBuy) * h.shares; return `<tr><td>${stock.symbol}</td><td>${h.shares}</td><td>${money(h.averageBuy)}</td><td class="${pnl >= 0 ? "up" : "down"}">${money(pnl)}</td></tr>`; }).join("") || `<tr><td colspan="4">No open positions yet.</td></tr>`;
        content.innerHTML = `<div class="er-finance-summary"><b>Dividends received ${money(s.financialMarkets.dividends)}</b><span>Quarterly payout · unrealized P&amp;L</span></div><table class="er-finance-table"><thead><tr><th>Symbol</th><th>Shares</th><th>Avg buy</th><th>P&amp;L</th></tr></thead><tbody>${rows}</tbody></table>`; return;
      }
      content.innerHTML = `<div class="er-finance-summary"><b>Wallet ${money(player().cash)}</b><span>Market tick ${s.financialMarkets.tick} · ${s.financialMarkets.news[0]?.headline || "Markets open steady"}</span></div><div class="er-stock-list">${Object.values(s.financialMarkets.stocks).map((stock) => { const h = s.financialMarkets.portfolio[stock.id] || { shares: 0 }; return `<article class="er-stock"><div class="er-stock-top"><div><b>${stock.symbol}</b><span>${stock.name}</span><small>${stock.sector}</small></div><strong>${money(stock.price)}</strong></div><svg viewBox="0 0 220 90" role="img" aria-label="${stock.name} price history"><polyline points="${renderChart(stock.history)}" fill="none" stroke="#8fe84f" stroke-width="3" /></svg><div class="er-stock-bottom"><span>${h.shares} shares · ${(stock.dividend * 100).toFixed(1)}% quarterly dividend</span><div><button data-trade="${stock.id}" data-shares="-1">Sell 1</button><button data-trade="${stock.id}" data-shares="1">Buy 1</button></div></div></article>`; }).join("")}</div><div class="er-news">${(s.financialMarkets.news.slice(0, 3).map((n) => `<div><b>NEWS</b> ${n.headline}</div>`).join("") || "No market news yet.")}</div><button class="er-refresh-market" id="erRefreshMarket">Run market tick</button>`;
      root.querySelectorAll("[data-trade]").forEach((b) => b.addEventListener("click", () => { const r = trade(b.dataset.trade, Number(b.dataset.shares)); alert(r.message); renderTab("markets"); }));
      root.querySelector("#erRefreshMarket").addEventListener("click", () => { tickMarket(); renderTab("markets"); });
    }
  }

  window.EmpireFinanceUI = { open, tickMarket, trade, launchIPO, buyProperty, properties, companies };
  window.EmpireRealEstateUI = { open: () => open("realestate") };
})();
