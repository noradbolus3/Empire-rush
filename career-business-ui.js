(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH — CAREER + CAPITAL + BUSINESS UI
   *
   * UI ONLY
   *
   * AUTHORITIES:
   *   EmpireGameState  → money, salary, world, companies
   *   EmpireCareer     → jobs, career progression, skills
   *
   * FLOW:
   *
   * Person
   *   ↓
   * Job
   *   ↓
   * Work
   *   ↓
   * Experience / Skills
   *   ↓
   * Monthly Salary
   *   ↓
   * Savings
   *   ↓
   * Capital
   *   ↓
   * Business
   *
   * IMPORTANT:
   * This UI does NOT create its own career database.
   * ============================================================
   */


  /* ============================================================
     WAIT FOR CORE SYSTEMS
  ============================================================ */

  function waitForSystems(callback) {

    if (
      window.EmpireGameState &&
      window.EmpireCareer
    ) {

      callback(
        window.EmpireGameState,
        window.EmpireCareer
      );

      return;
    }


    setTimeout(
      function () {
        waitForSystems(callback);
      },
      100
    );

  }


  waitForSystems(
    function (Game, Career) {


      /* ========================================================
         HELPERS
      ======================================================== */

      function getState() {

        return Game.getState
          ? Game.getState()
          : Game.state;

      }


      function getPlayer() {

        const state =
          getState();

        return state?.player || {};

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


        /*
         * Central GameState definition:
         *
         * available capital =
         * cash + personal savings
         */

        if (
          Game.money &&
          typeof Game.money.capital ===
          "function"
        ) {

          return Number(
            Game.money.capital() || 0
          );

        }


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

        if (
          Career &&
          typeof Career.getAverageSkill ===
          "function"
        ) {

          return Math.round(
            Number(
              Career.getAverageSkill() || 0
            )
          );

        }


        const player =
          getPlayer();

        const skills =
          player.skills || {};

        const values =
          Object.values(
            skills
          )
          .map(Number)
          .filter(
            value =>
              Number.isFinite(value)
          );


        if (!values.length) {
          return 0;
        }


        return Math.round(
          values.reduce(
            function (
              total,
              value
            ) {

              return (
                total +
                value
              );

            },
            0
          ) /
          values.length
        );

      }


      function notify(type) {

        window.dispatchEvent(
          new CustomEvent(
            "EmpireGameStateChanged",
            {
              detail: {
                type:
                  type ||
                  "career"
              }
            }
          )
        );

      }


      function escapeHTML(value) {

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


      /* ========================================================
         BUSINESS DATABASE
         
         Business data belongs to this UI only for presentation.
         Actual company creation is ALWAYS Game.business.start().
      ======================================================== */

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
            "Small food operation that can later grow into a restaurant."
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


      /* ========================================================
         CSS
      ======================================================== */

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

            margin:
              0 0 5px;

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

            display:block;

            font-size:16px;

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


          #empireCareerUI .danger {

            background:#8b3030 !important;

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


      /* ========================================================
         UI CREATION
      ======================================================== */

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


      /* ========================================================
         HEADER STATS
      ======================================================== */

      function updateStats() {

        const state =
          getState();

        const player =
          state?.player || {};


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
              state?.world?.day ||
              1
            );

        }

      }


      /* ========================================================
         WORK ONE DAY
      ======================================================== */

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
         * Career system handles:
         *
         * - experience
         * - career XP
         * - performance
         * - stress
         * - reputation
         * - skills
         *
         * GameState handles:
         *
         * - day
         * - monthly salary
         * - living expenses
         *
         * NEVER duplicate these here.
         */


        if (
          !Career ||
          typeof Career.workDay !==
          "function"
        ) {

          alert(
            "Career system unavailable."
          );

          return;

        }


        const result =
          Career.workDay();


        if (
          !result ||
          result.success !== true
        ) {

          alert(
            result?.message ||
            "Unable to work today."
          );

          return;

        }


        /*
         * One work action advances
         * exactly one game day.
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


        /*
         * Inform player of progression.
         */

        alert(
          "💼 Work Day Complete!\n\n" +

          "Experience +" +
          Number(
            result.experienceGain || 0
          ).toFixed(2) +

          "\nCareer XP +" +
          Number(
            result.xpGain || 0
          ) +

          "\n\n" +

          "Performance: " +
          Math.round(
            Number(
              result.performance || 0
            )
          ) +

          "\nStress: " +
          Math.round(
            Number(
              result.stress || 0
            )
          )
        );

      }


      /* ========================================================
         APPLY FOR JOB
      ======================================================== */

      function applyJob(jobId) {

        if (
          !Career ||
          typeof Career.getJob !==
          "function"
        ) {

          alert(
            "Career system unavailable."
          );

          return;

        }


        const job =
          Career.getJob(
            jobId
          );


        if (!job) {

          alert(
            "Job not found."
          );

          return;

        }


        const eligibility =
          Career.canApply(
            jobId
          );


        if (
          !eligibility ||
          eligibility.allowed !== true
        ) {

          alert(
            eligibility?.reason ||
            "You are not eligible for this job."
          );

          return;

        }


        /*
         * Interview first.
         */

        let interviewResult = null;


        if (
          typeof Career.interview ===
          "function"
        ) {

          interviewResult =
            Career.interview(
              jobId
            );

        }


        if (
          interviewResult &&
          interviewResult.passed !== true
        ) {

          alert(
            "❌ Interview Failed\n\n" +

            job.title +

            "\nScore: " +
            Number(
              interviewResult.score || 0
            ) +

            "\n\nImprove your skills and try again."
          );

          refresh();

          return;

        }


        /*
         * Accept job through central
         * Career system.
         */

        const result =
          Career.acceptJob(
            jobId
          );


        if (
          !result ||
          result.success !== true
        ) {

          alert(
            result?.message ||
            "Unable to accept this job."
          );

          return;

        }


        const player =
          getPlayer();


        /*
         * Additional UI metadata.
         * Core salary remains in GameState.
         */

        player.jobId =
          job.id;

        player.jobCompany =
          job.company ||
          "Employer";

        player.jobSkill =
          job.department ||
          "General";


        save();

        notify(
          "job-accepted"
        );

        refresh();


        alert(
          "💼 JOB ACCEPTED!\n\n" +

          job.title +

          "\n\nSalary: " +
          money(
            job.salary
          ) +
          " / month" +

          "\nLevel: " +
          job.level +

          "\nDepartment: " +
          job.department
        );

      }


      /* ========================================================
         SAVE MONEY
      ======================================================== */

      function saveMoney(
        amount
      ) {

        amount =
          Number(
            amount || 0
          );


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

          alert(
            "Banking system unavailable."
          );

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


        save();

        notify(
          "money-saved"
        );

        refresh();

      }


      /* ========================================================
         WITHDRAW SAVINGS
      ======================================================== */

      function withdrawSavings(
        amount
      ) {

        amount =
          Number(
            amount || 0
          );


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

          alert(
            "Banking system unavailable."
          );

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


        save();

        notify(
          "savings-withdrawn"
        );

        refresh();

      }


      /* ========================================================
         START BUSINESS
      ======================================================== */

      function startBusiness(
        business
      ) {

        if (!business) {
          return;
        }


        const availableCapital =
          capital();


        if (
          availableCapital <
          Number(
            business.cost || 0
          )
        ) {

          alert(
            "NOT ENOUGH CAPITAL\n\n" +

            "Required: " +
            money(
              business.cost
            ) +

            "\nAvailable: " +
            money(
              availableCapital
            )
          );

          return;

        }


        const confirmed =
          confirm(

            "START BUSINESS\n\n" +

            business.name +

            "\n\nSetup Cost: " +
            money(
              business.cost
            ) +

            "\nRisk: " +
            business.risk +

            "\n\nContinue?"

          );


        if (!confirmed) {
          return;
        }


        /*
         * Company creation ONLY through
         * central GameState.
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
            result?.message ||
            "Unable to start business."
          );

          return;

        }


        save();

        notify(
          "business-started"
        );

        refresh();


        alert(
          "🏢 BUSINESS CREATED!\n\n" +

          business.name +

          "\n\nStatus: Setup Required\n\n" +

          "Complete registration, tax,\n" +
          "banking, licenses, equipment\n" +
          "and other setup tasks before launch."
        );

      }


      /* ========================================================
         RENDER CAREER STATUS
      ======================================================== */

      function renderCareerStatus(
        player
      ) {

        const summary =
          Career.getSummary
            ? Career.getSummary()
            : null;


        const career =
          player.career || {};


        return `

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

              Job Level:
              <strong>
                ${escapeHTML(
                  player.jobLevel ||
                  "Entry"
                )}
              </strong>

              <br>

              Experience:
              <strong>
                ${Number(
                  player.experience || 0
                ).toFixed(2)}
              </strong>

              years

              <br>

              Career Level:
              <strong>
                ${Number(
                  player.careerLevel ||
                  career.level ||
                  1
                )}
              </strong>

              <br>

              Career XP:
              <strong>
                ${Number(
                  career.xp || 0
                )}
              </strong>

              <br>

              Average Skill:
              <strong>
                ${averageSkill()}
              </strong>

              <br>

              Performance:
              <strong>
                ${Math.round(
                  Number(
                    career.performance ||
                    0
                  )
                )}
              </strong>

              <br>

              Stress:
              <strong>
                ${Math.round(
                  Number(
                    career.stress ||
                    0
                  )
                )}
              </strong>

            </div>


            <div class="buttonRow">

              <button
                class="action success"
                id="workDayBtn"
                ${
                  !player.currentJob ||
                  player.currentJob ===
                  "Unemployed"
                    ? "disabled"
                    : ""
                }>

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

      }


      /* ========================================================
         RENDER JOB MARKET
      ======================================================== */

      function renderJobMarket(
        player
      ) {

        const jobs =
          typeof Career.getJobs ===
          "function"
            ? Career.getJobs()
            : Object.values(
                Career.jobs || {}
              );


        let html = `

          <div class="section">

            <div class="sectionTitle">
              💼 Job Market
            </div>

            <div class="cards">

        `;


        jobs.forEach(
          function (job) {

            const current =
              player.currentJob ===
              job.title;


            const eligibility =
              Career.canApply
                ? Career.canApply(
                    job.id
                  )
                : {
                    allowed: true
                  };


            const locked =
              !current &&
              !eligibility.allowed;


            html += `

              <div class="card">

                <h3>
                  ${escapeHTML(
                    job.title
                  )}
                </h3>

                <div class="muted">
                  ${escapeHTML(
                    job.department ||
                    "General"
                  )}
                </div>

                <div class="salary">
                  ${money(
                    job.salary
                  )}
                  / month
                </div>

                <div class="row">

                  <span>
                    Level
                  </span>

                  <strong>
                    ${escapeHTML(
                      job.level
                    )}
                  </strong>

                </div>

                <div class="row">

                  <span>
                    Required Experience
                  </span>

                  <strong>
                    ${Number(
                      job.requiredExperience ||
                      0
                    )}
                    yrs
                  </strong>

                </div>

                <div class="row">

                  <span>
                    Required Skill
                  </span>

                  <strong>
                    ${Number(
                      job.requiredSkill ||
                      0
                    )}
                  </strong>

                </div>

                <p class="muted">

                  ${
                    locked
                      ? escapeHTML(
                          eligibility.reason ||
                          "Requirements not met."
                        )
                      : "You are eligible to apply."
                  }

                </p>


                <button
                  class="action ${
                    current
                      ? "success"
                      : ""
                  }"
                  data-job-id="${job.id}"
                  ${
                    current ||
                    locked
                      ? "disabled"
                      : ""
                  }>

                  ${
                    current
                      ? "CURRENT JOB"
                      : locked
                        ? "NOT ELIGIBLE"
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


        return html;

      }


      /* ========================================================
         RENDER FINANCE
      ======================================================== */

      function renderFinance(
        player
      ) {

        return `

          <div class="section">

            <div class="sectionTitle">
              💰 Personal Finance
            </div>

            <div class="card">

              <div class="row">

                <span>
                  Cash
                </span>

                <strong>
                  ${money(
                    player.cash
                  )}
                </strong>

              </div>


              <div class="row">

                <span>
                  Savings
                </span>

                <strong>
                  ${money(
                    player.savings
                  )}
                </strong>

              </div>


              <div class="row">

                <span>
                  Available Capital
                </span>

                <strong>
                  ${money(
                    capital()
                  )}
                </strong>

              </div>


              <div class="row">

                <span>
                  Monthly Income
                </span>

                <strong>
                  ${money(
                    player.monthlyIncome
                  )}
                </strong>

              </div>


              <div class="row">

                <span>
                  Monthly Living Expenses
                </span>

                <strong>
                  ${money(
                    player.monthlyExpenses
                  )}
                </strong>

              </div>


              <div class="row">

                <span>
                  Debt
                </span>

                <strong>
                  ${money(
                    player.debt
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

      }


      /* ========================================================
         RENDER BUSINESS MARKET
      ======================================================== */

      function renderBusinessMarket() {

        let html = `

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

              Choose a business according
              to your actual financial capacity.

            </div>

            <div class="cards">

        `;


        BUSINESSES.forEach(
          function (business) {

            const affordable =
              capital() >=
              Number(
                business.cost || 0
              );


            const indicativeProfit =
              Number(
                business.expectedRevenue || 0
              ) -
              Number(
                business.monthlyExpense || 0
              );


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
                      indicativeProfit
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


        return html;

      }


      /* ========================================================
         RENDER COMPANIES
      ======================================================== */

      function renderCompanies(
        state
      ) {

        const companies =
          Array.isArray(
            state.companies
          )
            ? state.companies
            : [];


        if (!companies.length) {

          return `

            <div class="section">

              <div class="sectionTitle">
                🏛️ Your Companies
              </div>

              <div class="notice">

                You don't own a company yet.

                <br>

                Build enough capital and
                start your first business.

              </div>

            </div>

          `;

        }


        let html = `

          <div class="section">

            <div class="sectionTitle">
              🏛️ Your Companies
            </div>

            <div class="cards">

        `;


        companies.forEach(
          function (company) {

            const employees =
              Array.isArray(
                company.employees
              )
                ? company.employees.length
                : 0;


            const companyCash =
              Number(
                company.finance?.cash ??
                company.cash ??
                0
              );


            const revenue =
              Number(
                company.finance?.totalRevenue ??
                company.totalRevenue ??
                0
              );


            const expenses =
              Number(
                company.finance?.totalExpenses ??
                company.totalExpenses ??
                0
              );


            const profit =
              Number(
                company.finance?.profit ??
                (
                  revenue -
                  expenses
                )
              );


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

                  <span>
                    Status
                  </span>

                  <strong>
                    ${escapeHTML(
                      company.status ||
                      "Setup Required"
                    )}
                  </strong>

                </div>


                <div class="row">

                  <span>
                    Company Cash
                  </span>

                  <strong>
                    ${money(
                      companyCash
                    )}
                  </strong>

                </div>


                <div class="row">

                  <span>
                    Revenue
                  </span>

                  <strong>
                    ${money(
                      revenue
                    )}
                  </strong>

                </div>


                <div class="row">

                  <span>
                    Expenses
                  </span>

                  <strong>
                    ${money(
                      expenses
                    )}
                  </strong>

                </div>


                <div class="row">

                  <span>
                    Profit
                  </span>

                  <strong>
                    ${money(
                      profit
                    )}
                  </strong>

                </div>


                <div class="row">

                  <span>
                    Employees
                  </span>

                  <strong>
                    ${employees}
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


        return html;

      }


      /* ========================================================
         RENDER EVERYTHING
      ======================================================== */

      function renderCareer() {

        const content =
          document.getElementById(
            "careerContent"
          );


        if (!content) {
          return;
        }


        const state =
          getState();


        const player =
          state?.player || {};


        let html = "";


        html +=
          renderCareerStatus(
            player
          );


        html +=
          renderJobMarket(
            player
          );


        html +=
          renderFinance(
            player
          );


        html +=
          renderBusinessMarket();


        html +=
          renderCompanies(
            state
          );


        content.innerHTML =
          html;


        bindEvents();

      }


      /* ========================================================
         BIND EVENTS
      ======================================================== */

      function bindEvents() {

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

                  applyJob(
                    button.dataset.jobId
                  );

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
                      function (
                        item
                      ) {

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


      /* ========================================================
         REFRESH
      ======================================================== */

      function refresh() {

        updateStats();

        renderCareer();

      }


      /* ========================================================
         OPEN / CLOSE
      ======================================================== */

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


      /* ========================================================
         GAME STATE EVENTS
      ======================================================== */

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
        "EmpireCareerJobAccepted",
        function () {

          if (overlay) {
            refresh();
          }

        }
      );


      window.addEventListener(
        "EmpireCareerPromoted",
        function () {

          if (overlay) {
            refresh();
          }

        }
      );


      window.addEventListener(
        "EmpireCareerResigned",
        function () {

          if (overlay) {
            refresh();
          }

        }
      );


      window.addEventListener(
        "EmpireCareerWorkDay",
        function () {

          if (overlay) {
            refresh();
          }

        }
      );


      window.addEventListener(
        "EmpireSkillImproved",
        function () {

          if (overlay) {
            refresh();
          }

        }
      );


      window.addEventListener(
        "EmpireDayAdvanced",
        function () {

          if (overlay) {
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


      /* ========================================================
         PUBLIC API
      ======================================================== */

      window.EmpireCareerBusinessUI = {

        open,

        close,

        refresh,

        workDay:
          workOneDay,

        saveMoney,

        withdrawSavings,

        startBusiness,

        /*
         * Compatibility:
         * UI consumers can still access jobs/businesses.
         */

        get jobs() {

          return Career.jobs || {};

        },

        businesses:
          BUSINESSES

      };


      /* ========================================================
         INITIALIZE
      ======================================================== */

      createUI();

      refresh();


      console.log(
        "Empire Rush: Career + Business UI connected to central Career and GameState."
      );

    }

  );

})();
