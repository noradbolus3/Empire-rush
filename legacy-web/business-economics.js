(function () {
  "use strict";

  function money(v) {
    v = Math.round(Number(v) || 0);

    if (Math.abs(v) >= 10000000)
      return "₹" + (v / 10000000).toFixed(2) + "Cr";

    if (Math.abs(v) >= 100000)
      return "₹" + (v / 100000).toFixed(2) + "L";

    if (Math.abs(v) >= 1000)
      return "₹" + (v / 1000).toFixed(1) + "K";

    return "₹" + v.toLocaleString("en-IN");
  }

  function getState() {
    return window.EmpireSimulation &&
      window.EmpireSimulation.state
      ? window.EmpireSimulation.state
      : null;
  }

  function calculate() {
    const s = getState();

    if (!s) return null;

    const b = s.business;
    const m = s.market;

    const employees =
      Array.isArray(s.employees)
        ? s.employees
        : [];

    const payroll =
      employees.reduce(
        (sum, e) => sum + Number(e.salary || 0),
        0
      );

    const dailyRevenue =
      18000 *
      (Number(b.utilization || 0) / 100) *
      Number(b.demandIndex || 1) *
      Number(m.demand || 1) *
      (Number(m.consumerConfidence || 70) / 70) *
      (1 + ((Number(b.marketing || 1) - 1) * 0.08)) *
      (0.8 + Number(s.company.reputation || 50) / 250) /
      Math.max(0.7, Number(m.competition || 1));

    const dailyPayroll = payroll / 30;

    const dailyOperating =
      6500 * Number(m.inflation || 1);

    const dailyMarketing =
      1800 * Number(b.marketing || 1);

    const dailyRD =
      Array.isArray(s.projects)
        ? s.projects.reduce(
            (sum, p) =>
              sum +
              (p.status === "In Development"
                ? 1500
                : 0),
            0
          )
        : 0;

    const dailyInterest =
      Number(s.player.debt || 0) *
      (Number(m.interestRate || 0) / 100) /
      365;

    const dailyExpenses =
      dailyPayroll +
      dailyOperating +
      dailyMarketing +
      dailyRD +
      dailyInterest;

    const dailyProfit =
      dailyRevenue - dailyExpenses;

    const monthlyRevenue =
      dailyRevenue * 30;

    const monthlyExpenses =
      dailyExpenses * 30;

    const monthlyProfit =
      dailyProfit * 30;

    const breakEvenRevenue =
      dailyExpenses * 30;

    const runway =
      dailyExpenses > 0
        ? Number(s.player.cash || 0) / dailyExpenses
        : 9999;

    return {
      dailyRevenue,
      dailyExpenses,
      dailyProfit,
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit,
      breakEvenRevenue,
      runway,
      payroll,
      dailyPayroll
    };
  }

  function installStyle() {
    if (document.getElementById("er-economics-style"))
      return;

    const style = document.createElement("style");

    style.id = "er-economics-style";

    style.textContent = `
      #er-economics-panel {
        position:fixed;
        inset:0;
        z-index:999990;
        display:none;
        overflow:auto;
        background:rgba(5,8,13,.96);
        color:white;
        font-family:Arial,sans-serif;
      }

      .er-econ-wrap {
        width:min(94vw,900px);
        margin:20px auto 50px;
      }

      .er-econ-head {
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:15px;
      }

      .er-econ-title {
        font-size:25px;
        font-weight:900;
      }

      .er-econ-sub {
        color:#98a3b2;
        font-size:12px;
        margin-top:4px;
      }

      .er-econ-close {
        width:44px;
        height:44px;
        border:0;
        border-radius:50%;
        background:#252d37;
        color:white;
        font-size:23px;
      }

      .er-econ-section {
        background:#151c25;
        border:1px solid #303a48;
        border-radius:18px;
        padding:16px;
        margin-bottom:12px;
      }

      .er-econ-section h3 {
        margin:0 0 13px;
        font-size:16px;
      }

      .er-econ-grid {
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:10px;
      }

      .er-econ-card {
        background:#1b232e;
        border:1px solid #303b49;
        border-radius:14px;
        padding:13px;
      }

      .er-econ-card small {
        display:block;
        color:#9ba6b5;
        font-size:10px;
        margin-bottom:7px;
      }

      .er-econ-card strong {
        font-size:20px;
      }

      .er-econ-row {
        display:flex;
        justify-content:space-between;
        gap:15px;
        padding:10px 0;
        border-bottom:1px solid rgba(255,255,255,.06);
      }

      .er-econ-row:last-child {
        border-bottom:0;
      }

      .er-positive {
        color:#8bc34a;
      }

      .er-negative {
        color:#ff7b7b;
      }

      .er-econ-button {
        width:100%;
        border:0;
        border-radius:13px;
        padding:14px;
        background:#8bc34a;
        color:#111;
        font-weight:900;
        font-size:13px;
      }

      @media(max-width:650px) {
        .er-econ-grid {
          grid-template-columns:repeat(2,1fr);
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createButton() {
    if (document.getElementById("er-economics-button"))
      return;

    const button = document.createElement("button");

    button.id = "er-economics-button";

    button.textContent = "📊 ECONOMICS";

    button.style.cssText = `
      position:fixed;
      right:16px;
      bottom:75px;
      z-index:999989;
      border:0;
      border-radius:15px;
      padding:13px 16px;
      background:#202936;
      color:white;
      font:bold 12px Arial;
      box-shadow:0 10px 25px rgba(0,0,0,.35);
    `;

    button.onclick = open;

    document.body.appendChild(button);
  }

  function open() {
    const panel =
      document.getElementById("er-economics-panel");

    if (!panel) return;

    render();

    panel.style.display = "block";
  }

  function close() {
    const panel =
      document.getElementById("er-economics-panel");

    if (panel)
      panel.style.display = "none";
  }

  function createPanel() {
    if (document.getElementById("er-economics-panel"))
      return;

    const panel = document.createElement("div");

    panel.id = "er-economics-panel";

    panel.innerHTML = `
      <div class="er-econ-wrap">

        <div class="er-econ-head">

          <div>
            <div class="er-econ-title">
              Business Economics
            </div>

            <div class="er-econ-sub">
              Real-time business P&L and financial health
            </div>
          </div>

          <button
            class="er-econ-close"
            id="er-econ-close"
          >
            ×
          </button>

        </div>

        <div id="er-econ-content"></div>

      </div>
    `;

    document.body.appendChild(panel);

    document
      .getElementById("er-econ-close")
      .onclick = close;
  }

  function render() {
    const s = getState();
    const c = calculate();

    if (!s || !c) return;

    const b = s.business;

    const content =
      document.getElementById("er-econ-content");

    const profitClass =
      c.monthlyProfit >= 0
        ? "er-positive"
        : "er-negative";

    content.innerHTML = `

      <div class="er-econ-section">

        <h3>
          🏢 ${b.name}
        </h3>

        <div class="er-econ-row">
          <span>Industry</span>
          <strong>${b.industry}</strong>
        </div>

        <div class="er-econ-row">
          <span>Status</span>
          <strong>${b.status}</strong>
        </div>

        <div class="er-econ-row">
          <span>Capacity Utilization</span>
          <strong>${Math.round(b.utilization || 0)}%</strong>
        </div>

      </div>

      <div class="er-econ-section">

        <h3>📈 Monthly P&L</h3>

        <div class="er-econ-grid">

          <div class="er-econ-card">
            <small>REVENUE</small>
            <strong>${money(c.monthlyRevenue)}</strong>
          </div>

          <div class="er-econ-card">
            <small>EXPENSES</small>
            <strong>${money(c.monthlyExpenses)}</strong>
          </div>

          <div class="er-econ-card">
            <small>NET OPERATING PROFIT</small>
            <strong class="${profitClass}">
              ${money(c.monthlyProfit)}
            </strong>
          </div>

          <div class="er-econ-card">
            <small>BREAK-EVEN REVENUE</small>
            <strong>${money(c.breakEvenRevenue)}</strong>
          </div>

          <div class="er-econ-card">
            <small>PAYROLL / MONTH</small>
            <strong>${money(c.payroll)}</strong>
          </div>

          <div class="er-econ-card">
            <small>CASH RUNWAY</small>
            <strong>${Math.floor(c.runway)} days</strong>
          </div>

        </div>

      </div>

      <div class="er-econ-section">

        <h3>💸 Expense Structure</h3>

        <div class="er-econ-row">
          <span>Payroll</span>
          <strong>${money(c.payroll)}</strong>
        </div>

        <div class="er-econ-row">
          <span>Operating Costs</span>
          <strong>
            ${money(c.dailyExpenses * 30 - c.payroll)}
          </strong>
        </div>

        <div class="er-econ-row">
          <span>Debt</span>
          <strong>
            ${money(s.player.debt || 0)}
          </strong>
        </div>

      </div>

      <div class="er-econ-section">

        <h3>🌍 Market Impact</h3>

        <div class="er-econ-row">
          <span>Demand</span>
          <strong>
            ${Math.round((s.market.demand || 1) * 100)}%
          </strong>
        </div>

        <div class="er-econ-row">
          <span>Consumer Confidence</span>
          <strong>
            ${Math.round(s.market.consumerConfidence || 0)}%
          </strong>
        </div>

        <div class="er-econ-row">
          <span>Competition</span>
          <strong>
            ${Math.round((s.market.competition || 1) * 100)}%
          </strong>
        </div>

        <div class="er-econ-row">
          <span>Inflation</span>
          <strong>
            ${Math.round((s.market.inflation || 1) * 100)}%
          </strong>
        </div>

      </div>

      <button
        class="er-econ-button"
        id="er-econ-close-bottom"
      >
        CLOSE
      </button>
    `;

    document
      .getElementById("er-econ-close-bottom")
      .onclick = close;
  }

  function start() {
    installStyle();
    createButton();
    createPanel();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();
