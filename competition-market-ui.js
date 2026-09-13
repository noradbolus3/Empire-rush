(function () {
  "use strict";

  const Market = window.EmpireCompetitionMarket;
  const Game = window.EmpireGameState;

  if (!Market || !Game) {
    console.warn("Competition Market UI waiting for systems...");
    return;
  }

  const UI = {
    panel: null,

    money(v) {
      return "₹" + Math.round(Number(v || 0)).toLocaleString("en-IN");
    },

    state() {
      return Game.getState ? Game.getState() : {};
    },

    companies() {
      return this.state().companies || [];
    },

    selectedCompany() {
      const select = document.getElementById("empireMarketCompany");
      const companies = this.companies();

      if (!companies.length) return null;
      if (!select) return companies[0];

      return companies.find(
        c => String(c.id) === String(select.value)
      ) || companies[0];
    },

    call(name, ...args) {
      if (typeof Market[name] !== "function") return null;

      try {
        return Market[name](...args);
      } catch (error) {
        console.warn("Market action failed:", name, error);
        return null;
      }
    },

    snapshot(company) {
      const s =
        this.call("getSummary", company) ||
        this.call("summary", company) ||
        {};

      const world =
        this.call("getMarketState") ||
        this.call("getWorldState") ||
        Market.world ||
        Market.state ||
        {};

      return {
        demand: Number(
          s.demandIndex ??
          s.demand ??
          world.demandIndex ??
          100
        ),

        inflation: Number(
          s.inflationIndex ??
          s.inflation ??
          world.inflationIndex ??
          100
        ),

        supply: Number(
          s.supplyIndex ??
          s.supply ??
          world.supplyIndex ??
          100
        ),

        labor: Number(
          s.laborCostIndex ??
          s.laborCost ??
          world.laborCostIndex ??
          100
        ),

        interest: Number(
          s.interestRateIndex ??
          s.interestRate ??
          world.interestRateIndex ??
          100
        ),

        confidence: Number(
          s.consumerConfidence ??
          world.consumerConfidence ??
          100
        ),

        businessConfidence: Number(
          s.businessConfidence ??
          world.businessConfidence ??
          100
        ),

        competition: Number(
          s.competitionPressure ??
          s.competition ??
          0
        ),

        pricePressure: Number(
          s.pricePressure ??
          0
        ),

        event:
          s.activeEvent ||
          world.activeEvent ||
          Market.activeEvent ||
          null
      };
    },

    createButton() {
      if (document.getElementById("empireMarketButton")) return;

      const button = document.createElement("button");

      button.id = "empireMarketButton";
      button.textContent = "MARKET";

      button.style.cssText = `
        position:fixed;
        right:18px;
        bottom:205px;
        z-index:9998;
        padding:12px 17px;
        border:0;
        border-radius:14px;
        background:#172554;
        color:#fff;
        font-weight:900;
        font-size:12px;
        box-shadow:0 8px 25px rgba(0,0,0,.35);
      `;

      button.onclick = () => this.toggle();

      document.body.appendChild(button);
    },

    createPanel() {
      if (document.getElementById("empireMarketPanel")) return;

      this.panel = document.createElement("div");

      this.panel.id = "empireMarketPanel";

      this.panel.style.cssText = `
        position:fixed;
        inset:0;
        z-index:10000;
        display:none;
        overflow:auto;
        background:rgba(3,7,18,.92);
        backdrop-filter:blur(12px);
        padding:18px;
        box-sizing:border-box;
        color:#fff;
        font-family:Arial,sans-serif;
      `;

      document.body.appendChild(this.panel);
      this.render();
    },

    render() {
      if (!this.panel) return;

      const companies = this.companies();

      if (!companies.length) {
        this.panel.innerHTML = `
          <div style="${this.wrapStyle()}">
            <h1>Market & Competition</h1>
            <p style="opacity:.65">
              Start a business to enter the market.
            </p>
            <button
              onclick="EmpireCompetitionMarketUI.close()"
              style="${this.buttonStyle()}"
            >
              CLOSE
            </button>
          </div>
        `;
        return;
      }

      const company = this.selectedCompany();
      const data = this.snapshot(company);

      this.panel.innerHTML = `
        <div style="${this.wrapStyle()}">

          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:12px;
            margin-bottom:18px;
          ">
            <div>
              <div style="
                font-size:10px;
                opacity:.55;
                letter-spacing:1.5px;
              ">
                EMPIRE RUSH
              </div>

              <h1 style="
                margin:4px 0;
                font-size:26px;
              ">
                Market & Competition
              </h1>
            </div>

            <button
              onclick="EmpireCompetitionMarketUI.close()"
              style="${this.buttonStyle()}"
            >
              CLOSE
            </button>
          </div>

          <div style="${this.cardStyle()}">

            <div style="
              font-size:10px;
              opacity:.55;
              margin-bottom:7px;
            ">
              COMPANY
            </div>

            <select
              id="empireMarketCompany"
              onchange="EmpireCompetitionMarketUI.render()"
              style="${this.selectStyle()}"
            >
              ${companies.map(c => `
                <option
                  value="${this.escape(c.id)}"
                  ${
                    String(c.id) === String(company.id)
                      ? "selected"
                      : ""
                  }
                >
                  ${this.escape(c.name)}
                </option>
              `).join("")}
            </select>

          </div>

          ${this.eventCard(data.event)}

          <div style="${this.cardStyle()}">
            <h3 style="margin-top:0">
              Market Conditions
            </h3>

            <div style="
              display:grid;
              grid-template-columns:
              repeat(auto-fit,minmax(145px,1fr));
              gap:10px;
            ">

              ${this.metric(
                "Demand",
                data.demand,
                "100 = normal"
              )}

              ${this.metric(
                "Inflation",
                data.inflation,
                "100 = normal"
              )}

              ${this.metric(
                "Supply",
                data.supply,
                "100 = normal"
              )}

              ${this.metric(
                "Labor Cost",
                data.labor,
                "100 = normal"
              )}

              ${this.metric(
                "Interest",
                data.interest,
                "100 = normal"
              )}

              ${this.metric(
                "Consumer Confidence",
                data.confidence,
                "100 = normal"
              )}

              ${this.metric(
                "Business Confidence",
                data.businessConfidence,
                "100 = normal"
              )}

            </div>
          </div>

          <div style="${this.cardStyle()}">

            <h3 style="margin-top:0">
              Competitive Pressure
            </h3>

            ${this.progress(
              "Competition",
              data.competition,
              100
            )}

            ${this.progress(
              "Price Pressure",
              data.pricePressure,
              100
            )}

            <div style="
              margin-top:15px;
              padding:12px;
              border-radius:12px;
              background:rgba(255,255,255,.05);
              font-size:12px;
              line-height:1.5;
            ">
              ${this.competitionAdvice(data)}
            </div>

          </div>

          <div style="${this.cardStyle()}">

            <h3 style="margin-top:0">
              Market Strategy
            </h3>

            <div style="
              display:grid;
              grid-template-columns:
              repeat(auto-fit,minmax(150px,1fr));
              gap:10px;
            ">

              <button
                onclick="
                  EmpireCompetitionMarketUI.strategy('price')
                "
                style="${this.buttonStyle()}"
              >
                PRICE STRATEGY
              </button>

              <button
                onclick="
                  EmpireCompetitionMarketUI.strategy('growth')
                "
                style="${this.buttonStyle()}"
              >
                GROWTH STRATEGY
              </button>

              <button
                onclick="
                  EmpireCompetitionMarketUI.strategy('defensive')
                "
                style="${this.buttonStyle()}"
              >
                DEFENSIVE MODE
              </button>

            </div>

          </div>

          <div style="${this.cardStyle()}">

            <h3 style="margin-top:0">
              Market Intelligence
            </h3>

            <div style="
              font-size:12px;
              line-height:1.7;
              opacity:.78;
            ">
              Market conditions change over time.
              Demand affects sales, inflation affects
              operating costs, labor costs affect payroll,
              supply affects production, and competition
              affects pricing and customer acquisition.
            </div>

          </div>

        </div>
      `;
    },

    eventCard(event) {
      if (!event) {
        return `
          <div style="${this.cardStyle()}">
            <h3 style="margin:0 0 7px">
              No Major Market Event
            </h3>
            <div style="font-size:12px;opacity:.6">
              Markets are currently relatively stable.
            </div>
          </div>
        `;
      }

      const title =
        event.title ||
        event.name ||
        event.label ||
        "Market Event";

      const description =
        event.description ||
        event.message ||
        "A market event is affecting businesses.";

      return `
        <div style="
          ${this.cardStyle()}
          border:1px solid rgba(255,255,255,.12);
        ">

          <div style="
            font-size:10px;
            opacity:.55;
            letter-spacing:1px;
          ">
            ACTIVE MARKET EVENT
          </div>

          <h2 style="
            margin:6px 0;
            font-size:20px;
          ">
            ${this.escape(title)}
          </h2>

          <div style="
            font-size:12px;
            line-height:1.5;
            opacity:.75;
          ">
            ${this.escape(description)}
          </div>

        </div>
      `;
    },

    metric(title, value, note) {
      const n = Number(value || 0);

      let label = Math.round(n);

      if (title === "Competition" ||
          title === "Price Pressure") {
        label = Math.round(n) + "%";
      } else {
        label = Math.round(n);
      }

      return `
        <div style="
          padding:14px;
          border-radius:14px;
          background:rgba(255,255,255,.05);
        ">

          <div style="
            font-size:10px;
            opacity:.55;
            text-transform:uppercase;
          ">
            ${title}
          </div>

          <div style="
            font-size:22px;
            font-weight:900;
            margin-top:5px;
          ">
            ${label}
          </div>

          <div style="
            font-size:9px;
            opacity:.45;
            margin-top:3px;
          ">
            ${note}
          </div>

        </div>
      `;
    },

    progress(title, value, max) {
      const n = Math.max(
        0,
        Math.min(
          max,
          Number(value || 0)
        )
      );

      return `
        <div style="margin:13px 0">

          <div style="
            display:flex;
            justify-content:space-between;
            font-size:11px;
            margin-bottom:6px;
          ">
            <span>${title}</span>
            <b>${Math.round(n)}%</b>
          </div>

          <div style="
            height:8px;
            border-radius:20px;
            background:rgba(255,255,255,.08);
            overflow:hidden;
          ">
            <div style="
              width:${n}%;
              height:100%;
              background:#3b82f6;
            "></div>
          </div>

        </div>
      `;
    },

    competitionAdvice(data) {
      if (data.competition >= 75) {
        return `
          <b>Very High Competition.</b><br>
          Competitors are aggressively fighting for
          customers. Improve quality, differentiation
          and customer retention before raising prices.
        `;
      }

      if (data.competition >= 50) {
        return `
          <b>High Competition.</b><br>
          Monitor competitor pricing and protect your
          reputation and repeat customers.
        `;
      }

      if (data.demand < 75) {
        return `
          <b>Weak Demand.</b><br>
          Avoid unnecessary expansion. Preserve cash
          and focus on efficient operations.
        `;
      }

      if (data.inflation >= 120) {
        return `
          <b>Inflation Pressure.</b><br>
          Operating costs are rising. Review suppliers,
          inventory and pricing.
        `;
      }

      if (data.supply < 80) {
        return `
          <b>Supply Risk.</b><br>
          Consider securing suppliers and maintaining
          strategic inventory.
        `;
      }

      return `
        <b>Healthy Market.</b><br>
        Conditions currently support controlled growth.
        Continue monitoring competition and costs.
      `;
    },

    strategy(type) {
      const company = this.selectedCompany();

      if (!company) return;

      let result = null;

      if (
        typeof Market.setStrategy === "function"
      ) {
        result = Market.setStrategy(
          company,
          type
        );
      }

      if (
        result &&
        result.success === false
      ) {
        this.toast(
          result.reason ||
          "Strategy could not be applied."
        );
        return;
      }

      this.toast(
        type.toUpperCase() +
        " strategy selected."
      );

      this.render();
    },

    open() {
      this.createButton();
      this.createPanel();

      this.panel.style.display = "block";
      this.render();
    },

    close() {
      if (this.panel) {
        this.panel.style.display = "none";
      }
    },

    toggle() {
      if (
        this.panel &&
        this.panel.style.display === "block"
      ) {
        this.close();
      } else {
        this.open();
      }
    },

    toast(message) {
      const el = document.createElement("div");

      el.textContent = message;

      el.style.cssText = `
        position:fixed;
        left:50%;
        bottom:30px;
        transform:translateX(-50%);
        z-index:11001;
        padding:12px 18px;
        border-radius:12px;
        background:#111827;
        color:white;
        font-size:12px;
        font-weight:800;
        box-shadow:0 10px 30px rgba(0,0,0,.4);
      `;

      document.body.appendChild(el);

      setTimeout(() => el.remove(), 2200);
    },

    wrapStyle() {
      return `
        max-width:850px;
        margin:20px auto 60px;
      `;
    },

    cardStyle() {
      return `
        background:#111827;
        border-radius:18px;
        padding:18px;
        margin-bottom:12px;
        box-shadow:0 8px 25px rgba(0,0,0,.18);
      `;
    },

    buttonStyle() {
      return `
        background:#2563eb;
        color:#fff;
        border:0;
        border-radius:10px;
        padding:10px 13px;
        font-size:11px;
        font-weight:900;
      `;
    },

    selectStyle() {
      return `
        width:100%;
        padding:12px;
        border-radius:10px;
        background:#1f2937;
        color:white;
        border:1px solid rgba(255,255,255,.12);
      `;
    },

    escape(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  };

  window.EmpireCompetitionMarketUI = UI;

  function boot() {
    UI.createButton();
    UI.createPanel();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      boot
    );
  } else {
    boot();
  }

  [
    "EmpireDayAdvanced",
    "EmpireBusinessStarted",
    "EmpireBusinessLaunched",
    "EmpireMarketEvent"
  ].forEach(eventName => {
    window.addEventListener(
      eventName,
      () => {
        if (UI.panel) UI.render();
      }
    );
  });

  console.log(
    "Empire Rush: Competition & Market UI loaded."
  );

})();
