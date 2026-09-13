(function () {
  "use strict";

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

    const JOBS = [
      {
        id: "office_assistant",
        title: "Office Assistant",
        company: "Local Business",
        salary: 18000,
        experience: 0,
        skill: "Communication",
        description: "Entry-level job. Stable income with low requirements."
      },
      {
        id: "sales_executive",
        title: "Sales Executive",
        company: "Retail Company",
        salary: 25000,
        experience: 0,
        skill: "Sales",
        description: "Higher salary with performance-based growth."
      },
      {
        id: "junior_executive",
        title: "Junior Executive",
        company: "Corporate Company",
        salary: 30000,
        experience: 0,
        skill: "Management",
        description: "Corporate career path with strong promotion potential."
      },
      {
        id: "software_developer",
        title: "Junior Software Developer",
        company: "Technology Company",
        salary: 45000,
        experience: 0,
        skill: "Technology",
        description: "High-income technical career."
      },
      {
        id: "accountant",
        title: "Junior Accountant",
        company: "Finance Company",
        salary: 32000,
        experience: 0,
        skill: "Finance",
        description: "Finance-focused career with stable progression."
      }
    ];

    const BUSINESSES = [
      {
        id: "freelance",
        name: "Freelance Services",
        category: "Services",
        cost: 5000,
        monthlyExpense: 2000,
        expectedRevenue: 12000,
        employees: 0,
        risk: "Low"
      },
      {
        id: "home_food",
        name: "Home Food Business",
        category: "Food",
        cost: 25000,
        monthlyExpense: 9000,
        expectedRevenue: 30000,
        employees: 1,
        risk: "Medium"
      },
      {
        id: "retail",
        name: "Small Retail Store",
        category: "Retail",
        cost: 100000,
        monthlyExpense: 35000,
        expectedRevenue: 80000,
        employees: 2,
        risk: "Medium"
      },
      {
        id: "restaurant",
        name: "Small Restaurant",
        category: "Food & Hospitality",
        cost: 300000,
        monthlyExpense: 100000,
        expectedRevenue: 220000,
        employees: 4,
        risk: "High"
      },
      {
        id: "software",
        name: "Software Startup",
        category: "Technology",
        cost: 150000,
        monthlyExpense: 50000,
        expectedRevenue: 140000,
        employees: 2,
        risk: "High"
      },
      {
        id: "manufacturing",
        name: "Small Manufacturing Unit",
        category: "Manufacturing",
        cost: 750000,
        monthlyExpense: 250000,
        expectedRevenue: 500000,
        employees: 8,
        risk: "Very High"
      }
    ];

    let overlay = null;

    function money(value) {
      return "₹" + Math.round(value || 0).toLocaleString("en-IN");
    }

    function getState() {
      return Game.getState ? Game.getState() : Game.state;
    }

    function save() {
      if (Game.save) Game.save();
    }

    function emit() {
      window.dispatchEvent(new CustomEvent("EmpireGameStateChanged"));
    }

    function createUI() {

      if (document.getElementById("careerBusinessUI")) return;

      const style = document.createElement("style");

      style.textContent = `
        #careerBusinessUI {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: none;
          font-family: Arial, sans-serif;
          color: #fff;
        }

        #careerBusinessUI .cb-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,.72);
          backdrop-filter: blur(7px);
        }

        #careerBusinessUI .cb-window {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%);
          width: min(920px,92vw);
          max-height: 88vh;
          overflow-y: auto;
          background: linear-gradient(145deg,#10151f,#182231);
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 22px;
          box-shadow: 0 25px 80px rgba(0,0,0,.65);
          padding: 24px;
        }

        #careerBusinessUI h1 {
          margin: 0 0 5px;
          font-size: 27px;
        }

        #careerBusinessUI .subtitle {
          color: #9ca9ba;
          margin-bottom: 20px;
        }

        #careerBusinessUI .close {
          position:absolute;
          right:18px;
          top:15px;
          border:0;
          background:#293444;
          color:white;
          width:38px;
          height:38px;
          border-radius:50%;
          font-size:20px;
          cursor:pointer;
        }

        #careerBusinessUI .stats {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:10px;
          margin-bottom:20px;
        }

        #careerBusinessUI .stat {
          background:#202b3a;
          border-radius:13px;
          padding:13px;
        }

        #careerBusinessUI .stat small {
          display:block;
          color:#91a0b4;
          margin-bottom:5px;
        }

        #careerBusinessUI .stat strong {
          font-size:17px;
        }

        #careerBusinessUI .section-title {
          font-size:20px;
          font-weight:bold;
          margin:22px 0 12px;
        }

        #careerBusinessUI .cards {
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:12px;
        }

        #careerBusinessUI .card {
          background:#202b3a;
          border:1px solid rgba(255,255,255,.08);
          border-radius:15px;
          padding:16px;
        }

        #careerBusinessUI .card h3 {
          margin:0 0 5px;
        }

        #careerBusinessUI .muted {
          color:#96a5b8;
          font-size:13px;
        }

        #careerBusinessUI .salary {
          font-size:21px;
          font-weight:bold;
          margin:10px 0;
        }

        #careerBusinessUI .business-profit {
          font-size:15px;
          margin:9px 0;
        }

        #careerBusinessUI button.action {
          width:100%;
          border:0;
          border-radius:10px;
          padding:11px;
          background:#3478f6;
          color:white;
          font-weight:bold;
          cursor:pointer;
        }

        #careerBusinessUI button.action:hover {
          filter:brightness(1.15);
        }

        #careerBusinessUI button.action:disabled {
          opacity:.4;
          cursor:not-allowed;
        }

        #careerBusinessUI .danger {
          background:#8d3030 !important;
        }

        #careerBusinessUI .success {
          background:#247a50 !important;
        }

        #careerBusinessUI .notice {
          background:#1d3c5c;
          border-radius:12px;
          padding:13px;
          margin:12px 0;
          color:#c8e5ff;
        }

        #careerButton {
          position:fixed;
          left:20px;
          bottom:72px;
          z-index:5000;
          border:1px solid rgba(255,255,255,.2);
          background:rgba(20,28,40,.92);
          color:white;
          border-radius:12px;
          padding:11px 16px;
          font-weight:bold;
          cursor:pointer;
          box-shadow:0 6px 20px rgba(0,0,0,.3);
        }

        @media(max-width:650px) {
          #careerBusinessUI .stats {
            grid-template-columns:repeat(2,1fr);
          }

          #careerBusinessUI .cards {
            grid-template-columns:1fr;
          }

          #careerBusinessUI .cb-window {
            padding:18px;
          }
        }
      `;

      document.head.appendChild(style);

      overlay = document.createElement("div");
      overlay.id = "careerBusinessUI";

      overlay.innerHTML = `
        <div class="cb-backdrop"></div>

        <div class="cb-window">

          <button class="close" id="cbClose">×</button>

          <h1>Empire Career & Business</h1>
          <div class="subtitle">
            Start from zero. Build your career. Save capital. Build your empire.
          </div>

          <div class="stats">
            <div class="stat">
              <small>Cash</small>
              <strong id="cbCash">₹0</strong>
            </div>

            <div class="stat">
              <small>Savings</small>
              <strong id="cbSavings">₹0</strong>
            </div>

            <div class="stat">
              <small>Job</small>
              <strong id="cbJob">Unemployed</strong>
            </div>

            <div class="stat">
              <small>Day</small>
              <strong id="cbDay">1</strong>
            </div>
          </div>

          <div id="cbContent"></div>

        </div>
      `;

      document.body.appendChild(overlay);

      const button = document.createElement("button");
      button.id = "careerButton";
      button.textContent = "CAREER";
      document.body.appendChild(button);

      button.onclick = open;

      document.getElementById("cbClose").onclick = close;
      document.querySelector("#careerBusinessUI .cb-backdrop").onclick = close;
    }

    function updateStats() {

      const s = getState();

      if (!s) return;

      const cash = document.getElementById("cbCash");
      const savings = document.getElementById("cbSavings");
      const job = document.getElementById("cbJob");
      const day = document.getElementById("cbDay");

      if (cash) cash.textContent = money(s.cash);

      if (savings) savings.textContent = money(s.savings);

      if (job) {
        job.textContent =
          s.currentJob === "Unemployed"
            ? "Unemployed"
            : (s.currentJob || "Unemployed");
      }

      if (day) {
        day.textContent = s.world
          ? `Day ${s.world.day}`
          : "Day 1";
      }
    }

    function renderCareer() {

      const content = document.getElementById("cbContent");
      if (!content) return;

      const s = getState();

      let html = `
        <div class="section-title">Career</div>

        <div class="notice">
          Your first objective: get income, control expenses and build enough
          capital to start your first business.
        </div>

        <div class="cards">
      `;

      JOBS.forEach(function (job) {

        const active =
          s.currentJob &&
          s.currentJob.toLowerCase().includes(job.title.toLowerCase());

        html += `
          <div class="card">

            <h3>${job.title}</h3>

            <div class="muted">
              ${job.company}
            </div>

            <div class="salary">
              ${money(job.salary)} / month
            </div>

            <div class="muted">
              Skill: ${job.skill}
            </div>

            <p class="muted">
              ${job.description}
            </p>

            <button
              class="action ${active ? "success" : ""}"
              data-job="${job.id}">
              ${active ? "CURRENT JOB" : "APPLY"}
            </button>

          </div>
        `;
      });

      html += `
        </div>

        <div class="section-title">
          Capital & Business
        </div>

        <div class="notice">
          Available capital:
          <strong>${money(
            (s.cash || 0) + (s.savings || 0)
          )}</strong>
          <br>
          Choose a business that you can realistically afford.
        </div>

        <div class="cards">
      `;

      BUSINESSES.forEach(function (business) {

        const capital =
          (s.cash || 0) +
          (s.savings || 0);

        const affordable =
          capital >= business.cost;

        const profit =
          business.expectedRevenue -
          business.monthlyExpense;

        html += `
          <div class="card">

            <h3>${business.name}</h3>

            <div class="muted">
              ${business.category}
            </div>

            <div class="salary">
              Setup: ${money(business.cost)}
            </div>

            <div class="business-profit">
              Expected monthly revenue:
              <strong>${money(business.expectedRevenue)}</strong>
            </div>

            <div class="business-profit">
              Estimated monthly profit:
              <strong>${money(profit)}</strong>
            </div>

            <div class="muted">
              Employees: ${business.employees}
              · Risk: ${business.risk}
            </div>

            <br>

            <button
              class="action ${affordable ? "success" : ""}"
              data-business="${business.id}"
              ${affordable ? "" : "disabled"}>
              ${
                affordable
                  ? "START BUSINESS"
                  : "CAPITAL REQUIRED"
              }
            </button>

          </div>
        `;
      });

      html += `</div>`;

      content.innerHTML = html;

      document
        .querySelectorAll("[data-job]")
        .forEach(function (button) {

          button.onclick = function () {

            const id = button.dataset.job;

            const job = JOBS.find(
              j => j.id === id
            );

            if (!job) return;

            if (Game.setJob) {

              Game.setJob({
                title: job.title,
                salary: job.salary,
                company: job.company,
                skill: job.skill
              });

            } else {

              s.currentJob = job.title;
              s.salary = job.salary;

              save();
              emit();
            }

            updateStats();
            renderCareer();
          };
        });

      document
        .querySelectorAll("[data-business]")
        .forEach(function (button) {

          button.onclick = function () {

            const id = button.dataset.business;

            const business =
              BUSINESSES.find(
                b => b.id === id
              );

            if (!business) return;

            const capital =
              (s.cash || 0) +
              (s.savings || 0);

            if (capital < business.cost) {
              alert(
                "Not enough capital. Keep working and saving."
              );
              return;
            }

            if (
              !confirm(
                `Start ${business.name} for ${money(
                  business.cost
                )}?`
              )
            ) {
              return;
            }

            let success = false;

            if (Game.startBusiness) {

              success =
                Game.startBusiness({
                  id: business.id,
                  name: business.name,
                  category: business.category,
                  setupCost: business.cost,
                  monthlyExpense: business.monthlyExpense,
                  expectedRevenue: business.expectedRevenue
                });

            } else {

              s.companies = s.companies || [];

              s.companies.push({
                id: "company_" + Date.now(),
                name: business.name,
                type: business.category,
                status: "Operating",
                setupCost: business.cost,
                revenue: business.expectedRevenue,
                expenses: business.monthlyExpense
              });

              let remaining = business.cost;

              if ((s.cash || 0) >= remaining) {
                s.cash -= remaining;
                remaining = 0;
              } else {
                remaining -= s.cash;
                s.cash = 0;
              }

              s.savings =
                Math.max(
                  0,
                  (s.savings || 0) - remaining
                );

              save();
              emit();

              success = true;
            }

            if (success !== false) {

              alert(
                `${business.name} started successfully!`
              );

              updateStats();
              renderCareer();

              window.dispatchEvent(
                new CustomEvent(
                  "EmpireBusinessStarted",
                  {
                    detail: business
                  }
                )
              );
            }
          };
        });
    }

    function open() {

      createUI();

      overlay.style.display = "block";

      updateStats();
      renderCareer();
    }

    function close() {

      if (overlay) {
        overlay.style.display = "none";
      }
    }

    window.addEventListener(
      "EmpireGameStateChanged",
      function () {

        if (
          overlay &&
          overlay.style.display !== "none"
        ) {
          updateStats();
          renderCareer();
        }
      }
    );

    window.EmpireCareerBusinessUI = {
      open,
      close,
      refresh: function () {
        updateStats();
        renderCareer();
      }
    };

    createUI();

  });

})();
