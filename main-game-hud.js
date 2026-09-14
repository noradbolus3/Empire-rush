(function () {
  "use strict";

  /*
   * =========================================================
   * EMPIRE RUSH
   * MOBILE COMMAND HUD
   *
   * This file owns the mobile HUD.
   *
   * Responsibilities:
   *  - Compact header
   *  - Career / Business / Finance / More navigation
   *  - Module drawer
   *  - Legacy floating-button cleanup
   *  - Mobile-first viewport protection
   *
   * It does NOT render the 3D world.
   * =========================================================
   */


  const HUD = {

    root: null,

    moreDrawer: null,

    toastTimer: null,

    observer: null,

    game: null,


    /*
     * -------------------------------------------------------
     * GAME ACCESS
     * -------------------------------------------------------
     */

    getGame() {

      return (
        window.EmpireGameState ||
        null
      );

    },


    getState() {

      const game =
        this.getGame();

      if (
        !game
      ) {
        return null;
      }

      if (
        typeof game.getState === "function"
      ) {
        return game.getState();
      }

      return (
        game.state ||
        null
      );

    },


    getPlayer() {

      const state =
        this.getState();

      return (
        state &&
        state.player
      ) || {
        name: "Founder",
        currentJob: "Unemployed",
        jobLevel: "Entry",
        cash: 0,
        savings: 0
      };

    },


    getWorld() {

      const state =
        this.getState();

      return (
        state &&
        state.world
      ) || {
        day: 1,
        month: 1,
        year: 1
      };

    },


    /*
     * -------------------------------------------------------
     * NUMBER FORMAT
     * -------------------------------------------------------
     */

    money(value) {

      const amount =
        Number(value) || 0;


      if (
        Math.abs(amount) >= 10000000
      ) {

        return (
          "₹" +
          (
            amount /
            10000000
          ).toFixed(2) +
          "Cr"
        );

      }


      if (
        Math.abs(amount) >= 100000
      ) {

        return (
          "₹" +
          (
            amount /
            100000
          ).toFixed(2) +
          "L"
        );

      }


      if (
        Math.abs(amount) >= 1000
      ) {

        return (
          "₹" +
          (
            amount /
            1000
          ).toFixed(1) +
          "K"
        );

      }


      return (
        "₹" +
        Math.round(
          amount
        ).toLocaleString(
          "en-IN"
        )
      );

    },


    /*
     * -------------------------------------------------------
     * ROOT
     * -------------------------------------------------------
     */

    createRoot() {

      const old =
        document.getElementById(
          "empireCleanHUD"
        );


      if (old) {

        old.remove();

      }


      const root =
        document.createElement(
          "div"
        );


      root.id =
        "empireCleanHUD";


      root.innerHTML = `

        <div
          id="erHeader"
          class="er-header"
        >

          <div
            class="er-brand"
          >

            <div
              class="er-logo"
            >
              ♛
            </div>

            <div
              class="er-brand-text"
            >

              <div
                class="er-title"
              >
                RUSH
              </div>

              <div
                class="er-founder"
                id="erFounder"
              >
                Founder
              </div>

              <div
                class="er-job"
                id="erJob"
              >
                Unemployed · Entry
              </div>

            </div>

          </div>


          <div
            class="er-stat"
          >

            <span>
              CASH
            </span>

            <strong
              id="erCash"
            >
              ₹0
            </strong>

          </div>


          <div
            class="er-stat er-day"
          >

            <span>
              DAY
            </span>

            <strong
              id="erDay"
            >
              1
            </strong>

          </div>


          <button
            class="er-menu-button"
            id="erMenuButton"
            type="button"
            aria-label="Open menu"
          >

            <span></span>
            <span></span>
            <span></span>

          </button>

        </div>


        <div
          id="erObjective"
          class="er-objective"
        >

          <div
            class="er-objective-dot"
          ></div>

          <div
            class="er-objective-main"
            id="erObjectiveMain"
          >
            Build your career
          </div>

          <div
            class="er-objective-separator"
          ></div>

          <div
            class="er-objective-sub"
            id="erObjectiveSub"
          >
            Start from zero
          </div>

          <div
            class="er-date"
            id="erDate"
          >
            Y1 · M1 · D1
          </div>

        </div>


        <div
          id="erBottomNav"
          class="er-bottom-nav"
        >

          <button
            class="er-nav active"
            data-action="home"
            type="button"
          >

            <span
              class="er-nav-icon"
            >
              ⌂
            </span>

            <span>
              HOME
            </span>

          </button>


          <button
            class="er-nav"
            data-action="career"
            type="button"
          >

            <span
              class="er-nav-icon"
            >
              💼
            </span>

            <span>
              CAREER
            </span>

          </button>


          <button
            class="er-nav"
            data-action="business"
            type="button"
          >

            <span
              class="er-nav-icon"
            >
              ▦
            </span>

            <span>
              BUSINESS
            </span>

          </button>


          <button
            class="er-nav"
            data-action="finance"
            type="button"
          >

            <span
              class="er-nav-icon"
            >
              ₹
            </span>

            <span>
              FINANCE
            </span>

          </button>


          <button
            class="er-nav"
            data-action="more"
            type="button"
          >

            <span
              class="er-nav-icon"
            >
              ☰
            </span>

            <span>
              MORE
            </span>

          </button>

        </div>


        <div
          id="erMoreDrawer"
          class="er-more-drawer"
        >

          <div
            class="er-drawer-backdrop"
            data-close-more="true"
          ></div>


          <div
            class="er-drawer"
          >

            <div
              class="er-drawer-handle"
            ></div>


            <div
              class="er-drawer-title"
            >
              COMMAND MENU
            </div>


            <div
              class="er-drawer-grid"
            >

              <button
                class="er-module"
                data-module="products"
                type="button"
              >

                <span>📦</span>
                <b>Products</b>
                <small>Develop & manage</small>

              </button>


              <button
                class="er-module"
                data-module="news"
                type="button"
              >

                <span>📰</span>
                <b>News</b>
                <small>World events</small>

              </button>


              <button
                class="er-module"
                data-module="corporate"
                type="button"
              >

                <span>🏢</span>
                <b>Corporate</b>
                <small>Group control</small>

              </button>


              <button
                class="er-module"
                data-module="operations"
                type="button"
              >

                <span>⚙️</span>
                <b>Operations</b>
                <small>Run your company</small>

              </button>


              <button
                class="er-module"
                data-module="workforce"
                type="button"
              >

                <span>👥</span>
                <b>Workforce</b>
                <small>Employees & HR</small>

              </button>


              <button
                class="er-module"
                data-module="government"
                type="button"
              >

                <span>🏛️</span>
                <b>Government</b>
                <small>Tax & compliance</small>

              </button>


              <button
                class="er-module"
                data-module="market"
                type="button"
              >

                <span>📈</span>
                <b>Market</b>
                <small>Competition</small>

              </button>


              <button
                class="er-module"
                data-module="economics"
                type="button"
              >

                <span>📊</span>
                <b>Economics</b>
                <small>Business numbers</small>

              </button>


              <button
                class="er-module"
                data-module="save"
                type="button"
              >

                <span>💾</span>
                <b>Save Game</b>
                <small>Save progress</small>

              </button>

            </div>


            <button
              class="er-close"
              id="erCloseMore"
              type="button"
            >
              CLOSE
            </button>

          </div>

        </div>


        <div
          id="erToast"
          class="er-toast"
        ></div>

      `;


      document.body.appendChild(
        root
      );


      this.root =
        root;


      this.moreDrawer =
        document.getElementById(
          "erMoreDrawer"
        );

    },


    /*
     * -------------------------------------------------------
     * STYLES
     * -------------------------------------------------------
     */

    injectStyles() {

      if (
        document.getElementById(
          "empireCleanHUDStyles"
        )
      ) {

        return;

      }


      const style =
        document.createElement(
          "style"
        );


      style.id =
        "empireCleanHUDStyles";


      style.textContent = `

        #empireCleanHUD {

          position: fixed;

          inset: 0;

          z-index: 9000;

          pointer-events: none;

          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

        }


        #empireCleanHUD * {

          box-sizing: border-box;

        }


        /* ================================================
           HEADER
           ================================================ */

        .er-header {

          position: fixed;

          top: 12px;

          left: 14px;

          right: 14px;

          height: 88px;

          display: flex;

          align-items: center;

          gap: 8px;

          padding: 8px;

          border-radius: 28px;

          background:
            rgba(
              10,
              17,
              27,
              0.94
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.16
            );

          box-shadow:
            0 12px 35px
            rgba(
              0,
              0,
              0,
              0.32
            );

          backdrop-filter:
            blur(18px);

          -webkit-backdrop-filter:
            blur(18px);

          pointer-events:
            auto;

        }


        .er-brand {

          min-width: 0;

          flex: 1;

          display: flex;

          align-items: center;

          gap: 9px;

        }


        .er-logo {

          width: 52px;

          height: 52px;

          flex: 0 0 52px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              #182434,
              #0d141e
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.18
            );

          font-size: 25px;

        }


        .er-brand-text {

          min-width: 0;

          line-height: 1;

        }


        .er-title {

          color: #91df45;

          font-size: 22px;

          font-weight: 900;

          letter-spacing: -0.5px;

        }


        .er-founder {

          margin-top: 3px;

          color: #f4f7fb;

          font-size: 14px;

          font-weight: 800;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

        }


        .er-job {

          margin-top: 4px;

          color: #8da0b4;

          font-size: 9px;

          font-weight: 700;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

        }


        .er-stat {

          width: 86px;

          height: 66px;

          flex: 0 0 86px;

          display: flex;

          flex-direction: column;

          justify-content: center;

          padding: 8px 10px;

          border-radius: 18px;

          background:
            rgba(
              28,
              38,
              50,
              0.9
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.10
            );

        }


        .er-stat span {

          color: #718094;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 0.7px;

        }


        .er-stat strong {

          margin-top: 4px;

          color: #f4f7fb;

          font-size: 16px;

          font-weight: 900;

          white-space: nowrap;

        }


        .er-day {

          width: 70px;

          flex-basis: 70px;

        }


        .er-menu-button {

          width: 56px;

          height: 66px;

          flex: 0 0 56px;

          border: 0;

          border-radius: 18px;

          background:
            rgba(
              29,
              39,
              52,
              0.95
            );

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 5px;

          cursor: pointer;

        }


        .er-menu-button span {

          display: block;

          width: 28px;

          height: 4px;

          border-radius: 3px;

          background: #f2f5f8;

        }


        /* ================================================
           OBJECTIVE BAR
           ================================================ */

        .er-objective {

          position: fixed;

          top: 110px;

          left: 18px;

          right: 18px;

          min-height: 56px;

          display: flex;

          align-items: center;

          gap: 10px;

          padding: 9px 13px;

          border-radius: 19px;

          background:
            rgba(
              25,
              36,
              48,
              0.90
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.10
            );

          color: white;

          pointer-events: none;

        }


        .er-objective-dot {

          width: 13px;

          height: 13px;

          flex: 0 0 13px;

          border-radius: 50%;

          background: #f3c83b;

          box-shadow:
            0 0 10px
            rgba(
              243,
              200,
              59,
              0.45
            );

        }


        .er-objective-main {

          font-size: 14px;

          font-weight: 900;

          white-space: nowrap;

        }


        .er-objective-separator {

          width: 2px;

          height: 24px;

          background:
            rgba(
              255,
              255,
              255,
              0.22
            );

        }


        .er-objective-sub {

          min-width: 0;

          color: #8595a8;

          font-size: 10px;

          font-weight: 700;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

        }


        .er-date {

          margin-left: auto;

          color: #8999aa;

          font-size: 9px;

          font-weight: 800;

          white-space: nowrap;

        }


        /* ================================================
           BOTTOM NAV
           ================================================ */

        .er-bottom-nav {

          position: fixed;

          left: 16px;

          right: 16px;

          bottom:
            max(
              10px,
              env(
                safe-area-inset-bottom
              )
            );

          height: 74px;

          display: grid;

          grid-template-columns:
            repeat(
              5,
              1fr
            );

          align-items: stretch;

          padding: 5px;

          border-radius: 27px;

          background:
            rgba(
              7,
              14,
              23,
              0.96
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.12
            );

          box-shadow:
            0 -8px 30px
            rgba(
              0,
              0,
              0,
              0.28
            );

          backdrop-filter:
            blur(18px);

          -webkit-backdrop-filter:
            blur(18px);

          pointer-events:
            auto;

        }


        .er-nav {

          position: relative;

          min-width: 0;

          border: 0;

          background: transparent;

          color: #8993a0;

          border-radius: 20px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 2px;

          cursor: pointer;

          font-size: 8px;

          font-weight: 900;

        }


        .er-nav-icon {

          font-size: 22px;

          line-height: 23px;

        }


        .er-nav.active {

          color: white;

          background:
            rgba(
              38,
              58,
              82,
              0.92
            );

        }


        .er-nav.active::after {

          content: "";

          position: absolute;

          bottom: 4px;

          left: 30%;

          right: 30%;

          height: 3px;

          border-radius: 5px;

          background: #5eaeff;

        }


        /* ================================================
           MORE DRAWER
           ================================================ */

        .er-more-drawer {

          position: fixed;

          inset: 0;

          visibility: hidden;

          opacity: 0;

          pointer-events: none;

          transition:
            opacity 0.18s ease,
            visibility 0.18s ease;

        }


        .er-more-drawer.open {

          visibility: visible;

          opacity: 1;

          pointer-events: auto;

        }


        .er-drawer-backdrop {

          position: absolute;

          inset: 0;

          background:
            rgba(
              0,
              0,
              0,
              0.46
            );

        }


        .er-drawer {

          position: absolute;

          left: 10px;

          right: 10px;

          bottom: 10px;

          padding: 12px;

          border-radius: 28px;

          background:
            rgba(
              11,
              19,
              29,
              0.98
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.14
            );

          box-shadow:
            0 15px 50px
            rgba(
              0,
              0,
              0,
              0.45
            );

        }


        .er-drawer-handle {

          width: 42px;

          height: 4px;

          margin:
            0 auto 12px;

          border-radius: 5px;

          background:
            rgba(
              255,
              255,
              255,
              0.22
            );

        }


        .er-drawer-title {

          padding:
            2px 5px 10px;

          color: #8291a3;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 1px;

        }


        .er-drawer-grid {

          display: grid;

          grid-template-columns:
            repeat(
              3,
              1fr
            );

          gap: 7px;

        }


        .er-module {

          min-height: 70px;

          padding: 8px 5px;

          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );

          border-radius: 16px;

          background:
            rgba(
              25,
              35,
              47,
              0.95
            );

          color: white;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 2px;

          cursor: pointer;

        }


        .er-module > span {

          font-size: 20px;

          line-height: 22px;

        }


        .er-module b {

          font-size: 10px;

          font-weight: 900;

        }


        .er-module small {

          color: #78899b;

          font-size: 7px;

          font-weight: 700;

        }


        .er-close {

          width: 100%;

          height: 40px;

          margin-top: 9px;

          border: 0;

          border-radius: 13px;

          background:
            rgba(
              255,
              255,
              255,
              0.08
            );

          color: #b5c0cc;

          font-size: 10px;

          font-weight: 900;

        }


        /* ================================================
           TOAST
           ================================================ */

        .er-toast {

          position: fixed;

          left: 50%;

          bottom: 100px;

          transform:
            translate(
              -50%,
              15px
            );

          opacity: 0;

          padding:
            9px 14px;

          border-radius: 12px;

          background:
            rgba(
              8,
              15,
              23,
              0.95
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.12
            );

          color: white;

          font-size: 11px;

          font-weight: 800;

          pointer-events: none;

          transition:
            opacity 0.18s ease,
            transform 0.18s ease;

          white-space: nowrap;

        }


        .er-toast.show {

          opacity: 1;

          transform:
            translate(
              -50%,
              0
            );

        }


        /* ================================================
           LEGACY FLOATING UI
           ================================================ */

        /*
         * Old systems created huge standalone buttons.
         * We hide them because modules now live inside MORE.
         */

        body.empire-modern-hud
        .legacy-module-button,
        body.empire-modern-hud
        .floating-module-button,
        body.empire-modern-hud
        .module-launcher,
        body.empire-modern-hud
        .quick-action-button {

          display: none !important;

        }


        @media (
          max-width: 430px
        ){

          .er-header {

            left: 10px;

            right: 10px;

            top: 8px;

            height: 78px;

            padding: 6px;

            border-radius: 23px;

          }


          .er-logo {

            width: 45px;

            height: 45px;

            flex-basis: 45px;

            border-radius: 15px;

            font-size: 21px;

          }


          .er-title {

            font-size: 19px;

          }


          .er-founder {

            font-size: 12px;

          }


          .er-job {

            font-size: 8px;

          }


          .er-stat {

            width: 72px;

            flex-basis: 72px;

            height: 58px;

            border-radius: 15px;

          }


          .er-stat strong {

            font-size: 14px;

          }


          .er-day {

            width: 58px;

            flex-basis: 58px;

          }


          .er-menu-button {

            width: 48px;

            flex-basis: 48px;

            height: 58px;

            border-radius: 15px;

          }


          .er-menu-button span {

            width: 24px;

            height: 3px;

          }


          .er-objective {

            top: 94px;

            left: 12px;

            right: 12px;

            min-height: 48px;

            border-radius: 16px;

          }


          .er-objective-main {

            font-size: 12px;

          }


          .er-objective-sub {

            display: none;

          }


          .er-date {

            font-size: 8px;

          }


          .er-bottom-nav {

            left: 10px;

            right: 10px;

            bottom:
              max(
                7px,
                env(
                  safe-area-inset-bottom
                )
              );

            height: 68px;

            border-radius: 23px;

          }


          .er-nav {

            border-radius: 17px;

            font-size: 7px;

          }


          .er-nav-icon {

            font-size: 19px;

          }


          .er-drawer {

            left: 7px;

            right: 7px;

            bottom: 7px;

            border-radius: 24px;

          }


          .er-drawer-grid {

            gap: 5px;

          }


          .er-module {

            min-height: 64px;

          }

        }


        @media (
          max-height: 650px
        ){

          .er-header {

            height: 68px;

          }


          .er-logo {

            width: 42px;

            height: 42px;

            flex-basis: 42px;

          }


          .er-stat {

            height: 52px;

          }


          .er-menu-button {

            height: 52px;

          }


          .er-objective {

            top: 82px;

            min-height: 43px;

          }


          .er-bottom-nav {

            height: 62px;

          }

        }

      `;


      document.head.appendChild(
        style
      );

    },


    /*
     * -------------------------------------------------------
     * LEGACY UI CLEANER
     * -------------------------------------------------------
     */

    cleanLegacyUI() {

      /*
       * Old world3d.html header
       */

      const oldSelectors = [

        "#top",

        ".tip",

        "#legacyHUD",

        "#oldHUD",

        ".old-hud",

        ".legacy-hud",

        ".legacy-module-button",

        ".floating-module-button",

        ".module-launcher",

        ".quick-action-button"

      ];


      oldSelectors.forEach(
        selector => {

          document
            .querySelectorAll(
              selector
            )
            .forEach(
              element => {

                element.style
                  .setProperty(
                    "display",
                    "none",
                    "important"
                  );

              }
            );

        }
      );


      /*
       * Activate modern HUD mode.
       */

      document.body
        .classList
        .add(
          "empire-modern-hud"
        );


      /*
       * Search visible buttons by
       * their displayed labels.
       */

      const blockedLabels = [

        "PRODUCTS",

        "NEWS",

        "CORPORATE",

        "OPERATIONS",

        "WORKFORCE",

        "GOVERNMENT",

        "ECONOMICS"

      ];


      document
        .querySelectorAll(
          "button"
        )
        .forEach(
          button => {

            if (
              this.root &&
              this.root.contains(
                button
              )
            ) {

              return;

            }


            const text =
              (
                button.innerText ||
                button.textContent ||
                ""
              )
                .trim()
                .toUpperCase();


            if (
              blockedLabels.includes(
                text
              )
            ) {

              button.style
                .setProperty(
                  "display",
                  "none",
                  "important"
                );

            }

          }
        );

    },


    /*
     * -------------------------------------------------------
     * CONTINUOUS LEGACY CLEANUP
     * -------------------------------------------------------
     */

    startLegacyObserver() {

      if (
        this.observer
      ) {

        return;

      }


      this.observer =
        new MutationObserver(
          () => {

            this.cleanLegacyUI();

          }
        );


      this.observer.observe(
        document.body,
        {
          childList: true,
          subtree: true
        }
      );


      /*
       * Also perform periodic cleanup.
       * This catches systems that change
       * their styles after rendering.
       */

      setInterval(
        () => {

          this.cleanLegacyUI();

        },
        1200
      );

    },


    /*
     * -------------------------------------------------------
     * STATE RENDER
     * -------------------------------------------------------
     */

    render() {

      if (
        !this.root
      ) {

        return;

      }


      const player =
        this.getPlayer();


      const world =
        this.getWorld();


      const founder =
        document.getElementById(
          "erFounder"
        );


      const job =
        document.getElementById(
          "erJob"
        );


      const cash =
        document.getElementById(
          "erCash"
        );


      const day =
        document.getElementById(
          "erDay"
        );


      const date =
        document.getElementById(
          "erDate"
        );


      if(founder){

        founder.textContent =
          player.name ||
          "Founder";

      }


      if(job){

        job.textContent =
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


      if(cash){

        cash.textContent =
          this.money(
            player.cash
          );

      }


      if(day){

        day.textContent =
          world.day ||
          1;

      }


      if(date){

        date.textContent =
          "Y" +
          (
            world.year ||
            1
          ) +
          " · M" +
          (
            world.month ||
            1
          ) +
          " · D" +
          (
            world.day ||
            1
          );

      }


      this.updateObjective();

    },


    /*
     * -------------------------------------------------------
     * OBJECTIVE
     * -------------------------------------------------------
     */

    updateObjective() {

      const player =
        this.getPlayer();


      const main =
        document.getElementById(
          "erObjectiveMain"
        );


      const sub =
        document.getElementById(
          "erObjectiveSub"
        );


      if (
        !main ||
        !sub
      ) {

        return;

      }


      if (
        !player.currentJob ||
        player.currentJob ===
        "Unemployed"
      ) {

        main.textContent =
          "Build your career";

        sub.textContent =
          "Start from zero";

        return;

      }


      if (
        !this.getGameCompany()
      ) {

        main.textContent =
          "Grow your capital";

        sub.textContent =
          "Save for your first business";

        return;

      }


      main.textContent =
        "Build your company";

      sub.textContent =
        "Grow operations";

    },


    getGameCompany() {

      const game =
        this.getGame();


      if (
        !game
      ) {

        return null;

      }


      if (
        typeof game.getCompanies ===
        "function"
      ) {

        const companies =
          game.getCompanies();


        if (
          Array.isArray(
            companies
          ) &&
          companies.length
        ) {

          return companies[0];

        }

      }


      return null;

    },


    /*
     * -------------------------------------------------------
     * DRAWER
     * -------------------------------------------------------
     */

    openMore() {

      if (
        !this.moreDrawer
      ) {

        return;

      }


      this.moreDrawer
        .classList
        .add(
          "open"
        );

    },


    closeMore() {

      if (
        !this.moreDrawer
      ) {

        return;

      }


      this.moreDrawer
        .classList
        .remove(
          "open"
        );

    },


    toggleMore() {

      if (
        !this.moreDrawer
      ) {

        return;

      }


      this.moreDrawer
        .classList
        .toggle(
          "open"
        );

    },


    /*
     * -------------------------------------------------------
     * TOAST
     * -------------------------------------------------------
     */

    toast(
      message
    ) {

      const element =
        document.getElementById(
          "erToast"
        );


      if (
        !element
      ) {

        return;

      }


      element.textContent =
        message;


      element.classList
        .add(
          "show"
        );


      clearTimeout(
        this.toastTimer
      );


      this.toastTimer =
        setTimeout(
          () => {

            element.classList
              .remove(
                "show"
              );

          },
          1800
        );

    },


    /*
     * -------------------------------------------------------
     * MODULE INVOCATION
     * -------------------------------------------------------
     */

    invoke(
      module
    ) {

      const mapping = {

        products: [
          "EmpireProducts",
          "EmpireProductUI",
          "EmpireProductManagement"
        ],

        news: [
          "EmpireNewsUI",
          "EmpireNewsDecisionUI"
        ],

        corporate: [
          "EmpireGroupUI",
          "EmpireCorporateGameplay"
        ],

        operations: [
          "EmpireBusinessOperationsUI",
          "EmpireOperationsUI"
        ],

        workforce: [
          "EmpireHR",
          "EmpireHRUI",
          "EmpireWorkforce"
        ],

        government: [
          "EmpireGovernmentComplianceUI",
          "EmpireGovernmentUI"
        ],

        market: [
          "EmpireCompetitionUI",
          "EmpireMarketUI"
        ],

        economics: [
          "EmpireAccountingUI",
          "EmpireEconomicsUI"
        ]

      };


      const candidates =
        mapping[module] ||
        [];


      for (
        const name of candidates
      ) {

        const object =
          window[name];


        if (
          !object
        ) {

          continue;

        }


        const methods = [

          "open",

          "show",

          "openPanel",

          "openDashboard",

          "openOverlay",

          "launch"

        ];


        for (
          const method of methods
        ) {

          if (
            typeof object[method] ===
            "function"
          ) {

            try {

              object[method]();

              this.closeMore();

              return true;

            } catch (
              error
            ) {

              console.warn(
                "Empire Rush HUD module error:",
                name,
                method,
                error
              );

            }

          }

        }

      }


      this.toast(
        module.charAt(0)
          .toUpperCase() +
        module.slice(1) +
        " module"
      );


      return false;

    }

  };
  /*
   * =========================================================
   * EVENT HANDLERS
   * =========================================================
   */

  HUD.bindEvents = function () {

    if (!this.root) {
      return;
    }


    /*
     * Header menu
     */

    const menuButton =
      document.getElementById(
        "erMenuButton"
      );


    if (menuButton) {

      menuButton.addEventListener(
        "click",
        () => {

          this.toggleMore();

        }
      );

    }


    /*
     * Close button
     */

    const closeButton =
      document.getElementById(
        "erCloseMore"
      );


    if (closeButton) {

      closeButton.addEventListener(
        "click",
        () => {

          this.closeMore();

        }
      );

    }


    /*
     * Backdrop
     */

    this.root
      .querySelectorAll(
        "[data-close-more='true']"
      )
      .forEach(
        element => {

          element.addEventListener(
            "click",
            () => {

              this.closeMore();

            }
          );

        }
      );


    /*
     * Bottom navigation
     */

    this.root
      .querySelectorAll(
        ".er-nav"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const action =
                button.dataset.action;


              this.setActiveNav(
                action
              );


              this.handleNavigation(
                action
              );

            }
          );

        }
      );


    /*
     * More drawer modules
     */

    this.root
      .querySelectorAll(
        ".er-module"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const module =
                button.dataset.module;


              if (
                module === "save"
              ) {

                this.saveGame();

                return;

              }


              this.invoke(
                module
              );

            }
          );

        }
      );


    /*
     * Escape closes drawer
     */

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape"
        ) {

          this.closeMore();

        }

      }
    );


    /*
     * Game-state changes
     */

    const stateEvents = [

      "EmpireGameStateChanged",

      "EmpireStateChanged",

      "EmpireMoneyChanged",

      "EmpireDayChanged",

      "EmpireJobChanged",

      "EmpireBusinessChanged",

      "EmpireCompanyChanged",

      "EmpireEmployeeUpdated"

    ];


    stateEvents.forEach(
      eventName => {

        window.addEventListener(
          eventName,
          () => {

            this.render();

          }
        );

      }
    );

  };


  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  HUD.setActiveNav = function (
    action
  ) {

    if (!this.root) {
      return;
    }


    this.root
      .querySelectorAll(
        ".er-nav"
      )
      .forEach(
        button => {

          button.classList.toggle(
            "active",
            button.dataset.action ===
            action
          );

        }
      );

  };


  HUD.handleNavigation = function (
    action
  ) {

    switch (
      action
    ) {

      case "home":

        this.closeMore();

        this.focusWorld();

        break;


      case "career":

        this.closeMore();

        this.openCareer();

        break;


      case "business":

        this.closeMore();

        this.openBusiness();

        break;


      case "finance":

        this.closeMore();

        this.openFinance();

        break;


      case "more":

        this.openMore();

        break;

    }

  };


  /*
   * =========================================================
   * WORLD
   * =========================================================
   */

  HUD.focusWorld = function () {

    const world =
      window.EmpireWorld;


    if (
      world &&
      typeof world.focusOn ===
      "function"
    ) {

      world.focusOn(
        0,
        18
      );

    }

  };


  /*
   * =========================================================
   * CAREER
   * =========================================================
   */

  HUD.openCareer = function () {

    const candidates = [

      "EmpireCareerBusinessUI",

      "EmpireCareerUI",

      "EmpireCareer"

    ];


    for (
      const name of candidates
    ) {

      const object =
        window[name];


      if (
        !object
      ) {

        continue;

      }


      const methods = [

        "open",

        "show",

        "openPanel",

        "openCareer",

        "openDashboard"

      ];


      for (
        const method of methods
      ) {

        if (
          typeof object[method] ===
          "function"
        ) {

          try {

            object[method]();

            return;

          } catch (
            error
          ) {

            console.warn(
              "Career UI error:",
              error
            );

          }

        }

      }

    }


    /*
     * Fallback event.
     */

    window.dispatchEvent(
      new CustomEvent(
        "EmpireOpenCareer"
      )
    );

  };


  /*
   * =========================================================
   * BUSINESS
   * =========================================================
   */

  HUD.openBusiness = function () {

    const candidates = [

      "EmpireCareerBusinessUI",

      "EmpireBusinessSetupUI",

      "EmpireBusinessOperationsUI",

      "EmpireBusinessLauncher"

    ];


    for (
      const name of candidates
    ) {

      const object =
        window[name];


      if (
        !object
      ) {

        continue;

      }


      const methods = [

        "open",

        "show",

        "openPanel",

        "openBusiness",

        "openDashboard",

        "launch"

      ];


      for (
        const method of methods
      ) {

        if (
          typeof object[method] ===
          "function"
        ) {

          try {

            object[method]();

            return;

          } catch (
            error
          ) {

            console.warn(
              "Business UI error:",
              error
            );

          }

        }

      }

    }


    window.dispatchEvent(
      new CustomEvent(
        "EmpireOpenBusiness"
      )
    );

  };


  /*
   * =========================================================
   * FINANCE
   * =========================================================
   */

  HUD.openFinance = function () {

    const candidates = [

      "EmpireBankingUI",

      "EmpireFinanceUI",

      "EmpireAccountingUI",

      "EmpireBankingInvestment"

    ];


    for (
      const name of candidates
    ) {

      const object =
        window[name];


      if (
        !object
      ) {

        continue;

      }


      const methods = [

        "open",

        "show",

        "openPanel",

        "openDashboard",

        "openFinance"

      ];


      for (
        const method of methods
      ) {

        if (
          typeof object[method] ===
          "function"
        ) {

          try {

            object[method]();

            return;

          } catch (
            error
          ) {

            console.warn(
              "Finance UI error:",
              error
            );

          }

        }

      }

    }


    window.dispatchEvent(
      new CustomEvent(
        "EmpireOpenFinance"
      )
    );

  };


  /*
   * =========================================================
   * SAVE GAME
   * =========================================================
   */

  HUD.saveGame = function () {

    const game =
      this.getGame();


    if (
      game &&
      typeof game.save ===
      "function"
    ) {

      try {

        game.save();

        this.closeMore();

        this.toast(
          "Game saved"
        );

        return;

      } catch (
        error
      ) {

        console.warn(
          "Save error:",
          error
        );

      }

    }


    /*
     * Compatibility with systems
     * that expose saveGame().
     */

    if (
      game &&
      typeof game.saveGame ===
      "function"
    ) {

      try {

        game.saveGame();

        this.closeMore();

        this.toast(
          "Game saved"
        );

        return;

      } catch (
        error
      ) {

        console.warn(
          "SaveGame error:",
          error
        );

      }

    }


    this.toast(
      "Save system unavailable"
    );

  };


  /*
   * =========================================================
   * BOOT
   * =========================================================
   */

  HUD.start = function () {

    /*
     * Prevent duplicate HUD.
     */

    if (
      document.getElementById(
        "empireCleanHUD"
      )
    ) {

      return;

    }


    this.game =
      this.getGame();


    this.createRoot();

    this.injectStyles();

    this.bindEvents();

    this.render();

    this.cleanLegacyUI();

    this.startLegacyObserver();


    /*
     * Run cleanup several times during
     * initial boot because legacy game
     * systems may render after this HUD.
     */

    setTimeout(
      () => {

        this.cleanLegacyUI();

        this.render();

      },
      100
    );


    setTimeout(
      () => {

        this.cleanLegacyUI();

        this.render();

      },
      500
    );


    setTimeout(
      () => {

        this.cleanLegacyUI();

        this.render();

      },
      1500
    );

  };


  /*
   * =========================================================
   * SAFE BOOT
   *
   * empire-game-state.js may load before
   * or after this script depending on the
   * page/system sequence.
   * =========================================================
   */

  function boot() {

    if (
      document.readyState ===
      "loading"
    ) {

      document.addEventListener(
        "DOMContentLoaded",
        () => {

          HUD.start();

        },
        {
          once:true
        }
      );

      return;

    }


    HUD.start();

  }


  /*
   * If another system replaces the DOM,
   * make sure the HUD comes back.
   */

  window.addEventListener(
    "EmpireWorldReady",
    () => {

      if (
        !document.getElementById(
          "empireCleanHUD"
        )
      ) {

        HUD.start();

      }


      HUD.cleanLegacyUI();

      HUD.render();

    }
  );


  /*
   * Public API
   */

  window.EmpireMainHUD =
    HUD;


  boot();


})();
