(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH
   * BUSINESS OPERATIONS SYSTEM
   *
   * Company
   *   ↓
   * Hiring
   *   ↓
   * Payroll
   *   ↓
   * Operations
   *   ↓
   * Revenue
   *   ↓
   * Expenses
   *   ↓
   * Profit
   *   ↓
   * Compliance
   *   ↓
   * Expansion
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

    let panel = null;


    /* ============================================================
       EMPLOYEE DATABASE
       ============================================================ */

    const EMPLOYEE_TYPES = [

      {
        id: "assistant",
        title: "Business Assistant",
        salary: 16000,
        skill: 25,
        productivity: 1.0
      },

      {
        id: "sales",
        title: "Sales Executive",
        salary: 22000,
        skill: 35,
        productivity: 1.15
      },

      {
        id: "accountant",
        title: "Accountant",
        salary: 28000,
        skill: 45,
        productivity: 1.10
      },

      {
        id: "manager",
        title: "Operations Manager",
        salary: 45000,
        skill: 60,
        productivity: 1.35
      },

      {
        id: "developer",
        title: "Software Developer",
        salary: 50000,
        skill: 65,
        productivity: 1.40
      }

    ];


    /* ============================================================
       UTILITIES
       ============================================================ */

    function getState() {

      return Game.getState
        ? Game.getState()
        : Game.state;

    }


    function save() {

      if (Game.save) {
        Game.save();
      }

    }


    function refreshEvent() {

      window.dispatchEvent(
        new CustomEvent(
          "EmpireGameStateChanged"
        )
      );

    }


    function money(value) {

      return "₹" +
        Math.round(
          Number(value) || 0
        ).toLocaleString("en-IN");

    }


    function getCompanies() {

      const s = getState();

      if (!s) {
        return [];
      }

      if (!s.companies) {
        s.companies = [];
      }

      return s.companies;

    }


    function getEmployees(company) {

      if (!company.employees) {
        company.employees = [];
      }

      return company.employees;

    }


    /* ============================================================
       COMPANY OPERATING PROFIT
       ============================================================ */

    function calculateCompany(company) {

      const employees =
        getEmployees(company);


      let salaryCost = 0;

      employees.forEach(function (employee) {

        salaryCost +=
          Number(
            employee.salary || 0
          );

      });


      const baseRevenue =
        Number(
          company.expectedRevenue || 0
        );


      const productivity =
        employees.length
          ? employees.reduce(
              function (total, employee) {

                return total +
                  Number(
                    employee.productivity || 1
                  );

              },
              0
            ) / employees.length
          : 0.55;


      const revenue =
        Math.round(
          baseRevenue *
          productivity
        );


      const fixedExpense =
        Number(
          company.monthlyExpense || 0
        );


      const totalExpense =
        fixedExpense +
        salaryCost;


      const profit =
        revenue -
        totalExpense;


      company.revenue =
        revenue;

      company.expenses =
        totalExpense;

      company.profit =
        profit;


      if (profit > 0) {

        company.valuation =
          Math.max(
            Number(
              company.valuation ||
              company.setupCost ||
              0
            ),
            Math.round(
              profit * 24
            )
          );

      }


      return {

        revenue,
        salaryCost,
        fixedExpense,
        totalExpense,
        profit

      };

    }


    /* ============================================================
       HIRE EMPLOYEE
       ============================================================ */

    function hireEmployee(
      company,
      employeeType
    ) {

      const s = getState();

      if (!s) {
        return;
      }


      const employees =
        getEmployees(company);


      const joiningCost =
        Math.round(
          employeeType.salary * 0.25
        );


      const availableCash =
        Number(s.cash || 0);


      if (
        availableCash <
        joiningCost
      ) {

        alert(
          "Not enough cash for hiring cost.\n\n" +
          "Required: " +
          money(joiningCost) +
          "\nAvailable: " +
          money(availableCash)
        );

        return;

      }


      const confirmed =
        confirm(

          "Hire " +
          employeeType.title +
          "?\n\n" +

          "Monthly Salary: " +
          money(
            employeeType.salary
          ) +
          "\n" +

          "Hiring Cost: " +
          money(
            joiningCost
          )

        );


      if (!confirmed) {
        return;
      }


      s.cash -=
        joiningCost;


      const employee = {

        id:
          "employee_" +
          Date.now() +
          "_" +
          Math.floor(
            Math.random() * 10000
          ),

        name:
          employeeType.title,

        role:
          employeeType.title,

        salary:
          employeeType.salary,

        skill:
          employeeType.skill,

        productivity:
          employeeType.productivity,

        morale:
          75,

        performance:
          employeeType.skill,

        status:
          "Working",

        joinedDay:
          s.world
            ? s.world.day
            : 1

      };


      employees.push(
        employee
      );


      /*
       * Global employee list.
       */

      if (!s.employees) {
        s.employees = [];
      }


      s.employees.push(
        employee
      );


      window.dispatchEvent(

        new CustomEvent(
          "EmpireEmployeeHired",
          {
            detail: {
              company,
              employee
            }
          }
        )

      );


      save();
      refreshEvent();
      render();


      alert(
        "Employee hired successfully.\n\n" +
        employeeType.title
      );

    }


    /* ============================================================
       PAYROLL
       ============================================================ */

    function payPayroll(company) {

      const s = getState();

      if (!s) {
        return;
      }


      const employees =
        getEmployees(company);


      if (!employees.length) {

        alert(
          "No employees to pay."
        );

        return;

      }


      let payroll =
        0;


      employees.forEach(
        function (employee) {

          payroll +=
            Number(
              employee.salary || 0
            );

        }
      );


      if (
        Number(s.cash || 0) <
        payroll
      ) {

        company.status =
          "Payroll Risk";


        employees.forEach(
          function (employee) {

            employee.morale =
              Math.max(
                0,
                Number(
                  employee.morale || 0
                ) - 15
              );

          }
        );


        save();
        refreshEvent();
        render();


        alert(
          "⚠️ Payroll failure!\n\n" +
          "Required: " +
          money(payroll) +
          "\nAvailable: " +
          money(s.cash) +
          "\n\nEmployee morale has decreased."
        );

        return;

      }


      s.cash -=
        payroll;


      company.lastPayrollDay =
        s.world
          ? s.world.day
          : 1;


      employees.forEach(
        function (employee) {

          employee.morale =
            Math.min(
              100,
              Number(
                employee.morale || 0
              ) + 5
            );

        }
      );


      company.status =
        "Operating";


      save();
      refreshEvent();
      render();


      alert(
        "Payroll completed.\n\n" +
        "Total paid: " +
        money(payroll)
      );

    }


    /* ============================================================
       RUN OPERATIONS
       ============================================================ */

    function runOperations(company) {

      const s = getState();

      if (!s) {
        return;
      }


      const result =
        calculateCompany(
          company
        );


      /*
       * Daily business revenue.
       */

      const dailyRevenue =
        Math.max(
          0,
          Math.round(
            result.revenue / 30
          )
        );


      /*
       * Daily operating expense.
       */

      const dailyExpense =
        Math.max(
          0,
          Math.round(
            result.fixedExpense / 30
          )
        );


      const dailyProfit =
        dailyRevenue -
        dailyExpense;


      s.cash =
        Number(s.cash || 0) +
        dailyProfit;


      /*
       * Business experience.
       */

      company.operatingDays =
        Number(
          company.operatingDays || 0
        ) + 1;


      /*
       * Performance growth.
       */

      getEmployees(company)
        .forEach(
          function (employee) {

            employee.performance =
              Math.min(
                100,
                Number(
                  employee.performance || 0
                ) + 0.1
              );

          }
        );


      company.status =
        "Operating";


      save();
      refreshEvent();
      render();

    }


    /* ============================================================
       COMPLIANCE
       ============================================================ */

    function improveCompliance(
      company
    ) {

      const s = getState();

      if (!s) {
        return;
      }


      if (!company.compliance) {

        company.compliance = {

          registration: false,
          tax: false,
          bankAccount: false,
          license: false,
          accounting: false

        };

      }


      const options = [

        {
          key:
            "registration",

          name:
            "Company Registration",

          cost:
            5000

        },

        {
          key:
            "tax",

          name:
            "Tax Registration",

          cost:
            3000

        },

        {
          key:
            "bankAccount",

          name:
            "Business Bank Account",

          cost:
            2000

        },

        {
          key:
            "license",

          name:
            "Business License",

          cost:
            4000

        },

        {
          key:
            "accounting",

          name:
            "Accounting System",

          cost:
            6000

        }

      ];


      const pending =
        options.filter(
          function (option) {

            return !company
              .compliance[
                option.key
              ];

          }
        );


      if (!pending.length) {

        alert(
          "All major compliance tasks are complete."
        );

        return;

      }


      const option =
        pending[0];


      if (
        Number(s.cash || 0) <
        option.cost
      ) {

        alert(
          "Not enough cash.\n\n" +
          option.name +
          " requires " +
          money(option.cost)
        );

        return;

      }


      const confirmed =
        confirm(

          option.name +
          "\n\nCost: " +
          money(option.cost) +
          "\n\nComplete this requirement?"

        );


      if (!confirmed) {
        return;
      }


      s.cash -=
        option.cost;


      company.compliance[
        option.key
      ] = true;


      save();
      refreshEvent();
      render();


      alert(
        "✅ " +
        option.name +
        " completed."
      );

    }


    /* ============================================================
       COMPANY LEVEL
       ============================================================ */

    function upgradeCompany(
      company
    ) {

      const s = getState();

      if (!s) {
        return;
      }


      const level =
        Number(
          company.level || 1
        );


      const upgradeCost =
        Math.round(
          100000 *
          Math.pow(
            2,
            level - 1
          )
        );


      if (
        Number(s.cash || 0) <
        upgradeCost
      ) {

        alert(
          "Upgrade requires " +
          money(upgradeCost)
        );

        return;

      }


      const confirmed =
        confirm(

          "Upgrade company to Level " +
          (level + 1) +
          "?\n\nCost: " +
          money(upgradeCost)

        );


      if (!confirmed) {
        return;
      }


      s.cash -=
        upgradeCost;


      company.level =
        level + 1;


      company.expectedRevenue =
        Math.round(
          Number(
            company.expectedRevenue || 0
          ) * 1.25
        );


      company.valuation =
        Math.round(
          Number(
            company.valuation || 0
          ) * 1.3
        );


      save();
      refreshEvent();
      render();


      alert(
        "🏢 Company upgraded!\n\n" +
        "New Level: " +
        company.level
      );

    }


    /* ============================================================
       COMPANY PANEL
       ============================================================ */

    function renderCompany(
      company
    ) {

      const result =
        calculateCompany(
          company
        );


      const employees =
        getEmployees(company);


      const compliance =
        company.compliance ||
        {};


      const completed =
        [
          compliance.registration,
          compliance.tax,
          compliance.bankAccount,
          compliance.license,
          compliance.accounting
        ]
        .filter(Boolean)
        .length;


      let html = `

        <div class="bo-company">

          <div class="bo-company-header">

            <div>

              <h2>
                ${company.name}
              </h2>

              <div class="bo-muted">
                ${company.category || "Business"}
              </div>

            </div>

            <div class="bo-status">
              ${company.status || "Operating"}
            </div>

          </div>


          <div class="bo-metrics">

            <div>
              <small>
                Revenue
              </small>
              <strong>
                ${money(result.revenue)}
              </strong>
            </div>

            <div>
              <small>
                Expenses
              </small>
              <strong>
                ${money(result.totalExpense)}
              </strong>
            </div>

            <div>
              <small>
                Profit
              </small>
              <strong>
                ${money(result.profit)}
              </strong>
            </div>

            <div>
              <small>
                Valuation
              </small>
              <strong>
                ${money(company.valuation)}
              </strong>
            </div>

          </div>


          <div class="bo-section">

            <h3>
              Operations
            </h3>

            <div class="bo-actions">

              <button
                class="bo-action bo-green"
                data-run="${company.id}">

                RUN OPERATIONS

              </button>

              <button
                class="bo-action"
                data-payroll="${company.id}">

                PAYROLL

              </button>

              <button
                class="bo-action bo-gold"
                data-upgrade="${company.id}">

                UPGRADE

              </button>

            </div>

          </div>


          <div class="bo-section">

            <h3>
              Employees
              (${employees.length})
            </h3>


            <div class="bo-employee-list">

      `;


      if (!employees.length) {

        html += `

          <div class="bo-empty">
            No employees yet.
            Hire your first employee.
          </div>

        `;

      }


      employees.forEach(
        function (employee) {

          html += `

            <div class="bo-employee">

              <div>

                <strong>
                  ${employee.name}
                </strong>

                <div class="bo-muted">
                  ${employee.role}
                </div>

              </div>

              <div>

                <strong>
                  ${money(employee.salary)}
                </strong>

                <div class="bo-muted">
                  Morale:
                  ${Math.round(
                    employee.morale
                  )}
                </div>

              </div>

            </div>

          `;

        }
      );


      html += `

            </div>

          </div>


          <div class="bo-section">

            <h3>
              Hire Employee
            </h3>

            <div class="bo-hiring-grid">

      `;


      EMPLOYEE_TYPES.forEach(
        function (type) {

          html += `

            <div class="bo-hire-card">

              <strong>
                ${type.title}
              </strong>

              <div class="bo-muted">
                Salary:
                ${money(type.salary)}
              </div>

              <div class="bo-muted">
                Skill:
                ${type.skill}
              </div>

              <button
                class="bo-action"
                data-hire="${company.id}"
                data-type="${type.id}">

                HIRE

              </button>

            </div>

          `;

        }
      );


      html += `

            </div>

          </div>


          <div class="bo-section">

            <h3>
              Compliance
            </h3>

            <div class="bo-compliance">

              <div>
                ${compliance.registration ? "✅" : "⬜"}
                Registration
              </div>

              <div>
                ${compliance.tax ? "✅" : "⬜"}
                Tax Registration
              </div>

              <div>
                ${compliance.bankAccount ? "✅" : "⬜"}
                Bank Account
              </div>

              <div>
                ${compliance.license ? "✅" : "⬜"}
                Business License
              </div>

              <div>
                ${compliance.accounting ? "✅" : "⬜"}
                Accounting
              </div>

            </div>


            <div class="bo-progress">

              <div
                class="bo-progress-fill"
                style="
                  width:${completed * 20}%;
                ">
              </div>

            </div>


            <button
              class="bo-action bo-compliance-btn"
              data-compliance="${company.id}">

              COMPLETE NEXT REQUIREMENT

            </button>

          </div>

        </div>

      `;


      return html;

    }


    /* ============================================================
       MAIN RENDER
       ============================================================ */

    function render() {

      if (!panel) {
        return;
      }


      const companies =
        getCompanies();


      const s =
        getState();


      let html = `

        <div class="bo-backdrop"></div>

        <div class="bo-window">

          <button
            class="bo-close"
            id="boClose">
            ×
          </button>


          <h1>
            🏢 Business Operations
          </h1>

          <div class="bo-subtitle">
            Manage your companies,
            employees, payroll and growth.
          </div>


          <div class="bo-topstats">

            <div>
              <small>
                Personal Cash
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
                ${companies.length}
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


      if (!companies.length) {

        html += `

          <div class="bo-empty-main">

            <div class="bo-empty-icon">
              🏗️
            </div>

            <h2>
              No Company Yet
            </h2>

            <p>
              Build enough capital through
              your career and start your
              first business.
            </p>

          </div>

        `;

      } else {

        companies.forEach(
          function (company) {

            html +=
              renderCompany(
                company
              );

          }
        );

      }


      html += `

        </div>

      `;


      panel.innerHTML =
        html;


      document
        .getElementById(
          "boClose"
        )
        .onclick =
        close;


      /*
       * Operations
       */

      panel
        .querySelectorAll(
          "[data-run]"
        )
        .forEach(
          function (button) {

            button.onclick =
              function () {

                const company =
                  companies.find(
                    c =>
                      c.id ===
                      button.dataset.run
                  );

                if (company) {

                  runOperations(
                    company
                  );

                }

              };

          }
        );


      /*
       * Payroll
       */

      panel
        .querySelectorAll(
          "[data-payroll]"
        )
        .forEach(
          function (button) {

            button.onclick =
              function () {

                const company =
                  companies.find(
                    c =>
                      c.id ===
                      button.dataset.payroll
                  );

                if (company) {

                  payPayroll(
                    company
                  );

                }

              };

          }
        );


      /*
       * Upgrade
       */

      panel
        .querySelectorAll(
          "[data-upgrade]"
        )
        .forEach(
          function (button) {

            button.onclick =
              function () {

                const company =
                  companies.find(
                    c =>
                      c.id ===
                      button.dataset.upgrade
                  );

                if (company) {

                  upgradeCompany(
                    company
                  );

                }

              };

          }
        );


      /*
       * Hiring
       */

      panel
        .querySelectorAll(
          "[data-hire]"
        )
        .forEach(
          function (button) {

            button.onclick =
              function () {

                const company =
                  companies.find(
                    c =>
                      c.id ===
                      button.dataset.hire
                  );


                const type =
                  EMPLOYEE_TYPES.find(
                    t =>
                      t.id ===
                      button.dataset.type
                  );


                if (
                  company &&
                  type
                ) {

                  hireEmployee(
                    company,
                    type
                  );

                }

              };

          }
        );


      /*
       * Compliance
       */

      panel
        .querySelectorAll(
          "[data-compliance]"
        )
        .forEach(
          function (button) {

            button.onclick =
              function () {

                const company =
                  companies.find(
                    c =>
                      c.id ===
                      button.dataset.compliance
                  );


                if (company) {

                  improveCompliance(
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
       CREATE PANEL
       ============================================================ */

    function create() {

      if (
        document.getElementById(
          "businessOperationsUI"
        )
      ) {

        panel =
          document.getElementById(
            "businessOperationsUI"
          );

        return;

      }


      const style =
        document.createElement(
          "style"
        );


      style.textContent = `

        #businessOperationsUI {

          position:fixed;
          inset:0;
          z-index:99998;
          display:none;
          color:#fff;
          font-family:Arial,Helvetica,sans-serif;

        }


        #businessOperationsUI
        .bo-backdrop {

          position:absolute;
          inset:0;
          background:
            rgba(0,0,0,.78);
          backdrop-filter:
            blur(8px);

        }


        #businessOperationsUI
        .bo-window {

          position:absolute;
          left:50%;
          top:50%;

          transform:
            translate(-50%,-50%);

          width:
            min(1000px,94vw);

          max-height:
            90vh;

          overflow-y:auto;

          background:
            linear-gradient(
              145deg,
              #0d1520,
              #1b2a3a
            );

          border:
            1px solid
            rgba(255,255,255,.15);

          border-radius:22px;

          padding:24px;

          box-shadow:
            0 30px 100px
            rgba(0,0,0,.7);

        }


        #businessOperationsUI
        .bo-close {

          position:absolute;
          right:18px;
          top:15px;

          width:40px;
          height:40px;

          border:0;
          border-radius:50%;

          background:#293746;
          color:white;

          font-size:22px;

          cursor:pointer;

        }


        #businessOperationsUI h1 {

          margin:
            0 0 5px;

          font-size:28px;

        }


        .bo-subtitle {

          color:#96a7ba;
          margin-bottom:20px;

        }


        .bo-topstats {

          display:grid;

          grid-template-columns:
            repeat(4,1fr);

          gap:10px;

          margin-bottom:22px;

        }


        .bo-topstats > div {

          background:
            rgba(255,255,255,.07);

          padding:14px;

          border-radius:13px;

        }


        .bo-topstats small {

          display:block;
          color:#91a3b7;
          margin-bottom:5px;

        }


        .bo-topstats strong {

          font-size:18px;

        }


        .bo-company {

          background:
            rgba(255,255,255,.055);

          border:
            1px solid
            rgba(255,255,255,.08);

          border-radius:17px;

          padding:18px;

          margin-bottom:18px;

        }


        .bo-company-header {

          display:flex;

          justify-content:
            space-between;

          align-items:center;

        }


        .bo-company-header h2 {

          margin:
            0 0 4px;

        }


        .bo-status {

          background:#23764e;

          padding:
            7px 11px;

          border-radius:9px;

          font-size:12px;

          font-weight:bold;

        }


        .bo-metrics {

          display:grid;

          grid-template-columns:
            repeat(4,1fr);

          gap:10px;

          margin:
            16px 0;

        }


        .bo-metrics > div {

          background:
            rgba(0,0,0,.18);

          border-radius:11px;

          padding:12px;

        }


        .bo-metrics small {

          display:block;
          color:#91a3b7;
          margin-bottom:5px;

        }


        .bo-section {

          margin-top:20px;

        }


        .bo-section h3 {

          margin:
            0 0 11px;

        }


        .bo-actions {

          display:flex;
          gap:9px;

        }


        .bo-action {

          border:0;
          border-radius:10px;

          padding:
            10px 13px;

          background:#3478f6;

          color:white;

          font-weight:bold;

          cursor:pointer;

        }


        .bo-action:hover {

          filter:
            brightness(1.12);

        }


        .bo-green {

          background:#267b50;

        }


        .bo-gold {

          background:#806323;

        }


        .bo-employee-list {

          display:flex;
          flex-direction:column;
          gap:7px;

        }


        .bo-employee {

          display:flex;

          justify-content:
            space-between;

          background:
            rgba(255,255,255,.05);

          padding:11px;

          border-radius:10px;

        }


        .bo-hiring-grid {

          display:grid;

          grid-template-columns:
            repeat(3,1fr);

          gap:9px;

        }


        .bo-hire-card {

          background:
            rgba(255,255,255,.05);

          padding:13px;

          border-radius:11px;

        }


        .bo-hire-card
        .bo-action {

          width:100%;
          margin-top:9px;

        }


        .bo-muted {

          color:#93a4b7;

          font-size:13px;

          margin-top:4px;

        }


        .bo-compliance {

          display:grid;

          grid-template-columns:
            repeat(2,1fr);

          gap:8px;

        }


        .bo-compliance > div {

          background:
            rgba(255,255,255,.05);

          padding:10px;

          border-radius:9px;

        }


        .bo-progress {

          height:8px;

          margin:
            12px 0;

          background:#293746;

          border-radius:10px;

          overflow:hidden;

        }


        .bo-progress-fill {

          height:100%;

          background:#4d8cff;

        }


        .bo-compliance-btn {

          width:100%;

        }


        .bo-empty {

          color:#91a3b7;

          padding:15px;

          background:
            rgba(255,255,255,.04);

          border-radius:10px;

        }


        .bo-empty-main {

          text-align:center;

          padding:70px 20px;

          color:#95a6b9;

        }


        .bo-empty-icon {

          font-size:55px;

        }


        @media(max-width:700px) {

          .bo-topstats {

            grid-template-columns:
              repeat(2,1fr);

          }

          .bo-metrics {

            grid-template-columns:
              repeat(2,1fr);

          }

          .bo-hiring-grid {

            grid-template-columns:1fr;

          }

          .bo-actions {

            flex-direction:column;

          }

          .bo-compliance {

            grid-template-columns:1fr;

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
        "businessOperationsUI";


      document.body.appendChild(
        panel
      );

    }


    /* ============================================================
       BUTTON
       ============================================================ */

    function createButton() {

      if (
        document.getElementById(
          "businessOperationsButton"
        )
      ) {
        return;
      }


      const button =
        document.createElement(
          "button"
        );


      button.id =
        "businessOperationsButton";


      button.textContent =
        "BUSINESS";


      button.style.cssText = `

        position:fixed;
        right:20px;
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

      `;


      button.onclick =
        open;


      document.body.appendChild(
        button
      );

    }


    /* ============================================================
       STATE CHANGE
       ============================================================ */

    window.addEventListener(
      "EmpireGameStateChanged",
      function () {

        if (
          panel &&
          panel.style.display !==
            "none"
        ) {

          render();

        }

      }
    );


    /* ============================================================
       PUBLIC API
       ============================================================ */

    window.EmpireBusinessOperations = {

      open,
      close,
      render,

      hireEmployee,
      payPayroll,
      runOperations,
      improveCompliance,
      upgradeCompany,

      calculateCompany

    };


    /* ============================================================
       INITIALIZE
       ============================================================ */

    create();
    createButton();

  });

})();
