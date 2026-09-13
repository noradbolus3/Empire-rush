(function () {
  "use strict";

  const Game = window.EmpireGameState;

  if (!Game) {
    console.warn("Empire Rush HUD: GameState not ready.");
    return;
  }

  const HUD = {
    root: null,
    moreMenu: null,
    companyId: null,

    money(value) {
      const n = Number(value || 0);

      if (Math.abs(n) >= 10000000) {
        return "₹" + (n / 10000000).toFixed(1) + "Cr";
      }

      if (Math.abs(n) >= 100000) {
        return "₹" + (n / 100000).toFixed(1) + "L";
      }

      return "₹" + Math.round(n).toLocaleString("en-IN");
    },

    getState() {
      try {
        return Game.getState() || {};
      } catch {
        return {};
      }
    },

    getCompanies() {
      return this.getState().companies || [];
    },

    getPlayer() {
      return this.getState().player || {};
    },

    getWorld() {
      return this.getState().world || {};
    },

    getCompany() {
      const companies = this.getCompanies();

      if (!companies.length) return null;

      if (this.companyId) {
        const found = companies.find(
          c => String(c.id) === String(this.companyId)
        );

        if (found) return found;
      }

      return companies[0];
    },

    number(value) {
      return Math.round(Number(value || 0)).toLocaleString("en-IN");
    },

    /* =========================================================
       ROOT
       ========================================================= */

    createRoot() {
      if (document.getElementById("empireMainHUD")) {
        this.root = document.getElementById("empireMainHUD");
        return;
      }

      this.root = document.createElement("div");
      this.root.id = "empireMainHUD";

      this.root.innerHTML = `
        <div id="empireHUDTop"></div>
        <div id="empireHUDContent"></div>
        <div id="empireHUDBottom"></div>
        <div id="empireHUDMore"></div>
      `;

      document.body.appendChild(this.root);

      this.injectStyles();
    },

    /* =========================================================
       STYLE
       ========================================================= */

    injectStyles() {
      if (document.getElementById("empireHUDStyles")) return;

      const style = document.createElement("style");
      style.id = "empireHUDStyles";

      style.textContent = `
        #empireMainHUD {
          position:fixed;
          inset:0;
          z-index:8000;
          pointer-events:none;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
          color:#fff;
        }

        #empireHUDTop,
        #empireHUDContent,
        #empireHUDBottom,
        #empireHUDMore {
          pointer-events:none;
        }

        .er-hud-top {
          position:absolute;
          top:10px;
          left:10px;
          right:10px;
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:10px;
        }

        .er-player-card,
        .er-money-card,
        .er-company-card {
          background:rgba(10,15,25,.88);
          border:1px solid rgba(255,255,255,.10);
          box-shadow:
            0 10px 30px rgba(0,0,0,.30),
            inset 0 1px 0 rgba(255,255,255,.05);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
        }

        .er-player-card {
          min-width:180px;
          max-width:250px;
          padding:10px 12px;
          border-radius:17px;
        }

        .er-money-card {
          padding:9px 12px;
          border-radius:16px;
          min-width:155px;
        }

        .er-company-card {
          position:absolute;
          top:74px;
          left:10px;
          right:10px;
          max-width:440px;
          padding:10px 12px;
          border-radius:16px;
        }

        .er-label {
          font-size:8px;
          font-weight:800;
          letter-spacing:1.2px;
          opacity:.48;
          text-transform:uppercase;
        }

        .er-name {
          font-size:14px;
          font-weight:900;
          margin-top:2px;
        }

        .er-job {
          font-size:10px;
          opacity:.65;
          margin-top:2px;
        }

        .er-money {
          font-size:17px;
          font-weight:950;
          margin-top:2px;
        }

        .er-date {
          font-size:9px;
          opacity:.55;
          margin-top:3px;
        }

        .er-row {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
        }

        .er-stats {
          display:grid;
          grid-template-columns:
            repeat(4,1fr);
          gap:7px;
          margin-top:8px;
        }

        .er-stat {
          min-width:0;
          padding:7px 8px;
          border-radius:11px;
          background:rgba(255,255,255,.055);
        }

        .er-stat-title {
          font-size:7px;
          opacity:.45;
          text-transform:uppercase;
          letter-spacing:.5px;
        }

        .er-stat-value {
          font-size:11px;
          font-weight:900;
          margin-top:3px;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .er-status {
          display:inline-flex;
          align-items:center;
          gap:5px;
          padding:4px 7px;
          border-radius:8px;
          background:rgba(255,255,255,.07);
          font-size:8px;
          font-weight:800;
        }

        .er-dot {
          width:6px;
          height:6px;
          border-radius:50%;
          background:#55d68a;
          box-shadow:0 0 8px rgba(85,214,138,.7);
        }

        .er-content {
          position:absolute;
          left:10px;
          right:10px;
          bottom:82px;
          display:flex;
          justify-content:center;
        }

        .er-alert {
          max-width:420px;
          padding:9px 12px;
          border-radius:12px;
          background:rgba(12,18,29,.88);
          border:1px solid rgba(255,255,255,.09);
          box-shadow:0 8px 25px rgba(0,0,0,.25);
          font-size:10px;
          font-weight:700;
          opacity:0;
          transform:translateY(8px);
          transition:.25s ease;
        }

        .er-alert.show {
          opacity:1;
          transform:translateY(0);
        }

        .er-bottom {
          position:absolute;
          left:8px;
          right:8px;
          bottom:
            max(8px, env(safe-area-inset-bottom));
          padding:7px;
          border-radius:20px;
          background:rgba(7,11,19,.93);
          border:1px solid rgba(255,255,255,.10);
          box-shadow:0 -10px 35px rgba(0,0,0,.35);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          display:grid;
          grid-template-columns:
            repeat(5,1fr);
          gap:5px;
          pointer-events:auto;
        }

        .er-nav {
          min-height:49px;
          border:0;
          border-radius:14px;
          background:transparent;
          color:#fff;
          opacity:.55;
          font-size:8px;
          font-weight:900;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:3px;
          touch-action:manipulation;
        }

        .er-nav-icon {
          font-size:18px;
          line-height:18px;
        }

        .er-nav.active {
          opacity:1;
          background:rgba(255,255,255,.08);
        }

        .er-more {
          position:absolute;
          left:8px;
          right:8px;
          bottom:78px;
          display:none;
          grid-template-columns:
            repeat(3,1fr);
          gap:8px;
          padding:10px;
          border-radius:18px;
          background:rgba(7,11,19,.96);
          border:1px solid rgba(255,255,255,.10);
          box-shadow:0 15px 45px rgba(0,0,0,.45);
          pointer-events:auto;
          backdrop-filter:blur(18px);
        }

        .er-more.open {
          display:grid;
        }

        .er-more-button {
          min-height:54px;
          border:0;
          border-radius:13px;
          background:rgba(255,255,255,.06);
          color:#fff;
          font-size:9px;
          font-weight:850;
          touch-action:manipulation;
        }

        .er-more-icon {
          display:block;
          font-size:20px;
          margin-bottom:4px;
        }

        @media (min-width:700px) {
          .er-hud-top {
            left:18px;
            right:18px;
            top:16px;
          }

          .er-company-card {
            left:18px;
            top:82px;
          }

          .er-bottom {
            left:50%;
            right:auto;
            width:min(600px,calc(100% - 30px));
            transform:translateX(-50%);
          }

          .er-more {
            left:50%;
            right:auto;
            width:min(600px,calc(100% - 30px));
            transform:translateX(-50%);
          }
        }

        @media (max-width:420px) {
          .er-player-card {
            min-width:145px;
          }

          .er-money-card {
            min-width:125px;
          }

          .er-stats {
            gap:4px;
          }

          .er-stat {
            padding:6px;
          }

          .er-stat-value {
            font-size:10px;
          }
        }
      `;

      document.head.appendChild(style);
    },

    /* =========================================================
       TOP HUD
       ========================================================= */

    renderTop() {
      const top =
        document.getElementById("empireHUDTop");

      const player = this.getPlayer();
      const world = this.getWorld();

      const cash =
        Number(player.cash || 0);

      const savings =
        Number(player.savings || 0);

      const bank =
        this.getState().bank || {};

      const bankSavings =
        Number(bank.savings || 0);

      const netWorth =
        cash +
        savings +
        bankSavings;

      const day =
        world.day || 1;

      const month =
        world.month || 1;

      const year =
        world.year || 1;

      top.innerHTML = `
        <div class="er-player-card">

          <div class="er-label">
            FOUNDER
          </div>

          <div class="er-name">
            ${this.escape(player.name || "Founder")}
          </div>

          <div class="er-job">
            ${this.escape(
              player.currentJob ||
              "Unemployed"
            )}
          </div>

          <div style="
            margin-top:7px;
            display:flex;
            justify-content:space-between;
            gap:6px;
            align-items:center;
          ">

            <span class="er-status">
              <span class="er-dot"></span>
              ${
                this.escape(
                  player.jobLevel ||
                  "Entry"
                )
              }
            </span>

            <span style="
              font-size:8px;
              opacity:.5;
            ">
              AGE ${Number(player.age || 22)}
            </span>

          </div>

        </div>

        <div class="er-money-card">

          <div class="er-label">
            PERSONAL WEALTH
          </div>

          <div class="er-money">
            ${this.money(netWorth)}
          </div>

          <div class="er-date">
            Cash ${this.money(cash)}
            · Savings ${this.money(
              savings + bankSavings
            )}
          </div>

          <div class="er-date">
            Year ${year}
            · Month ${month}
            · Day ${day}
          </div>

        </div>
      `;
    },

    /* =========================================================
       COMPANY HUD
       ========================================================= */

    renderCompany() {
      const content =
        document.getElementById(
          "empireHUDContent"
        );

      const company =
        this.getCompany();

      if (!company) {
        content.innerHTML = `
          <div class="er-content">
            <div class="er-alert show">
              💼 Get a job and build your capital to
              start your first business.
            </div>
          </div>
        `;
        return;
      }

      const finance =
        company.finance || {};

      const revenue =
        Number(
          finance.totalRevenue ||
          finance.revenue ||
          company.revenue ||
          0
        );

      const expenses =
        Number(
          finance.totalExpenses ||
          finance.expenses ||
          company.expenses ||
          0
        );

      const profit =
        Number(
          finance.profit ??
          company.profit ??
          (revenue - expenses)
        );

      const valuation =
        Number(
          company.valuation ||
          finance.valuation ||
          0
        );

      const employees =
        (company.employees || []).length;

      const status =
        company.status ||
        "Operating";

      content.innerHTML = `
        <div class="er-company-card">

          <div class="er-row">

            <div style="min-width:0">

              <div class="er-label">
                COMPANY
              </div>

              <div class="er-name" style="
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
              ">
                ${this.escape(
                  company.name ||
                  "My Company"
                )}
              </div>

            </div>

            <span class="er-status">
              <span class="er-dot"></span>
              ${this.escape(status)}
            </span>

          </div>

          <div class="er-stats">

            <div class="er-stat">
              <div class="er-stat-title">
                Revenue
              </div>
              <div class="er-stat-value">
                ${this.money(revenue)}
              </div>
            </div>

            <div class="er-stat">
              <div class="er-stat-title">
                Profit
              </div>
              <div class="er-stat-value">
                ${this.money(profit)}
              </div>
            </div>

            <div class="er-stat">
              <div class="er-stat-title">
                Employees
              </div>
              <div class="er-stat-value">
                ${this.number(employees)}
              </div>
            </div>

            <div class="er-stat">
              <div class="er-stat-title">
                Valuation
              </div>
              <div class="er-stat-value">
                ${this.money(valuation)}
              </div>
            </div>

          </div>

        </div>
      `;
    },

    /* =========================================================
       BOTTOM NAV
       ========================================================= */

    renderBottom() {
      const bottom =
        document.getElementById(
          "empireHUDBottom"
        );

      bottom.innerHTML = `
        <div class="er-bottom">

          <button
            class="er-nav active"
            onclick="
              EmpireMainHUD.home()
            "
          >
            <span class="er-nav-icon">⌂</span>
            HOME
          </button>

          <button
            class="er-nav"
            onclick="
              EmpireMainHUD.openCareer()
            "
          >
            <span class="er-nav-icon">💼</span>
            CAREER
          </button>

          <button
            class="er-nav"
            onclick="
              EmpireMainHUD.openBusiness()
            "
          >
            <span class="er-nav-icon">🏢</span>
            BUSINESS
          </button>

          <button
            class="er-nav"
            onclick="
              EmpireMainHUD.openFinance()
            "
          >
            <span class="er-nav-icon">₹</span>
            FINANCE
          </button>

          <button
            class="er-nav"
            onclick="
              EmpireMainHUD.toggleMore()
            "
          >
            <span class="er-nav-icon">☰</span>
            MORE
          </button>

        </div>
      `;
    },

    /* =========================================================
       MORE MENU
       ========================================================= */

    renderMore() {
      const menu =
        document.getElementById(
          "empireHUDMore"
        );

      menu.innerHTML = `
        <div class="er-more">

          <button
            class="er-more-button"
            onclick="
              EmpireMainHUD.openProducts()
            "
          >
            <span class="er-more-icon">📦</span>
            PRODUCTS
          </button>

          <button
            class="er-more-button"
            onclick="
              EmpireMainHUD.openHR()
            "
          >
            <span class="er-more-icon">👥</span>
            HR
          </button>

          <button
            class="er-more-button"
            onclick="
              EmpireMainHUD.openGovernment()
            "
          >
            <span class="er-more-icon">🏛️</span>
            GOVERNMENT
          </button>

          <button
            class="er-more-button"
            onclick="
              EmpireMainHUD.openMarket()
            "
          >
            <span class="er-more-icon">📈</span>
            MARKET
          </button>

          <button
            class="er-more-button"
            onclick="
              EmpireMainHUD.openNews()
            "
          >
            <span class="er-more-icon">📰</span>
            NEWS
          </button>

          <button
            class="er-more-button"
            onclick="
              EmpireMainHUD.openCorporate()
            "
          >
            <span class="er-more-icon">🏙️</span>
            CORPORATE
          </button>

          <button
            class="er-more-button"
            onclick="
              EmpireMainHUD.saveGame()
            "
          >
            <span class="er-more-icon">💾</span>
            SAVE
          </button>

          <button
            class="er-more-button"
            onclick="
              EmpireMainHUD.closeMore()
            "
          >
            <span class="er-more-icon">×</span>
            CLOSE
          </button>

        </div>
      `;
    },

    /* =========================================================
       MODULE OPENERS
       ========================================================= */

    invoke(names) {
      this.closeMore();

      for (const name of names) {
        const fn =
          name
            .split(".")
            .reduce(
              (obj, key) =>
                obj &&
                obj[key],
              window
            );

        if (typeof fn === "function") {
          try {
            fn();
            return true;
          } catch (error) {
            console.warn(
              "HUD module action failed:",
              name,
              error
            );
          }
        }
      }

      return false;
    },

    openCareer() {
      if (
        this.invoke([
          "EmpireCareerBusinessUI.open",
          "EmpireCareerUI.open",
          "EmpireCareerBusiness.open"
        ])
      ) return;

      this.toast(
        "Career dashboard unavailable."
      );
    },

    openBusiness() {
      if (
        this.invoke([
          "EmpireBusinessOperationsUI.open",
          "EmpireBusinessUI.open",
          "EmpireBusinessOperations.open"
        ])
      ) return;

      this.toast(
        "Business dashboard unavailable."
      );
    },

    openFinance() {
      if (
        this.invoke([
          "EmpireBanking.open",
          "EmpireBankingUI.open",
          "EmpireFinanceUI.open",
          "EmpireFinancingUI.open"
        ])
      ) return;

      this.toast(
        "Finance dashboard unavailable."
      );
    },

    openProducts() {
      if (
        this.invoke([
          "EmpireProductUI.open",
          "EmpireProductManagementUI.open",
          "EmpireProductsUI.open"
        ])
      ) return;

      this.toast(
        "Product dashboard unavailable."
      );
    },

    openHR() {
      if (
        this.invoke([
          "EmpireHRUI.open",
          "EmpireHR.open",
          "EmpireHumanResourcesUI.open"
        ])
      ) return;

      this.toast(
        "HR dashboard unavailable."
      );
    },

    openGovernment() {
      if (
        this.invoke([
          "EmpireGovernmentUI.open",
          "EmpireComplianceUI.open"
        ])
      ) return;

      this.toast(
        "Government dashboard unavailable."
      );
    },

    openMarket() {
      if (
        this.invoke([
          "EmpireCompetitionMarketUI.open",
          "EmpireMarketUI.open"
        ])
      ) return;

      this.toast(
        "Market dashboard unavailable."
      );
    },

    openNews() {
      if (
        this.invoke([
          "EmpireNewsDecisionUI.open",
          "EmpireNewsUI.open"
        ])
      ) return;

      this.toast(
        "News dashboard unavailable."
      );
    },

    openCorporate() {
      if (
        this.invoke([
          "EmpireCompanyGroupUI.open",
          "EmpireCorporateUI.open",
          "EmpireGroupUI.open"
        ])
      ) return;

      this.toast(
        "Corporate dashboard unavailable."
      );
    },

    /* =========================================================
       NAV ACTIONS
       ========================================================= */

    home() {
      this.closeMore();
      this.render();

      this.toast(
        "Empire Rush command center"
      );
    },

    toggleMore() {
      const menu =
        document.querySelector(
          ".er-more"
        );

      if (!menu) return;

      menu.classList.toggle("open");
    },

    closeMore() {
      const menu =
        document.querySelector(
          ".er-more"
        );

      if (menu) {
        menu.classList.remove("open");
      }
    },

    saveGame() {
      this.closeMore();

      try {
        if (typeof Game.save === "function") {
          Game.save();
        }

        this.toast(
          "Game saved."
        );
      } catch {
        this.toast(
          "Save failed."
        );
      }
    },

    /* =========================================================
       ALERT
       ========================================================= */

    toast(message) {
      const old =
        document.getElementById(
          "empireHUDToast"
        );

      if (old) old.remove();

      const alert =
        document.createElement("div");

      alert.id =
        "empireHUDToast";

      alert.className =
        "er-alert show";

      alert.textContent =
        message;

      document
        .getElementById(
          "empireHUDContent"
        )
        ?.appendChild(alert);

      setTimeout(() => {
        alert.classList.remove("show");

        setTimeout(
          () => alert.remove(),
          250
        );
      }, 1800);
    },

    /* =========================================================
       REFRESH
       ========================================================= */

    render() {
      this.createRoot();

      this.renderTop();
      this.renderCompany();
      this.renderBottom();
      this.renderMore();
    },

    /* =========================================================
       UTILS
       ========================================================= */

    escape(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    start() {
      this.render();

      setInterval(() => {
        this.renderTop();
        this.renderCompany();
      }, 1000);
    }
  };

  window.EmpireMainHUD = HUD;

  function boot() {
    HUD.start();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      boot
    );
  } else {
    boot();
  }

  [
    "EmpireGameStateChanged",
    "EmpireDayAdvanced",
    "EmpireMonthAdvanced",
    "EmpireBusinessStarted",
    "EmpireBusinessLaunched",
    "EmpireEmployeeHired",
    "EmpireEmployeePromoted"
  ].forEach(eventName => {
    window.addEventListener(
      eventName,
      () => {
        HUD.render();
      }
    );
  });

  console.log(
    "Empire Rush: Main Game HUD loaded."
  );

})();
