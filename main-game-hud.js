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
    refreshTimer: null,

    /* =========================================================
       MONEY / DATA HELPERS
       ========================================================= */

    money(value) {
      const n = Number(value || 0);

      if (Math.abs(n) >= 10000000) {
        return "₹" + (n / 10000000).toFixed(1) + "Cr";
      }

      if (Math.abs(n) >= 100000) {
        return "₹" + (n / 100000).toFixed(1) + "L";
      }

      if (Math.abs(n) >= 1000) {
        return "₹" + Math.round(n / 1000) + "K";
      }

      return "₹" + Math.round(n).toLocaleString("en-IN");
    },

    number(value) {
      return Math.round(Number(value || 0))
        .toLocaleString("en-IN");
    },

    getState() {
      try {
        return Game.getState() || {};
      } catch (error) {
        console.warn("HUD state read failed:", error);
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

      if (!companies.length) {
        return null;
      }

      if (this.companyId) {
        const found = companies.find(
          company =>
            String(company.id) ===
            String(this.companyId)
        );

        if (found) {
          return found;
        }
      }

      return companies[0];
    },

    getPersonalWealth() {
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

    /* =========================================================
       ROOT
       ========================================================= */

    createRoot() {
      const existing =
        document.getElementById("empireMainHUD");

      if (existing) {
        this.root = existing;
        return;
      }

      this.root =
        document.createElement("div");

      this.root.id =
        "empireMainHUD";

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
       MODERN GAME HUD STYLE
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
          position:fixed;
          inset:0;
          z-index:8000;
          pointer-events:none;
          color:#ffffff;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Helvetica,
            Arial,
            sans-serif;

          -webkit-font-smoothing:antialiased;
          text-rendering:optimizeLegibility;
        }

        #empireHUDTop,
        #empireHUDContent,
        #empireHUDBottom,
        #empireHUDMore {
          pointer-events:none;
        }

        /* =====================================================
           TOP HEADER
           ===================================================== */

        .er-topbar {
          position:absolute;

          top:
            max(8px, env(safe-area-inset-top));

          left:8px;
          right:8px;

          height:54px;

          display:flex;
          align-items:center;

          padding:5px 7px;

          border-radius:17px;

          background:
            linear-gradient(
              180deg,
              rgba(15,21,31,.94),
              rgba(8,12,19,.91)
            );

          border:1px solid
            rgba(255,255,255,.12);

          box-shadow:
            0 8px 28px rgba(0,0,0,.30),
            inset 0 1px 0
              rgba(255,255,255,.07);

          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);

          overflow:hidden;

          pointer-events:auto;
        }

        .er-topbar::after {
          content:"";

          position:absolute;
          left:0;
          right:0;
          bottom:0;

          height:1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.16),
              transparent
            );

          pointer-events:none;
        }

        /* =====================================================
           BRAND
           ===================================================== */

        .er-brand {
          width:96px;
          min-width:96px;

          display:flex;
          align-items:center;
          gap:7px;

          padding-left:5px;

          overflow:hidden;
        }

        .er-brand-mark {
          width:29px;
          height:29px;

          flex:0 0 29px;

          display:flex;
          align-items:center;
          justify-content:center;

          border-radius:9px;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.18),
              rgba(255,255,255,.05)
            );

          border:1px solid
            rgba(255,255,255,.13);

          font-size:13px;
          font-weight:950;

          letter-spacing:-1px;
        }

        .er-brand-text {
          min-width:0;
          line-height:1;
        }

        .er-brand-main {
          font-size:12px;
          font-weight:950;
          letter-spacing:1.4px;
          white-space:nowrap;
        }

        .er-brand-sub {
          margin-top:3px;

          font-size:6px;
          font-weight:800;

          letter-spacing:1.15px;

          opacity:.45;

          white-space:nowrap;
        }

        /* =====================================================
           PLAYER MINI CARD
           ===================================================== */

        .er-player-mini {
          min-width:0;
          flex:1;

          display:flex;
          align-items:center;

          padding:0 8px;

          overflow:hidden;
        }

        .er-avatar {
          width:29px;
          height:29px;

          flex:0 0 29px;

          border-radius:50%;

          display:flex;
          align-items:center;
          justify-content:center;

          background:
            rgba(255,255,255,.09);

          border:1px solid
            rgba(255,255,255,.13);

          font-size:13px;
        }

        .er-player-info {
          min-width:0;
          margin-left:7px;
        }

        .er-player-name {
          font-size:11px;
          font-weight:900;

          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .er-player-role {
          margin-top:2px;

          font-size:7px;
          font-weight:700;

          opacity:.48;

          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        /* =====================================================
           CENTER COMPANY MINI STATUS
           ===================================================== */

        .er-company-mini {
          display:none;

          align-items:center;
          gap:7px;

          min-width:0;

          max-width:180px;

          padding:
            6px 9px;

          border-radius:11px;

          background:
            rgba(255,255,255,.055);

          border:1px solid
            rgba(255,255,255,.07);
        }

        .er-company-mini-info {
          min-width:0;
        }

        .er-company-mini-name {
          font-size:8px;
          font-weight:900;

          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .er-company-mini-type {
          margin-top:2px;

          font-size:6px;
          font-weight:700;

          opacity:.42;
        }

        /* =====================================================
           MONEY
           ===================================================== */

        .er-money-mini {
          display:flex;
          align-items:center;
          gap:6px;

          padding:
            6px 9px;

          border-radius:11px;

          background:
            rgba(255,255,255,.055);

          border:1px solid
            rgba(255,255,255,.07);

          white-space:nowrap;
        }

        .er-money-icon {
          width:21px;
          height:21px;

          display:flex;
          align-items:center;
          justify-content:center;

          border-radius:7px;

          background:
            rgba(255,255,255,.08);

          font-size:10px;
          font-weight:900;
        }

        .er-money-info {
          line-height:1;
        }

        .er-money-label {
          font-size:5.5px;
          font-weight:800;

          letter-spacing:.8px;

          opacity:.42;
        }

        .er-money-value {
          margin-top:3px;

          font-size:11px;
          font-weight:950;
        }

        /* =====================================================
           DAY
           ===================================================== */

        .er-day-mini {
          min-width:43px;

          padding:
            5px 7px;

          text-align:center;

          border-radius:11px;

          background:
            rgba(255,255,255,.055);

          border:1px solid
            rgba(255,255,255,.07);
        }

        .er-day-label {
          font-size:5.5px;
          font-weight:800;

          letter-spacing:.7px;

          opacity:.42;
        }

        .er-day-value {
          margin-top:2px;

          font-size:10px;
          font-weight:950;
        }

        /* =====================================================
           MORE BUTTON
           ===================================================== */

        .er-header-more {
          width:31px;
          height:31px;

          margin-left:5px;

          flex:0 0 31px;

          border:0;

          border-radius:9px;

          background:
            rgba(255,255,255,.075);

          color:#fff;

          font-size:15px;
          font-weight:900;

          display:flex;
          align-items:center;
          justify-content:center;

          touch-action:manipulation;
          cursor:pointer;
        }

        .er-header-more:active {
          transform:scale(.94);
        }

        /* =====================================================
           COMPANY STATUS STRIP
           ===================================================== */

        .er-company-strip {
          position:absolute;

          top:
            calc(
              max(8px, env(safe-area-inset-top))
              + 61px
            );

          left:10px;
          right:10px;

          min-height:31px;

          display:flex;
          align-items:center;

          padding:
            5px 9px;

          border-radius:11px;

          background:
            rgba(8,13,21,.78);

          border:1px solid
            rgba(255,255,255,.08);

          box-shadow:
            0 6px 18px
              rgba(0,0,0,.18);

          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);

          pointer-events:none;
        }

        .er-company-strip-left {
          min-width:0;
          flex:1;

          display:flex;
          align-items:center;
          gap:6px;
        }

        .er-company-dot {
          width:6px;
          height:6px;

          flex:0 0 6px;

          border-radius:50%;

          background:#55d68a;

          box-shadow:
            0 0 8px
              rgba(85,214,138,.7);
        }

        .er-company-name {
          max-width:150px;

          font-size:8px;
          font-weight:900;

          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .er-company-status {
          font-size:6px;
          font-weight:800;

          opacity:.45;

          text-transform:uppercase;
          letter-spacing:.5px;
        }

        .er-company-metrics {
          display:flex;
          align-items:center;
          gap:8px;

          font-size:6px;
          font-weight:800;

          opacity:.58;
        }

        .er-company-metric b {
          font-size:7px;
          opacity:1;
        }

        /* =====================================================
           CONTENT / TOAST
           ===================================================== */

        .er-content {
          position:absolute;

          left:10px;
          right:10px;

          bottom:
            calc(
              72px
              + env(safe-area-inset-bottom)
            );

          display:flex;
          justify-content:center;

          pointer-events:none;
        }

        .er-alert {
          max-width:360px;

          padding:
            8px 12px;

          border-radius:11px;

          background:
            rgba(9,14,22,.92);

          border:1px solid
            rgba(255,255,255,.10);

          box-shadow:
            0 10px 30px
              rgba(0,0,0,.28);

          font-size:9px;
          font-weight:800;

          opacity:0;
          transform:translateY(7px);

          transition:
            opacity .22s ease,
            transform .22s ease;
        }

        .er-alert.show {
          opacity:1;
          transform:translateY(0);
        }

        /* =====================================================
           BOTTOM NAV
           ===================================================== */

        .er-bottom {
          position:absolute;

          left:8px;
          right:8px;

          bottom:
            max(7px, env(safe-area-inset-bottom));

          height:57px;

          padding:5px;

          border-radius:17px;

          background:
            rgba(7,11,18,.94);

          border:1px solid
            rgba(255,255,255,.10);

          box-shadow:
            0 -8px 30px
              rgba(0,0,0,.28),
            inset 0 1px 0
              rgba(255,255,255,.05);

          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);

          display:grid;

          grid-template-columns:
            repeat(5,1fr);

          gap:4px;

          pointer-events:auto;
        }

        .er-nav {
          position:relative;

          min-width:0;
          min-height:46px;

          border:0;
          border-radius:12px;

          background:transparent;

          color:#fff;

          opacity:.46;

          font-size:7px;
          font-weight:900;

          letter-spacing:.45px;

          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;

          gap:3px;

          touch-action:manipulation;
          cursor:pointer;

          transition:
            background .16s ease,
            opacity .16s ease,
            transform .12s ease;
        }

        .er-nav:hover {
          opacity:.75;
        }

        .er-nav:active {
          transform:scale(.95);
        }

        .er-nav.active {
          opacity:1;

          background:
            rgba(255,255,255,.09);
        }

        .er-nav.active::before {
          content:"";

          position:absolute;

          top:2px;
          left:50%;

          width:18px;
          height:2px;

          border-radius:10px;

          transform:translateX(-50%);

          background:
            rgba(255,255,255,.9);
        }

        .er-nav-icon {
          width:22px;
          height:20px;

          display:flex;
          align-items:center;
          justify-content:center;

          font-size:15px;
          line-height:20px;
        }

        .er-nav-label {
          font-size:6.5px;
          font-weight:900;

          letter-spacing:.5px;
        }

        /* =====================================================
           MORE MENU
           ===================================================== */

        .er-more-panel {
          position:absolute;

          left:8px;
          right:8px;

          bottom:
            calc(
              70px
              + env(safe-area-inset-bottom)
            );

          padding:9px;

          border-radius:16px;

          background:
            rgba(7,11,18,.97);

          border:1px solid
            rgba(255,255,255,.11);

          box-shadow:
            0 15px 45px
              rgba(0,0,0,.42);

          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);

          display:none;

          grid-template-columns:
            repeat(4,1fr);

          gap:6px;

          pointer-events:auto;
        }

        .er-more-panel.open {
          display:grid;
          animation:
            erMenuIn .16s ease-out;
        }

        @keyframes erMenuIn {
          from {
            opacity:0;
            transform:translateY(8px);
          }

          to {
            opacity:1;
            transform:translateY(0);
          }
        }

        .er-more-button {
          min-width:0;
          min-height:50px;

          border:0;

          border-radius:11px;

          background:
            rgba(255,255,255,.055);

          color:#fff;

          font-size:6.5px;
          font-weight:850;

          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;

          gap:3px;

          touch-action:manipulation;
          cursor:pointer;
        }

        .er-more-button:active {
          transform:scale(.96);
          background:
            rgba(255,255,255,.10);
        }

        .er-more-icon {
          display:flex;
          align-items:center;
          justify-content:center;

          width:22px;
          height:21px;

          font-size:15px;
        }

        /* =====================================================
           DESKTOP / IPAD LANDSCAPE
           ===================================================== */

        @media (min-width:700px) {

          .er-topbar {
            left:14px;
            right:14px;

            top:
              max(12px, env(safe-area-inset-top));

            height:58px;

            padding:6px 9px;

            border-radius:18px;
          }

          .er-brand {
            width:130px;
            min-width:130px;
          }

          .er-brand-mark {
            width:32px;
            height:32px;
            flex-basis:32px;
          }

          .er-brand-main {
            font-size:13px;
          }

          .er-brand-sub {
            font-size:6.5px;
          }

          .er-player-mini {
            justify-content:center;
            flex:none;
            width:210px;
          }

          .er-company-mini {
            display:flex;
          }

          .er-money-mini {
            margin-left:auto;
          }

          .er-company-strip {
            left:16px;
            right:auto;

            top:
              calc(
                max(12px, env(safe-area-inset-top))
                + 67px
              );

            width:
              min(430px, calc(100% - 32px));
          }

          .er-bottom {
            left:50%;
            right:auto;

            width:
              min(620px, calc(100% - 32px));

            transform:
              translateX(-50%);

            bottom:
              max(10px, env(safe-area-inset-bottom));

            height:61px;
          }

          .er-nav {
            min-height:50px;
          }

          .er-nav-icon {
            font-size:17px;
          }

          .er-nav-label {
            font-size:7px;
          }

          .er-more-panel {
            left:50%;
            right:auto;

            width:
              min(620px, calc(100% - 32px));

            transform:
              translateX(-50%);

            bottom:
              calc(
                78px
                + env(safe-area-inset-bottom)
              );
          }
        }

        /* =====================================================
           SMALL PHONES
           ===================================================== */

        @media (max-width:420px) {

          .er-topbar {
            left:5px;
            right:5px;

            height:51px;

            padding:4px 5px;

            border-radius:15px;
          }

          .er-brand {
            width:72px;
            min-width:72px;
          }

          .er-brand-mark {
            width:27px;
            height:27px;
            flex-basis:27px;
          }

          .er-brand-main {
            font-size:10px;
            letter-spacing:1px;
          }

          .er-brand-sub {
            display:none;
          }

          .er-avatar {
            display:none;
          }

          .er-player-mini {
            padding:0 4px;
          }

          .er-player-name {
            font-size:9px;
          }

          .er-player-role {
            font-size:6px;
          }

          .er-money-mini {
            padding:
              5px 7px;
          }

          .er-money-icon {
            display:none;
          }

          .er-money-value {
            font-size:10px;
          }

          .er-day-mini {
            min-width:37px;
            padding:5px;
          }

          .er-company-strip {
            left:6px;
            right:6px;
          }

          .er-company-metrics {
            gap:5px;
          }

          .er-bottom {
            left:5px;
            right:5px;
            bottom:
              max(5px, env(safe-area-inset-bottom));

            height:54px;

            border-radius:15px;
          }

          .er-nav {
            min-height:43px;
            border-radius:10px;
          }

          .er-nav-icon {
            font-size:14px;
          }

          .er-nav-label {
            font-size:5.8px;
          }

          .er-more-panel {
            left:5px;
            right:5px;

            grid-template-columns:
              repeat(4,1fr);
          }

          .er-more-button {
            min-height:47px;
            font-size:6px;
          }

          .er-more-icon {
            font-size:14px;
          }
        }

        /* =====================================================
           VERY SHORT SCREENS
           ===================================================== */

        @media (max-height:500px) {

          .er-topbar {
            height:48px;
          }

          .er-company-strip {
            display:none;
          }

          .er-bottom {
            height:50px;
          }

          .er-nav {
            min-height:40px;
          }
        }
      `;

      document.head.appendChild(style);
    },

    /* =========================================================
       TOP BAR
       ========================================================= */

    renderTop() {
      const top =
        document.getElementById(
          "empireHUDTop"
        );

      if (!top) {
        return;
      }

      const player =
        this.getPlayer();

      const world =
        this.getWorld();

      const wealth =
        this.getPersonalWealth();

      const company =
        this.getCompany();

      const day =
        Number(world.day || 1);

      const month =
        Number(world.month || 1);

      const year =
        Number(world.year || 1);

      const playerName =
        player.name || "Founder";

      const job =
        player.currentJob ||
        "Unemployed";

      const companyName =
        company?.name ||
        "No Company";

      const companyType =
        company?.type ||
        company?.businessType ||
        "";

      top.innerHTML = `
        <div class="er-topbar">

          <!-- BRAND -->

          <div class="er-brand">

            <div class="er-brand-mark">
              R
            </div>

            <div class="er-brand-text">

              <div class="er-brand-main">
                RUSH
              </div>

              <div class="er-brand-sub">
                BUSINESS EMPIRE
              </div>

            </div>

          </div>


          <!-- PLAYER -->

          <div class="er-player-mini">

            <div class="er-avatar">
              👤
            </div>

            <div class="er-player-info">

              <div class="er-player-name">
                ${this.escape(playerName)}
              </div>

              <div class="er-player-role">
                ${this.escape(job)}
                ·
                ${this.escape(
                  player.jobLevel || "Entry"
                )}
              </div>

            </div>

          </div>


          <!-- COMPANY -->

          <div class="er-company-mini">

            <span class="er-company-dot"></span>

            <div class="er-company-mini-info">

              <div class="er-company-mini-name">
                ${this.escape(companyName)}
              </div>

              <div class="er-company-mini-type">
                ${this.escape(
                  companyType || "Founder"
                )}
              </div>

            </div>

          </div>


          <!-- MONEY -->

          <div class="er-money-mini">

            <div class="er-money-icon">
              ₹
            </div>

            <div class="er-money-info">

              <div class="er-money-label">
                CASH
              </div>

              <div class="er-money-value">
                ${this.money(wealth.cash)}
              </div>

            </div>

          </div>


          <!-- DAY -->

          <div class="er-day-mini">

            <div class="er-day-label">
              DAY
            </div>

            <div class="er-day-value">
              ${day}
            </div>

          </div>


          <!-- MORE -->

          <button
            class="er-header-more"
            type="button"
            aria-label="Open menu"
            onclick="
              EmpireMainHUD.toggleMore()
            "
          >
            ☰
          </button>

        </div>
      `;

      this.renderCompanyStrip(
        company,
        year,
        month,
        day
      );
    },

    /* =========================================================
       COMPANY STRIP
       ========================================================= */

    renderCompanyStrip(
      company,
      year,
      month,
      day
    ) {
      const content =
        document.getElementById(
          "empireHUDContent"
        );

      if (!content) {
        return;
      }

      if (!company) {
        content.innerHTML = `
          <div class="er-company-strip">

            <div class="er-company-strip-left">

              <span
                class="er-company-dot"
                style="
                  background:#f0b84b;
                  box-shadow:
                    0 0 8px
                    rgba(240,184,75,.6);
                "
              ></span>

              <span class="er-company-name">
                Build your career
              </span>

              <span class="er-company-status">
                Start from zero
              </span>

            </div>

            <div class="er-company-metrics">
              Y${year}
              ·
              M${month}
              ·
              D${day}
            </div>

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
            : "Setup"
        );

      content.innerHTML = `
        <div class="er-company-strip">

          <div class="er-company-strip-left">

            <span class="er-company-dot"></span>

            <span class="er-company-name">
              ${this.escape(
                company.name ||
                "My Company"
              )}
            </span>

            <span class="er-company-status">
              ${this.escape(status)}
            </span>

          </div>

          <div class="er-company-metrics">

            <span class="er-company-metric">
              REV
              <b>
                ${this.money(revenue)}
              </b>
            </span>

            <span class="er-company-metric">
              PROF
              <b>
                ${this.money(profit)}
              </b>
            </span>

            <span class="er-company-metric">
              EMP
              <b>
                ${this.number(employees)}
              </b>
            </span>

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

      if (!bottom) {
        return;
      }

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
              ⋯
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
      const menu =
        document.getElementById(
          "empireHUDMore"
        );

      if (!menu) {
        return;
      }

      menu.innerHTML = `
        <div class="er-more-panel">

          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.openProducts()
            "
          >
            <span class="er-more-icon">
              📦
            </span>

            PRODUCTS
          </button>


          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.openHR()
            "
          >
            <span class="er-more-icon">
              👥
            </span>

            HR
          </button>


          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.openGovernment()
            "
          >
            <span class="er-more-icon">
              🏛️
            </span>

            GOVERNMENT
          </button>


          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.openMarket()
            "
          >
            <span class="er-more-icon">
              📈
            </span>

            MARKET
          </button>


          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.openNews()
            "
          >
            <span class="er-more-icon">
              📰
            </span>

            NEWS
          </button>


          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.openCorporate()
            "
          >
            <span class="er-more-icon">
              🏙️
            </span>

            CORPORATE
          </button>


          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.saveGame()
            "
          >
            <span class="er-more-icon">
              💾
            </span>

            SAVE
          </button>


          <button
            class="er-more-button"
            type="button"
            onclick="
              EmpireMainHUD.closeMore()
            "
          >
            <span class="er-more-icon">
              ×
            </span>

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
                obj && obj[key],
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
        "HR dashboard unavailable."
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
        "Market dashboard unavailable."
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
      this.render();

      this.toast(
        "Empire Rush command center"
      );
    },

    toggleMore() {
      const menu =
        document.querySelector(
          "#empireHUDMore .er-more-panel"
        );

      if (!menu) {
        return;
      }

      menu.classList.toggle("open");

      const nav =
        document.querySelector(
          '[data-nav="more"]'
        );

      if (nav) {
        nav.classList.toggle(
          "active",
          menu.classList.contains("open")
        );
      }
    },

    closeMore() {
      const menu =
        document.querySelector(
          "#empireHUDMore .er-more-panel"
        );

      if (menu) {
        menu.classList.remove("open");
      }

      const nav =
        document.querySelector(
          '[data-nav="more"]'
        );

      if (nav) {
        nav.classList.remove("active");
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
          "HUD save failed:",
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
        document.createElement("div");

      alert.id =
        "empireHUDToast";

      alert.className =
        "er-alert show";

      alert.textContent =
        String(message || "");

      const content =
        document.getElementById(
          "empireHUDContent"
        );

      if (content) {
        content.appendChild(alert);
      }

      setTimeout(() => {
        alert.classList.remove(
          "show"
        );

        setTimeout(() => {
          if (alert.parentNode) {
            alert.remove();
          }
        }, 250);
      }, 1800);
    },

    /* =========================================================
       REFRESH
       ========================================================= */

    render() {
      this.createRoot();

      this.renderTop();
      this.renderBottom();
      this.renderMore();
    },

    refresh() {
      this.renderTop();

      /*
       * Do not rebuild the bottom navigation
       * every second. This prevents unnecessary
       * button recreation and preserves UI state.
       */
    },

    /* =========================================================
       UTILITIES
       ========================================================= */

    escape(value) {
      return String(value ?? "")
        .replace(
          /&/g,
          "&amp;"
        )
        .replace(
          /</g,
          "&lt;"
        )
        .replace(
          />/g,
          "&gt;"
        )
        .replace(
          /"/g,
          "&quot;"
        )
        .replace(
          /'/g,
          "&#039;"
        );
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

  window.EmpireMainHUD = HUD;


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

      const moreButton =
        event.target.closest(
          ".er-header-more, [data-nav='more']"
        );

      if (
        panel &&
        panel.classList.contains("open") &&
        !panel.contains(event.target) &&
        !moreButton
      ) {
        HUD.closeMore();
      }

    },
    true
  );


  /* ===========================================================
     PREVENT HUD FROM BLOCKING THE 3D WORLD
     =========================================================== */

  const worldPassthrough =
    document.getElementById(
      "empireMainHUD"
    );

  if (worldPassthrough) {
    worldPassthrough.addEventListener(
      "pointerdown",
      event => {

        const interactive =
          event.target.closest(
            "button, .er-more-panel"
          );

        if (!interactive) {
          event.stopPropagation();
        }

      },
      true
    );
  }


  console.log(
    "Empire Rush: Compact Game HUD loaded."
  );

})();
