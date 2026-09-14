(function () {
  "use strict";

  const Game = window.EmpireGameState;

  if (!Game) {
    console.warn(
      "Empire Rush HUD: GameState not ready."
    );
    return;
  }

  const HUD = {

    root: null,
    refreshTimer: null,
    moreOpen: false,

    /* =====================================================
       STATE
       ===================================================== */

    getState() {
      try {
        return Game.getState() || {};
      } catch (error) {
        console.warn(
          "HUD state read failed:",
          error
        );
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
      const state = this.getState();

      return Array.isArray(state.companies)
        ? state.companies
        : [];
    },

    getCompany() {
      const companies =
        this.getCompanies();

      if (!companies.length) {
        return null;
      }

      return companies[0];
    },

    getWealth() {
      const state =
        this.getState();

      const player =
        state.player || {};

      const bank =
        state.bank || {};

      const cash =
        Number(player.cash || 0);

      const personalSavings =
        Number(player.savings || 0);

      const bankSavings =
        Number(bank.savings || 0);

      return {
        cash,
        savings:
          personalSavings +
          bankSavings,
        total:
          cash +
          personalSavings +
          bankSavings
      };
    },

    /* =====================================================
       FORMATTING
       ===================================================== */

    money(value) {
      const n =
        Number(value || 0);

      const negative =
        n < 0;

      const abs =
        Math.abs(n);

      let result;

      if (abs >= 10000000) {
        result =
          "₹" +
          (abs / 10000000)
            .toFixed(1) +
          "Cr";
      }

      else if (abs >= 100000) {
        result =
          "₹" +
          (abs / 100000)
            .toFixed(1) +
          "L";
      }

      else if (abs >= 1000) {
        result =
          "₹" +
          (abs / 1000)
            .toFixed(1) +
          "K";
      }

      else {
        result =
          "₹" +
          Math.round(abs)
            .toLocaleString("en-IN");
      }

      return negative
        ? "-" + result
        : result;
    },

    number(value) {
      return Math.round(
        Number(value || 0)
      ).toLocaleString("en-IN");
    },

    escape(value) {
      return String(
        value ?? ""
      )
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

    /* =====================================================
       ROOT
       ===================================================== */

    createRoot() {

      let root =
        document.getElementById(
          "empireMainHUD"
        );

      if (root) {

        this.root =
          root;

        return;
      }

      root =
        document.createElement(
          "div"
        );

      root.id =
        "empireMainHUD";

      root.innerHTML = `
        <div
          id="empireHUDTop"
        ></div>

        <div
          id="empireHUDContent"
        ></div>

        <div
          id="empireHUDMore"
        ></div>

        <div
          id="empireHUDBottom"
        ></div>

        <div
          id="empireHUDToastLayer"
        ></div>
      `;

      document.body.appendChild(
        root
      );

      this.root =
        root;

      this.injectStyles();
    },

    /* =====================================================
       CSS
       ===================================================== */

    injectStyles() {

      if (
        document.getElementById(
          "empireHUDStyles"
        )
      ) {
        return;
      }

      const style =
        document.createElement(
          "style"
        );

      style.id =
        "empireHUDStyles";

      style.textContent = `

        /* =================================================
           ROOT
           ================================================= */

        #empireMainHUD {

          position:fixed;

          inset:0;

          z-index:9000;

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

          -webkit-font-smoothing:
            antialiased;

          text-rendering:
            optimizeLegibility;
        }


        #empireHUDTop,
        #empireHUDContent,
        #empireHUDMore,
        #empireHUDBottom,
        #empireHUDToastLayer {

          pointer-events:none;
        }


        /* =================================================
           HEADER
           ================================================= */

        .er-header {

          position:absolute;

          top:
            max(
              7px,
              env(
                safe-area-inset-top
              )
            );

          left:7px;

          right:7px;

          height:58px;

          display:flex;

          align-items:center;

          padding:
            5px 6px;

          border-radius:18px;

          background:
            rgba(
              7,
              14,
              24,
              .94
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              .14
            );

          box-shadow:
            0 8px 28px
            rgba(
              0,
              0,
              0,
              .30
            ),
            inset 0 1px 0
            rgba(
              255,
              255,
              255,
              .06
            );

          backdrop-filter:
            blur(18px);

          -webkit-backdrop-filter:
            blur(18px);

          pointer-events:auto;

          overflow:hidden;
        }


        /* =================================================
           BRAND
           ================================================= */

        .er-brand {

          width:134px;

          min-width:134px;

          display:flex;

          align-items:center;

          gap:8px;
        }


        .er-brand-mark {

          width:40px;

          height:40px;

          flex:0 0 40px;

          display:flex;

          align-items:center;

          justify-content:center;

          border-radius:13px;

          background:
            linear-gradient(
              145deg,
              #2c3748,
              #111925
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              .16
            );

          box-shadow:
            inset 0 1px 0
            rgba(
              255,
              255,
              255,
              .10
            );

          font-size:21px;

          line-height:1;

          color:#ffffff;
        }


        .er-brand-word {

          font-size:16px;

          line-height:16px;

          font-weight:950;

          letter-spacing:.4px;

          white-space:nowrap;
        }


        .er-brand-word .rush {

          color:#8bd23f;
        }


        .er-brand-sub {

          margin-top:4px;

          font-size:6px;

          line-height:6px;

          font-weight:800;

          letter-spacing:
            1.05px;

          opacity:.48;
        }


        /* =================================================
           PLAYER
           ================================================= */

        .er-player {

          min-width:0;

          flex:1;

          display:flex;

          align-items:center;

          padding:
            0 7px;
        }


        .er-avatar {

          width:38px;

          height:38px;

          flex:0 0 38px;

          display:flex;

          align-items:center;

          justify-content:center;

          border-radius:50%;

          background:
            linear-gradient(
              145deg,
              #6c58f5,
              #3829bd
            );

          box-shadow:
            0 4px 12px
            rgba(
              79,
              65,
              220,
              .35
            );

          font-size:14px;

          font-weight:900;
        }


        .er-player-info {

          min-width:0;

          margin-left:8px;
        }


        .er-player-name {

          font-size:12px;

          line-height:14px;

          font-weight:900;

          white-space:nowrap;

          overflow:hidden;

          text-overflow:ellipsis;
        }


        .er-player-role {

          margin-top:3px;

          font-size:7px;

          line-height:8px;

          font-weight:700;

          color:#a9c9e8;

          white-space:nowrap;

          overflow:hidden;

          text-overflow:ellipsis;
        }


        /* =================================================
           CASH
           ================================================= */

        .er-cash-box {

          width:64px;

          min-width:64px;

          height:43px;

          display:flex;

          align-items:center;

          gap:5px;

          padding:
            0 6px;

          border-radius:12px;

          background:
            rgba(
              255,
              255,
              255,
              .055
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              .08
            );
        }


        .er-cash-icon {

          width:23px;

          height:23px;

          display:flex;

          align-items:center;

          justify-content:center;

          border-radius:7px;

          background:
            rgba(
              75,
              206,
              126,
              .18
            );

          font-size:13px;
        }


        .er-cash-info {

          min-width:0;
        }


        .er-cash-label {

          font-size:5px;

          line-height:6px;

          font-weight:800;

          opacity:.42;
        }


        .er-cash-value {

          margin-top:2px;

          font-size:11px;

          line-height:12px;

          font-weight:950;

          white-space:nowrap;
        }


        /* =================================================
           DAY
           ================================================= */

        .er-day-box {

          width:60px;

          min-width:60px;

          height:43px;

          margin-left:5px;

          display:flex;

          align-items:center;

          gap:5px;

          padding:
            0 6px;

          border-radius:12px;

          background:
            rgba(
              255,
              255,
              255,
              .055
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              .08
            );
        }


        .er-day-icon {

          width:23px;

          height:23px;

          display:flex;

          align-items:center;

          justify-content:center;

          border-radius:7px;

          background:
            rgba(
              136,
              203,
              87,
              .18
            );

          font-size:13px;
        }


        .er-day-info {

          min-width:0;
        }


        .er-day-label {

          font-size:5px;

          line-height:6px;

          font-weight:800;

          opacity:.42;
        }


        .er-day-value {

          margin-top:2px;

          font-size:9px;

          line-height:10px;

          font-weight:950;

          white-space:nowrap;
        }


        /* =================================================
           MENU
           ================================================= */

        .er-menu {

          width:40px;

          height:40px;

          flex:0 0 40px;

          margin-left:5px;

          border:0;

          border-radius:12px;

          background:
            rgba(
              255,
              255,
              255,
              .075
            );

          color:#ffffff;

          display:flex;

          align-items:center;

          justify-content:center;

          font-size:22px;

          font-weight:900;

          touch-action:manipulation;
        }


        .er-menu:active {

          transform:
            scale(.95);
        }


        /* =================================================
           STATUS STRIP
           ================================================= */

        .er-status {

          position:absolute;

          top:
            calc(
              max(
                7px,
                env(
                  safe-area-inset-top
                )
              )
              + 65px
            );

          left:9px;

          right:9px;

          height:34px;

          display:flex;

          align-items:center;

          padding:
            0 10px;

          border-radius:11px;

          background:
            rgba(
              7,
              14,
              24,
              .78
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              .08
            );

          backdrop-filter:
            blur(12px);

          -webkit-backdrop-filter:
            blur(12px);
        }


        .er-status-left {

          min-width:0;

          flex:1;

          display:flex;

          align-items:center;

          gap:7px;
        }


        .er-status-dot {

          width:7px;

          height:7px;

          flex:0 0 7px;

          border-radius:50%;

          background:#f0bd45;

          box-shadow:
            0 0 9px
            rgba(
              240,
              189,
              69,
              .70
            );
        }


        .er-status-title {

          font-size:9px;

          line-height:10px;

          font-weight:900;

          white-space:nowrap;

          overflow:hidden;

          text-overflow:ellipsis;
        }


        .er-status-divider {

          opacity:.28;

          font-size:10px;
        }


        .er-status-sub {

          font-size:7px;

          font-weight:700;

          opacity:.48;

          white-space:nowrap;
        }


        .er-status-date {

          font-size:7px;

          font-weight:800;

          opacity:.52;

          white-space:nowrap;
        }


        /* =================================================
           BOTTOM NAV
           ================================================= */

        .er-bottom {

          position:absolute;

          left:7px;

          right:7px;

          bottom:
            max(
              6px,
              env(
                safe-area-inset-bottom
              )
            );

          height:68px;

          padding:5px;

          display:grid;

          grid-template-columns:
            repeat(5, 1fr);

          gap:4px;

          border-radius:19px;

          background:
            rgba(
              6,
              13,
              22,
              .96
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              .12
            );

          box-shadow:
            0 -8px 30px
            rgba(
              0,
              0,
              0,
              .32
            );

          backdrop-filter:
            blur(18px);

          -webkit-backdrop-filter:
            blur(18px);

          pointer-events:auto;
        }


        .er-nav {

          position:relative;

          min-width:0;

          border:0;

          border-radius:14px;

          background:transparent;

          color:#ffffff;

          opacity:.65;

          display:flex;

          flex-direction:column;

          align-items:center;

          justify-content:center;

          gap:3px;

          touch-action:manipulation;
        }


        .er-nav:active {

          transform:
            scale(.96);
        }


        .er-nav.active {

          opacity:1;

          background:
            linear-gradient(
              180deg,
              rgba(
                53,
                70,
                112,
                .55
              ),
              rgba(
                27,
                44,
                76,
                .42
              )
            );

          box-shadow:
            inset 0 1px 0
            rgba(
              255,
              255,
              255,
              .05
            );
        }


        .er-nav.active::after {

          content:"";

          position:absolute;

          left:50%;

          bottom:4px;

          width:34px;

          height:3px;

          transform:
            translateX(-50%);

          border-radius:5px;

          background:
            #4da9ff;

          box-shadow:
            0 0 8px
            rgba(
              77,
              169,
              255,
              .55
            );
        }


        .er-nav-icon {

          font-size:20px;

          line-height:20px;
        }


        .er-nav-label {

          font-size:7px;

          line-height:8px;

          font-weight:900;

          letter-spacing:.35px;
        }


        /* =================================================
           MORE MENU
           ================================================= */

        .er-more-panel {

          position:absolute;

          left:8px;

          right:8px;

          bottom:
            calc(
              80px +
              env(
                safe-area-inset-bottom
              )
            );

          padding:9px;

          display:none;

          grid-template-columns:
            repeat(3, 1fr);

          gap:6px;

          border-radius:17px;

          background:
            rgba(
              6,
              13,
              22,
              .97
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              .12
            );

          box-shadow:
            0 18px 45px
            rgba(
              0,
              0,
              0,
              .42
            );

          backdrop-filter:
            blur(20px);

          -webkit-backdrop-filter:
            blur(20px);

          pointer-events:auto;
        }


        .er-more-panel.open {

          display:grid;
        }


        .er-more-button {

          min-width:0;

          height:56px;

          border:0;

          border-radius:12px;

          background:
            rgba(
              255,
              255,
              255,
              .055
            );

          color:#ffffff;

          display:flex;

          flex-direction:column;

          align-items:center;

          justify-content:center;

          gap:4px;

          font-size:7px;

          font-weight:900;

          touch-action:manipulation;
        }


        .er-more-button:active {

          transform:
            scale(.96);
        }


        .er-more-icon {

          font-size:18px;

          line-height:18px;
        }


        /* =================================================
           TOAST
           ================================================= */

        .er-toast {

          position:absolute;

          left:50%;

          bottom:
            calc(
              84px +
              env(
                safe-area-inset-bottom
              )
            );

          transform:
            translate(
              -50%,
              10px
            );

          max-width:
            calc(100% - 30px);

          padding:
            9px 13px;

          border-radius:11px;

          background:
            rgba(
              7,
              14,
              24,
              .95
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              .10
            );

          box-shadow:
            0 10px 30px
            rgba(
              0,
              0,
              0,
              .35
            );

          font-size:8px;

          font-weight:800;

          opacity:0;

          transition:
            opacity .20s ease,
            transform .20s ease;

          pointer-events:none;
        }


        .er-toast.show {

          opacity:1;

          transform:
            translate(
              -50%,
              0
            );
        }


        /* =================================================
           SMALL PHONES
           ================================================= */

        @media (
          max-width:420px
        ) {

          .er-header {

            height:55px;

            border-radius:17px;
          }


          .er-brand {

            width:91px;

            min-width:91px;

            gap:6px;
          }


          .er-brand-mark {

            width:32px;

            height:32px;

            flex-basis:32px;

            border-radius:10px;

            font-size:17px;
          }


          .er-brand-word {

            font-size:13px;

            line-height:13px;
          }


          .er-brand-sub {

            font-size:5px;

            margin-top:3px;
          }


          .er-player {

            padding:
              0 4px;
          }


          .er-avatar {

            width:32px;

            height:32px;

            flex-basis:32px;

            font-size:12px;
          }


          .er-player-info {

            margin-left:6px;
          }


          .er-player-name {

            font-size:10px;

            line-height:11px;
          }


          .er-player-role {

            font-size:6px;

            line-height:7px;
          }


          .er-cash-box {

            width:56px;

            min-width:56px;

            height:39px;

            padding:0 5px;

            gap:4px;
          }


          .er-cash-icon {

            width:20px;

            height:20px;

            font-size:11px;
          }


          .er-cash-value {

            font-size:10px;
          }


          .er-day-box {

            width:51px;

            min-width:51px;

            height:39px;

            padding:0 5px;

            gap:4px;
          }


          .er-day-icon {

            width:20px;

            height:20px;

            font-size:11px;
          }


          .er-day-value {

            font-size:8px;
          }


          .er-menu {

            width:35px;

            height:35px;

            flex-basis:35px;

            font-size:19px;
          }


          .er-status {

            height:31px;
          }


          .er-status-title {

            font-size:8px;
          }


          .er-status-sub {

            font-size:6px;
          }


          .er-status-date {

            font-size:6px;
          }


          .er-bottom {

            height:64px;

            border-radius:18px;
          }


          .er-nav-icon {

            font-size:18px;
          }


          .er-nav-label {

            font-size:6px;
          }
        }


        /* =================================================
           VERY SMALL
           ================================================= */

        @media (
          max-width:360px
        ) {

          .er-brand {

            width:73px;

            min-width:73px;
          }


          .er-brand-sub {

            display:none;
          }


          .er-brand-word {

            font-size:12px;
          }


          .er-avatar {

            display:none;
          }


          .er-player-info {

            margin-left:2px;
          }


          .er-player-name {

            font-size:9px;
          }


          .er-cash-box {

            width:50px;

            min-width:50px;
          }


          .er-day-box {

            width:46px;

            min-width:46px;
          }


          .er-day-icon,
          .er-cash-icon {

            display:none;
          }


          .er-menu {

            width:32px;

            height:32px;

            flex-basis:32px;
          }
        }


        /* =================================================
           TABLET
           ================================================= */

        @media (
          min-width:700px
        ) {

          .er-header {

            top:
              max(
                10px,
                env(
                  safe-area-inset-top
                )
              );

            left:14px;

            right:14px;

            height:60px;

            border-radius:18px;
          }


          .er-brand {

            width:145px;

            min-width:145px;
          }


          .er-brand-mark {

            width:42px;

            height:42px;

            flex-basis:42px;
          }


          .er-brand-word {

            font-size:17px;
          }


          .er-player {

            justify-content:center;

            flex:none;

            width:220px;
          }


          .er-status {

            left:16px;

            right:16px;
          }


          .er-bottom {

            left:50%;

            right:auto;

            width:
              min(
                620px,
                calc(
                  100% - 30px
                )
              );

            transform:
              translateX(-50%);

            height:68px;
          }


          .er-more-panel {

            left:50%;

            right:auto;

            width:
              min(
                430px,
                calc(
                  100% - 30px
                )
              );

            transform:
              translateX(-50%);
          }
        }

      `;

      document.head.appendChild(
        style
      );
    },
      /* =====================================================
       MODULE INVOKER
       ===================================================== */

    invoke(names) {

      this.closeMore();

      for (
        const name of names
      ) {

        const fn =
          name
            .split(".")
            .reduce(
              (
                obj,
                key
              ) =>
                obj &&
                obj[key],
              window
            );

        if (
          typeof fn ===
          "function"
        ) {

          try {

            fn();

            return true;

          } catch (error) {

            console.warn(
              "Empire Rush HUD module error:",
              name,
              error
            );
          }
        }
      }

      return false;
    },


    /* =====================================================
       CAREER
       ===================================================== */

    openCareer() {

      this.setActive(
        "career"
      );

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


    /* =====================================================
       BUSINESS
       ===================================================== */

    openBusiness() {

      this.setActive(
        "business"
      );

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


    /* =====================================================
       FINANCE
       ===================================================== */

    openFinance() {

      this.setActive(
        "finance"
      );

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


    /* =====================================================
       PRODUCTS
       ===================================================== */

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
        "Products dashboard unavailable."
      );
    },


    /* =====================================================
       HR / WORKFORCE
       ===================================================== */

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


    /* =====================================================
       GOVERNMENT
       ===================================================== */

    openGovernment() {

      if (
        this.invoke([
          "EmpireGovernmentUI.open",
          "EmpireComplianceUI.open",
          "EmpireGovernmentComplianceUI.open"
        ])
      ) {
        return;
      }

      this.toast(
        "Government dashboard unavailable."
      );
    },


    /* =====================================================
       ECONOMICS / MARKET
       ===================================================== */

    openMarket() {

      if (
        this.invoke([
          "EmpireCompetitionMarketUI.open",
          "EmpireMarketUI.open",
          "EmpireEconomicsUI.open"
        ])
      ) {
        return;
      }

      this.toast(
        "Economics dashboard unavailable."
      );
    },


    /* =====================================================
       NEWS
       ===================================================== */

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


    /* =====================================================
       CORPORATE
       ===================================================== */

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


    /* =====================================================
       COMMAND CENTER
       ===================================================== */

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


    /* =====================================================
       ACTIVE NAV
       ===================================================== */

    setActive(name) {

      const buttons =
        document.querySelectorAll(
          "#empireHUDBottom .er-nav"
        );

      buttons.forEach(
        button => {

          button.classList.toggle(
            "active",
            button.dataset.nav ===
              name
          );
        }
      );
    },


    /* =====================================================
       HOME
       ===================================================== */

    home() {

      this.setActive(
        "home"
      );

      this.closeMore();

      this.toast(
        "Empire Rush command center"
      );
    },


    /* =====================================================
       MORE
       ===================================================== */

    toggleMore() {

      const panel =
        document.querySelector(
          "#empireHUDMore .er-more-panel"
        );

      if (!panel) {
        return;
      }

      this.moreOpen =
        !panel.classList.contains(
          "open"
        );

      panel.classList.toggle(
        "open",
        this.moreOpen
      );

      const moreButton =
        document.querySelector(
          "#empireHUDBottom [data-nav='more']"
        );

      if (moreButton) {

        moreButton.classList.toggle(
          "active",
          this.moreOpen
        );
      }
    },


    closeMore() {

      this.moreOpen =
        false;

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


    /* =====================================================
       SAVE
       ===================================================== */

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
          "Empire Rush save error:",
          error
        );

        this.toast(
          "Save failed."
        );
      }
    },


    /* =====================================================
       TOAST
       ===================================================== */

    toast(message) {

      const layer =
        document.getElementById(
          "empireHUDToastLayer"
        );

      if (!layer) {
        return;
      }

      const existing =
        layer.querySelector(
          ".er-toast"
        );

      if (existing) {
        existing.remove();
      }

      const toast =
        document.createElement(
          "div"
        );

      toast.className =
        "er-toast";

      toast.textContent =
        String(
          message || ""
        );

      layer.appendChild(
        toast
      );

      requestAnimationFrame(
        () => {
          toast.classList.add(
            "show"
          );
        }
      );

      setTimeout(
        () => {

          toast.classList.remove(
            "show"
          );

          setTimeout(
            () => {

              if (
                toast.parentNode
              ) {
                toast.remove();
              }

            },
            220
          );

        },
        1700
      );
    },


    /* =====================================================
       DYNAMIC DATA REFRESH
       ===================================================== */

    refresh() {

      /*
       * IMPORTANT:
       * Do not rebuild the entire HUD every second.
       *
       * Only update dynamic values.
       */

      const player =
        this.getPlayer();

      const world =
        this.getWorld();

      const wealth =
        this.getWealth();

      const company =
        this.getCompany();


      /* ------------------------------
         Player name
         ------------------------------ */

      const name =
        document.querySelector(
          ".er-player-name"
        );

      if (name) {

        name.textContent =
          player.name ||
          "Founder";
      }


      /* ------------------------------
         Job
         ------------------------------ */

      const role =
        document.querySelector(
          ".er-player-role"
        );

      if (role) {

        role.textContent =
          (
            player.currentJob ||
            "Unemployed"
          ) +
          " · " +
          (
            player.jobLevel ||
            "Entry"
          );
      }


      /* ------------------------------
         Avatar
         ------------------------------ */

      const avatar =
        document.querySelector(
          ".er-avatar"
        );

      if (avatar) {

        avatar.textContent =
          String(
            player.name ||
            "Founder"
          )
            .charAt(0)
            .toUpperCase();
      }


      /* ------------------------------
         Cash
         ------------------------------ */

      const cash =
        document.querySelector(
          ".er-cash-value"
        );

      if (cash) {

        cash.textContent =
          this.money(
            wealth.cash
          );
      }


      /* ------------------------------
         Day
         ------------------------------ */

      const day =
        document.querySelector(
          ".er-day-value"
        );

      if (day) {

        day.textContent =
          "Day " +
          Number(
            world.day || 1
          );
      }


      /* ------------------------------
         Status strip
         ------------------------------ */

      this.updateStatus(
        company,
        world
      );
    },


    /* =====================================================
       STATUS UPDATE
       ===================================================== */

    updateStatus(
      company,
      world
    ) {

      const title =
        document.querySelector(
          ".er-status-title"
        );

      const sub =
        document.querySelector(
          ".er-status-sub"
        );

      const date =
        document.querySelector(
          ".er-status-date"
        );

      const dot =
        document.querySelector(
          ".er-status-dot"
        );

      if (!title) {
        return;
      }


      if (!company) {

        title.textContent =
          "Build your career";

        if (sub) {

          sub.textContent =
            "Start from zero";
        }

        if (date) {

          date.textContent =
            "No Company";
        }

        if (dot) {

          dot.style.background =
            "#f0bd45";
        }

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
        Array.isArray(
          company.employees
        )
          ? company.employees.length
          : Number(
              company.employeeCount ||
              0
            );

      title.textContent =
        company.name ||
        "My Company";

      if (sub) {

        sub.textContent =
          company.status ||
          (
            company.operating
              ? "Operating"
              : "Setup Required"
          );
      }

      if (date) {

        date.textContent =
          "REV " +
          this.money(
            revenue
          ) +
          " · PROF " +
          this.money(
            profit
          ) +
          " · EMP " +
          employees;
      }

      if (dot) {

        dot.style.background =
          company.operating
            ? "#55d68a"
            : "#f0bd45";
      }
    },


    /* =====================================================
       FULL RENDER
       ===================================================== */

    render() {

      this.createRoot();

      this.renderTop();

      this.renderBottom();

      this.renderMore();

      /*
       * Right-side actions are intentionally
       * compact and fixed.
       */

      this.renderSide();

      this.renderCommand();
    },


    /* =====================================================
       SIDE ACTIONS
       ===================================================== */

    renderSide() {

      const side =
        document.getElementById(
          "empireHUDContent"
        );

      if (!side) {
        return;
      }

      const existing =
        side.querySelector(
          ".er-side"
        );

      if (existing) {
        return;
      }

      const container =
        document.createElement(
          "div"
        );

      container.className =
        "er-side";

      container.innerHTML = `

        <button
          class="er-side-button"
          type="button"
          onclick="
            EmpireMainHUD.openProducts()
          "
        >
          <span class="er-side-icon">
            📦
          </span>

          <span>
            PRODUCTS
          </span>

          <span class="er-side-arrow">
            ›
          </span>
        </button>


        <button
          class="er-side-button"
          type="button"
          onclick="
            EmpireMainHUD.openNews()
          "
        >
          <span class="er-side-icon">
            📰
          </span>

          <span>
            NEWS
          </span>

          <span class="er-side-arrow">
            ›
          </span>
        </button>


        <button
          class="er-side-button"
          type="button"
          onclick="
            EmpireMainHUD.openCorporate()
          "
        >
          <span class="er-side-icon">
            🏢
          </span>

          <span>
            CORPORATE
          </span>

          <span class="er-side-arrow">
            ›
          </span>
        </button>


        <div
          style="
            height:18px;
          "
        ></div>


        <button
          class="er-side-button"
          type="button"
          onclick="
            EmpireMainHUD.openGovernment()
          "
        >
          <span class="er-side-icon">
            🏛️
          </span>

          <span>
            GOVERNMENT
          </span>

          <span class="er-side-arrow">
            ›
          </span>
        </button>


        <button
          class="er-side-button"
          type="button"
          onclick="
            EmpireMainHUD.openHR()
          "
        >
          <span class="er-side-icon">
            👥
          </span>

          <span>
            WORKFORCE
          </span>

          <span class="er-side-arrow">
            ›
          </span>
        </button>


        <button
          class="er-side-button"
          type="button"
          onclick="
            EmpireMainHUD.openMarket()
          "
        >
          <span class="er-side-icon">
            📊
          </span>

          <span>
            ECONOMICS
          </span>

          <span class="er-side-arrow">
            ›
          </span>
        </button>
      `;

      side.appendChild(
        container
      );
    },


    /* =====================================================
       COMMAND CENTER
       ===================================================== */

    renderCommand() {

      const content =
        document.getElementById(
          "empireHUDContent"
        );

      if (!content) {
        return;
      }

      if (
        content.querySelector(
          ".er-command"
        )
      ) {
        return;
      }

      const button =
        document.createElement(
          "button"
        );

      button.className =
        "er-command";

      button.type =
        "button";

      button.innerHTML = `
        <span
          class="er-command-icon"
        >
          ☷
        </span>

        <span>
          COMMAND CENTER
        </span>

        <span
          class="er-command-arrow"
        >
          ›
        </span>
      `;

      button.onclick =
        () => {
          this.openCommandCenter();
        };

      content.appendChild(
        button
      );
    },


    /* =====================================================
       START
       ===================================================== */

    start() {

      this.render();

      if (
        this.refreshTimer
      ) {

        clearInterval(
          this.refreshTimer
        );
      }

      this.refreshTimer =
        setInterval(
          () => {

            this.refresh();

          },
          1000
        );
    }
  };


  /* =========================================================
     PUBLIC API
     ========================================================= */

  window.EmpireMainHUD =
    HUD;


  /* =========================================================
     BOOT
     ========================================================= */

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
      {
        once:true
      }
    );

  } else {

    boot();
  }


  /* =========================================================
     GAME EVENTS
     ========================================================= */

  const events = [

    "EmpireGameStateChanged",

    "EmpireDayAdvanced",

    "EmpireMonthAdvanced",

    "EmpireBusinessStarted",

    "EmpireBusinessLaunched",

    "EmpireEmployeeHired",

    "EmpireEmployeePromoted"

  ];


  events.forEach(
    eventName => {

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
    }
  );


  /* =========================================================
     OUTSIDE TAP
     ========================================================= */

  document.addEventListener(
    "pointerdown",
    event => {

      const panel =
        document.querySelector(
          "#empireHUDMore .er-more-panel"
        );

      if (
        !panel ||
        !panel.classList.contains(
          "open"
        )
      ) {
        return;
      }


      if (
        panel.contains(
          event.target
        )
      ) {
        return;
      }


      if (
        event.target.closest(
          ".er-menu"
        )
      ) {
        return;
      }


      if (
        event.target.closest(
          "[data-nav='more']"
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
