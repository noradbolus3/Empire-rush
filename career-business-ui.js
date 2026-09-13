(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH — CAREER + CAPITAL + BUSINESS UI
   *
   * CENTRAL STATE VERSION
   *
   * Player
   *   ↓
   * Job
   *   ↓
   * Work
   *   ↓
   * Salary
   *   ↓
   * Living Expenses
   *   ↓
   * Savings
   *   ↓
   * Capital
   *   ↓
   * Business Setup
   *   ↓
   * Company
   * ============================================================
   */

  function waitForGameState(callback) {

    if (window.EmpireGameState) {
      callback(window.EmpireGameState);
      return;
    }

    setTimeout(
      function () {
        waitForGameState(callback);
      },
      100
    );

  }


  waitForGameState(function (Game) {

    /* ==========================================================
       JOB DATABASE
    ========================================================== */

    const JOBS = [

      {
        id: "office_assistant",
        title: "Office Assistant",
        company: "Local Business",
        salary: 18000,
        growth: 2500,
        skill: "Communication",
        requirement: 0,
        description:
          "Entry-level job with stable income."
      },

      {
        id: "sales_executive",
        title: "Sales Executive",
        company: "Retail Company",
        salary: 25000,
        growth: 3500,
        skill: "Sales",
        requirement: 5,
        description:
          "Sales-focused career with performance-based growth."
      },

      {
        id: "junior_executive",
        title: "Junior Executive",
        company: "Corporate Company",
        salary: 30000,
        growth: 4500,
        skill: "Management",
        requirement: 8,
        description:
          "Corporate career with stronger management opportunities."
      },

      {
        id: "accountant",
        title: "Junior Accountant",
        company: "Finance Company",
        salary: 32000,
        growth: 4000,
        skill: "Finance",
        requirement: 10,
        description:
          "Finance career that builds strong business knowledge."
      },

      {
        id: "software_developer",
        title: "Junior Software Developer",
        company: "Technology Company",
        salary: 45000,
        growth: 6500,
        skill: "Technology",
        requirement: 12,
        description:
          "High-income technical career."
      },

      {
        id: "senior_executive",
        title: "Senior Executive",
        company: "National Corporation",
        salary: 65000,
        growth: 8000,
        skill: "Management",
        requirement: 25,
        description:
          "Experienced corporate leadership position."
      }

    ];


    /* ==========================================================
       BUSINESS DATABASE
       ========================================================== */

    const BUSINESSES = [

      {
        id: "freelance",
        name: "Freelance Services",
        category: "Services",
        cost: 2000,
        monthlyExpense: 2000,
        expectedRevenue: 12000,
        employees: 0,
        risk: "Low",
        description:
          "Start with your own skills and sell professional services."
      },

      {
        id: "home-food",
        name: "Home Food Business",
        category: "Food",
        cost: 12000,
        monthlyExpense: 9000,
        expectedRevenue: 30000,
        employees: 1,
        risk: "Medium",
        description:
          "Small food operation that can later become a restaurant."
      },

      {
        id: "retail",
        name: "Retail Store",
        category: "Retail",
        cost: 75000,
        monthlyExpense: 35000,
        expectedRevenue: 80000,
        employees: 2,
        risk: "Medium",
        description:
          "Physical retail business with inventory and employees."
      },

      {
        id: "software",
        name: "Software Startup",
        category: "Technology",
        cost: 60000,
        monthlyExpense: 50000,
        expectedRevenue: 140000,
        employees: 2,
        risk: "High",
        description:
          "Build and sell software products and digital services."
      },

      {
        id: "restaurant",
        name: "Restaurant",
        category: "Food & Hospitality",
        cost: 350000,
        monthlyExpense: 100000,
        expectedRevenue: 220000,
        employees: 4,
        risk: "High",
        description:
          "Full physical restaurant operation."
      },

      {
        id: "manufacturing",
        name: "Manufacturing Unit",
        category: "Manufacturing",
        cost: 1800000,
        monthlyExpense: 250000,
        expectedRevenue: 500000,
        employees: 8,
        risk: "Very High",
        description:
          "Manufacture products and build a scalable industrial company."
      }

    ];


    /* ==========================================================
       HELPERS
    ========================================================== */

    function getState() {

      return Game.getState
        ? Game.getState()
        : Game.state;

    }


    function getPlayer() {

      const s = getState();

      return s.player || {};

    }


    function money(value) {

      return (
        "₹" +
        Math.round(
          Number(value || 0)
        ).toLocaleString("en-IN")
      );

    }


    function save() {

      if (
        typeof Game.save ===
        "function"
      ) {

        Game.save();

      }

    }


    function capital() {

      const player =
        getPlayer();

      return (
        Number(
          player.cash || 0
        ) +
        Number(
          player.savings || 0
        )
      );

    }


    function averageSkill() {

      const player =
        getPlayer();

      const skills =
        player.skills || {};

      const values =
        Object.values(
          skills
        );

      if (!values.length) {
        return 10;
      }

      return Math.round(
        values.reduce(
          function (
            total,
            value
          ) {

            return (
              total +
              Number(value || 0)
            );

          },
          0
        ) /
        values.length
      );

    }


    function notify(
      type = "career"
    ) {

      window.dispatchEvent(
        new CustomEvent(
          "EmpireGameStateChanged",
          {
            detail: {
              type
            }
          }
        )
      );

    }


    /* ==========================================================
       CSS
    ========================================================== */

    function installCSS() {

      if (
        document.getElementById(
          "empireCareerCSS"
        )
      ) {

        return;

      }


      const style =
        document.createElement(
          "style"
        );

      style.id =
        "empireCareerCSS";


      style.textContent = `

        #empireCareerUI {

          position:fixed;
          inset:0;
          z-index:99999;
          display:none;
          color:#fff;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

        }


        #empireCareerUI .backdrop {

          position:absolute;
          inset:0;

          background:
            rgba(0,0,0,.78);

          backdrop-filter:
            blur(9px);

        }


        #empireCareerUI .window {

          position:absolute;

          left:50%;
          top:50%;

          transform:
            translate(-50%,-50%);

          width:
            min(980px,94vw);

          max-height:
            90vh;

          overflow-y:auto;

          padding:24px;

          border-radius:22px;

          background:
            linear-gradient(
              145deg,
              #0c1420,
              #182638
            );

          border:
            1px solid
            rgba(255,255,255,.13);

          box-shadow:
            0 30px 100px
            rgba(0,0,0,.75);

          box-sizing:border-box;

        }


        #empireCareerUI .close {

          position:absolute;

          right:17px;
          top:15px;

          width:40px;
          height:40px;

          border:0;
          border-radius:50%;

          background:#293747;
          color:#fff;

          font-size:22px;

          cursor:pointer;

        }


        #empireCareerUI h1 {

          margin:0 0 5px;

          font-size:28px;

        }


        #empireCareerUI .subtitle {

          color:#92a3b8;

          margin-bottom:20px;

          line-height:1.4;

        }


        #empireCareerUI .stats {

          display:grid;

          grid-template-columns:
            repeat(5,1fr);

          gap:10px;

          margin-bottom:20px;

        }


        #empireCareerUI .stat {

          background:
            rgba(255,255,255,.065);

          border-radius:13px;

          padding:13px;

        }


        #empireCareerUI .stat small {

          display:block;

          color:#8fa1b6;

          margin-bottom:6px;

        }


        #empireCareerUI .stat strong {

          font-size:16px;

          display:block;

          white-space:nowrap;

          overflow:hidden;

          text-overflow:ellipsis;

        }


        #empireCareerUI .section {

          margin-top:24px;

        }


        #empireCareerUI .sectionTitle {

          font-size:20px;

          font-weight:bold;

          margin-bottom:12px;

        }


        #empireCareerUI .cards {

          display:grid;

          grid-template-columns:
            repeat(2,1fr);

          gap:12px;

        }


        #empireCareerUI .card {

          background:
            rgba(255,255,255,.06);

          border:
            1px solid
            rgba(255,255,255,.08);

          border-radius:15px;

          padding:16px;

        }


        #empireCareerUI .card h3 {

          margin:
            0 0 5px;

          font-size:18px;

        }


        #empireCareerUI .muted {

          color:#95a5b8;

          font-size:13px;

          line-height:1.45;

        }


        #empireCareerUI .salary {

          font-size:21px;

          font-weight:bold;

          margin:10px 0;

        }


        #empireCareerUI .row {

          display:flex;

          justify-content:space-between;

          gap:10px;

          margin:8px 0;

        }


        #empireCareerUI .buttonRow {

          display:flex;

          gap:8px;

          margin-top:12px;

        }


        #empireCareerUI button.action {

          flex:1;

          border:0;

          border-radius:10px;

          padding:11px;

          background:#3478f6;

          color:white;

          font-weight:bold;

          cursor:pointer;

        }


        #empireCareerUI button.action:disabled {

          opacity:.35;

          cursor:not-allowed;

        }


        #empireCareerUI .success {

          background:#267b50 !important;

        }


        #empireCareerUI .warning {

          background:#806225 !important;

        }


        #empireCareerUI .notice {

          background:
            rgba(50,120,246,.12);

          border:
            1px solid
            rgba(50,120,246,.2);

          border-radius:13px;

          padding:14px;

          margin:12px 0;

          line-height:1.6;

        }


        #careerButton {

          position:fixed;

          left:20px;
          bottom:72px;

          z-index:5000;

          padding:
            11px 17px;

          border:
            1px solid
            rgba(255,255,255,.18);

          border-radius:12px;

          background:
            rgba(15,24,35,.94);

          color:#fff;

          font-weight:bold;

          cursor:pointer;

        }


        @media(max-width:700px) {

          #empireCareerUI .stats {

            grid-template-columns:
              repeat(2,1fr);

          }

          #empireCareerUI .cards {

            grid-template-columns:1fr;

          }

          #empireCareerUI .window {

            padding:18px;

          }

        }

      `;

      document.head.appendChild(
        style
      );

    }


    /* ==========================================================
       UI
    ========================================================== */

    let overlay = null;


    function createUI() {

      installCSS();


      if (
        document.getElementById(
          "empireCareerUI"
        )
      ) {

        overlay =
          document.getElementById(
            "empireCareerUI"
          );

        return;

      }


      overlay =
        document.createElement(
          "div"
        );

      overlay.id =
        "empireCareerUI";


      overlay.innerHTML = `

        <div class="backdrop"></div>

        <div class="window">

          <button
            class="close"
            id="careerClose">
            ×
          </button>

          <h1>
            Empire Career & Business
          </h1>

          <div class="subtitle">
            Start from zero. Build skills,
            earn capital and create your company.
          </div>

          <div class="stats">

            <div class="stat">
              <small>Cash</small>
              <strong id="careerCash">
                ₹0
              </strong>
            </div>

            <div class="stat">
              <small>Savings</small>
              <strong id="careerSavings">
                ₹0
              </strong>
            </div>

            <div class="stat">
              <small>Total Capital</small>
              <strong id="careerCapital">
                ₹0
              </strong>
            </div>

            <div class="stat">
              <small>Job</small>
              <strong id="careerJob">
                Unemployed
              </strong>
            </div>

            <div class="stat">
              <small>Day</small>
              <strong id="careerDay">
                Day 1
              </strong>
            </div>

          </div>

          <div id="careerContent"></div>

        </div>

      `;


      document.body.appendChild(
        overlay
      );


      const button =
        document.createElement(
          "button"
        );

      button.id =
        "careerButton";

      button.textContent =
        "CAREER";

      document.body.appendChild(
        button
      );


      button.onclick =
        open;


      document
        .getElementById(
          "careerClose"
        )
        .onclick =
        close;


      overlay
        .querySelector(
          ".backdrop"
        )
        .onclick =
        close;

    }


    /* ==========================================================
       HEADER
    ========================================================== */

    function updateStats() {

      const s =
        getState();

      const player =
        s.player || {};

      const cash =
        document.getElementById(
          "careerCash"
        );

      const savings =
        document.getElementById(
          "careerSavings"
        );

      const total =
        document.getElementById(
          "careerCapital"
        );

      const job =
        document.getElementById(
          "careerJob"
        );

      const day =
        document.getElementById(
          "careerDay"
        );


      if (cash) {

        cash.textContent =
          money(
            player.cash
          );

      }


      if (savings) {

        savings.textContent =
          money(
            player.savings
          );

      }


      if (total) {

        total.textContent =
          money(
            capital()
          );

      }


      if (job) {

        job.textContent =
          player.currentJob ||
          "Unemployed";

      }


      if (day) {

        day.textContent =
          "Day " +
          (
            s.world?.day ||
            1
          );

      }

    }


    /* ==========================================================
       WORK ONE DAY
    ========================================================== */

    function workOneDay() {

      const player =
        getPlayer();


      if (
        !player.currentJob ||
        player.currentJob ===
        "Unemployed"
      ) {

        alert(
          "Choose a job first."
        );

        return;

      }


      /*
       * Salary and expenses are now
       * controlled by the central GameState.
       *
       * We intentionally DO NOT manually
       * add salary here.
       *
       * Daily work only advances the world.
       */

      const before =
        Number(
          player.experience || 0
        );


      /*
       * Experience.
       */

      player.experience =
        before + 1;


      /*
       * Skill development.
       */

      if (player.skills) {

        const job =
          JOBS.find(
            function (item) {

              return (
                item.title ===
                player.currentJob
              );

            }
          );


        const skill =
          job?.skill ||
          "Communication";


        player.skills[skill] =
          Math.min(
            100,
            Number(
              player.skills[skill] || 0
            ) + 0.25
          );

      }


      /*
       * Central clock.
       *
       * Month-end salary and expenses
       * are handled by GameState.
       */

      if (
        Game.world &&
        typeof Game.world.advanceDay ===
        "function"
      ) {

        Game.world.advanceDay();

      }


      save();

      notify(
        "worked-day"
      );

      refresh();

    }


    /* ==========================================================
       APPLY JOB
    ========================================================== */

    function applyJob(job) {

      if (!job) {
        return;
      }


      if (
        averageSkill() <
        Number(
          job.requirement || 0
        )
      ) {

        alert(
          "Your skill level is too low for this job."
        );

        return;

      }


      const accepted =
        Game.player &&
        typeof Game.player.setJob ===
        "function"
          ? Game.player.setJob(
              {
                title:
                  job.title,

                level:
                  job.requirement >= 25
                    ? "Senior"
                    : job.requirement >= 10
                      ? "Professional"
                      : "Entry",

                monthlySalary:
                  job.salary
              }
            )
          : false;


      if (!accepted) {

        alert(
          "Unable to apply for this job."
        );

        return;

      }


      const player =
        getPlayer();


      player.jobCompany =
        job.company;

      player.jobSkill =
        job.skill;

      player.jobId =
        job.id;


      save();

      notify(
        "job-accepted"
      );

      refresh();


      alert(
        "💼 Job Accepted!\n\n" +
        job.title +
        "\n" +
        money(job.salary) +
        " / month"
      );

    }


    /* ==========================================================
       SAVE MONEY
    ========================================================== */

    function saveMoney(
      amount
    ) {

      amount =
        Number(amount || 0);


      if (
        amount <= 0
      ) {
        return;
      }


      if (
        !Game.player ||
        typeof Game.player.saveMoney !==
        "function"
      ) {

        return;

      }


      const success =
        Game.player.saveMoney(
          amount
        );


      if (!success) {

        alert(
          "You don't have enough cash."
        );

        return;

      }


      refresh();

    }


    /* ==========================================================
       WITHDRAW
    ========================================================== */

    function withdrawSavings(
      amount
    ) {

      amount =
        Number(amount || 0);


      if (
        amount <= 0
      ) {
        return;
      }


      if (
        !Game.player ||
        typeof Game.player.withdrawSavings !==
        "function"
      ) {

        return;

      }


      const success =
        Game.player.withdrawSavings(
          amount
        );


      if (!success) {

        alert(
          "Not enough savings."
        );

        return;

      }


      refresh();

    }


    /* ==========================================================
       START BUSINESS
    ========================================================== */

    function startBusiness(
      business
    ) {

      if (!business) {
        return;
      }


      const available =
        capital();


      if (
        available <
        business.cost
      ) {

        alert(
          "Not enough capital.\n\n" +
          "Required: " +
          money(
            business.cost
          ) +
          "\nAvailable: " +
          money(
            available
          )
        );

        return;

      }


      const confirmStart =
        confirm(

          "START BUSINESS\n\n" +

          business.name +

          "\n\nSetup Cost: " +
          money(
            business.cost
          ) +

          "\n\nRisk: " +
          business.risk +

          "\n\nContinue?"

        );


      if (!confirmStart) {
        return;
      }


      /*
       * Central GameState is now the ONLY
       * place that creates the company.
       */

      if (
        !Game.business ||
        typeof Game.business.start !==
        "function"
      ) {

        alert(
          "Business system unavailable."
        );

        return;

      }


      const result =
        Game.business.start(
          business.id,
          business.name
        );


      if (
        !result ||
        result.success !== true
      ) {

        alert(
          result?.reason ||
          "Unable to start business."
        );

        return;

      }


      refresh();


      alert(
        "🏢 Business Created!\n\n" +
        business.name +
        "\n\n" +
        "Status: Setup Required\n\n" +
        "Complete registration, tax, banking,\n" +
        "licenses and other setup tasks before launch."
      );

    }


    /* ==========================================================
       CAREER RENDER
    ========================================================== */

    function renderCareer() {

      const content =
        document.getElementById(
          "careerContent"
        );


      if (!content) {
        return;
      }


      const s =
        getState();

      const player =
        s.player || {};


      let html = "";


      /* ========================================================
         CAREER STATUS
      ======================================================== */

      html += `

        <div class="section">

          <div class="sectionTitle">
            👤 Career Status
          </div>

          <div class="notice">

            Current Job:
            <strong>
              ${escapeHTML(
                player.currentJob ||
                "Unemployed"
              )}
            </strong>

            <br>

            Monthly Salary:
            <strong>
              ${money(
                player.monthlyIncome
              )}
            </strong>

            <br>

            Experience:
            <strong>
              ${Math.round(
                Number(
                  player.experience || 0
                )
              )}
            </strong>

            days

            <br>

            Average Skill:
            <strong>
              ${averageSkill()}
            </strong>

          </div>


          <div class="buttonRow">

            <button
              class="action success"
              id="workDayBtn">

              WORK 1 DAY

            </button>

            <button
              class="action"
              id="saveMoneyBtn">

              SAVE ₹5,000

            </button>

          </div>

        </div>

      `;


      /* ========================================================
         JOB MARKET
      ======================================================== */

      html += `

        <div class="section">

          <div class="sectionTitle">
            💼 Job Market
          </div>

          <div class="cards">

      `;


      JOBS.forEach(
        function (job) {

          const current =
            player.currentJob ===
            job.title;


          const locked =
            averageSkill() <
            job.requirement;


          html += `

            <div class="card">

              <h3>
                ${escapeHTML(
                  job.title
                )}
              </h3>

              <div class="muted">
                ${escapeHTML(
                  job.company
                )}
              </div>

              <div class="salary">
                ${money(
                  job.salary
                )}
                / month
              </div>

              <div class="muted">
                Skill:
                ${escapeHTML(
                  job.skill
                )}
              </div>

              <div class="muted">
                Required Skill:
                ${job.requirement}
              </div>

              <p class="muted">
                ${escapeHTML(
                  job.description
                )}
              </p>

              <button
                class="action ${
                  current
                    ? "success"
                    : ""
                }"
                data-job-id="${job.id}"
                ${
                  locked &&
                  !current
                    ? "disabled"
                    : ""
                }>

                ${
                  current
                    ? "CURRENT JOB"
                    : locked
                      ? "SKILL TOO LOW"
                      : "APPLY"
                }

              </button>

            </div>

          `;

        }
      );


      html += `
          </div>
        </div>
      `;


      /* ========================================================
         FINANCE
      ======================================================== */

      html += `

        <div class="section">

          <div class="sectionTitle">
            💰 Personal Finance
          </div>

          <div class="card">

            <div class="row">
              <span>Cash</span>
              <strong>
                ${money(
                  player.cash
                )}
              </strong>
            </div>

            <div class="row">
              <span>Savings</span>
              <strong>
                ${money(
                  player.savings
                )}
              </strong>
            </div>

            <div class="row">
              <span>Total Capital</span>
              <strong>
                ${money(
                  capital()
                )}
              </strong>
            </div>

            <div class="row">
              <span>Monthly Expenses</span>
              <strong>
                ${money(
                  player.monthlyExpenses
                )}
              </strong>
            </div>

            <div class="buttonRow">

              <button
                class="action"
                id="withdrawBtn">

                WITHDRAW ₹5,000

              </button>

            </div>

          </div>

        </div>

      `;


      /* ========================================================
         BUSINESS MARKET
      ======================================================== */

      html += `

        <div class="section">

          <div class="sectionTitle">
            🏢 Business Market
          </div>

          <div class="notice">

            Available Capital:

            <strong>
              ${money(
                capital()
              )}
            </strong>

            <br>

            Business selection is based on
            your actual available capital.

          </div>

          <div class="cards">

      `;


      BUSINESSES.forEach(
        function (business) {

          const affordable =
            capital() >=
            business.cost;


          const profit =
            business.expectedRevenue -
            business.monthlyExpense;


          html += `

            <div class="card">

              <h3>
                ${escapeHTML(
                  business.name
                )}
              </h3>

              <div class="muted">
                ${escapeHTML(
                  business.category
                )}
              </div>

              <div class="salary">
                Setup:
                ${money(
                  business.cost
                )}
              </div>

              <div class="row">
                <span>
                  Expected Revenue
                </span>

                <strong>
                  ${money(
                    business.expectedRevenue
                  )}
                </strong>
              </div>

              <div class="row">
                <span>
                  Estimated Expenses
                </span>

                <strong>
                  ${money(
                    business.monthlyExpense
                  )}
                </strong>
              </div>

              <div class="row">
                <span>
                  Indicative Profit
                </span>

                <strong>
                  ${money(
                    profit
                  )}
                </strong>
              </div>

              <div class="muted">

                Employees:
                ${business.employees}

                <br>

                Risk:
                ${escapeHTML(
                  business.risk
                )}

              </div>

              <p class="muted">
                ${escapeHTML(
                  business.description
                )}
              </p>

              <button
                class="action ${
                  affordable
                    ? "success"
                    : ""
                }"
                data-business-id="${business.id}"
                ${
                  affordable
                    ? ""
                    : "disabled"
                }>

                ${
                  affordable
                    ? "START BUSINESS"
                    : "CAPITAL REQUIRED"
                }

              </button>

            </div>

          `;

        }
      );


      html += `
          </div>
        </div>
      `;


      /* ========================================================
         COMPANIES
      ======================================================== */

      const companies =
        s.companies || [];


      if (companies.length) {

        html += `

          <div class="section">

            <div class="sectionTitle">
              🏛️ Your Companies
            </div>

            <div class="cards">

        `;


        companies.forEach(
          function (company) {

            html += `

              <div class="card">

                <h3>
                  ${escapeHTML(
                    company.name ||
                    company.legalName ||
                    "Company"
                  )}
                </h3>

                <div class="muted">
                  ${escapeHTML(
                    company.businessName ||
                    company.type ||
                    ""
                  )}
                </div>

                <div class="row">
                  <span>Status</span>
                  <strong>
                    ${escapeHTML(
                      company.status ||
                      "Setup Required"
                    )}
                  </strong>
                </div>

                <div class="row">
                  <span>Level</span>
                  <strong>
                    ${company.level || 1}
                  </strong>
                </div>

                <div class="row">
                  <span>Company Cash</span>
                  <strong>
                    ${money(
                      company.finance?.cash ??
                      company.cash ??
                      0
                    )}
                  </strong>
                </div>

                <div class="row">
                  <span>Employees</span>
                  <strong>
                    ${
                      Array.isArray(
                        company.employees
                      )
                        ? company.employees.length
                        : 0
                    }
                  </strong>
                </div>

              </div>

            `;

          }
        );


        html += `
            </div>
          </div>
        `;

      }


      content.innerHTML =
        html;


      /* ========================================================
         EVENTS
      ======================================================== */

      const work =
        document.getElementById(
          "workDayBtn"
        );

      if (work) {
        work.onclick =
          workOneDay;
      }


      const saveButton =
        document.getElementById(
          "saveMoneyBtn"
        );

      if (saveButton) {

        saveButton.onclick =
          function () {

            saveMoney(
              5000
            );

          };

      }


      const withdraw =
        document.getElementById(
          "withdrawBtn"
        );

      if (withdraw) {

        withdraw.onclick =
          function () {

            withdrawSavings(
              5000
            );

          };

      }


      document
        .querySelectorAll(
          "[data-job-id]"
        )
        .forEach(
          function (button) {

            button.onclick =
              function () {

                const job =
                  JOBS.find(
                    function (item) {

                      return (
                        item.id ===
                        button.dataset.jobId
                      );

                    }
                  );

                if (job) {
                  applyJob(job);
                }

              };

          }
        );


      document
        .querySelectorAll(
          "[data-business-id]"
        )
        .forEach(
          function (button) {

            button.onclick =
              function () {

                const business =
                  BUSINESSES.find(
                    function (item) {

                      return (
                        item.id ===
                        button.dataset.businessId
                      );

                    }
                  );

                if (business) {
                  startBusiness(
                    business
                  );
                }

              };

          }
        );

    }


    /* ==========================================================
       REFRESH
    ========================================================== */

    function refresh() {

      updateStats();

      renderCareer();

    }


    /* ==========================================================
       OPEN / CLOSE
    ========================================================== */

    function open() {

      createUI();

      overlay.style.display =
        "block";

      refresh();

    }


    function close() {

      if (overlay) {

        overlay.style.display =
          "none";

      }

    }


    /* ==========================================================
       ESCAPE HTML
    ========================================================== */

    function escapeHTML(
      value
    ) {

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

    }


    /* ==========================================================
       EVENTS
    ========================================================== */

    window.addEventListener(
      "EmpireGameStateChanged",
      function () {

        if (
          overlay &&
          overlay.style.display !==
          "none"
        ) {

          refresh();

        }

      }
    );


    window.addEventListener(
      "EmpireBusinessStarted",
      function () {

        if (overlay) {
          refresh();
        }

      }
    );


    window.addEventListener(
      "EmpireBusinessLaunched",
      function () {

        if (overlay) {
          refresh();
        }

      }
    );


    /* ==========================================================
       PUBLIC API
    ========================================================== */

    window.EmpireCareerBusinessUI = {

      open,

      close,

      refresh,

      workDay:
        workOneDay,

      saveMoney,

      withdrawSavings,

      startBusiness,

      jobs:
        JOBS,

      businesses:
        BUSINESSES

    };


    /* ==========================================================
       INITIALIZE
    ========================================================== */

    createUI();

    refresh();


    console.log(
      "Empire Rush: Career Business UI integrated with Central Game State."
    );

  });

})();
