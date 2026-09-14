(function () {
  "use strict";

  /*
   * =========================================================
   * EMPIRE RUSH — MOBILE HUD
   *
   * Current job:
   * ONLY remove the old oversized floating module buttons.
   *
   * 3D CAMERA / CITY / BUILDINGS ARE NOT TOUCHED.
   * =========================================================
   */

  const HUD = {

    root: null,

    observer: null,

    cleanupTimer: null,

    game: null,


    /* =======================================================
       GAME STATE
       ======================================================= */

    getGame() {

      return window.EmpireGameState || null;

    },


    getState() {

      const game = this.getGame();

      if (!game) {
        return null;
      }

      if (
        typeof game.getState === "function"
      ) {
        return game.getState();
      }

      return game.state || null;

    },


    getPlayer() {

      const state = this.getState();

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

      const state = this.getState();

      return (
        state &&
        state.world
      ) || {

        day: 1,

        month: 1,

        year: 1

      };

    },


    /* =======================================================
       MONEY FORMAT
       ======================================================= */

    money(value) {

      const amount =
        Number(value) || 0;


      if (
        Math.abs(amount) >= 10000000
      ) {

        return (
          "₹" +
          (
            amount / 10000000
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
            amount / 100000
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
            amount / 1000
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


    /* =======================================================
       CREATE HUD
       ======================================================= */

    createRoot() {

      const existing =
        document.getElementById(
          "empireCleanHUD"
        );


      if (existing) {

        existing.remove();

      }


      const root =
        document.createElement(
          "div"
        );


      root.id =
        "empireCleanHUD";


      root.innerHTML = `

        <div
          class="er-header"
          id="erHeader"
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
            type="button"
            class="er-menu-button"
            id="erMenuButton"
            aria-label="Open command menu"
          >

            <span></span>
            <span></span>
            <span></span>

          </button>

        </div>


        <div
          class="er-objective"
          id="erObjective"
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
          class="er-bottom-nav"
          id="erBottomNav"
        >

          <button
            type="button"
            class="er-nav active"
            data-action="home"
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
            type="button"
            class="er-nav"
            data-action="career"
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
            type="button"
            class="er-nav"
            data-action="business"
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
            type="button"
            class="er-nav"
            data-action="finance"
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
            type="button"
            class="er-nav"
            data-action="more"
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
          class="er-more-drawer"
          id="erMoreDrawer"
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
                type="button"
                class="er-module"
                data-module="products"
              >

                <span>📦</span>

                <b>
                  Products
                </b>

                <small>
                  Develop & manage
                </small>

              </button>


              <button
                type="button"
                class="er-module"
                data-module="news"
              >

                <span>📰</span>

                <b>
                  News
                </b>

                <small>
                  World events
                </small>

              </button>


              <button
                type="button"
                class="er-module"
                data-module="corporate"
              >

                <span>🏢</span>

                <b>
                  Corporate
                </b>

                <small>
                  Group control
                </small>

              </button>


              <button
                type="button"
                class="er-module"
                data-module="operations"
              >

                <span>⚙️</span>

                <b>
                  Operations
                </b>

                <small>
                  Run company
                </small>

              </button>


              <button
                type="button"
                class="er-module"
                data-module="workforce"
              >

                <span>👥</span>

                <b>
                  Workforce
                </b>

                <small>
                  Employees & HR
                </small>

              </button>


              <button
                type="button"
                class="er-module"
                data-module="government"
              >

                <span>🏛️</span>

                <b>
                  Government
                </b>

                <small>
                  Tax & compliance
                </small>

              </button>


              <button
                type="button"
                class="er-module"
                data-module="market"
              >

                <span>📈</span>

                <b>
                  Market
                </b>

                <small>
                  Competition
                </small>

              </button>


              <button
                type="button"
                class="er-module"
                data-module="economics"
              >

                <span>📊</span>

                <b>
                  Economics
                </b>

                <small>
                  Business numbers
                </small>

              </button>


              <button
                type="button"
                class="er-module"
                data-module="save"
              >

                <span>💾</span>

                <b>
                  Save Game
                </b>

                <small>
                  Save progress
                </small>

              </button>

            </div>


            <button
              type="button"
              class="er-close"
              id="erCloseMore"
            >
              CLOSE
            </button>

          </div>

        </div>


        <div
          class="er-toast"
          id="erToast"
        ></div>

      `;


      document.body.appendChild(
        root
      );


      this.root =
        root;

    },


    /* =======================================================
       STYLES
       ======================================================= */

    injectStyles() {

      const old =
        document.getElementById(
          "empireCleanHUDStyles"
        );


      if (old) {

        old.remove();

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


        /* =================================================
           HEADER
           ================================================= */

        .er-header {

          position: fixed;

          top: 8px;

          left: 10px;

          right: 10px;

          height: 78px;

          display: flex;

          align-items: center;

          gap: 7px;

          padding: 6px;

          border-radius: 23px;

          background:
            rgba(
              10,
              17,
              27,
              0.95
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.15
            );

          box-shadow:
            0 10px 30px
            rgba(
              0,
              0,
              0,
              0.30
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

          gap: 8px;

        }


        .er-logo {

          width: 45px;

          height: 45px;

          flex: 0 0 45px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 15px;

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
              0.17
            );

          color: #ffffff;

          font-size: 21px;

        }


        .er-brand-text {

          min-width: 0;

          line-height: 1;

        }


        .er-title {

          color: #91df45;

          font-size: 19px;

          font-weight: 900;

        }


        .er-founder {

          margin-top: 3px;

          color: #f4f7fb;

          font-size: 12px;

          font-weight: 800;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

        }


        .er-job {

          margin-top: 3px;

          color: #8da0b4;

          font-size: 8px;

          font-weight: 700;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

        }


        .er-stat {

          width: 72px;

          height: 58px;

          flex: 0 0 72px;

          display: flex;

          flex-direction: column;

          justify-content: center;

          padding: 7px 9px;

          border-radius: 15px;

          background:
            rgba(
              28,
              38,
              50,
              0.92
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.09
            );

        }


        .er-stat span {

          color: #718094;

          font-size: 7px;

          font-weight: 800;

          letter-spacing: 0.6px;

        }


        .er-stat strong {

          margin-top: 3px;

          color: #f4f7fb;

          font-size: 14px;

          font-weight: 900;

          white-space: nowrap;

        }


        .er-day {

          width: 58px;

          flex-basis: 58px;

        }


        .er-menu-button {

          width: 48px;

          height: 58px;

          flex: 0 0 48px;

          border: 0;

          border-radius: 15px;

          background:
            rgba(
              29,
              39,
              52,
              0.96
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

          width: 24px;

          height: 3px;

          border-radius: 3px;

          background: #f2f5f8;

        }


        /* =================================================
           OBJECTIVE
           ================================================= */

        .er-objective {

          position: fixed;

          top: 94px;

          left: 12px;

          right: 12px;

          min-height: 48px;

          display: flex;

          align-items: center;

          gap: 9px;

          padding:
            8px 12px;

          border-radius: 16px;

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
              0.09
            );

          color: white;

          pointer-events: none;

        }


        .er-objective-dot {

          width: 12px;

          height: 12px;

          flex: 0 0 12px;

          border-radius: 50%;

          background: #f3c83b;

          box-shadow:
            0 0 9px
            rgba(
              243,
              200,
              59,
              0.40
            );

        }


        .er-objective-main {

          font-size: 12px;

          font-weight: 900;

          white-space: nowrap;

        }


        .er-objective-separator {

          width: 2px;

          height: 22px;

          background:
            rgba(
              255,
              255,
              255,
              0.20
            );

        }


        .er-objective-sub {

          min-width: 0;

          color: #8595a8;

          font-size: 9px;

          font-weight: 700;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

        }


        .er-date {

          margin-left: auto;

          color: #8999aa;

          font-size: 8px;

          font-weight: 800;

          white-space: nowrap;

        }


        /* =================================================
           BOTTOM NAV
           ================================================= */

        .er-bottom-nav {

          position: fixed;

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

          display: grid;

          grid-template-columns:
            repeat(
              5,
              1fr
            );

          padding: 5px;

          border-radius: 23px;

          background:
            rgba(
              7,
              14,
              23,
              0.97
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
            0 -8px 28px
            rgba(
              0,
              0,
              0,
              0.27
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

          border-radius: 17px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 2px;

          cursor: pointer;

          font-size: 7px;

          font-weight: 900;

        }


        .er-nav-icon {

          font-size: 19px;

          line-height: 21px;

        }


        .er-nav.active {

          color: #ffffff;

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

          bottom: 3px;

          left: 30%;

          right: 30%;

          height: 3px;

          border-radius: 4px;

          background: #5eaeff;

        }


        /* =================================================
           MORE DRAWER
           ================================================= */

        .er-more-drawer {

          position: fixed;

          inset: 0;

          visibility: hidden;

          opacity: 0;

          pointer-events: none;

          transition:
            opacity .18s ease,
            visibility .18s ease;

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
              .48
            );

        }


        .er-drawer {

          position: absolute;

          left: 7px;

          right: 7px;

          bottom: 7px;

          padding: 12px;

          border-radius: 24px;

          background:
            rgba(
              11,
              19,
              29,
              .99
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
            0 15px 50px
            rgba(
              0,
              0,
              0,
              .45
            );

        }


        .er-drawer-handle {

          width: 42px;

          height: 4px;

          margin:
            0 auto 11px;

          border-radius: 5px;

          background:
            rgba(
              255,
              255,
              255,
              .22
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

          gap: 5px;

        }


        .er-module {

          min-height: 64px;

          padding: 7px 4px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              .08
            );

          border-radius: 15px;

          background:
            rgba(
              25,
              35,
              47,
              .96
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

          font-size: 19px;

          line-height: 21px;

        }


        .er-module b {

          font-size: 9px;

          font-weight: 900;

        }


        .er-module small {

          color: #78899b;

          font-size: 7px;

          font-weight: 700;

        }


        .er-close {

          width: 100%;

          height: 38px;

          margin-top: 8px;

          border: 0;

          border-radius: 13px;

          background:
            rgba(
              255,
              255,
              255,
              .08
            );

          color: #b5c0cc;

          font-size: 10px;

          font-weight: 900;

        }


        /* =================================================
           TOAST
           ================================================= */

        .er-toast {

          position: fixed;

          left: 50%;

          bottom: 88px;

          transform:
            translate(
              -50%,
              12px
            );

          opacity: 0;

          padding:
            8px 13px;

          border-radius: 11px;

          background:
            rgba(
              8,
              15,
              23,
              .96
            );

          color: white;

          font-size: 10px;

          font-weight: 800;

          pointer-events: none;

          transition:
            opacity .18s ease,
            transform .18s ease;

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


        /* =================================================
           SMALL SCREEN
           ================================================= */

        @media (
          max-width: 360px
        ){

          .er-stat {

            width: 65px;

            flex-basis: 65px;

          }


          .er-day {

            width: 52px;

            flex-basis: 52px;

          }


          .er-menu-button {

            width: 44px;

            flex-basis: 44px;

          }


          .er-objective-sub {

            display: none;

          }

        }

      `;


      document.head.appendChild(
        style
      );

    },


    /* =======================================================
       LEGACY BUTTON DETECTION
       ======================================================= */

    legacyLabels: [

      "PRODUCTS",

      "NEWS",

      "CORPORATE",

      "OPERATIONS",

      "WORKFORCE",

      "GOVERNMENT",

      "ECONOMICS",

      "BUSINESS"

    ],


    isLegacyLabel(
      text
    ) {

      const value =
        String(
          text || ""
        )
          .replace(
            /\s+/g,
            " "
          )
          .trim()
          .toUpperCase();


      if (!value) {
        return false;
      }


      return this.legacyLabels.some(
        label => {

          return (
            value === label ||
            value.includes(
              label
            )
          );

        }
      );

    },


    /* =======================================================
       FIND LEGACY UI
       ======================================================= */

    cleanLegacyUI() {

      /*
       * IMPORTANT:
       * We NEVER touch anything inside
       * the new HUD.
       */

      const hud =
        this.root;


      /*
       * First hide known legacy containers.
       */

      const selectors = [

        "#top",

        ".tip",

        "#legacyHUD",

        "#oldHUD",

        ".legacy-hud",

        ".legacyHUD",

        ".legacy-module-button",

        ".floating-module-button",

        ".module-launcher",

        ".quick-action-button",

        ".quick-actions",

        ".floating-actions",

        ".floating-buttons",

        ".action-buttons"

      ];


      selectors.forEach(
        selector => {

          document
            .querySelectorAll(
              selector
            )
            .forEach(
              element => {

                if (
                  hud &&
                  hud.contains(
                    element
                  )
                ) {

                  return;

                }


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
       * Then inspect every button.
       */

      document
        .querySelectorAll(
          "button"
        )
        .forEach(
          button => {

            if (
              hud &&
              hud.contains(
                button
              )
            ) {

              return;

            }


            if (
              this.isLegacyLabel(
                button.innerText ||
                button.textContent
              )
            ) {

              this.hideLegacyElement(
                button
              );

            }

          }
        );


      /*
       * Inspect clickable elements
       * that are NOT buttons.
       *
       * This is the important fix for
       * the current screenshot.
       */

      document
        .querySelectorAll(
          "[role='button'], [onclick]"
        )
        .forEach(
          element => {

            if (
              hud &&
              hud.contains(
                element
              )
            ) {

              return;

            }


            if (
              this.isLegacyLabel(
                element.innerText ||
                element.textContent
              )
            ) {

              this.hideLegacyElement(
                element
              );

            }

          }
        );


      /*
       * Inspect common div/span containers.
       * We only hide an element when its
       * visible text is EXACTLY one of the
       * old module names.
       */

      document
        .querySelectorAll(
          "div, span"
        )
        .forEach(
          element => {

            if (
              hud &&
              hud.contains(
                element
              )
            ) {

              return;

            }


            const text =
              (
                element.innerText ||
                ""
              )
                .replace(
                  /\s+/g,
                  " "
                )
                .trim()
                .toUpperCase();


            if (
              !this.legacyLabels.includes(
                text
              )
            ) {

              return;

            }


            /*
             * Prefer hiding the nearest
             * useful visual container.
             */

            this.hideLegacyElement(
              element
            );

          }
        );


      /*
       * Modern mode.
       */

      document.body
        .classList
        .add(
          "empire-modern-hud"
        );

    },


    /* =======================================================
       HIDE LEGACY ELEMENT
       ======================================================= */

    hideLegacyElement(
      element
    ) {

      if (
        !element ||
        element === this.root
      ) {

        return;

      }


      /*
       * Don't remove it from the DOM.
       * Other game systems may still have
       * event listeners attached.
       *
       * We simply make the legacy visual
       * unavailable.
       */

      element.style
        .setProperty(
          "display",
          "none",
          "important"
        );


      element.style
        .setProperty(
          "visibility",
          "hidden",
          "important"
        );


      element.style
        .setProperty(
          "pointer-events",
          "none",
          "important"
        );


      /*
       * If its immediate parent is a
       * dedicated floating action wrapper,
       * hide that wrapper too.
       */

      const parent =
        element.parentElement;


      if (
        parent &&
        parent !== document.body &&
        parent !== document.documentElement &&
        !(
          this.root &&
          this.root.contains(
            parent
          )
        )
      ) {

        const parentText =
          (
            parent.innerText ||
            ""
          )
            .replace(
              /\s+/g,
              " "
            )
            .trim()
            .toUpperCase();


        if (
          this.isLegacyLabel(
            parentText
          )
        ) {

          parent.style
            .setProperty(
              "display",
              "none",
              "important"
            );

        }

      }

    },
    /* =======================================================
       LEGACY OBSERVER
       ======================================================= */

    startLegacyObserver() {

      if (this.observer) {
        return;
      }


      /*
       * New/old systems kabhi bhi DOM mein
       * floating buttons inject kar sakte hain.
       *
       * Observer unhe turant clean karega.
       */

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
       * Safety cleanup.
       */

      this.cleanupTimer =
        setInterval(
          () => {

            this.cleanLegacyUI();

          },
          1000
        );

    },


    /* =======================================================
       RENDER
       ======================================================= */

    render() {

      if (!this.root) {
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


      if (founder) {

        founder.textContent =
          player.name ||
          "Founder";

      }


      if (job) {

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


      if (cash) {

        cash.textContent =
          this.money(
            player.cash
          );

      }


      if (day) {

        day.textContent =
          world.day ||
          1;

      }


      if (date) {

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


    /* =======================================================
       OBJECTIVE
       ======================================================= */

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


      const company =
        this.getFirstCompany();


      if (!company) {

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


    getFirstCompany() {

      const game =
        this.getGame();


      if (!game) {
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
          companies.length > 0
        ) {

          return companies[0];

        }

      }


      const state =
        this.getState();


      if (
        state &&
        Array.isArray(
          state.companies
        ) &&
        state.companies.length > 0
      ) {

        return state.companies[0];

      }


      return null;

    },


    /* =======================================================
       DRAWER
       ======================================================= */

    openMore() {

      if (!this.moreDrawer) {
        return;
      }


      this.moreDrawer
        .classList
        .add(
          "open"
        );

    },


    closeMore() {

      if (!this.moreDrawer) {
        return;
      }


      this.moreDrawer
        .classList
        .remove(
          "open"
        );

    },


    toggleMore() {

      if (!this.moreDrawer) {
        return;
      }


      this.moreDrawer
        .classList
        .toggle(
          "open"
        );

    },


    /* =======================================================
       TOAST
       ======================================================= */

    toast(
      message
    ) {

      const toast =
        document.getElementById(
          "erToast"
        );


      if (!toast) {
        return;
      }


      toast.textContent =
        message;


      toast.classList
        .add(
          "show"
        );


      clearTimeout(
        this.toastTimer
      );


      this.toastTimer =
        setTimeout(
          () => {

            toast.classList
              .remove(
                "show"
              );

          },
          1800
        );

    },


    /* =======================================================
       MODULE OPEN
       ======================================================= */

    invoke(
      module
    ) {

      const mapping = {

        products: [
          "EmpireProductUI",
          "EmpireProducts",
          "EmpireProductManagement"
        ],

        news: [
          "EmpireNewsDecisionUI",
          "EmpireNewsUI"
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
        mapping[module] || [];


      for (
        const name of candidates
      ) {

        const object =
          window[name];


        if (!object) {
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
            typeof object[method] !==
            "function"
          ) {

            continue;

          }


          try {

            object[method]();

            this.closeMore();

            return true;

          } catch (error) {

            console.warn(
              "Empire Rush module error:",
              name,
              method,
              error
            );

          }

        }

      }


      this.closeMore();


      this.toast(
        module.charAt(0)
          .toUpperCase() +
        module.slice(1) +
        " module"
      );


      return false;

    },


    /* =======================================================
       SAVE
       ======================================================= */

    saveGame() {

      const game =
        this.getGame();


      if (!game) {

        this.toast(
          "Game state unavailable"
        );

        return;

      }


      try {

        if (
          typeof game.save ===
          "function"
        ) {

          game.save();

          this.closeMore();

          this.toast(
            "Game saved"
          );

          return;

        }


        if (
          typeof game.saveGame ===
          "function"
        ) {

          game.saveGame();

          this.closeMore();

          this.toast(
            "Game saved"
          );

          return;

        }


        this.toast(
          "Save system unavailable"
        );

      } catch (error) {

        console.warn(
          "Empire Rush save error:",
          error
        );


        this.toast(
          "Unable to save"
        );

      }

    },


    /* =======================================================
       NAVIGATION
       ======================================================= */

    setActiveNav(
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

    },


    handleNavigation(
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

    },


    /* =======================================================
       HOME / WORLD
       ======================================================= */

    focusWorld() {

      const world =
        window.EmpireWorld;


      if (
        world &&
        typeof world.focusOn ===
        "function"
      ) {

        /*
         * IMPORTANT:
         * Camera position is NOT modified here.
         *
         * This only uses the existing
         * world focus API.
         */

        world.focusOn(
          0,
          18
        );

      }

    },


    /* =======================================================
       CAREER
       ======================================================= */

    openCareer() {

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


        if (!object) {
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
            typeof object[method] !==
            "function"
          ) {

            continue;

          }


          try {

            object[method]();

            return;

          } catch (error) {

            console.warn(
              "Career UI error:",
              error
            );

          }

        }

      }


      window.dispatchEvent(
        new CustomEvent(
          "EmpireOpenCareer"
        )
      );

    },


    /* =======================================================
       BUSINESS
       ======================================================= */

    openBusiness() {

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


        if (!object) {
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
            typeof object[method] !==
            "function"
          ) {

            continue;

          }


          try {

            object[method]();

            return;

          } catch (error) {

            console.warn(
              "Business UI error:",
              error
            );

          }

        }

      }


      window.dispatchEvent(
        new CustomEvent(
          "EmpireOpenBusiness"
        )
      );

    },


    /* =======================================================
       FINANCE
       ======================================================= */

    openFinance() {

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


        if (!object) {
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
            typeof object[method] !==
            "function"
          ) {

            continue;

          }


          try {

            object[method]();

            return;

          } catch (error) {

            console.warn(
              "Finance UI error:",
              error
            );

          }

        }

      }


      window.dispatchEvent(
        new CustomEvent(
          "EmpireOpenFinance"
        )
      );

    },


    /* =======================================================
       EVENTS
       ======================================================= */

    bindEvents() {

      if (!this.root) {
        return;
      }


      const menu =
        document.getElementById(
          "erMenuButton"
        );


      if (menu) {

        menu.addEventListener(
          "click",
          () => {

            this.toggleMore();

          }
        );

      }


      const close =
        document.getElementById(
          "erCloseMore"
        );


      if (close) {

        close.addEventListener(
          "click",
          () => {

            this.closeMore();

          }
        );

      }


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

    },


    /* =======================================================
       START
       ======================================================= */

    start() {

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
       * Legacy systems ko DOM render karne
       * ka thoda time dete hain, phir cleanup.
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
          once: true
        }
      );

      return;

    }


    HUD.start();

  }


  /*
   * World ready hone par HUD ensure karo.
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


  boot();


})();
