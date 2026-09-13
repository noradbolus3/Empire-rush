(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH
   * CAREER + CAPITAL + BUSINESS GAMEPLAY
   *
   * Flow:
   * START
   *   ↓
   * JOB
   *   ↓
   * WORK DAYS
   *   ↓
   * SALARY
   *   ↓
   * EXPENSES
   *   ↓
   * SAVINGS
   *   ↓
   * CAPITAL
   *   ↓
   * BUSINESS
   * ============================================================
   */

  function waitForGameState(callback) {
    if (window.EmpireGameState) {
      callback(window.EmpireGameState);
      return;
    }

    setTimeout(function () {
      waitForGameState(callback);
    }, 100);
  }

  waitForGameState(function (Game) {

    /* ============================================================
       JOB DATABASE
       ============================================================ */

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
          "Entry-level job. Easy to enter and provides stable income."
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
          "Corporate career path with stronger promotion opportunities."
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
          "Stable finance career with strong business usefulness."
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
          "High-income technical career with strong long-term growth."
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
          "Experienced corporate position."
      }

    ];


    /* ============================================================
       BUSINESS DATABASE
       ============================================================ */

    const BUSINESSES = [

      {
        id: "freelance",
        name: "Freelance Services",
        category: "Services",
        cost: 5000,
        monthlyExpense: 2000,
        expectedRevenue: 12000,
        employees: 0,
        risk: "Low",
        description:
          "Start with your own skills and sell professional services."
      },

      {
        id: "home_food",
        name: "Home Food Business",
        category: "Food",
        cost: 25000,
        monthlyExpense: 9000,
        expectedRevenue: 30000,
        employees: 1,
        risk: "Medium",
        description:
          "Small food operation that can later become a restaurant chain."
      },

      {
        id: "retail",
        name: "Small Retail Store",
        category: "Retail",
        cost: 100000,
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
        cost: 150000,
        monthlyExpense: 50000,
        expectedRevenue: 140000,
        employees: 2,
        risk: "High",
        description:
          "Build and sell software products or digital services."
      },

      {
        id: "restaurant",
        name: "Small Restaurant",
        category: "Food & Hospitality",
        cost: 300000,
        monthlyExpense: 100000,
        expectedRevenue: 220000,
        employees: 4,
        risk: "High",
        description:
          "Full physical restaurant operation."
      },

      {
        id: "manufacturing",
        name: "Small Manufacturing Unit",
        category: "Manufacturing",
        cost: 750000,
        monthlyExpense: 250000,
        expectedRevenue: 500000,
        employees: 8,
        risk: "Very High",
        description:
          "Manufacture products and build a scalable industrial company."
      }

    ];


    /* ============================================================
       UTILITIES
       ============================================================ */

    function money(value) {

      return "₹" +
        Math.round(Number(value) || 0)
          .toLocaleString("en-IN");

    }


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


    function notify() {

      window.dispatchEvent(
        new CustomEvent(
          "EmpireGameStateChanged"
        )
      );

    }


    function capital() {

      const s = state();

      return (
        Number(s.cash) +
        Number(s.savings)
      );

    }


    function averageSkill() {

      const s = state();

      if (!s.skills) {
        return 10;
      }

      const values =
        Object.values(s.skills);

      if (!values.length) {
        return 10;
      }

      return Math.round(
        values.reduce(
          (a, b) => a + Number(b || 0),
          0
        ) / values.length
      );

    }


    /* ============================================================
       CSS
       ============================================================ */

    function installCSS() {

      if (
        document.getElementById(
          "empireCareerCSS"
        )
      ) {
        return;
      }

      const style =
        document.createElement("style");

      style.id =
        "empireCareerCSS";

      style.textContent = `

        #empireCareerUI {

          position:fixed;
          inset:0;
          z-index:99999;
          display:none;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          color:#ffffff;

        }


        #empireCareerUI .backdrop {

          position:absolute;
          inset:0;

          background:
            rgba(0,0,0,.76);

          backdrop-filter:
            blur(8px);

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

          background:
            linear-gradient(
              145deg,
              #0d1420,
              #182536
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


        #empireCareerUI .close {

          position:absolute;

          right:18px;
          top:15px;

          width:40px;
          height:40px;

          border:0;

          border-radius:50%;

          background:#293646;

          color:#fff;

          font-size:22px;

          cursor:pointer;

        }


        #empireCareerUI h1 {

          margin:
            0 0 5px;

          font-size:28px;

        }


        #empireCareerUI .subtitle {

          color:#94a4b8;

          margin-bottom:20px;

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
            rgba(255,255,255,.07);

          border-radius:13px;

          padding:13px;

        }


        #empireCareerUI .stat small {

          display:block;

          color:#8fa1b6;

          margin-bottom:6px;

        }


        #empireCareerUI .stat strong {

          font-size:17px;

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
            rgba(255,255,255,.065);

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

          justify-content:
            space-between;

          gap:10px;

          margin:
            8px 0;

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


        #empireCareerUI button.action:hover {

          filter:brightness(1.15);

        }


        #empireCareerUI button.action:disabled {

          opacity:.35;

          cursor:not-allowed;

        }


        #empireCareerUI .success {

          background:#267b50 !important;

        }


        #empireCareerUI .danger {

          background:#8b3030 !important;

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

          margin:
            12px 0;

          line-height:1.5;

        }


        #empireCareerUI .progress {

          height:8px;

          background:#283544;

          border-radius:10px;

          overflow:hidden;

          margin-top:8px;

        }


        #empireCareerUI .progressFill {

          height:100%;

          width:0%;

          background:#4d8cff;

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

          box-shadow:
            0 8px 25px
            rgba(0,0,0,.35);

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

      document.head.appendChild(style);

    }


    /* ============================================================
       CREATE UI
       ============================================================ */

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
        document.createElement("div");

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
            Build your life from zero capital
            to a business empire.
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
                1
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
        document.createElement("button");

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


    /* ============================================================
       UPDATE HEADER
       ============================================================ */

    function updateStats() {

      const s = state();

      if (!s) {
        return;
      }


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
          money(s.cash);

      }


      if (savings) {

        savings.textContent =
          money(s.savings);

      }


      if (total) {

        total.textContent =
          money(capital());

      }


      if (job) {

        job.textContent =
          s.currentJob ||
          "Unemployed";

      }


      if (day) {

        const d =
          s.world
            ? s.world.day
            : 1;

        day.textContent =
          "Day " + d;

      }

    }


    /* ============================================================
       WORK / DAY SYSTEM
       ============================================================ */

    function workOneDay() {

      const s = state();

      if (!s) {
        return;
      }


      if (
        !s.currentJob ||
        s.currentJob === "Unemployed"
      ) {

        alert(
          "Choose a job first."
        );

        return;

      }


      let salary =
        Number(s.salary || 0);


      if (salary <= 0) {

        const found =
          JOBS.find(
            j =>
              s.currentJob
                .toLowerCase()
                .includes(
                  j.title.toLowerCase()
                )
          );

        if (found) {

          salary =
            found.salary;

        }

      }


      /*
       * Salary is earned daily
       * from monthly salary.
       */

      const dailySalary =
        Math.round(
          salary / 30
        );


      const monthlyExpenses =
        Number(
          s.monthlyExpenses ||
          s.monthlyExpense ||
          15000
        );


      const dailyExpense =
        Math.round(
          monthlyExpenses / 30
        );


      s.cash =
        Number(s.cash || 0)
        + dailySalary
        - dailyExpense;


      if (s.cash < 0) {

        s.cash = 0;

      }


      s.experience =
        Number(
          s.experience || 0
        ) + 1;


      /*
       * Small skill growth.
       */

      if (s.skills) {

        Object.keys(
          s.skills
        ).forEach(function (key) {

          s.skills[key] =
            Math.min(
              100,
              Number(
                s.skills[key] || 0
              ) + 0.2
            );

        });

      }


      /*
       * Advance game day.
       */

      if (
        Game.advanceDay
      ) {

        Game.advanceDay();

      } else {

        if (!s.world) {

          s.world = {
            day:1,
            month:1,
            year:1
          };

        }

        s.world.day++;

      }


      /*
       * Monthly payday / progression.
       */

      const currentDay =
        s.world
          ? s.world.day
          : 1;


      if (
        currentDay > 0 &&
        currentDay % 30 === 0
      ) {

        monthlyCareerProgression();

      }


      save();

      notify();

      refresh();

    }


    /* ============================================================
       MONTHLY CAREER PROGRESSION
       ============================================================ */

    function monthlyCareerProgression() {

      const s = state();

      if (!s) {
        return;
      }


      if (
        !s.currentJob ||
        s.currentJob === "Unemployed"
      ) {
        return;
      }


      const job =
        JOBS.find(
          j =>
            s.currentJob
              .toLowerCase()
              .includes(
                j.title.toLowerCase()
              )
        );


      if (!job) {
        return;
      }


      s.salary =
        Number(
          s.salary || job.salary
        );


      /*
       * Every month salary gets
       * a small increment.
       */

      s.salary +=
        Math.round(
          job.growth * 0.25
        );


      /*
       * Promotion after enough experience.
       */

      if (
        Number(s.experience || 0) >= 90
      ) {

        promotePlayer();

      }

    }


    /* ============================================================
       PROMOTION
       ============================================================ */

    function promotePlayer() {

      const s = state();

      if (!s) {
        return;
      }


      const current =
        s.currentJob || "";


      const index =
        JOBS.findIndex(
          j =>
            current
              .toLowerCase()
              .includes(
                j.title.toLowerCase()
              )
        );


      if (
        index < 0 ||
        index >= JOBS.length - 1
      ) {
        return;
      }


      const next =
        JOBS[index + 1];


      const average =
        averageSkill();


      if (
        average <
        next.requirement
      ) {

        return;

      }


      s.currentJob =
        next.title;

      s.salary =
        next.salary;


      alert(
        "🎉 Promotion!\n\n" +
        "New Position: " +
        next.title +
        "\nSalary: " +
        money(next.salary)
      );


      save();

      notify();

    }


    /* ============================================================
       APPLY FOR JOB
       ============================================================ */

    function applyJob(job) {

      const s = state();

      if (!s) {
        return;
      }


      if (
        averageSkill() <
        job.requirement
      ) {

        alert(
          "You need more skills for this job."
        );

        return;

      }


      s.currentJob =
        job.title;

      s.salary =
        job.salary;

      s.jobCompany =
        job.company;

      s.jobSkill =
        job.skill;

      s.experience =
        Number(
          s.experience || 0
        );


      /*
       * Apply a small starting bonus
       * so the career system feels alive.
       */

      if (
        !s.jobStarted
      ) {

        s.jobStarted =
          true;

      }


      save();

      notify();

      refresh();

    }


    /* ============================================================
       SAVE MONEY
       ============================================================ */

    function saveMoney(amount) {

      const s = state();

      if (!s) {
        return;
      }


      amount =
        Number(amount || 0);


      if (
        amount <= 0
      ) {
        return;
      }


      if (
        Number(s.cash || 0)
        < amount
      ) {

        alert(
          "You don't have enough cash."
        );

        return;

      }


      s.cash -=
        amount;


      s.savings =
        Number(
          s.savings || 0
        ) + amount;


      save();

      notify();

      refresh();

    }


    /* ============================================================
       WITHDRAW SAVINGS
       ============================================================ */

    function withdrawSavings(amount) {

      const s = state();

      if (!s) {
        return;
      }


      amount =
        Number(amount || 0);


      if (
        amount <= 0
      ) {
        return;
      }


      if (
        Number(s.savings || 0)
        < amount
      ) {

        alert(
          "Not enough savings."
        );

        return;

      }


      s.savings -=
        amount;

      s.cash =
        Number(s.cash || 0)
        + amount;


      save();

      notify();

      refresh();

    }


    /* ============================================================
       START BUSINESS
       ============================================================ */

    function startBusiness(business) {

      const s = state();

      if (!s) {
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
          money(business.cost) +
          "\nAvailable: " +
          money(available)
        );

        return;

      }


      const confirmStart =
        confirm(

          "START BUSINESS\n\n" +

          business.name +
          "\n\n" +

          "Setup Cost: " +
          money(business.cost) +
          "\n" +

          "Monthly Expense: " +
          money(
            business.monthlyExpense
          ) +
          "\n" +

          "Expected Revenue: " +
          money(
            business.expectedRevenue
          ) +
          "\n\n" +

          "Continue?"

        );


      if (!confirmStart) {
        return;
      }


      let remaining =
        business.cost;


      /*
       * Cash first.
       */

      const cash =
        Number(s.cash || 0);


      if (
        cash >= remaining
      ) {

        s.cash -=
          remaining;

        remaining = 0;

      } else {

        remaining -=
          cash;

        s.cash = 0;

      }


      /*
       * Then savings.
       */

      if (remaining > 0) {

        s.savings =
          Math.max(
            0,
            Number(
              s.savings || 0
            ) - remaining
          );

      }


      /*
       * Create company.
       */

      if (!s.companies) {

        s.companies = [];

      }


      const company = {

        id:
          "company_" +
          Date.now(),

        name:
          business.name,

        category:
          business.category,

        status:
          "Operating",

        foundedDay:
          s.world
            ? s.world.day
            : 1,

        setupCost:
          business.cost,

        monthlyExpense:
          business.monthlyExpense,

        expectedRevenue:
          business.expectedRevenue,

        revenue:
          0,

        expenses:
          0,

        profit:
          0,

        employees:
          [],

        level:
          1,

        valuation:
          business.cost

      };


      s.companies.push(
        company
      );


      /*
       * Active company reference.
       */

      s.activeCompanyId =
        company.id;


      /*
       * Start business event.
       */

      window.dispatchEvent(

        new CustomEvent(
          "EmpireBusinessStarted",
          {
            detail: company
          }
        )

      );


      save();

      notify();

      refresh();


      alert(
        "🏢 Business Started!\n\n" +
        business.name +
        "\n\n" +
        "You are now a business owner."
      );

    }


    /* ============================================================
       RENDER CAREER
       ============================================================ */

    function renderCareer() {

      const content =
        document.getElementById(
          "careerContent"
        );

      if (!content) {
        return;
      }


      const s = state();

      if (!s) {
        return;
      }


      let html = "";


      /* ----------------------------------------------------------
         CAREER STATUS
         ---------------------------------------------------------- */

      html += `

        <div class="section">

          <div class="sectionTitle">
            👤 Career Status
          </div>

          <div class="notice">

            Current Job:
            <strong>
              ${s.currentJob || "Unemployed"}
            </strong>

            <br>

            Monthly Salary:
            <strong>
              ${money(s.salary || 0)}
            </strong>

            <br>

            Experience:
            <strong>
              ${Math.round(
                Number(
                  s.experience || 0
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


      /* ----------------------------------------------------------
         JOB MARKET
         ---------------------------------------------------------- */

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
            s.currentJob ===
            job.title;


          const locked =
            averageSkill() <
            job.requirement;


          html += `

            <div class="card">

              <h3>
                ${job.title}
              </h3>

              <div class="muted">
                ${job.company}
              </div>

              <div class="salary">
                ${money(job.salary)}
                / month
              </div>

              <div class="muted">
                Skill:
                ${job.skill}
              </div>

              <div class="muted">
                Required Skill:
                ${job.requirement}
              </div>

              <p class="muted">
                ${job.description}
              </p>

              <button
                class="action ${
                  current
                    ? "success"
                    : ""
                }"
                data-job-id="${job.id}"
                ${
                  locked && !current
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


      /* ----------------------------------------------------------
         SAVINGS
         ---------------------------------------------------------- */

      html += `

        <div class="section">

          <div class="sectionTitle">
            💰 Financial Management
          </div>

          <div class="card">

            <div class="row">
              <span>Cash</span>
              <strong>
                ${money(s.cash)}
              </strong>
            </div>

            <div class="row">
              <span>Savings</span>
              <strong>
                ${money(s.savings)}
              </strong>
            </div>

            <div class="row">
              <span>Total Capital</span>
              <strong>
                ${money(capital())}
              </strong>
            </div>

            <div class="row">
              <span>Monthly Expenses</span>
              <strong>
                ${money(
                  s.monthlyExpenses ||
                  s.monthlyExpense ||
                  15000
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


      /* ----------------------------------------------------------
         BUSINESS MARKET
         ---------------------------------------------------------- */

      html += `

        <div class="section">

          <div class="sectionTitle">
            🏢 Business Market
          </div>

          <div class="notice">

            Your available capital:

            <strong>
              ${money(capital())}
            </strong>

            <br>

            Businesses are unlocked
            according to your actual capital.

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
                ${business.name}
              </h3>

              <div class="muted">
                ${business.category}
              </div>

              <div class="salary">
                Setup:
                ${money(
                  business.cost
                )}
              </div>

              <div class="row">
                <span>
                  Monthly Revenue
                </span>

                <strong>
                  ${money(
                    business.expectedRevenue
                  )}
                </strong>
              </div>

              <div class="row">
                <span>
                  Monthly Expense
                </span>

                <strong>
                  ${money(
                    business.monthlyExpense
                  )}
                </strong>
              </div>

              <div class="row">
                <span>
                  Estimated Profit
                </span>

                <strong>
                  ${money(profit)}
                </strong>
              </div>

              <div class="muted">
                Employees:
                ${business.employees}
                <br>
                Risk:
                ${business.risk}
              </div>

              <p class="muted">
                ${business.description}
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


      /* ----------------------------------------------------------
         EXISTING COMPANIES
         ---------------------------------------------------------- */

      if (
        s.companies &&
        s.companies.length
      ) {

        html += `

          <div class="section">

            <div class="sectionTitle">
              🏛️ Your Companies
            </div>

            <div class="cards">

        `;


        s.companies.forEach(
          function (company) {

            html += `

              <div class="card">

                <h3>
                  ${company.name}
                </h3>

                <div class="muted">
                  ${company.category}
                </div>

                <div class="row">
                  <span>Status</span>
                  <strong>
                    ${company.status}
                  </strong>
                </div>

                <div class="row">
                  <span>Level</span>
                  <strong>
                    ${company.level || 1}
                  </strong>
                </div>

                <div class="row">
                  <span>Valuation</span>
                  <strong>
                    ${money(
                      company.valuation
                    )}
                  </strong>
                </div>

                <div class="row">
                  <span>Employees</span>
                  <strong>
                    ${
                      company.employees
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


      /* ==========================================================
         BUTTON EVENTS
         ========================================================== */


      const workButton =
        document.getElementById(
          "workDayBtn"
        );


      if (workButton) {

        workButton.onclick =
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


      const withdrawButton =
        document.getElementById(
          "withdrawBtn"
        );


      if (withdrawButton) {

        withdrawButton.onclick =
          function () {

            withdrawSavings(
              5000
            );

          };

      }


      /* ==========================================================
         JOB BUTTONS
         ========================================================== */

      document
        .querySelectorAll(
          "[data-job-id]"
        )
        .forEach(
          function (button) {

            button.onclick =
              function () {

                const id =
                  button.dataset.jobId;

                const job =
                  JOBS.find(
                    j =>
                      j.id === id
                  );

                if (!job) {
                  return;
                }

                applyJob(job);

              };

          }
        );


      /* ==========================================================
         BUSINESS BUTTONS
         ========================================================== */

      document
        .querySelectorAll(
          "[data-business-id]"
        )
        .forEach(
          function (button) {

            button.onclick =
              function () {

                const id =
                  button.dataset.businessId;

                const business =
                  BUSINESSES.find(
                    b =>
                      b.id === id
                  );

                if (!business) {
                  return;
                }

                startBusiness(
                  business
                );

              };

          }
        );

    }


    /* ============================================================
       REFRESH
       ============================================================ */

    function refresh() {

      updateStats();

      renderCareer();

    }


    /* ============================================================
       OPEN / CLOSE
       ============================================================ */

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


    /* ============================================================
       GAME STATE EVENTS
       ============================================================ */

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

        refresh();

      }
    );


    /* ============================================================
       PUBLIC API
       ============================================================ */

    window.EmpireCareerBusinessUI = {

      open: open,

      close: close,

      refresh: refresh,

      workDay:
        workOneDay,

      saveMoney:
        saveMoney,

      withdrawSavings:
        withdrawSavings,

      startBusiness:
        startBusiness,

      jobs:
        JOBS,

      businesses:
        BUSINESSES

    };


    /* ============================================================
       INITIALIZE
       ============================================================ */

    createUI();

    refresh();

  });

})();
