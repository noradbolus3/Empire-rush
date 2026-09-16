(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH
   * BUSINESS SETUP & LAUNCH SYSTEM
   * ============================================================
   *
   * Business idea
   *      ↓
   * Capital
   *      ↓
   * Location
   *      ↓
   * Registration
   *      ↓
   * Tax / Compliance
   *      ↓
   * Bank Account
   *      ↓
   * License
   *      ↓
   * Equipment
   *      ↓
   * Inventory / Setup
   *      ↓
   * Launch
   *      ↓
   * OPERATING COMPANY
   *
   * ============================================================
   */

  function waitForState(callback) {

    if (window.EmpireGameState) {
      callback(window.EmpireGameState);
      return;
    }

    setTimeout(function () {
      waitForState(callback);
    }, 100);

  }


  waitForState(function (Game) {

    let panel = null;


    /* ============================================================
       SETUP TASK DATABASE
       ============================================================ */

    const SETUP_TASKS = [

      {
        id: "location",

        title: "Choose Business Location",

        description:
          "Select a suitable location for your business.",

        cost: 5000,

        icon: "📍"
      },

      {
        id: "registration",

        title: "Business Registration",

        description:
          "Register the business legally.",

        cost: 5000,

        icon: "📄"
      },

      {
        id: "tax",

        title: "Tax Registration",

        description:
          "Set up tax registration and basic tax compliance.",

        cost: 3000,

        icon: "🧾"
      },

      {
        id: "bank",

        title: "Business Bank Account",

        description:
          "Open a dedicated bank account for the company.",

        cost: 2000,

        icon: "🏦"
      },

      {
        id: "license",

        title: "Business License",

        description:
          "Obtain the required operating license.",

        cost: 4000,

        icon: "📜"
      },

      {
        id: "equipment",

        title: "Equipment & Infrastructure",

        description:
          "Purchase the basic equipment required to operate.",

        cost: 10000,

        icon: "⚙️"
      },

      {
        id: "inventory",

        title: "Initial Inventory",

        description:
          "Purchase initial stock, materials or operating supplies.",

        cost: 10000,

        icon: "📦"
      },

      {
        id: "staff",

        title: "Initial Staffing",

        description:
          "Prepare the initial workforce required for launch.",

        cost: 5000,

        icon: "👥"
      }

    ];


    /* ============================================================
       UTILITIES
       ============================================================ */

    function state() {

      return Game.getState
        ? Game.getState()
        : Game.state;

    }


    function save() {

      if (Game.save) {
        Game.save();
      }

    }


    function money(value) {

      return "₹" +
        Math.round(
          Number(value) || 0
        ).toLocaleString("en-IN");

    }


    function notify() {

      window.dispatchEvent(
        new CustomEvent(
          "EmpireGameStateChanged"
        )
      );

    }


    function companies() {

      const s = state();

      if (!s.companies) {
        s.companies = [];
      }

      return s.companies;

    }


    /* ============================================================
       INITIALIZE COMPANY SETUP
       ============================================================ */

    function initializeSetup(company) {

      if (!company) {
        return;
      }


      if (!company.setup) {

        company.setup = {

          started: true,

          location: null,

          registration: false,

          tax: false,

          bank: false,

          license: false,

          equipment: false,

          inventory: false,

          staff: false,

          launched: false

        };

      }


      /*
       * Existing company that was created by the
       * previous business system.
       */

      if (
        company.status === "Operating" &&
        !company.setup.launched
      ) {

        company.status =
          "Setup Required";

      }


      save();

    }


    /* ============================================================
       CALCULATE SETUP
       ============================================================ */

    function setupProgress(company) {

      initializeSetup(company);


      const setup =
        company.setup;


      const keys = [

        "location",
        "registration",
        "tax",
        "bank",
        "license",
        "equipment",
        "inventory",
        "staff"

      ];


      let completed = 0;


      keys.forEach(
        function (key) {

          if (setup[key]) {
            completed++;
          }

        }
      );


      return {

        completed,

        total: keys.length,

        percentage:
          Math.round(
            completed /
            keys.length *
            100
          )

      };

    }


    /* ============================================================
       LOCATION OPTIONS
       ============================================================ */

    const LOCATIONS = [

      {
        id: "residential",

        name: "Home / Residential",

        cost: 0,

        suitability: [
          "Freelance Services",
          "Home Food Business"
        ],

        description:
          "Low-cost location. Suitable for home-based businesses."
      },

      {
        id: "local_market",

        name: "Local Market",

        cost: 10000,

        suitability: [
          "Retail",
          "Food",
          "Services"
        ],

        description:
          "Good customer visibility with moderate rent."
      },

      {
        id: "commercial",

        name: "Commercial Area",

        cost: 25000,

        suitability: [
          "Retail",
          "Restaurant",
          "Services"
        ],

        description:
          "Higher customer traffic but significantly higher cost."
      },

      {
        id: "business_district",

        name: "Business District",

        cost: 50000,

        suitability: [
          "Technology",
          "Finance",
          "Corporate Services"
        ],

        description:
          "Premium location suitable for professional companies."
      },

      {
        id: "industrial",

        name: "Industrial Area",

        cost: 75000,

        suitability: [
          "Manufacturing"
        ],

        description:
          "Suitable for manufacturing and industrial operations."
      }

    ];


    /* ============================================================
       CHOOSE LOCATION
       ============================================================ */

    function chooseLocation(
      company,
      location
    ) {

      const s = state();


      initializeSetup(
        company
      );


      if (
        Number(s.cash || 0) <
        location.cost
      ) {

        alert(
          "Not enough cash.\n\n" +
          "Required: " +
          money(location.cost) +
          "\nAvailable: " +
          money(s.cash)
        );

        return;

      }


      if (location.cost > 0) {

        s.cash -=
          location.cost;

      }


      company.setup.location =
        location.name;


      company.location =
        location.name;


      save();
      notify();
      render();

    }


    /* ============================================================
       COMPLETE SETUP TASK
       ============================================================ */

    function completeTask(
      company,
      task
    ) {

      const s = state();


      initializeSetup(
        company
      );


      const setup =
        company.setup;


      /*
       * Location has its own system.
       */

      if (
        task.id === "location"
      ) {

        openLocationSelector(
          company
        );

        return;

      }


      if (
        setup[task.id]
      ) {

        return;

      }


      /*
       * Initial setup cost.
       */

      if (
        Number(s.cash || 0) <
        task.cost
      ) {

        alert(

          task.title +
          "\n\n" +

          "Required: " +
          money(task.cost) +

          "\nAvailable: " +
          money(s.cash)

        );

        return;

      }


      const confirmed =
        confirm(

          task.title +
          "\n\n" +

          task.description +

          "\n\nCost: " +
          money(task.cost) +

          "\n\nComplete this step?"

        );


      if (!confirmed) {
        return;
      }


      s.cash -=
        task.cost;


      setup[task.id] =
        true;


      save();
      notify();
      render();

    }


    /* ============================================================
       LOCATION SELECTOR
       ============================================================ */

    function openLocationSelector(
      company
    ) {

      const s = state();


      let html = `

        <div class="bs-location-overlay">

          <div class="bs-location-window">

            <button
              class="bs-location-close"
              id="locationClose">
              ×
            </button>

            <h2>
              📍 Choose Business Location
            </h2>

            <p class="bs-muted">
              Location affects cost, customers,
              suitability and future expansion.
            </p>

            <div class="bs-location-grid">

      `;


      LOCATIONS.forEach(
        function (location) {

          html += `

            <div class="bs-location-card">

              <h3>
                ${location.name}
              </h3>

              <div class="bs-muted">
                ${location.description}
              </div>

              <div class="bs-location-cost">
                ${
                  location.cost === 0
                    ? "FREE"
                    : money(location.cost)
                }
              </div>

              <div class="bs-muted">

                Suitable for:

                <br>

                ${location.suitability.join(", ")}

              </div>

              <button
                class="bs-action"
                data-location="${location.id}">

                SELECT

              </button>

            </div>

          `;

        }
      );


      html += `

            </div>

          </div>

        </div>

      `;


      const wrapper =
        document.createElement(
          "div"
        );


      wrapper.id =
        "locationSelector";


      wrapper.innerHTML =
        html;


      document.body.appendChild(
        wrapper
      );


      document
        .getElementById(
          "locationClose"
        )
        .onclick =
        function () {

          wrapper.remove();

        };


      wrapper
        .querySelectorAll(
          "[data-location]"
        )
        .forEach(
          function (button) {

            button.onclick =
              function () {

                const location =
                  LOCATIONS.find(
                    l =>
                      l.id ===
                      button.dataset.location
                  );


                if (!location) {
                  return;
                }


                chooseLocation(
                  company,
                  location
                );


                wrapper.remove();

              };

          }
        );

    }


    /* ============================================================
       LAUNCH BUSINESS
       ============================================================ */

    function launchBusiness(
      company
    ) {

      const s = state();


      initializeSetup(
        company
      );


      const progress =
        setupProgress(
          company
        );


      if (
        progress.completed <
        progress.total
      ) {

        alert(

          "Business is not ready to launch.\n\n" +

          "Setup completed: " +
          progress.completed +
          "/" +
          progress.total +

          "\n\n" +

          "Complete all setup requirements first."

        );

        return;

      }


      if (
        !company.setup.location
      ) {

        alert(
          "Choose a business location first."
        );

        return;

      }


      const confirmed =
        confirm(

          "🚀 LAUNCH BUSINESS\n\n" +

          company.name +

          "\n\n" +

          "All setup requirements are complete." +

          "\n\nLaunch company?"

        );


      if (!confirmed) {
        return;
      }


      company.setup.launched =
        true;


      company.status =
        "Operating";


      company.launchDay =
        s.world
          ? s.world.day
          : 1;


      /*
       * Revenue becomes active after launch.
       */

      company.operating =
        true;


      /*
       * Business launch event.
       */

      window.dispatchEvent(

        new CustomEvent(
          "EmpireBusinessLaunched",
          {
            detail: company
          }
        )

      );


      save();
      notify();
      render();


      alert(

        "🚀 BUSINESS LAUNCHED!\n\n" +

        company.name +

        "\n\n" +

        "Your company is now officially operating."

      );

    }


    /* ============================================================
       RENDER
       ============================================================ */

    function render() {

      if (!panel) {
        return;
      }


      const s = state();


      const list =
        companies();


      let html = `

        <div class="bs-backdrop"></div>

        <div class="bs-window">

          <button
            class="bs-close"
            id="businessSetupClose">
            ×
          </button>


          <h1>
            🏗️ Business Setup
          </h1>

          <div class="bs-subtitle">

            Turn your business idea into
            a legally operating company.

          </div>


          <div class="bs-topstats">

            <div>
              <small>
                Cash
              </small>

              <strong>
                ${money(s.cash)}
              </strong>
            </div>

            <div>
              <small>
                Savings
              </small>

              <strong>
                ${money(s.savings)}
              </strong>
            </div>

            <div>
              <small>
                Companies
              </small>

              <strong>
                ${list.length}
              </strong>
            </div>

            <div>
              <small>
                Day
              </small>

              <strong>
                ${
                  s.world
                    ? s.world.day
                    : 1
                }
              </strong>
            </div>

          </div>

      `;


      if (!list.length) {

        html += `

          <div class="bs-empty">

            <div>
              🏢
            </div>

            <h2>
              No Business Yet
            </h2>

            <p>
              Start a business from the
              Career screen first.
            </p>

          </div>

        `;

      }


      list.forEach(
        function (company) {

          initializeSetup(
            company
          );


          const progress =
            setupProgress(
              company
            );


          html += `

            <div class="bs-company">

              <div class="bs-company-header">

                <div>

                  <h2>
                    ${company.name}
                  </h2>

                  <div class="bs-muted">

                    ${
                      company.category ||
                      "Business"
                    }

                  </div>

                </div>


                <div class="bs-status">

                  ${
                    company.status ||
                    "Setup Required"
                  }

                </div>

              </div>


              <div class="bs-progress-row">

                <span>
                  Setup Progress
                </span>

                <strong>
                  ${progress.percentage}%
                </strong>

              </div>


              <div class="bs-progress">

                <div
                  class="bs-progress-fill"
                  style="
                    width:${progress.percentage}%;
                  ">
                </div>

              </div>


              <div class="bs-tasks">

          `;


          SETUP_TASKS.forEach(
            function (task) {

              const done =
                company.setup[
                  task.id
                ];


              let disabled = false;


              /*
               * Staff step can be
               * completed without
               * hiring in this first version.
               */

              html += `

                <div
                  class="
                    bs-task
                    ${
                      done
                        ? "done"
                        : ""
                    }
                  ">

                  <div class="bs-task-icon">

                    ${
                      done
                        ? "✅"
                        : task.icon
                    }

                  </div>


                  <div class="bs-task-info">

                    <strong>
                      ${task.title}
                    </strong>

                    <div class="bs-muted">

                      ${
                        done
                          ? "Completed"
                          : task.description
                      }

                    </div>

                  </div>


                  <div class="bs-task-action">

                    ${
                      done

                        ? `<span class="bs-complete">
                             DONE
                           </span>`

                        : `
                          <button
                            class="bs-action"
                            data-task="${company.id}"
                            data-task-id="${task.id}"
                            ${
                              disabled
                                ? "disabled"
                                : ""
                            }>

                            ${
                              task.id ===
                              "location"
                                ? "CHOOSE"
                                : "COMPLETE"
                            }

                            ${
                              task.id !==
                              "location"
                                ? "<br>" +
                                  money(task.cost)
                                : ""
                            }

                          </button>
                        `
                    }

                  </div>

                </div>

              `;

            }
          );


          html += `

              </div>


              <div class="bs-company-footer">

                <div>

                  <span class="bs-muted">
                    Location:
                  </span>

                  <strong>

                    ${
                      company.setup.location ||
                      "Not selected"
                    }

                  </strong>

                </div>


                <button
                  class="bs-launch"
                  data-launch="${company.id}"
                  ${
                    progress.completed <
                    progress.total
                      ? "disabled"
                      : ""
                  }>

                  🚀 LAUNCH BUSINESS

                </button>

              </div>

            </div>

          `;

        }
      );


      html += `

        </div>

      `;


      panel.innerHTML =
        html;


      /* ==========================================================
         CLOSE
         ========================================================== */

      document
        .getElementById(
          "businessSetupClose"
        )
        .onclick =
        close;


      /* ==========================================================
         TASK BUTTONS
         ========================================================== */

      panel
        .querySelectorAll(
          "[data-task]"
        )
        .forEach(
          function (button) {

            button.onclick =
              function () {

                const company =
                  list.find(
                    c =>
                      c.id ===
                      button.dataset.task
                  );


                const task =
                  SETUP_TASKS.find(
                    t =>
                      t.id ===
                      button.dataset.taskId
                  );


                if (
                  company &&
                  task
                ) {

                  completeTask(
                    company,
                    task
                  );

                }

              };

          }
        );


      /* ==========================================================
         LAUNCH BUTTONS
         ========================================================== */

      panel
        .querySelectorAll(
          "[data-launch]"
        )
        .forEach(
          function (button) {

            button.onclick =
              function () {

                const company =
                  list.find(
                    c =>
                      c.id ===
                      button.dataset.launch
                  );


                if (company) {

                  launchBusiness(
                    company
                  );

                }

              };

          }
        );

    }


    /* ============================================================
       OPEN / CLOSE
       ============================================================ */

    function open() {

      create();

      panel.style.display =
        "block";

      render();

    }


    function close() {

      if (panel) {

        panel.style.display =
          "none";

      }

    }


    /* ============================================================
       CREATE UI
       ============================================================ */

    function create() {

      if (
        document.getElementById(
          "businessSetupUI"
        )
      ) {

        panel =
          document.getElementById(
            "businessSetupUI"
          );

        return;

      }


      const style =
        document.createElement(
          "style"
        );


      style.textContent = `

        #businessSetupUI {

          position:fixed;
          inset:0;
          z-index:99997;

          display:none;

          color:#fff;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

        }


        #businessSetupUI
        .bs-backdrop {

          position:absolute;
          inset:0;

          background:
            rgba(0,0,0,.8);

          backdrop-filter:
            blur(8px);

        }


        #businessSetupUI
        .bs-window {

          position:absolute;

          left:50%;
          top:50%;

          transform:
            translate(-50%,-50%);

          width:
            min(950px,94vw);

          max-height:
            90vh;

          overflow-y:auto;

          background:
            linear-gradient(
              145deg,
              #0d1520,
              #1b2a3b
            );

          border:
            1px solid
            rgba(255,255,255,.14);

          border-radius:22px;

          padding:24px;

          box-shadow:
            0 30px 100px
            rgba(0,0,0,.7);

        }


        #businessSetupUI
        .bs-close {

          position:absolute;

          right:18px;
          top:15px;

          width:40px;
          height:40px;

          border:0;

          border-radius:50%;

          background:#293746;

          color:#fff;

          font-size:22px;

          cursor:pointer;

        }


        #businessSetupUI h1 {

          margin:
            0 0 5px;

          font-size:28px;

        }


        .bs-subtitle {

          color:#96a7ba;

          margin-bottom:20px;

        }


        .bs-topstats {

          display:grid;

          grid-template-columns:
            repeat(4,1fr);

          gap:10px;

          margin-bottom:20px;

        }


        .bs-topstats > div {

          background:
            rgba(255,255,255,.07);

          border-radius:12px;

          padding:13px;

        }


        .bs-topstats small {

          display:block;

          color:#91a3b7;

          margin-bottom:5px;

        }


        .bs-topstats strong {

          font-size:17px;

        }


        .bs-company {

          background:
            rgba(255,255,255,.055);

          border:
            1px solid
            rgba(255,255,255,.08);

          border-radius:17px;

          padding:18px;

          margin-bottom:18px;

        }


        .bs-company-header {

          display:flex;

          justify-content:
            space-between;

          align-items:center;

        }


        .bs-company-header h2 {

          margin:
            0 0 4px;

        }


        .bs-status {

          padding:
            7px 11px;

          background:#705d28;

          border-radius:9px;

          font-size:12px;

          font-weight:bold;

        }


        .bs-progress-row {

          display:flex;

          justify-content:
            space-between;

          margin-top:18px;

          margin-bottom:6px;

        }


        .bs-progress {

          height:9px;

          background:#293746;

          border-radius:10px;

          overflow:hidden;

          margin-bottom:15px;

        }


        .bs-progress-fill {

          height:100%;

          background:#4d8cff;

          transition:
            width .25s ease;

        }


        .bs-tasks {

          display:flex;

          flex-direction:column;

          gap:8px;

        }


        .bs-task {

          display:grid;

          grid-template-columns:
            42px 1fr auto;

          align-items:center;

          gap:12px;

          background:
            rgba(255,255,255,.045);

          border-radius:11px;

          padding:11px;

        }


        .bs-task.done {

          opacity:.7;

        }


        .bs-task-icon {

          font-size:23px;

          text-align:center;

        }


        .bs-task-info strong {

          display:block;

          margin-bottom:4px;

        }


        .bs-muted {

          color:#94a5b8;

          font-size:13px;

          line-height:1.45;

        }


        .bs-action {

          border:0;

          border-radius:9px;

          background:#3478f6;

          color:#fff;

          padding:
            8px 12px;

          font-weight:bold;

          cursor:pointer;

        }


        .bs-action:hover {

          filter:
            brightness(1.12);

        }


        .bs-action:disabled {

          opacity:.35;

          cursor:not-allowed;

        }


        .bs-complete {

          color:#58c78b;

          font-size:12px;

          font-weight:bold;

        }


        .bs-company-footer {

          display:flex;

          justify-content:
            space-between;

          align-items:center;

          gap:10px;

          margin-top:18px;

          padding-top:15px;

          border-top:
            1px solid
            rgba(255,255,255,.08);

        }


        .bs-launch {

          border:0;

          border-radius:10px;

          padding:
            11px 17px;

          background:#247a50;

          color:#fff;

          font-weight:bold;

          cursor:pointer;

        }


        .bs-launch:disabled {

          opacity:.3;

          cursor:not-allowed;

        }


        .bs-empty {

          text-align:center;

          padding:70px 20px;

          color:#94a5b8;

        }


        .bs-empty div {

          font-size:55px;

        }


        /* LOCATION */

        #locationSelector {

          position:fixed;

          inset:0;

          z-index:100001;

        }


        .bs-location-overlay {

          position:absolute;

          inset:0;

          background:
            rgba(0,0,0,.78);

          display:flex;

          align-items:center;

          justify-content:center;

          padding:20px;

        }


        .bs-location-window {

          position:relative;

          width:
            min(850px,94vw);

          max-height:
            88vh;

          overflow-y:auto;

          background:
            #142131;

          border-radius:20px;

          padding:22px;

          box-shadow:
            0 30px 100px
            rgba(0,0,0,.7);

        }


        .bs-location-close {

          position:absolute;

          right:15px;
          top:12px;

          width:38px;
          height:38px;

          border:0;

          border-radius:50%;

          background:#293746;

          color:#fff;

          font-size:20px;

        }


        .bs-location-grid {

          display:grid;

          grid-template-columns:
            repeat(2,1fr);

          gap:10px;

          margin-top:18px;

        }


        .bs-location-card {

          background:
            rgba(255,255,255,.055);

          border:
            1px solid
            rgba(255,255,255,.08);

          border-radius:13px;

          padding:15px;

        }


        .bs-location-card h3 {

          margin:
            0 0 6px;

        }


        .bs-location-cost {

          font-size:19px;

          font-weight:bold;

          margin:
            10px 0;

        }


        .bs-location-card
        .bs-action {

          width:100%;

          margin-top:12px;

        }


        @media(max-width:700px) {

          .bs-topstats {

            grid-template-columns:
              repeat(2,1fr);

          }

          .bs-location-grid {

            grid-template-columns:1fr;

          }

          .bs-company-footer {

            flex-direction:column;

            align-items:stretch;

          }

          .bs-launch {

            width:100%;

          }

          .bs-task {

            grid-template-columns:
              35px 1fr;

          }

          .bs-task-action {

            grid-column:
              2;

          }

        }

      `;


      document.head.appendChild(
        style
      );


      panel =
        document.createElement(
          "div"
        );


      panel.id =
        "businessSetupUI";


      document.body.appendChild(
        panel
      );

    }


    /* ============================================================
       AUTOMATICALLY CATCH NEW BUSINESS
       ============================================================ */

    window.addEventListener(
      "EmpireBusinessStarted",
      function (event) {

        const company =
          event.detail;


        if (!company) {
          return;
        }


        initializeSetup(
          company
        );


        /*
         * Important:
         * A newly created company must
         * complete setup before operating.
         */

        company.status =
          "Setup Required";


        company.operating =
          false;


        company.setup.launched =
          false;


        save();
        notify();


        /*
         * Automatically open setup screen.
         */

        setTimeout(
          function () {

            open();

          },
          150
        );

      }
    );


    /* ============================================================
       BUSINESS LAUNCHED EVENT
       ============================================================ */

    window.addEventListener(
      "EmpireBusinessLaunched",
      function () {

        if (
          window.EmpireBusinessOperations
        ) {

          window.EmpireBusinessOperations
            .render();

        }

      }
    );


    /* ============================================================
       PUBLIC API
       ============================================================ */

    window.EmpireBusinessSetup = {

      open,

      close,

      render,

      initializeSetup,

      setupProgress,

      chooseLocation,

      completeTask,

      launchBusiness,

      tasks:
        SETUP_TASKS,

      locations:
        LOCATIONS

    };


    /* ============================================================
       INITIALIZE
       ============================================================ */

    create();

  });

})();
