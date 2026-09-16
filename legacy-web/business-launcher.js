(function () {
  "use strict";

  const BUSINESSES = [
    {
      id:"home",
      icon:"🧹",
      name:"Home Cleaning Service",
      industry:"Home Services",
      capital:15000,
      setup:12000,
      employees:1,
      rent:3000,
      margin:42,
      risk:12
    },
    {
      id:"food",
      icon:"🍔",
      name:"Food Cart",
      industry:"Food & Beverage",
      capital:25000,
      setup:18000,
      employees:1,
      rent:5000,
      margin:34,
      risk:18
    },
    {
      id:"agency",
      icon:"💻",
      name:"Freelance Agency",
      industry:"Professional Services",
      capital:40000,
      setup:10000,
      employees:2,
      rent:7000,
      margin:48,
      risk:20
    },
    {
      id:"repair",
      icon:"📱",
      name:"Mobile Repair Shop",
      industry:"Electronics",
      capital:80000,
      setup:25000,
      employees:2,
      rent:12000,
      margin:38,
      risk:22
    },
    {
      id:"salon",
      icon:"✂️",
      name:"Salon & Grooming Studio",
      industry:"Personal Services",
      capital:150000,
      setup:40000,
      employees:3,
      rent:18000,
      margin:41,
      risk:25
    },
    {
      id:"carwash",
      icon:"🚗",
      name:"Car Wash",
      industry:"Automotive",
      capital:250000,
      setup:70000,
      employees:4,
      rent:25000,
      margin:36,
      risk:28
    },
    {
      id:"cafe",
      icon:"☕",
      name:"Café",
      industry:"Food & Beverage",
      capital:450000,
      setup:90000,
      employees:6,
      rent:35000,
      margin:28,
      risk:31
    },
    {
      id:"retail",
      icon:"🏪",
      name:"Retail Store",
      industry:"Retail",
      capital:900000,
      setup:100000,
      employees:6,
      rent:45000,
      margin:23,
      risk:34
    },
    {
      id:"restaurant",
      icon:"🍽️",
      name:"Restaurant",
      industry:"Food & Beverage",
      capital:1500000,
      setup:180000,
      employees:12,
      rent:65000,
      margin:24,
      risk:38
    },
    {
      id:"logistics",
      icon:"🚚",
      name:"Logistics Company",
      industry:"Logistics",
      capital:3000000,
      setup:250000,
      employees:18,
      rent:80000,
      margin:19,
      risk:43
    },
    {
      id:"factory",
      icon:"🏭",
      name:"Small Manufacturing Factory",
      industry:"Manufacturing",
      capital:7000000,
      setup:500000,
      employees:35,
      rent:150000,
      margin:21,
      risk:52
    },
    {
      id:"software",
      icon:"🖥️",
      name:"Software Company",
      industry:"Technology",
      capital:10000000,
      setup:300000,
      employees:20,
      rent:180000,
      margin:55,
      risk:58
    }
  ];

  const LOCATIONS = [
    ["home","🏠 Home / Residential",0.55,0.72],
    ["market","🛍️ Local Market",1,1],
    ["road","🛣️ Main Road",1.35,1.18],
    ["commercial","🏙️ Commercial District",1.7,1.32],
    ["industrial","🏭 Industrial Zone",0.85,0.92]
  ];

  let selected = null;
  let location = null;
  let ownership = "Sole Proprietorship";

  function money(n) {
    n = Number(n) || 0;

    if (n >= 10000000)
      return "₹" + (n / 10000000).toFixed(2) + "Cr";

    if (n >= 100000)
      return "₹" + (n / 100000).toFixed(2) + "L";

    if (n >= 1000)
      return "₹" + (n / 1000).toFixed(1) + "K";

    return "₹" + Math.round(n).toLocaleString("en-IN");
  }

  function getState() {
    return window.EmpireSimulation &&
           window.EmpireSimulation.state
      ? window.EmpireSimulation.state
      : null;
  }

  function injectCSS() {

    if (document.getElementById("er-business-css"))
      return;

    const style = document.createElement("style");

    style.id = "er-business-css";

    style.textContent = `
      #er-business-button {
        position:fixed;
        right:16px;
        bottom:18px;
        z-index:999999;
        border:0;
        border-radius:16px;
        padding:14px 18px;
        background:#8bc34a;
        color:#111;
        font:bold 13px Arial;
        box-shadow:0 10px 30px rgba(0,0,0,.4);
      }

      #er-business-modal {
        position:fixed;
        inset:0;
        z-index:999998;
        display:none;
        overflow:auto;
        background:rgba(4,7,11,.9);
        backdrop-filter:blur(12px);
        font-family:Arial,sans-serif;
        color:white;
      }

      .er-business-wrap {
        width:min(94vw,1000px);
        margin:20px auto 60px;
      }

      .er-business-head {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:15px;
        margin-bottom:14px;
      }

      .er-business-title {
        font-size:25px;
        font-weight:900;
      }

      .er-business-sub {
        color:#9ca6b4;
        font-size:12px;
        margin-top:5px;
      }

      .er-close {
        width:44px;
        height:44px;
        border:0;
        border-radius:50%;
        background:#242b35;
        color:white;
        font-size:23px;
      }

      .er-wallet {
        background:#151b24;
        border:1px solid #29313d;
        border-radius:16px;
        padding:14px;
        margin-bottom:12px;
      }

      .er-wallet small {
        color:#8e99a8;
      }

      .er-wallet strong {
        display:block;
        font-size:22px;
        margin-top:5px;
      }

      .er-section {
        background:#151b24;
        border:1px solid #29313d;
        border-radius:18px;
        padding:15px;
        margin-bottom:12px;
      }

      .er-section h2 {
        margin:0 0 12px;
        font-size:17px;
      }

      .er-grid {
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:10px;
      }

      .er-card {
        border:1px solid #303947;
        border-radius:15px;
        padding:13px;
        background:#1b222d;
        color:white;
        text-align:left;
      }

      .er-card.selected {
        border:2px solid #8bc34a;
        background:#243025;
      }

      .er-card.locked {
        opacity:.42;
      }

      .er-icon {
        font-size:27px;
      }

      .er-name {
        font-weight:900;
        margin-top:7px;
      }

      .er-meta {
        color:#9ca6b4;
        font-size:11px;
        margin-top:4px;
      }

      .er-cost {
        margin-top:9px;
        font-weight:900;
      }

      .er-options {
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:10px;
      }

      .er-option {
        border:1px solid #303947;
        border-radius:14px;
        padding:13px;
        background:#1b222d;
        color:white;
        text-align:left;
      }

      .er-option.selected {
        border:2px solid #8bc34a;
      }

      .er-summary {
        line-height:1.8;
        color:#dce2e9;
        font-size:13px;
      }

      .er-total {
        margin-top:10px;
        padding:14px;
        border-radius:13px;
        background:#202b24;
      }

      .er-total strong {
        display:block;
        font-size:22px;
        color:#8bc34a;
      }

      .er-launch {
        width:100%;
        margin-top:13px;
        padding:15px;
        border:0;
        border-radius:13px;
        background:#8bc34a;
        color:#111;
        font-weight:900;
        font-size:14px;
      }

      .er-launch:disabled {
        opacity:.35;
      }

      @media(max-width:700px) {
        .er-grid {
          grid-template-columns:repeat(2,1fr);
        }

        .er-options {
          grid-template-columns:1fr;
        }
      }

      @media(max-width:450px) {
        .er-grid {
          grid-template-columns:1fr;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createUI() {

    if (document.getElementById("er-business-button"))
      return;

    const button = document.createElement("button");

    button.id = "er-business-button";
    button.textContent = "🏢 BUSINESS";

    button.onclick = open;

    document.body.appendChild(button);

    const modal = document.createElement("div");

    modal.id = "er-business-modal";

    modal.innerHTML = `
      <div class="er-business-wrap">

        <div class="er-business-head">

          <div>
            <div class="er-business-title">
              Start a New Business
            </div>

            <div class="er-business-sub">
              Choose according to your available capital
            </div>
          </div>

          <button class="er-close" id="er-close">
            ×
          </button>

        </div>

        <div class="er-wallet" id="er-wallet"></div>

        <div class="er-section" id="er-business-list"></div>

        <div class="er-section" id="er-location-list"></div>

        <div class="er-section" id="er-ownership-list"></div>

        <div class="er-section" id="er-summary"></div>

      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("er-close").onclick = close;

    render();
  }

  function open() {
    const modal =
      document.getElementById("er-business-modal");

    if (!modal)
      return;

    render();

    modal.style.display = "block";
  }

  function close() {
    const modal =
      document.getElementById("er-business-modal");

    if (modal)
      modal.style.display = "none";
  }

  function render() {

    const state = getState();

    const cash =
      state && state.player
        ? Number(state.player.cash) || 0
        : 0;

    document.getElementById("er-wallet").innerHTML = `
      <small>AVAILABLE CAPITAL</small>
      <strong>${money(cash)}</strong>
    `;

    renderBusinesses(cash);
    renderLocations();
    renderOwnership();
    renderSummary(cash);
  }

  function renderBusinesses(cash) {

    let html = `
      <h2>1. Choose Your Business</h2>
      <div class="er-grid">
    `;

    BUSINESSES.forEach(b => {

      const affordable =
        cash >= b.capital;

      html += `
        <button
          class="er-card
            ${selected && selected.id === b.id ? "selected" : ""}
            ${!affordable ? "locked" : ""}
          "
          data-er-business="${b.id}"
        >

          <div class="er-icon">${b.icon}</div>

          <div class="er-name">
            ${b.name}
          </div>

          <div class="er-meta">
            ${b.industry}
          </div>

          <div class="er-cost">
            Starting Capital: ${money(b.capital)}
          </div>

          <div class="er-meta">
            ${b.employees} starting employees ·
            ${b.margin}% margin
          </div>

        </button>
      `;
    });

    html += `</div>`;

    const box =
      document.getElementById("er-business-list");

    box.innerHTML = html;

    box.querySelectorAll("[data-er-business]")
      .forEach(btn => {

        btn.onclick = function () {

          const id =
            btn.dataset.erBusiness;

          selected =
            BUSINESSES.find(b => b.id === id);

          location = null;

          render();
        };
      });
  }

  function renderLocations() {

    const box =
      document.getElementById("er-location-list");

    let html = `
      <h2>2. Choose Location</h2>
      <div class="er-options">
    `;

    LOCATIONS.forEach(l => {

      html += `
        <button
          class="er-option
            ${location && location[0] === l[0]
              ? "selected"
              : ""}
          "
          data-er-location="${l[0]}"
        >

          <strong>${l[1]}</strong>

          <div class="er-meta">
            Rent ×${l[2]}
          </div>

          <div class="er-meta">
            Demand ×${l[3]}
          </div>

        </button>
      `;
    });

    html += `</div>`;

    box.innerHTML = html;

    box.querySelectorAll("[data-er-location]")
      .forEach(btn => {

        btn.onclick = function () {

          location =
            LOCATIONS.find(
              l => l[0] === btn.dataset.erLocation
            );

          render();
        };
      });
  }

  function renderOwnership() {

    const box =
      document.getElementById("er-ownership-list");

    const types = [
      ["Sole Proprietorship","Simple and cheap"],
      ["Partnership","Shared ownership"],
      ["Private Limited","Better for future expansion"]
    ];

    let html = `
      <h2>3. Ownership Structure</h2>
      <div class="er-options">
    `;

    types.forEach(t => {

      html += `
        <button
          class="er-option
            ${ownership === t[0] ? "selected" : ""}
          "
          data-er-owner="${t[0]}"
        >
          <strong>${t[0]}</strong>
          <div class="er-meta">${t[1]}</div>
        </button>
      `;
    });

    html += `</div>`;

    box.innerHTML = html;

    box.querySelectorAll("[data-er-owner]")
      .forEach(btn => {

        btn.onclick = function () {

          ownership =
            btn.dataset.erOwner;

          render();
        };
      });
  }

  function renderSummary(cash) {

    const box =
      document.getElementById("er-summary");

    if (!selected || !location) {

      box.innerHTML = `
        <h2>4. Launch Plan</h2>

        <div class="er-meta">
          Select a business and location to see
          the complete setup requirement.
        </div>
      `;

      return;
    }

    const total =
      Math.round(
        selected.setup +
        selected.capital * .25 +
        selected.rent * location[2]
      );

    const affordable =
      cash >= total;

    const monthlyRevenue =
      Math.round(
        100000 *
        (selected.margin / 100) *
        location[3]
      );

    const monthlyProfit =
      Math.round(
        monthlyRevenue -
        (selected.employees * 18000) -
        (selected.rent * location[2])
      );

    box.innerHTML = `
      <h2>4. Business Plan</h2>

      <div class="er-summary">

        <b>Business:</b>
        ${selected.icon} ${selected.name}

        <br>

        <b>Location:</b>
        ${location[1]}

        <br>

        <b>Ownership:</b>
        ${ownership}

        <br>

        <b>Starting Employees:</b>
        ${selected.employees}

        <br>

        <b>Monthly Rent:</b>
        ${money(selected.rent * location[2])}

        <br>

        <b>Expected Monthly Revenue:</b>
        ${money(monthlyRevenue)}

        <br>

        <b>Estimated Monthly Profit:</b>
        ${money(monthlyProfit)}

        <br>

        <b>Business Risk:</b>
        ${selected.risk}/100

      </div>

      <div class="er-total">

        TOTAL STARTUP CAPITAL

        <strong>
          ${money(total)}
        </strong>

      </div>

      <button
        class="er-launch"
        id="er-launch"
        ${affordable ? "" : "disabled"}
      >
        🚀 LAUNCH BUSINESS
      </button>

      ${
        affordable
          ? ""
          : `
            <div class="er-meta" style="margin-top:8px;">
              You need ${money(total - cash)}
              more capital.
            </div>
          `
      }
    `;

    document.getElementById("er-launch").onclick =
      function () {

        launchBusiness(
          total,
          monthlyRevenue,
          monthlyProfit
        );
      };
  }

  function launchBusiness(
    total,
    monthlyRevenue,
    monthlyProfit
  ) {

    const state = getState();

    if (!state) {
      alert("Game simulation is not ready.");
      return;
    }

    if (state.player.cash < total) {
      alert("Insufficient capital.");
      return;
    }

    state.player.cash -= total;

    state.company.name =
      selected.name;

    state.company.type =
      ownership;

    state.company.foundedDay =
      state.player.day;

    state.business = {

      name:selected.name,

      industry:selected.industry,

      status:"Operating",

      employees:selected.employees,

      capacity:selected.employees * 50,

      utilization:35,

      priceIndex:1,

      demandIndex:location[3],

      marketing:1,

      operations:1,

      reputation:60,

      businessId:selected.id,

      location:location[1],

      registration:ownership,

      setupCapital:total,

      monthlyRent:
        selected.rent * location[2],

      monthlyPayroll:
        selected.employees * 18000,

      risk:selected.risk,

      monthlyRevenue:monthlyRevenue,

      monthlyProfit:monthlyProfit,

      launchedDay:
        state.player.day
    };

    if (!Array.isArray(state.ledger))
      state.ledger = [];

    state.ledger.unshift({

      day:state.player.day,

      type:"business_setup",

      amount:-total,

      description:
        "Started " +
        selected.name +
        " at " +
        location[1],

      timestamp:Date.now()
    });

    if (!Array.isArray(state.notifications))
      state.notifications = [];

    state.notifications.unshift({

      day:state.player.day,

      title:"Business Started",

      message:
        selected.name +
        " is now operating."
    });

    if (
      window.EmpireSimulation &&
      typeof window.EmpireSimulation.save === "function"
    ) {
      window.EmpireSimulation.save();
    }

    close();

    alert(
      "🎉 Business Started!\n\n" +
      selected.name +
      "\n\nCapital invested: " +
      money(total)
    );

    selected = null;
    location = null;

    if (
      window.EmpireSimulation &&
      typeof window.EmpireSimulation.openDashboard === "function"
    ) {
      window.EmpireSimulation.openDashboard();
    }
  }

  injectCSS();
  createUI();

})();
