(function () {
  "use strict";

  const Game = window.EmpireGameState;

  if (!Game) {
    console.warn("Empire Rush HUD: GameState not ready.");
    return;
  }

  const HUD = {
    root: null,
    refreshTimer: null,
    companyId: null,

    /* =========================================================
       DATA
       ========================================================= */

    getState() {
      try {
        return Game.getState() || {};
      } catch (e) {
        return {};
      }
    },

    getPlayer() {
      return this.getState().player || {};
    },

    getWorld() {
      return this.getState().world || {};
    },

    getCompanies() {
      return this.getState().companies || [];
    },

    getCompany() {
      const companies = this.getCompanies();

      if (!companies.length) {
        return null;
      }

      if (this.companyId) {
        const found = companies.find(
          c => String(c.id) === String(this.companyId)
        );

        if (found) {
          return found;
        }
      }

      return companies[0];
    },

    getWealth() {
      const state = this.getState();
      const player = state.player || {};
      const bank = state.bank || {};

      const cash = Number(player.cash || 0);
      const savings = Number(player.savings || 0);
      const bankSavings = Number(bank.savings || 0);

      return {
        cash,
        savings: savings + bankSavings,
        total: cash + savings + bankSavings
      };
    },

    money(value) {
      const n = Number(value || 0);

      if (Math.abs(n) >= 10000000) {
        return (
          "₹" +
          (n / 10000000).toFixed(1) +
          "Cr"
        );
      }

      if (Math.abs(n) >= 100000) {
        return (
          "₹" +
          (n / 100000).toFixed(1) +
          "L"
        );
      }

      if (Math.abs(n) >= 1000) {
        return (
          "₹" +
          (n / 1000).toFixed(1) +
          "K"
        );
      }

      return (
        "₹" +
        Math.round(n).toLocaleString("en-IN")
      );
    },

    number(value) {
      return Math.round(Number(value || 0))
        .toLocaleString("en-IN");
    },

    escape(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    /* =========================================================
       ROOT
       ========================================================= */

    createRoot() {
      let root =
        document.getElementById("empireMainHUD");

      if (root) {
        this.root = root;
        return;
      }

      root = document.createElement("div");
      root.id = "empireMainHUD";

      root.innerHTML = `
        <div id="empireHUDTop"></div>
        <div id="empireHUDContent"></div>
        <div id="empireHUDBottom"></div>
        <div id="empireHUDMore"></div>
        <div id="empireHUDSide"></div>
        <div id="empireHUDCommand"></div>
      `;

      document.body.appendChild(root);

      this.root = root;

      this.injectStyles();
    },

    /* =========================================================
       CSS
       ========================================================= */

    injectStyles() {
      if (
        document.getElementById(
          "empireHUDStyles"
        )
      ) {
        return;
      }

      const style =
        document.createElement("style");

      style.id =
        "empireHUDStyles";

      style.textContent = `

        /* =====================================================
           ROOT
           ===================================================== */

        #empireMainHUD {
          position:fixed !important;
          inset:0 !important;
          z-index:9000 !important;
          pointer-events:none !important;

          color:#fff;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Arial,
            sans-serif;

          -webkit-font-smoothing:antialiased;
          text-rendering:optimizeLegibility;
        }

        #empireHUDTop,
        #empireHUDContent,
        #empireHUDBottom,
        #empireHUDMore,
        #empireHUDSide,
        #empireHUDCommand {
          pointer-events:none;
        }

        /* =====================================================
           TOP HEADER
           ===================================================== */

        .er-header {
          position:absolute;

          top:
            max(7px, env(safe-area-inset-top));

          left:8px;
          right:8px;

          height:52px;

          display:flex;
          align-items:center;

          padding:5px 7px;

          border-radius:16px;

          background:
            rgba(8,13,21,.94);

          border:
            1px solid
            rgba(255,255,255,.13);

          box-shadow:
            0 8px 28px
            rgba(0,0,0,.30),
            inset 0 1px 0
            rgba(255,255,255,.06);

          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);

          pointer-events:auto;

          overflow:hidden;
        }

        /* =====================================================
           BRAND
           ===================================================== */

        .er-brand {
          display:flex;
          align-items:center;
          gap:7px;

          width:82px;
          min-width:82px;
        }

        .er-brand-icon {
          width:28px;
          height:28px;

          display:flex;
          align-items:center;
          justify-content:center;

          flex:0 0 28px;

          border-radius:9px;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.16),
              rgba(255,255,255,.05)
            );

          border:
            1px solid
            rgba(255,255,255,.14);

          font-size:12px;
          font-weight:950;
        }

        .er-brand-main {
          font-size:11px;
          line-height:1;

          font-weight:950;

          letter-spacing:1px;
        }

        .er-brand-sub {
          margin-top:3px;

          font-size:5px;
          line-height:1;

          font-weight:800;

          letter-spacing:.7px;

          opacity:.45;
        }

        /* =====================================================
           PLAYER
           ===================================================== */

        .er-player {
          min-width:0;
          flex:1;

          display:flex;
          align-items:center;

          padding:0 5px;
        }

        .er-avatar {
          width:28px;
          height:28px;

          flex:0 0 28px;

          display:flex;
          align-items:center;
          justify-content:center;

          border-radius:50%;

          background:
            rgba(255,255,255,.10);

          border:
            1px solid
            rgba(255,255,255,.13);

          font-size:11px;
          font-weight:900;
        }

        .er-player-info {
          min-width:0;
          margin-left:6px;
        }

        .er-player-name {
          font-size:10px;
          font-weight:900;

          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .er-player-role {
          margin-top:2px;

          font-size:6px;
          font-weight:700;

          opacity:.48;

          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        /* =====================================================
           CASH
           ===================================================== */

        .er-cash {
          min-width:58px;

          padding:5px 7px;

          text-align:center;

          border-radius:10px;

          background:
            rgba(255,255,255,.055);

          border:
            1px solid
            rgba(255,255,255,.07);
        }

        .er-label {
          font-size:5px;
          font-weight:800;

          letter-spacing:.7px;

          opacity:.42;
        }

        .er-cash-value {
          margin-top:2px;

          font-size:10px;
          font-weight:950;
        }

        /* =====================================================
           DAY
           ===================================================== */

        .er-day {
          min-width:43px;

          margin-left:5px;

          padding:5px 6px;

          text-align:center;

          border-radius:10px;

          background:
            rgba(255,255,255,.055);

          border:
            1px solid
            rgba(255,255,255,.07);
        }

        .er-day-value {
          margin-top:2px;

          font-size:9px;
          font-weight:950;
        }

        /* =====================================================
           MENU
           ===================================================== */

        .er-header-menu {
          width:30px;
          height:30px;

          flex:0 0 30px;

          margin-left:5px;

          padding:0;

          border:0;
          border-radius:9px;

          background:
            rgba(255,255,255,.08);

          color:#fff;

          display:flex;
          align-items:center;
          justify-content:center;

          font-size:15px;
          font-weight:900;

          touch-action:manipulation;
        }

        /* =====================================================
           STATUS STRIP
           ===================================================== */

        .er-status-strip {
          position:absolute;

          top:
            calc(
              max(7px, env(safe-area-inset-top))
              + 58px
            );

          left:9px;
          right:9px;

          height:30px;

          padding:0 9px;

          display:flex;
          align-items:center;

          border-radius:10px;

          background:
            rgba(8,13,21,.78);

          border:
            1px solid
            rgba(255,255,255,.08);

          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);

          pointer-events:none;
        }

        .er-status-left {
          min-width:0;
          flex:1;

          display:flex;
          align-items:center;

          gap:6px;
        }

        .er-status-dot {
          width:6px;
          height:6px;

          flex:0 0 6px;

          border-radius:50%;

          background:#f1bd45;

          box-shadow:
            0 0 8px
            rgba(241,189,69,.65);
        }

        .er-status-title {
          font-size:7px;
          font-weight:900;

          white-space:nowrap;
        }

        .er-status-divider {
          font-size:8px;
          opacity:.3;
        }

        .er-status-sub {
          font-size:6px;
          font-weight:700;
          opacity:.45;
        }

        .er-status-company {
          max-width:140px;

          font-size:6px;
          font-weight:800;

          opacity:.55;

          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        /* =====================================================
           RIGHT BUTTONS
           ===================================================== */

        .er-side {
          position:absolute;

          right:8px;
          top:50%;

          transform:
            translateY(-42%);

          width:124px;

          display:flex;
          flex-direction:column;

          gap:5px;

          pointer-events:auto;
        }

        .er-side-gap {
          height:25px;
          flex:0 0 25px;
        }

        .er-side-button {
          width:100%;
          height:38px;

          padding:0 9px;

          display:flex;
          align-items:center;

          gap:7px;

          border-radius:12px;

          border:
            1px solid
            rgba(255,255,255,.09);

          background:
            rgba(7,12,20,.92);

          color:#fff;

          box-shadow:
            0 7px 20px
            rgba(0,0,0,.22);

          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);

          font-size:8px;
          font-weight:900;

          touch-action:manipulation;
        }

        .er-side-button:active {
          transform:scale(.97);
        }

        .er-side-icon {
          width:20px;
          height:20px;

          flex:0 0 20px;

          display:flex;
          align-items:center;
          justify-content:center;

          font-size:12px;
        }

        .er-side-arrow {
          margin-left:auto;
          opacity:.45;
          font-size:13px;
        }

        /* =====================================================
           COMMAND CENTER
           ===================================================== */

        .er-command {
          position:absolute;

          left:8px;

          bottom:
            calc(
              68px
              + env(safe-area-inset-bottom)
            );

          height:38px;

          padding:
            0 12px;

          display:flex;
          align-items:center;

          gap:7px;

          border-radius:12px;

          border:
            1px solid
            rgba(255,255,255,.10);

          background:
            rgba(7,12,20,.92);

          color:#fff;

          box-shadow:
            0 7px 22px
            rgba(0,0,0,.25);

          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);

          font-size:8px;
          font-weight:900;

          pointer-events:auto;

          touch-action:manipulation;
        }

        .er-command-icon {
          font-size:13px;
        }

        .er-command-arrow {
          opacity:.45;
          font-size:12px;
        }

        /* =====================================================
           BOTTOM NAV
           ===================================================== */

        .er-bottom {
          position:absolute;

          left:50%;

          bottom:
            max(6px, env(safe-area-inset-bottom));

          transform:
            translateX(-50%);

          width:
            min(600px, calc(100% - 14px));

          height:55px;

          padding:5px;

          display:grid;

          grid-template-columns:
            repeat(5, 1fr);

          gap:4px;

          border-radius:17px;

          background:
            rgba(7,11,18,.95);

          border:
            1px solid
            rgba(255,255,255,.11);

          box-shadow:
            0 -8px 28px
            rgba(0,0,0,.30);

          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);

          pointer-events:auto;
        }

        .er-nav {
          position:relative;

          min-width:0;

          border:0;
          border-radius:11px;

          background:transparent;

          color:#fff;

          opacity:.48;

          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;

          gap:2px;

          touch-action:manipulation;
        }

        .er-nav.active {
          opacity:1;

          background:
            rgba(255,255,255,.09);
        }

        .er-nav.active::after {
          content:"";

          position:absolute;

          left:50%;
          bottom:3px;

          width:18px;
          height:2px;

          transform:
            translateX(-50%);

          border-radius:5px;

          background:#fff;
        }

        .er-nav-icon {
          font-size:14px;
          line-height:16px;
        }

        .er-nav-label {
          font-size:6px;
          font-weight:900;

          letter-spacing:.35px;
        }

        /* =====================================================
           MORE PANEL
           ===================================================== */

        .er-more-panel {
          position:absolute;

          right:8px;

          bottom:
            calc(
              67px
              + env(safe-area-inset-bottom)
            );

          width:220px;

          padding:8px;

          display:none;

          grid-template-columns:
            repeat(3, 1fr);

          gap:5px;

          border-radius:15px;

          background:
            rgba(7,11,18,.97);

          border:
            1px solid
            rgba(255,255,255,.10);

          box-shadow:
            0 15px 40px
            rgba(0,0,0,.42);

          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);

          pointer-events:auto;
        }

        .er-more-panel.open {
          display:grid;
        }

        .er-more-button {
          height:48px;

          border:0;
          border-radius:10px;

          background:
            rgba(255,255,255,.055);

          color:#fff;

          font-size:6px;
          font-weight:850;

          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;

          gap:3px;

          touch-action:manipulation;
        }

        .er-more-icon {
          font-size:14px;
        }

        /* =====================================================
           PHONE
           ===================================================== */

        @media (max-width:520px) {

          .er-header {
            left:6px;
            right:6px;

            height:50px;

            border-radius:15px;
          }

          .er-brand {
            width:70px;
            min-width:70px;
          }

          .er-brand-icon {
            width:26px;
            height:26px;
            flex-basis:26px;
          }

          .er-brand-main {
            font-size:10px;
          }

          .er-brand-sub {
            display:none;
          }

          .er-avatar {
            display:none;
          }

          .er-player-role {
            font-size:5.5px;
          }

          .er-cash {
            min-width:52px;
            padding:5px;
          }

          .er-day {
            min-width:39px;
          }

          .er-side {
            right:6px;
            width:122px;
            top:51%;
          }

          .er-side-button {
            height:37px;
            font-size:8px;
          }

          .er-command {
            left:7px;
            height:36px;
            font-size:7px;
          }

          .er-bottom {
            width:
              calc(100% - 14px);

            height:54px;
          }

          .er-nav-icon {
            font-size:14px;
          }

          .er-nav-label {
            font-size:5.7px;
          }

          .er-more-panel {
            right:6px;
            width:215px;
          }
        }

        /* =====================================================
           VERY SMALL PHONES
           ===================================================== */

        @media (max-width:380px) {

          .er-brand {
            width:59px;
            min-width:59px;
          }

          .er-brand-icon {
            display:none;
          }

          .er-player-name {
            font-size:8px;
          }

          .er-cash {
            min-width:46px;
          }

          .er-day {
            min-width:35px;
          }

          .er-side {
            width:108px;
          }

          .er-side-button {
            height:35px;
            font-size:7px;
          }

          .er-side-icon {
            font-size:11px;
          }
        }

        /* =====================================================
           TABLET / IPAD
           ===================================================== */

        @media (min-width:700px) {

          .er-header {
            top:
              max(10px, env(safe-area-inset-top));

            left:14px;
            right:14px;

            height:56px;

            border-radius:17px;
          }

          .er-brand {
            width:105px;
            min-width:105px;
          }

          .er-brand-main {
            font-size:12px;
          }

          .er-player {
            justify-content:center;
            flex:none;
            width:190px;
          }

          .er-side {
            right:15px;
            width:140px;
          }

          .er-side-button {
            height:41px;
            font-size:9px;
          }

          .er-command {
            left:15px;
          }

          .er-status-strip {
            left:16px;
            right:auto;

            width:
              min(430px, calc(100% - 32px));
          }
        }

      `;

      document.head.appendChild(style);
    },

    /* =========================================================
       TOP HEADER
       ========================================================= */

    renderTop() {
      const top =
        document.getElementById(
          "empireHUDTop"
        );

      if (!top) return;

      const player =
        this.getPlayer();

      const world =
        this.getWorld();

      const wealth =
        this.getWealth();

      const company =
        this.getCompany();

      const day =
        Number(world.day || 1);

      const month =
        Number(world.month || 1);

      const year =
        Number(world.year || 1);

      const name =
        player.name || "Founder";

      const job =
        player.currentJob ||
        "Unemployed";

      const level =
        player.jobLevel ||
        "Entry";

      top.innerHTML = `
        <div class="er-header">

          <div class="er-brand">

            <div class="er-brand-icon">
              R
            </div>

            <div>
              <div class="er-brand-main">
                RUSH
              </div>

              <div class="er-brand-sub">
                BUSINESS EMPIRE
              </div>
            </div>

          </div>


          <div class="er-player">

            <div class="er-avatar">
              ${this.escape(
                String(name).charAt(0).toUpperCase()
              )}
            </div>

            <div class="er-player-info">

              <div class="er-player-name">
                ${this.escape(name)}
              </div>

              <div class="er-player-role">
                ${this.escape(job)}
                ·
                ${this.escape(level)}
              </div>

            </div>

          </div>


          <div class="er-cash">

            <div class="er-label">
              CASH
            </div>

            <div class="er-cash-value">
              ${this.money(wealth.cash)}
            </div>

          </div>


          <div class="er-day">

            <div class="er-label">
              DAY
            </div>

            <div class="er-day-value">
              ${day}
            </div>

          </div>


          <button
            class="er-header-menu"
            type="button"
            aria-label="More"
            onclick="
              EmpireMainHUD.toggleMore()
            "
          >
            ☰
          </button>

        </div>
      `;

      this.renderStatusStrip(
        company,
        year,
        month,
        day
      );
    },

    /* =========================================================
       STATUS STRIP
       ========================================================= */

    renderStatusStrip(
      company,
      year,
      month,
      day
    ) {
      const content =
        document.getElementById(
          "empireHUDContent"
        );

      if (!content) return;

      if (!company) {

        content.innerHTML = `
          <div class="er-status-strip">

            <div class="er-status-left">

              <span class="er-status-dot"></span>

              <span class="er-status-title">
                Build your career
              </span>

              <span class="er-status-divider">
                |
              </span>

              <span class="er-status-sub">
                Start from zero
              </span>

            </div>

            <span class="er-status-company">
              No Company
            </span>

          </div>
        `;

        return;
      }

      const finance =
        company.finance || {};

      const revenue =
        Number(
          finance.totalRevenue ??
          finance.revenue ??
          company.revenue ??
          0
        );

      const profit =
        Number(
          finance.profit ??
          company.profit ??
          0
        );

      const employees =
        Array.isArray(company.employees)
          ? company.employees.length
          : Number(
              company.employeeCount || 0
            );

      const status =
        company.status ||
        (
          company.operating
            ? "Operating"
            : "Setup Required"
        );

      content.innerHTML = `
        <div class="er-status-strip">

          <div class="er-status-left">

            <span class="er-status-dot"></span>

            <span class="er-status-title">
              ${this.escape(
                company.name ||
                "My Company"
              )}
            </span>

            <span class="er-status-divider">
              |
            </span>

            <span class="er-status-sub">
              ${this.escape(status)}
            </span>

          </div>

          <span class="er-status-company">
            REV ${this.money(revenue)}
            · PROF ${this.money(profit)}
            · EMP ${employees}
          </span>

        </div>
      `;
    },

    /* =========================================================
       SIDE MENU
       ========================================================= */

    renderSide() {
      const side =
        document.getElementById(
          "empireHUDSide"
        );

      if (!side) return;

      side.innerHTML = `
        <div class="er-side">

          <button
            class="er-side-button"
            type="button"
            onclick="
              EmpireMainHUD.openProducts()
            "
          >
            <span class="er-side-icon">📦</span>
            <span>PRODUCTS</span>
            <span class="er-side-arrow">›</span>
          </button>

          <button
            class="er-side-button"
            type="button"
            onclick="
              EmpireMainHUD.openNews()
            "
          >
            <span class="er-side-icon">📰</span>
            <span>NEWS</span>
            <span class="er-side-arrow">›</span>
          </button>

          <button
            class="er-side-button"
            type="button"
            onclick="
              EmpireMainHUD.openCorporate()
            "
          >
            <span class="er-side-icon">🏢</span>
            <span>CORPORATE</span>
            <span class="er-side-arrow">›</span>
          </button>

          <div class="er-side-gap"></div>

          <button
            class="er-side-button"
            type="button"
            onclick="
              EmpireMainHUD.openGovernment()
            "
          >
            <span class="er-side-icon">🏛️</span>
            <span>GOVERNMENT</span>
            <span class="er-side-arrow">›</span>
          </button>

          <button
            class="er-side-button"
            type="button"
            onclick="
              EmpireMainHUD.openHR()
            "
          >
            <span class="er-side-icon">👥</span>
            <span>WORKFORCE</span>
            <span class="er-side-arrow">›</span>
          </button>

          <button
            class="er-side-button"
            type="button"
            onclick="
              EmpireMainHUD.openMarket()
            "
          >
            <span class="er-side-icon">📊</span>
            <span>ECONOMICS</span>
            <span class="er-side-arrow">›</span>
          </button>

        </div>
      `;
    },

    /* =========================================================
       COMMAND CENTER
       ========================================================= */

    renderCommand() {
      const command =
        document.getElementById(
          "empireHUDCommand"
        );

      if (!command) return;

      command.innerHTML = `
        <button
          class="er-command"
          type="button"
          onclick="
            EmpireMainHUD.openCommandCenter()
          "
        >
          <span class="er-command-icon">
            ☷
          </span>

          <span>
            COMMAND CENTER
          </span>

          <span class="er-command-arrow">
            ›
          </span>
        </button>
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

      if (!bottom) return;

      bottom.innerHTML = `
        <div class="er-bottom">

          <button
            class="er-nav active"
            type="button"
            data-nav="home"
            onclick="
              EmpireMainHUD.home()
            "
          >
            <span class="er-nav-icon">
              ⌂
            </span>

            <span class="er-nav-label">
              HOME
            </span>
          </button>


          <button
            class="er-nav"
            type="button"
            data-nav="career"
            onclick="
              EmpireMainHUD.openCareer()
            "
          >
            <span class="er-nav-icon">
              💼
            </span>

            <span class="er-nav-label">
              CAREER
            </span>
          </button>


          <button
            class="er-nav"
            type="button"
            data-nav="business"
            onclick="
              EmpireMainHUD.openBusiness()
            "
          >
            <span class="er-nav-icon">
              🏢
            </span>

            <span class="er-nav-label">
              BUSINESS
            </span>
          </button>


          <button
            class="er-nav"
            type="button"
            data-nav="finance"
            onclick="
              EmpireMainHUD.openFinance()
            "
          >
            <span class="er-nav-icon">
              ₹
            </span>

            <span class="er-nav-label">
              FINANCE
            </span>
          </button>


          <button
            class="er-nav"
            type="button"
            data-nav="more"
            onclick="
              EmpireMainHUD.toggleMore()
            "
          >
            <span class="er-nav-icon">
              ☰
            </span>

            <span class="er-nav-label">
              MORE
            </span>
          </button>

        </div>
      `;
    },

    /* =========================================================
       MORE MENU
       ========================================================= */

    renderMore() {
      const more =
        document.getElementById(
          "empireHUDMore"
        );

      if (!more) return;

      more.innerHTML = `
        <div class="er-more-panel">

          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.openProducts()
            "
          >
            <span class="er-more-icon">📦</span>
            PRODUCTS
          </button>

          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.openHR()
            "
          >
            <span class="er-more-icon">👥</span>
            HR
          </button>

          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.openGovernment()
            "
          >
            <span class="er-more-icon">🏛️</span>
            GOVERNMENT
          </button>

          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.openMarket()
            "
          >
            <span class="er-more-icon">📊</span>
            MARKET
          </button>

          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.openNews()
            "
          >
            <span class="er-more-icon">📰</span>
            NEWS
          </button>

          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.openCorporate()
            "
          >
            <span class="er-more-icon">🏢</span>
            CORPORATE
          </button>

          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.saveGame()
            "
          >
            <span class="er-more-icon">💾</span>
            SAVE
          </button>

          <button
            class="er-more-button"
            type="button"
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
        const fn = name
          .split(".")
          .reduce(
            (obj, key) =>
              obj && obj[key],
            window
          );

        if (typeof fn === "function") {
          try {
            fn();
            return true;
          } catch (error) {
            console.warn(
              "Empire Rush HUD action failed:",
              name,
              error
            );
          }
        }
      }

      return false;
    },


    openCareer() {
      this.setActive("career");

      if (
        this.invoke([
          "EmpireCareerBusinessUI.open",
          "EmpireCareerUI.open",
          "EmpireCareerBusiness.open"
        ])
      ) {
        return;
      }

      this.toast(
        "Career dashboard unavailable."
      );
    },


    openBusiness() {
      this.setActive("business");

      if (
        this.invoke([
          "EmpireBusinessOperationsUI.open",
          "EmpireBusinessUI.open",
          "EmpireBusinessOperations.open"
        ])
      ) {
        return;
      }

      this.toast(
        "Business dashboard unavailable."
      );
    },


    openFinance() {
      this.setActive("finance");

      if (
        this.invoke([
          "EmpireBanking.open",
          "EmpireBankingUI.open",
          "EmpireFinanceUI.open",
          "EmpireFinancingUI.open"
        ])
      ) {
        return;
      }

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
      ) {
        return;
      }

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
      ) {
        return;
      }

      this.toast(
        "Workforce dashboard unavailable."
      );
    },


    openGovernment() {
      if (
        this.invoke([
          "EmpireGovernmentUI.open",
          "EmpireComplianceUI.open"
        ])
      ) {
        return;
      }

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
      ) {
        return;
      }

      this.toast(
        "Economics dashboard unavailable."
      );
    },


    openNews() {
      if (
        this.invoke([
          "EmpireNewsDecisionUI.open",
          "EmpireNewsUI.open"
        ])
      ) {
        return;
      }

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
      ) {
        return;
      }

      this.toast(
        "Corporate dashboard unavailable."
      );
    },


    openCommandCenter() {
      if (
        this.invoke([
          "EmpireCommandCenter.open",
          "EmpireCommandCenterUI.open",
          "EmpireMainCommandCenter.open"
        ])
      ) {
        return;
      }

      this.toast(
        "Command Center"
      );
    },


    /* =========================================================
       NAVIGATION
       ========================================================= */

    setActive(name) {
      document
        .querySelectorAll(
          "#empireHUDBottom .er-nav"
        )
        .forEach(button => {
          button.classList.toggle(
            "active",
            button.dataset.nav === name
          );
        });
    },


    home() {
      this.setActive("home");
      this.closeMore();

      this.toast(
        "Empire Rush command center"
      );
    },


    toggleMore() {
      const panel =
        document.querySelector(
          "#empireHUDMore .er-more-panel"
        );

      if (!panel) return;

      const isOpen =
        panel.classList.contains("open");

      panel.classList.toggle(
        "open",
        !isOpen
      );

      const moreButton =
        document.querySelector(
          "#empireHUDBottom [data-nav='more']"
        );

      if (moreButton) {
        moreButton.classList.toggle(
          "active",
          !isOpen
        );
      }
    },


    closeMore() {
      const panel =
        document.querySelector(
          "#empireHUDMore .er-more-panel"
        );

      if (panel) {
        panel.classList.remove(
          "open"
        );
      }

      const moreButton =
        document.querySelector(
          "#empireHUDBottom [data-nav='more']"
        );

      if (moreButton) {
        moreButton.classList.remove(
          "active"
        );
      }
    },


    /* =========================================================
       SAVE
       ========================================================= */

    saveGame() {
      this.closeMore();

      try {
        if (
          typeof Game.save ===
          "function"
        ) {
          Game.save();
        }

        this.toast(
          "Game saved."
        );
      } catch (error) {
        console.warn(
          "Empire Rush save failed:",
          error
        );

        this.toast(
          "Save failed."
        );
      }
    },


    /* =========================================================
       TOAST
       ========================================================= */

    toast(message) {
      const old =
        document.getElementById(
          "empireHUDToast"
        );

      if (old) {
        old.remove();
      }

      const alert =
        document.createElement(
          "div"
        );

      alert.id =
        "empireHUDToast";

      alert.textContent =
        String(message || "");

      alert.style.cssText = `
        position:fixed;
        left:50%;
        bottom:
          calc(
            76px +
            env(safe-area-inset-bottom)
          );
        transform:
          translateX(-50%)
          translateY(8px);

        max-width:
          calc(100% - 30px);

        padding:9px 13px;

        border-radius:11px;

        background:
          rgba(7,12,20,.94);

        border:
          1px solid
          rgba(255,255,255,.10);

        color:#fff;

        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;

        font-size:8px;
        font-weight:800;

        box-shadow:
          0 10px 30px
          rgba(0,0,0,.30);

        backdrop-filter:blur(14px);
        -webkit-backdrop-filter:blur(14px);

        opacity:0;

        transition:
          opacity .2s ease,
          transform .2s ease;

        pointer-events:none;

        z-index:99999;
      `;

      document.body.appendChild(
        alert
      );

      requestAnimationFrame(() => {
        alert.style.opacity = "1";
        alert.style.transform =
          "translateX(-50%) translateY(0)";
      });

      setTimeout(() => {
        alert.style.opacity = "0";
        alert.style.transform =
          "translateX(-50%) translateY(8px)";

        setTimeout(() => {
          if (alert.parentNode) {
            alert.remove();
          }
        }, 220);
      }, 1800);
    },


    /* =========================================================
       REFRESH
       ========================================================= */

    refresh() {
      /*
       * Dynamic data only.
       * Header is rebuilt because player/cash/day
       * can change during simulation.
       */

      this.renderTop();
    },


    /* =========================================================
       FULL RENDER
       ========================================================= */

    render() {
      this.createRoot();

      this.renderTop();
      this.renderBottom();
      this.renderMore();
      this.renderSide();
      this.renderCommand();
    },


    /* =========================================================
       START
       ========================================================= */

    start() {
      this.render();

      if (this.refreshTimer) {
        clearInterval(
          this.refreshTimer
        );
      }

      this.refreshTimer =
        setInterval(() => {
          this.refresh();
        }, 1000);
    }
  };


  /* ===========================================================
     PUBLIC API
     =========================================================== */

  window.EmpireMainHUD =
    HUD;


  /* ===========================================================
     BOOT
     =========================================================== */

  function boot() {
    HUD.start();
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      boot,
      { once: true }
    );
  } else {
    boot();
  }


  /* ===========================================================
     GAME EVENTS
     =========================================================== */

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
        if (
          window.EmpireMainHUD
        ) {
          HUD.refresh();
        }
      }
    );
  });


  /* ===========================================================
     CLOSE MORE WHEN TAPPING OUTSIDE
     =========================================================== */

  document.addEventListener(
    "pointerdown",
    event => {
      const panel =
        document.querySelector(
          "#empireHUDMore .er-more-panel"
        );

      if (
        !panel ||
        !panel.classList.contains("open")
      ) {
        return;
      }

      if (
        panel.contains(event.target)
      ) {
        return;
      }

      if (
        event.target.closest(
          ".er-header-menu, [data-nav='more']"
        )
      ) {
        return;
      }

      HUD.closeMore();
    },
    true
  );


  console.log(
    "Empire Rush: Main Game HUD loaded successfully."
  );

})();
