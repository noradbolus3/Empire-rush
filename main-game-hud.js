(function () {
  "use strict";

  /* =========================================================
     EMPIRE RUSH — CLEAN MOBILE HUD
     One HUD only.
     Legacy HUD is automatically hidden.
     ========================================================= */

  const HUD_ID = "empireCleanHUD";

  const HUD = {

    root: null,
    started: false,
    timer: null,

    /* =======================================================
       GAME STATE
       ======================================================= */

    game() {
      return window.EmpireGameState || null;
    },

    state() {
      try {
        const game = this.game();
        return game && game.getState
          ? game.getState() || {}
          : {};
      } catch (e) {
        return {};
      }
    },

    player() {
      return this.state().player || {};
    },

    world() {
      return this.state().world || {};
    },

    company() {
      const companies =
        this.state().companies;

      if (
        !Array.isArray(companies) ||
        !companies.length
      ) {
        return null;
      }

      return companies[0];
    },

    money(value) {
      const n = Number(value || 0);
      const a = Math.abs(n);

      let text;

      if (a >= 10000000) {
        text =
          "₹" +
          (a / 10000000).toFixed(1) +
          "Cr";
      } else if (a >= 100000) {
        text =
          "₹" +
          (a / 100000).toFixed(1) +
          "L";
      } else if (a >= 1000) {
        text =
          "₹" +
          (a / 1000).toFixed(1) +
          "K";
      } else {
        text =
          "₹" +
          Math.round(a)
            .toLocaleString("en-IN");
      }

      return n < 0
        ? "-" + text
        : text;
    },

    esc(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    /* =======================================================
       REMOVE THIS HUD'S OLD VERSION
       ======================================================= */

    removeOwnOldHUD() {

      const old =
        document.getElementById(HUD_ID);

      if (old) {
        old.remove();
      }

      const previous =
        document.getElementById(
          "empireMainHUD"
        );

      if (previous) {
        previous.remove();
      }

      const oldStyle =
        document.getElementById(
          "empireHUDStyles"
        );

      if (oldStyle) {
        oldStyle.remove();
      }
    },

    /* =======================================================
       HIDE LEGACY STATIC HUD
       ======================================================= */

    hideLegacy() {

      /*
       * The previous HUD was being rendered separately
       * from this controller.
       *
       * We hide only obvious legacy game HUD elements.
       * Three.js canvas/world is NEVER touched.
       */

      const exactTexts = [
        "EMPIRE RUSH · HQ",
        "EMPIRE RUSH • HQ",
        "COMMAND CENTER"
      ];

      const buttons = [
        "PRODUCTS",
        "NEWS",
        "CORPORATE",
        "GOVERNMENT",
        "WORKFORCE",
        "ECONOMICS",
        "BUSINESS"
      ];

      const all =
        document.body.querySelectorAll(
          "div,section,header,nav,button"
        );

      all.forEach(el => {

        if (
          el.id === HUD_ID ||
          el.closest("#" + HUD_ID)
        ) {
          return;
        }

        const text =
          (el.textContent || "")
            .replace(/\s+/g, " ")
            .trim();

        if (!text) {
          return;
        }

        /*
         * Hide exact old header.
         */

        if (
          exactTexts.some(
            value =>
              text === value
          )
        ) {

          const target =
            el.tagName === "BUTTON"
              ? el
              : el;

          target.style.setProperty(
            "display",
            "none",
            "important"
          );

          return;
        }

        /*
         * Hide old standalone right-side
         * and bottom navigation buttons.
         */

        if (
          el.tagName === "BUTTON" &&
          buttons.includes(text)
        ) {

          el.style.setProperty(
            "display",
            "none",
            "important"
          );
        }
      });
    },

    /* =======================================================
       ROOT
       ======================================================= */

    create() {

      this.removeOwnOldHUD();

      const root =
        document.createElement("div");

      root.id = HUD_ID;

      root.innerHTML = `
        <div class="er-header"></div>

        <div class="er-status"></div>

        <div class="er-more"></div>

        <div class="er-bottom"></div>

        <div class="er-toast-layer"></div>
      `;

      document.body.appendChild(root);

      this.root = root;

      this.css();
    },

    /* =======================================================
       CSS
       ======================================================= */

    css() {

      if (
        document.getElementById(
          "empireCleanHUDStyle"
        )
      ) {
        return;
      }

      const style =
        document.createElement("style");

      style.id =
        "empireCleanHUDStyle";

      style.textContent = `

        #${HUD_ID} {

          position:fixed;
          inset:0;

          z-index:9990;

          pointer-events:none;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Arial,
            sans-serif;

          color:#fff;

          -webkit-font-smoothing:antialiased;
        }


        #${HUD_ID} * {
          box-sizing:border-box;
        }


        /* ===============================================
           HEADER
           =============================================== */

        #${HUD_ID} .er-header {

          position:absolute;

          top:
            max(
              7px,
              env(safe-area-inset-top)
            );

          left:8px;
          right:8px;

          height:58px;

          display:flex;
          align-items:center;

          padding:5px 6px;

          border-radius:18px;

          background:
            rgba(8,15,25,.95);

          border:
            1px solid
            rgba(255,255,255,.13);

          box-shadow:
            0 8px 28px
            rgba(0,0,0,.32),
            inset 0 1px 0
            rgba(255,255,255,.06);

          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);

          pointer-events:auto;

          overflow:hidden;
        }


        .er-brand {

          width:118px;
          min-width:118px;

          display:flex;
          align-items:center;

          gap:7px;
        }


        .er-logo {

          width:39px;
          height:39px;

          flex:0 0 39px;

          display:flex;
          align-items:center;
          justify-content:center;

          border-radius:12px;

          background:
            linear-gradient(
              145deg,
              #303b4d,
              #121a26
            );

          border:
            1px solid
            rgba(255,255,255,.15);

          font-size:20px;
          font-weight:950;
        }


        .er-brand-title {

          font-size:15px;
          line-height:15px;

          font-weight:950;

          letter-spacing:.2px;

          white-space:nowrap;
        }


        .er-brand-title span {
          color:#8bd63f;
        }


        .er-brand-sub {

          margin-top:4px;

          font-size:5px;

          font-weight:800;

          letter-spacing:1px;

          opacity:.45;
        }


        /* ===============================================
           PLAYER
           =============================================== */

        .er-player {

          min-width:0;
          flex:1;

          display:flex;
          align-items:center;

          padding:0 6px;
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
              #745cff,
              #3d2bc0
            );

          font-size:14px;
          font-weight:900;
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


        .er-player-job {

          margin-top:3px;

          font-size:6px;
          font-weight:700;

          color:#9ec1e1;

          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }


        /* ===============================================
           CASH
           =============================================== */

        .er-cash {

          width:66px;
          min-width:66px;

          height:43px;

          display:flex;
          align-items:center;

          gap:5px;

          padding:4px 6px;

          border-radius:12px;

          background:
            rgba(255,255,255,.055);

          border:
            1px solid
            rgba(255,255,255,.08);
        }


        .er-cash-icon {

          width:22px;
          height:22px;

          display:flex;
          align-items:center;
          justify-content:center;

          border-radius:7px;

          background:
            rgba(80,210,125,.16);

          font-size:12px;
        }


        .er-cash-label {

          font-size:5px;

          font-weight:800;

          opacity:.42;
        }


        .er-cash-value {

          margin-top:2px;

          font-size:10px;

          font-weight:950;

          white-space:nowrap;
        }


        /* ===============================================
           DAY
           =============================================== */

        .er-day {

          width:58px;
          min-width:58px;

          height:43px;

          margin-left:5px;

          display:flex;
          align-items:center;

          gap:5px;

          padding:4px 6px;

          border-radius:12px;

          background:
            rgba(255,255,255,.055);

          border:
            1px solid
            rgba(255,255,255,.08);
        }


        .er-day-icon {

          width:22px;
          height:22px;

          display:flex;
          align-items:center;
          justify-content:center;

          border-radius:7px;

          background:
            rgba(140,210,75,.16);

          font-size:12px;
        }


        .er-day-label {

          font-size:5px;

          font-weight:800;

          opacity:.42;
        }


        .er-day-value {

          margin-top:2px;

          font-size:9px;

          font-weight:950;

          white-space:nowrap;
        }


        /* ===============================================
           MENU
           =============================================== */

        .er-menu {

          width:39px;
          height:39px;

          flex:0 0 39px;

          margin-left:5px;

          border:0;

          border-radius:11px;

          background:
            rgba(255,255,255,.075);

          color:#fff;

          font-size:21px;

          font-weight:900;
        }


        /* ===============================================
           STATUS
           =============================================== */

        #${HUD_ID} .er-status {

          position:absolute;

          top:
            calc(
              max(
                7px,
                env(safe-area-inset-top)
              ) + 65px
            );

          left:9px;
          right:9px;

          height:33px;

          display:flex;
          align-items:center;

          padding:0 10px;

          border-radius:11px;

          background:
            rgba(8,15,25,.80);

          border:
            1px solid
            rgba(255,255,255,.08);

          backdrop-filter:blur(13px);
          -webkit-backdrop-filter:blur(13px);

          pointer-events:none;
        }


        .er-status-main {

          min-width:0;
          flex:1;

          display:flex;
          align-items:center;

          gap:7px;
        }


        .er-dot {

          width:7px;
          height:7px;

          flex:0 0 7px;

          border-radius:50%;

          background:#f1bd45;

          box-shadow:
            0 0 8px
            rgba(241,189,69,.7);
        }


        .er-status-title {

          font-size:8px;
          font-weight:900;

          white-space:nowrap;
        }


        .er-separator {

          opacity:.3;
        }


        .er-status-sub {

          font-size:7px;
          font-weight:700;

          opacity:.48;

          white-space:nowrap;
        }


        .er-date {

          font-size:6px;
          font-weight:800;

          opacity:.5;

          white-space:nowrap;
        }


        /* ===============================================
           MORE
           =============================================== */

        #${HUD_ID} .er-more {

          position:absolute;

          left:8px;
          right:8px;

          bottom:
            calc(
              79px +
              env(safe-area-inset-bottom)
            );

          padding:8px;

          display:none;

          grid-template-columns:
            repeat(3,1fr);

          gap:6px;

          border-radius:17px;

          background:
            rgba(7,13,22,.97);

          border:
            1px solid
            rgba(255,255,255,.12);

          box-shadow:
            0 18px 45px
            rgba(0,0,0,.45);

          backdrop-filter:blur(20px);

          -webkit-backdrop-filter:blur(20px);

          pointer-events:auto;
        }


        #${HUD_ID} .er-more.open {
          display:grid;
        }


        .er-more-button {

          height:52px;

          border:0;

          border-radius:11px;

          background:
            rgba(255,255,255,.06);

          color:#fff;

          font-size:7px;
          font-weight:900;

          display:flex;
          flex-direction:column;

          align-items:center;
          justify-content:center;

          gap:3px;
        }


        .er-more-icon {
          font-size:17px;
        }


        /* ===============================================
           BOTTOM
           =============================================== */

        #${HUD_ID} .er-bottom {

          position:absolute;

          left:8px;
          right:8px;

          bottom:
            max(
              6px,
              env(safe-area-inset-bottom)
            );

          height:67px;

          padding:5px;

          display:grid;

          grid-template-columns:
            repeat(5,1fr);

          gap:4px;

          border-radius:19px;

          background:
            rgba(6,13,22,.96);

          border:
            1px solid
            rgba(255,255,255,.12);

          box-shadow:
            0 -8px 30px
            rgba(0,0,0,.34);

          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);

          pointer-events:auto;
        }


        .er-nav {

          position:relative;

          border:0;

          border-radius:14px;

          background:transparent;

          color:#fff;

          opacity:.58;

          display:flex;

          flex-direction:column;

          align-items:center;

          justify-content:center;

          gap:3px;
        }


        .er-nav.active {

          opacity:1;

          background:
            rgba(
              56,
              82,
              137,
              .35
            );
        }


        .er-nav.active::after {

          content:"";

          position:absolute;

          bottom:4px;
          left:50%;

          width:32px;
          height:3px;

          transform:
            translateX(-50%);

          border-radius:5px;

          background:#4da9ff;

          box-shadow:
            0 0 8px
            rgba(77,169,255,.6);
        }


        .er-nav-icon {

          font-size:19px;
          line-height:19px;
        }


        .er-nav-label {

          font-size:6px;

          line-height:8px;

          font-weight:900;

          letter-spacing:.3px;
        }


        /* ===============================================
           TOAST
           =============================================== */

        .er-toast {

          position:absolute;

          left:50%;

          bottom:
            calc(
              84px +
              env(safe-area-inset-bottom)
            );

          transform:
            translate(-50%,10px);

          padding:9px 13px;

          border-radius:11px;

          background:
            rgba(7,14,24,.96);

          border:
            1px solid
            rgba(255,255,255,.10);

          font-size:8px;
          font-weight:800;

          opacity:0;

          transition:.2s ease;

          white-space:nowrap;
        }


        .er-toast.show {

          opacity:1;

          transform:
            translate(-50%,0);
        }


        /* ===============================================
           SMALL MOBILE
           =============================================== */

        @media(max-width:420px) {

          #${HUD_ID} .er-header {
            height:55px;
          }

          .er-brand {
            width:89px;
            min-width:89px;
          }

          .er-logo {
            width:33px;
            height:33px;
            flex-basis:33px;
            font-size:17px;
          }

          .er-brand-title {
            font-size:13px;
          }

          .er-brand-sub {
            font-size:4px;
          }

          .er-avatar {
            display:none;
          }

          .er-player-info {
            margin-left:2px;
          }

          .er-player-name {
            font-size:10px;
          }

          .er-player-job {
            font-size:6px;
          }

          .er-cash {
            width:57px;
            min-width:57px;
          }

          .er-cash-icon {
            display:none;
          }

          .er-day {
            width:51px;
            min-width:51px;
          }

          .er-day-icon {
            display:none;
          }

          .er-menu {
            width:35px;
            height:35px;
            flex-basis:35px;
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

          .er-date {
            font-size:5.5px;
          }
        }


        @media(max-width:360px) {

          .er-brand {
            width:70px;
            min-width:70px;
          }

          .er-brand-sub {
            display:none;
          }

          .er-brand-title {
            font-size:11px;
          }

          .er-player-name {
            font-size:8px;
          }

          .er-player-job {
            font-size:5px;
          }

          .er-cash {
            width:51px;
            min-width:51px;
          }

          .er-day {
            width:45px;
            min-width:45px;
          }

          .er-menu {
            width:32px;
            height:32px;
            flex-basis:32px;
          }
        }


        @media(min-width:700px) {

          #${HUD_ID} .er-header {

            left:14px;
            right:14px;

            height:60px;

            border-radius:18px;
          }

          .er-brand {
            width:145px;
            min-width:145px;
          }

          .er-brand-title {
            font-size:17px;
          }

          .er-player {
            flex:none;
            width:220px;
          }

          #${HUD_ID} .er-status {
            left:16px;
            right:16px;
          }

          #${HUD_ID} .er-bottom {

            left:50%;
            right:auto;

            width:
              min(
                620px,
                calc(100% - 30px)
              );

            transform:
              translateX(-50%);
          }

          #${HUD_ID} .er-more {

            left:50%;
            right:auto;

            width:
              min(
                430px,
                calc(100% - 30px)
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

    /* =======================================================
       HEADER RENDER
       ======================================================= */

    renderHeader() {

      const el =
        this.root.querySelector(
          ".er-header"
        );

      if (!el) return;

      const player =
        this.player();

      const world =
        this.world();

      const name =
        player.name ||
        "Founder";

      const job =
        player.currentJob ||
        "Unemployed";

      const level =
        player.jobLevel ||
        "Entry";

      const cash =
        Number(
          player.cash || 0
        );

      const day =
        Number(
          world.day || 1
        );

      const year =
        Number(
          world.year || 1
        );

      const month =
        Number(
          world.month || 1
        );

      el.innerHTML = `

        <div class="er-brand">

          <div class="er-logo">
            ♛
          </div>

          <div>

            <div class="er-brand-title">
              <span>RUSH</span>
            </div>

            <div class="er-brand-sub">
              BUSINESS EMPIRE
            </div>

          </div>

        </div>


        <div class="er-player">

          <div class="er-avatar">
            ${this.esc(
              String(name)
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div class="er-player-info">

            <div class="er-player-name">
              ${this.esc(name)}
            </div>

            <div class="er-player-job">
              ${this.esc(job)}
              ·
              ${this.esc(level)}
            </div>

          </div>

        </div>


        <div class="er-cash">

          <div class="er-cash-icon">
            💵
          </div>

          <div>

            <div class="er-cash-label">
              CASH
            </div>

            <div class="er-cash-value">
              ${this.money(cash)}
            </div>

          </div>

        </div>


        <div class="er-day">

          <div class="er-day-icon">
            ▣
          </div>

          <div>

            <div class="er-day-label">
              DAY
            </div>

            <div class="er-day-value">
              ${day}
            </div>

          </div>

        </div>


        <button
          class="er-menu"
          type="button"
          aria-label="More"
        >
          ☰
        </button>
      `;

      el
        .querySelector(".er-menu")
        .onclick = () => {
          this.toggleMore();
        };
    },

    /* =======================================================
       STATUS
       ======================================================= */

    renderStatus() {

      const el =
        this.root.querySelector(
          ".er-status"
        );

      if (!el) return;

      const company =
        this.company();

      const world =
        this.world();

      if (!company) {

        el.innerHTML = `

          <div class="er-status-main">

            <span class="er-dot"></span>

            <span class="er-status-title">
              Build your career
            </span>

            <span class="er-separator">
              |
            </span>

            <span class="er-status-sub">
              Start from zero
            </span>

          </div>

          <span class="er-date">
            Y${world.year || 1}
            · M${world.month || 1}
            · D${world.day || 1}
          </span>
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
        Array.isArray(
          company.employees
        )
          ? company.employees.length
          : 0;

      const status =
        company.status ||
        (
          company.operating
            ? "Operating"
            : "Setup Required"
        );

      el.innerHTML = `

        <div class="er-status-main">

          <span
            class="er-dot"
            style="
              background:
                ${company.operating
                  ? "#55d68a"
                  : "#f1bd45"};
            "
          ></span>

          <span class="er-status-title">
            ${this.esc(
              company.name ||
              "My Company"
            )}
          </span>

          <span class="er-separator">
            |
          </span>

          <span class="er-status-sub">
            ${this.esc(status)}
          </span>

        </div>

        <span class="er-date">
          REV ${this.money(revenue)}
          · PROF ${this.money(profit)}
          · EMP ${employees}
        </span>
      `;
    },

    /* =======================================================
       BOTTOM
       ======================================================= */

    renderBottom() {

      const el =
        this.root.querySelector(
          ".er-bottom"
        );

      if (!el) return;

      el.innerHTML = `

        <button
          class="er-nav active"
          data-nav="home"
          type="button"
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
          data-nav="career"
          type="button"
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
          data-nav="business"
          type="button"
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
          data-nav="finance"
          type="button"
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
          data-nav="more"
          type="button"
        >
          <span class="er-nav-icon">
            ☰
          </span>

          <span class="er-nav-label">
            MORE
          </span>
        </button>
      `;

      el
        .querySelector(
          '[data-nav="home"]'
        )
        .onclick = () => {
          this.setActive("home");
          this.closeMore();
        };

      el
        .querySelector(
          '[data-nav="career"]'
        )
        .onclick = () => {
          this.setActive("career");
          this.openCareer();
        };

      el
        .querySelector(
          '[data-nav="business"]'
        )
        .onclick = () => {
          this.setActive("business");
          this.openBusiness();
        };

      el
        .querySelector(
          '[data-nav="finance"]'
        )
        .onclick = () => {
          this.setActive("finance");
          this.openFinance();
        };

      el
        .querySelector(
          '[data-nav="more"]'
        )
        .onclick = () => {
          this.toggleMore();
        };
    },

    /* =======================================================
       MORE
       ======================================================= */

    renderMore() {

      const el =
        this.root.querySelector(
          ".er-more"
        );

      if (!el) return;

      el.innerHTML = `

        <button
          class="er-more-button"
          data-action="products"
        >
          <span class="er-more-icon">
            📦
          </span>
          PRODUCTS
        </button>


        <button
          class="er-more-button"
          data-action="news"
        >
          <span class="er-more-icon">
            📰
          </span>
          NEWS
        </button>


        <button
          class="er-more-button"
          data-action="corporate"
        >
          <span class="er-more-icon">
            🏢
          </span>
          CORPORATE
        </button>


        <button
          class="er-more-button"
          data-action="government"
        >
          <span class="er-more-icon">
            🏛️
          </span>
          GOVERNMENT
        </button>


        <button
          class="er-more-button"
          data-action="workforce"
        >
          <span class="er-more-icon">
            👥
          </span>
          WORKFORCE
        </button>


        <button
          class="er-more-button"
          data-action="economics"
        >
          <span class="er-more-icon">
            📊
          </span>
          ECONOMICS
        </button>


        <button
          class="er-more-button"
          data-action="save"
        >
          <span class="er-more-icon">
            💾
          </span>
          SAVE
        </button>


        <button
          class="er-more-button"
          data-action="close"
        >
          <span class="er-more-icon">
            ×
          </span>
          CLOSE
        </button>
      `;

      el
        .querySelectorAll(
          ".er-more-button"
        )
        .forEach(button => {

          button.onclick =
            () => {

              const action =
                button.dataset.action;

              if (
                action === "close"
              ) {
                this.closeMore();
                return;
              }

              if (
                action === "save"
              ) {
                this.save();
                return;
              }

              const map = {

                products:
                  "openProducts",

                news:
                  "openNews",

                corporate:
                  "openCorporate",

                government:
                  "openGovernment",

                workforce:
                  "openWorkforce",

                economics:
                  "openEconomics"
              };

              if (
                map[action] &&
                typeof this[
                  map[action]
                ] === "function"
              ) {
                this[
                  map[action]
                ]();
              }
            };
        });
    },

    /* =======================================================
       NAV ACTIVE
       ======================================================= */

    setActive(name) {

      this.root
        .querySelectorAll(
          ".er-nav"
        )
        .forEach(button => {

          button.classList.toggle(
            "active",
            button.dataset.nav ===
              name
          );
        });
    },

    /* =======================================================
       MORE TOGGLE
       ======================================================= */

    toggleMore() {

      const panel =
        this.root.querySelector(
          ".er-more"
        );

      if (!panel) return;

      panel.classList.toggle(
        "open"
      );

      const open =
        panel.classList.contains(
          "open"
        );

      const button =
        this.root.querySelector(
          '[data-nav="more"]'
        );

      if (button) {

        button.classList.toggle(
          "active",
          open
        );
      }
    },

    closeMore() {

      const panel =
        this.root.querySelector(
          ".er-more"
        );

      if (panel) {
        panel.classList.remove(
          "open"
        );
      }

      const button =
        this.root.querySelector(
          '[data-nav="more"]'
        );

      if (button) {
        button.classList.remove(
          "active"
        );
      }
    },

    /* =======================================================
       MODULE ACTIONS
       ======================================================= */

    call(names) {

      this.closeMore();

      for (
        const path of names
      ) {

        try {

          const fn =
            path
              .split(".")
              .reduce(
                (
                  object,
                  key
                ) =>
                  object &&
                  object[key],
                window
              );

          if (
            typeof fn ===
            "function"
          ) {

            fn();

            return true;
          }

        } catch (error) {

          console.warn(
            "HUD module:",
            path,
            error
          );
        }
      }

      return false;
    },

    openCareer() {

      if (
        !this.call([
          "EmpireCareerBusinessUI.open",
          "EmpireCareerUI.open",
          "EmpireCareerBusiness.open"
        ])
      ) {
        this.toast(
          "Career"
        );
      }
    },

    openBusiness() {

      if (
        !this.call([
          "EmpireBusinessOperationsUI.open",
          "EmpireBusinessUI.open",
          "EmpireBusinessOperations.open"
        ])
      ) {
        this.toast(
          "Business"
        );
      }
    },

    openFinance() {

      if (
        !this.call([
          "EmpireBanking.open",
          "EmpireBankingUI.open",
          "EmpireFinanceUI.open",
          "EmpireFinancingUI.open"
        ])
      ) {
        this.toast(
          "Finance"
        );
      }
    },

    openProducts() {

      if (
        !this.call([
          "EmpireProductUI.open",
          "EmpireProductManagementUI.open",
          "EmpireProductsUI.open"
        ])
      ) {
        this.toast(
          "Products"
        );
      }
    },

    openNews() {

      if (
        !this.call([
          "EmpireNewsDecisionUI.open",
          "EmpireNewsUI.open"
        ])
      ) {
        this.toast(
          "News"
        );
      }
    },

    openCorporate() {

      if (
        !this.call([
          "EmpireCompanyGroupUI.open",
          "EmpireCorporateUI.open",
          "EmpireGroupUI.open"
        ])
      ) {
        this.toast(
          "Corporate"
        );
      }
    },

    openGovernment() {

      if (
        !this.call([
          "EmpireGovernmentUI.open",
          "EmpireComplianceUI.open",
          "EmpireGovernmentComplianceUI.open"
        ])
      ) {
        this.toast(
          "Government"
        );
      }
    },

    openWorkforce() {

      if (
        !this.call([
          "EmpireHRUI.open",
          "EmpireHR.open",
          "EmpireHumanResourcesUI.open"
        ])
      ) {
        this.toast(
          "Workforce"
        );
      }
    },

    openEconomics() {

      if (
        !this.call([
          "EmpireCompetitionMarketUI.open",
          "EmpireMarketUI.open",
          "EmpireEconomicsUI.open"
        ])
      ) {
        this.toast(
          "Economics"
        );
      }
    },

    /* =======================================================
       SAVE
       ======================================================= */

    save() {

      this.closeMore();

      try {

        const game =
          this.game();

        if (
          game &&
          typeof game.save ===
          "function"
        ) {
          game.save();
        }

        this.toast(
          "Game saved"
        );

      } catch (error) {

        console.warn(
          "Save failed:",
          error
        );

        this.toast(
          "Save failed"
        );
      }
    },

    /* =======================================================
       TOAST
       ======================================================= */

    toast(message) {

      const layer =
        this.root.querySelector(
          ".er-toast-layer"
        );

      if (!layer) return;

      layer.innerHTML = `
        <div class="er-toast">
          ${this.esc(message)}
        </div>
      `;

      const toast =
        layer.querySelector(
          ".er-toast"
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
        },
        1500
      );
    },

    /* =======================================================
       REFRESH
       ======================================================= */

    refresh() {

      if (!this.root) {
        return;
      }

      this.renderHeader();
      this.renderStatus();

      /*
       * Legacy elements can be recreated by old
       * scripts after our HUD starts, so check again.
       */

      this.hideLegacy();
    },

    /* =======================================================
       START
       ======================================================= */

    start() {

      if (this.started) {
        return;
      }

      this.started = true;

      this.create();

      this.renderHeader();
      this.renderStatus();
      this.renderBottom();
      this.renderMore();

      this.hideLegacy();

      if (this.timer) {
        clearInterval(
          this.timer
        );
      }

      this.timer =
        setInterval(
          () => {
            this.refresh();
          },
          1000
        );

      console.log(
        "Empire Rush: Clean HUD started."
      );
    }
  };


  /* ===========================================================
     BOOT WITH RETRY
     =========================================================== */

  function boot() {

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

      return;
    }


    if (
      window.EmpireGameState
    ) {

      HUD.start();

      return;
    }


    /*
     * GameState may load after this file.
     * Retry instead of permanently stopping.
     */

    setTimeout(
      boot,
      250
    );
  }


  boot();


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
  ].forEach(
    eventName => {

      window.addEventListener(
        eventName,
        () => {

          if (
            HUD.started
          ) {
            HUD.refresh();
          }
        }
      );
    }
  );


  /* ===========================================================
     PUBLIC API
     =========================================================== */

  window.EmpireMainHUD =
    HUD;

})();
