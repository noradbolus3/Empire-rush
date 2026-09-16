(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH
   * BUSINESS-SPECIFIC OPERATIONS
   * ============================================================
   *
   * Every business has its own operating model.
   *
   * FOOD
   * Orders → Kitchen → Customers → Revenue
   *
   * RETAIL
   * Inventory → Customers → Sales → Revenue
   *
   * SOFTWARE
   * Development → Testing → Product → Users → Revenue
   *
   * MANUFACTURING
   * Raw Material → Production → Inventory → Sales
   *
   * SERVICES
   * Clients → Projects → Delivery → Payment
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
    let activeCompanyId = null;


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


    function getCompany() {

      const list =
        companies();

      if (!activeCompanyId) {

        return list[0] || null;

      }

      return list.find(
        function (company) {

          return company.id ===
            activeCompanyId;

        }
      ) || null;

    }


    function ensureOperations(
      company
    ) {

      if (!company.operations) {

        company.operations = {

          orders: 0,

          customers: 0,

          sales: 0,

          production: 0,

          inventory: 0,

          rawMaterial: 0,

          products: 0,

          projects: 0,

          clients: 0,

          completedProjects: 0,

          development: 0,

          testing: 0,

          users: 0,

          reputation: 50,

          quality: 50,

          operationalDays: 0

        };

      }

      return company.operations;

    }


    /* ============================================================
       BUSINESS TYPE
       ============================================================ */

    function typeOf(company) {

      const category =
        String(
          company.category ||
          ""
        ).toLowerCase();


      const name =
        String(
          company.name ||
          ""
        ).toLowerCase();


      if (
        category.includes("food") ||
        category.includes("hospitality") ||
        name.includes("restaurant") ||
        name.includes("food")
      ) {

        return "food";

      }


      if (
        category.includes("retail") ||
        name.includes("retail")
      ) {

        return "retail";

      }


      if (
        category.includes("technology") ||
        name.includes("software") ||
        name.includes("tech")
      ) {

        return "software";

      }


      if (
        category.includes("manufacturing") ||
        name.includes("manufacturing")
      ) {

        return "manufacturing";

      }


      return "services";

    }


    /* ============================================================
       CHECK COMPANY STATUS
       ============================================================ */

    function canOperate(company) {

      if (!company) {
        return false;
      }


      if (
        company.status !==
        "Operating"
      ) {

        alert(
          "This company is not operating yet.\n\n" +
          "Complete Business Setup and Launch first."
        );

        return false;

      }


      return true;

    }


    /* ============================================================
       FOOD BUSINESS
       ============================================================ */

    function runFoodOperation(
      company
    ) {

      if (!canOperate(company)) {
        return;
      }


      const op =
        ensureOperations(
          company
        );


      const employees =
        company.employees
          ? company.employees.length
          : 0;


      /*
       * More employees = more orders
       */

      const orderCapacity =
        Math.max(
          4,
          8 +
          employees * 5
        );


      const orders =
        Math.round(
          orderCapacity *
          (0.8 +
            Math.random() * 0.5)
        );


      const averageOrderValue =
        220;


      const revenue =
        orders *
        averageOrderValue;


      const foodCost =
        Math.round(
          revenue * 0.32
        );


      const operatingCost =
        Math.round(
          revenue * 0.10
        );


      const profit =
        revenue -
        foodCost -
        operatingCost;


      op.orders +=
        orders;

      op.customers +=
        orders;

      op.sales +=
        revenue;

      op.reputation =
        Math.min(
          100,
          op.reputation +
          (orders > 10 ? 0.2 : 0)
        );


      addCompanyCash(
        company,
        profit
      );


      company.revenue =
        Number(
          company.revenue || 0
        ) + revenue;


      company.expenses =
        Number(
          company.expenses || 0
        ) +
        foodCost +
        operatingCost;


      company.profit =
        Number(
          company.revenue
        ) -
        Number(
          company.expenses
        );


      op.operationalDays++;


      save();
      notify();
      render();


      showResult(
        "🍔 FOOD OPERATION",
        [
          "Orders: " +
            orders,

          "Customers: " +
            orders,

          "Revenue: " +
            money(revenue),

          "Food Cost: " +
            money(foodCost),

          "Operating Cost: " +
            money(operatingCost),

          "Profit: " +
            money(profit)

        ]
      );

    }


    /* ============================================================
       RETAIL BUSINESS
       ============================================================ */

    function runRetailOperation(
      company
    ) {

      if (!canOperate(company)) {
        return;
      }


      const op =
        ensureOperations(
          company
        );


      /*
       * Automatically maintain
       * a small amount of inventory.
       */

      if (
        op.inventory <= 0
      ) {

        const inventoryCost =
          15000;


        const s =
          state();


        if (
          Number(s.cash || 0) <
          inventoryCost
        ) {

          alert(
            "⚠️ Inventory shortage.\n\n" +
            "₹15,000 required to restock."
          );

          return;

        }


        s.cash -=
          inventoryCost;


        op.inventory =
          100;

      }


      const customers =
        Math.round(
          12 +
          Math.random() * 15
        );


      const itemsPerCustomer =
        1 +
        Math.random();


      const units =
        Math.max(
          1,
          Math.round(
            customers *
            itemsPerCustomer
          )
        );


      const price =
        850;


      const revenue =
        units *
        price;


      const costOfGoods =
        Math.round(
          revenue * 0.58
        );


      const profit =
        revenue -
        costOfGoods;


      op.customers +=
        customers;

      op.sales +=
        revenue;


      op.inventory =
        Math.max(
          0,
          op.inventory -
          units
        );


      addCompanyCash(
        company,
        profit
      );


      company.revenue =
        Number(
          company.revenue || 0
        ) +
        revenue;


      company.expenses =
        Number(
          company.expenses || 0
        ) +
        costOfGoods;


      company.profit =
        Number(
          company.revenue
        ) -
        Number(
          company.expenses
        );


      op.operationalDays++;


      save();
      notify();
      render();


      showResult(
        "🛒 RETAIL OPERATION",
        [
          "Customers: " +
            customers,

          "Units Sold: " +
            units,

          "Revenue: " +
            money(revenue),

          "Cost of Goods: " +
            money(costOfGoods),

          "Gross Profit: " +
            money(profit),

          "Remaining Inventory: " +
            op.inventory

        ]
      );

    }


    /* ============================================================
       SOFTWARE BUSINESS
       ============================================================ */

    function runSoftwareOperation(
      company
    ) {

      if (!canOperate(company)) {
        return;
      }


      const op =
        ensureOperations(
          company
        );


      /*
       * Development
       */

      if (
        op.development < 100
      ) {

        op.development =
          Math.min(
            100,
            op.development +
            12 +
            Math.random() * 10
          );


        save();
        notify();
        render();


        showResult(
          "💻 PRODUCT DEVELOPMENT",
          [
            "Development Progress: " +
              Math.round(
                op.development
              ) +
              "%",

            "Product is being developed.",

            "Testing and launch will follow."

          ]
        );

        return;

      }


      /*
       * Testing
       */

      if (
        op.testing < 100
      ) {

        op.testing =
          Math.min(
            100,
            op.testing +
            15 +
            Math.random() * 8
          );


        save();
        notify();
        render();


        showResult(
          "🧪 PRODUCT TESTING",
          [
            "Testing Progress: " +
              Math.round(
                op.testing
              ) +
              "%",

            "QA team is testing the product.",

            "Bug fixes and quality checks are active."

          ]
        );

        return;

      }


      /*
       * Product is live.
       */

      const newUsers =
        Math.round(
          10 +
          Math.random() * 30
        );


      const subscription =
        499;


      const revenue =
        newUsers *
        subscription;


      op.users +=
        newUsers;


      op.sales +=
        revenue;


      op.quality =
        Math.min(
          100,
          op.quality +
          0.15
        );


      addCompanyCash(
        company,
        revenue
      );


      company.revenue =
        Number(
          company.revenue || 0
        ) +
        revenue;


      company.profit =
        Number(
          company.revenue
        ) -
        Number(
          company.expenses || 0
        );


      op.operationalDays++;


      save();
      notify();
      render();


      showResult(
        "💻 SOFTWARE OPERATION",
        [
          "New Users: " +
            newUsers,

          "Total Users: " +
            op.users,

          "Revenue: " +
            money(revenue),

          "Product Quality: " +
            Math.round(
              op.quality
            ) +
            "%"

        ]
      );

    }


    /* ============================================================
       MANUFACTURING
       ============================================================ */

    function runManufacturingOperation(
      company
    ) {

      if (!canOperate(company)) {
        return;
      }


      const op =
        ensureOperations(
          company
        );


      const s =
        state();


      /*
       * Raw material purchase.
       */

      if (
        op.rawMaterial < 20
      ) {

        const materialCost =
          30000;


        if (
          Number(s.cash || 0) <
          materialCost
        ) {

          alert(
            "⚠️ Production stopped.\n\n" +
            "Not enough cash for raw materials.\n" +
            "Required: " +
            money(materialCost)
          );

          return;

        }


        s.cash -=
          materialCost;


        op.rawMaterial +=
          100;

      }


      const employees =
        company.employees
          ? company.employees.length
          : 0;


      const productionCapacity =
        Math.max(
          10,
          15 +
          employees * 5
        );


      const units =
        Math.min(
          op.rawMaterial,
          Math.round(
            productionCapacity
          )
        );


      op.rawMaterial -=
        units;


      op.production +=
        units;


      op.inventory +=
        units;


      /*
       * Sell part of production.
       */

      const sold =
        Math.round(
          units * 0.7
        );


      const unitPrice =
        1800;


      const revenue =
        sold *
        unitPrice;


      const productionCost =
        Math.round(
          revenue * 0.55
        );


      const profit =
        revenue -
        productionCost;


      op.inventory =
        Math.max(
          0,
          op.inventory -
          sold
        );


      op.sales +=
        revenue;


      addCompanyCash(
        company,
        profit
      );


      company.revenue =
        Number(
          company.revenue || 0
        ) +
        revenue;


      company.expenses =
        Number(
          company.expenses || 0
        ) +
        productionCost;


      company.profit =
        Number(
          company.revenue
        ) -
        Number(
          company.expenses
        );


      op.operationalDays++;


      save();
      notify();
      render();


      showResult(
        "🏭 MANUFACTURING",
        [
          "Produced: " +
            units +
            " units",

          "Sold: " +
            sold +
            " units",

          "Revenue: " +
            money(revenue),

          "Production Cost: " +
            money(productionCost),

          "Profit: " +
            money(profit),

          "Inventory: " +
            op.inventory +
            " units"

        ]
      );

    }


    /* ============================================================
       SERVICES / FREELANCE
       ============================================================ */

    function runServicesOperation(
      company
    ) {

      if (!canOperate(company)) {
        return;
      }


      const op =
        ensureOperations(
          company
        );


      const employees =
        company.employees
          ? company.employees.length
          : 0;


      const clients =
        Math.max(
          1,
          Math.round(
            1 +
            employees * 0.8 +
            Math.random() * 3
          )
        );


      const projects =
        Math.max(
          1,
          Math.round(
            clients * 0.8
          )
        );


      const projectValue =
        7000;


      const revenue =
        projects *
        projectValue;


      const operatingCost =
        Math.round(
          revenue * 0.20
        );


      const profit =
        revenue -
        operatingCost;


      op.clients +=
        clients;

      op.projects +=
        projects;

      op.completedProjects +=
        projects;

      op.sales +=
        revenue;


      op.reputation =
        Math.min(
          100,
          op.reputation +
          0.3
        );


      addCompanyCash(
        company,
        profit
      );


      company.revenue =
        Number(
          company.revenue || 0
        ) +
        revenue;


      company.expenses =
        Number(
          company.expenses || 0
        ) +
        operatingCost;


      company.profit =
        Number(
          company.revenue
        ) -
        Number(
          company.expenses
        );


      op.operationalDays++;


      save();
      notify();
      render();


      showResult(
        "💼 SERVICES OPERATION",
        [
          "Clients: " +
            clients,

          "Projects Completed: " +
            projects,

          "Revenue: " +
            money(revenue),

          "Operating Cost: " +
            money(operatingCost),

          "Profit: " +
            money(profit),

          "Reputation: " +
            Math.round(
              op.reputation
            )

        ]
      );

    }


    /* ============================================================
       ADD CASH
       ============================================================ */

    function addCompanyCash(
      company,
      amount
    ) {

      /*
       * Company revenue eventually
       * flows into player cash in
       * this browser simulation.
       */

      const s =
        state();


      s.cash =
        Number(
          s.cash || 0
        ) +
        Number(
          amount || 0
        );

    }


    /* ============================================================
       RUN OPERATION
       ============================================================ */

    function runOperation() {

      const company =
        getCompany();


      if (!company) {

        alert(
          "No company available."
        );

        return;

      }


      const type =
        typeOf(
          company
        );


      if (
        type === "food"
      ) {

        runFoodOperation(
          company
        );

        return;

      }


      if (
        type === "retail"
      ) {

        runRetailOperation(
          company
        );

        return;

      }


      if (
        type === "software"
      ) {

        runSoftwareOperation(
          company
        );

        return;

      }


      if (
        type === "manufacturing"
      ) {

        runManufacturingOperation(
          company
        );

        return;

      }


      runServicesOperation(
        company
      );

    }


    /* ============================================================
       RESULT POPUP
       ============================================================ */

    function showResult(
      title,
      lines
    ) {

      const old =
        document.getElementById(
          "businessOperationResult"
        );


      if (old) {
        old.remove();
      }


      const result =
        document.createElement(
          "div"
        );


      result.id =
        "businessOperationResult";


      result.innerHTML = `

        <div class="bor-backdrop"></div>

        <div class="bor-window">

          <h2>
            ${title}
          </h2>

          <div class="bor-lines">

            ${lines.map(
              function (line) {

                return `
                  <div>
                    ${line}
                  </div>
                `;

              }
            ).join("")}

          </div>

          <button
            id="borClose">

            CONTINUE

          </button>

        </div>

      `;


      document.body.appendChild(
        result
      );


      document
        .getElementById(
          "borClose"
        )
        .onclick =
        function () {

          result.remove();

        };

    }


    /* ============================================================
       RENDER
       ============================================================ */

    function render() {

      if (!panel) {
        return;
      }


      const list =
        companies();


      if (!list.length) {

        panel.innerHTML = `

          <div class="bto-backdrop"></div>

          <div class="bto-window">

            <button
              class="bto-close"
              id="btoClose">
              ×
            </button>

            <h1>
              ⚙️ Business Operations
            </h1>

            <div class="bto-empty">

              No company available.

              <br><br>

              Start your first business
              from Career.

            </div>

          </div>

        `;


        document
          .getElementById(
            "btoClose"
          )
          .onclick =
          close;


        return;

      }


      if (!activeCompanyId) {

        activeCompanyId =
          list[0].id;

      }


      const company =
        getCompany();


      const op =
        ensureOperations(
          company
        );


      const type =
        typeOf(
          company
        );


      let typeName =
        "Services";


      if (type === "food") {
        typeName =
          "Food & Hospitality";
      }

      if (type === "retail") {
        typeName =
          "Retail";
      }

      if (type === "software") {
        typeName =
          "Technology";
      }

      if (type === "manufacturing") {
        typeName =
          "Manufacturing";
      }


      let html = `

        <div class="bto-backdrop"></div>

        <div class="bto-window">

          <button
            class="bto-close"
            id="btoClose">
            ×
          </button>


          <h1>
            ⚙️ Business Operations
          </h1>

          <div class="bto-subtitle">

            Run the actual day-to-day
            operations of your company.

          </div>


          <div class="bto-company-selector">

      `;


      list.forEach(
        function (item) {

          html += `

            <button
              class="
                bto-company-tab
                ${
                  item.id ===
                  company.id
                    ? "active"
                    : ""
                }
              "
              data-company="${item.id}">

              ${item.name}

            </button>

          `;

        }
      );


      html += `

          </div>


          <div class="bto-header">

            <div>

              <h2>
                ${company.name}
              </h2>

              <div class="bto-muted">
                ${typeName}
              </div>

            </div>

            <div class="bto-status">
              ${company.status}
            </div>

          </div>


          <div class="bto-metrics">

            <div>
              <small>
                Revenue
              </small>

              <strong>
                ${money(company.revenue)}
              </strong>
            </div>

            <div>
              <small>
                Expenses
              </small>

              <strong>
                ${money(company.expenses)}
              </strong>
            </div>

            <div>
              <small>
                Profit
              </small>

              <strong>
                ${money(company.profit)}
              </strong>
            </div>

            <div>
              <small>
                Reputation
              </small>

              <strong>
                ${Math.round(
                  op.reputation
                )}
              </strong>
            </div>

          </div>


          <div class="bto-section">

            <h3>
              Today's Operations
            </h3>


            <div class="bto-main-action">

              <button
                id="runBusinessOperation">

                ${
                  type === "food"
                    ? "🍔 SERVE CUSTOMERS"
                    : type === "retail"
                      ? "🛒 RUN STORE"
                      : type === "software"
                        ? "💻 WORK ON PRODUCT"
                        : type === "manufacturing"
                          ? "🏭 RUN PRODUCTION"
                          : "💼 SERVE CLIENTS"
                }

              </button>

            </div>

          </div>


          <div class="bto-section">

            <h3>
              Business Activity
            </h3>


            <div class="bto-activity">

      `;


      if (type === "food") {

        html += `

          <div>
            🍽️ Orders
            <strong>
              ${op.orders}
            </strong>
          </div>

          <div>
            👥 Customers
            <strong>
              ${op.customers}
            </strong>
          </div>

          <div>
            💰 Sales
            <strong>
              ${money(op.sales)}
            </strong>
          </div>

          <div>
            ⭐ Reputation
            <strong>
              ${Math.round(
                op.reputation
              )}
            </strong>
          </div>

        `;

      }


      if (type === "retail") {

        html += `

          <div>
            👥 Customers
            <strong>
              ${op.customers}
            </strong>
          </div>

          <div>
            📦 Inventory
            <strong>
              ${op.inventory}
            </strong>
          </div>

          <div>
            💰 Sales
            <strong>
              ${money(op.sales)}
            </strong>
          </div>

        `;

      }


      if (type === "software") {

        html += `

          <div>
            🧑‍💻 Development
            <strong>
              ${Math.round(
                op.development
              )}%
            </strong>
          </div>

          <div>
            🧪 Testing
            <strong>
              ${Math.round(
                op.testing
              )}%
            </strong>
          </div>

          <div>
            👥 Users
            <strong>
              ${op.users}
            </strong>
          </div>

          <div>
            ⭐ Quality
            <strong>
              ${Math.round(
                op.quality
              )}%
            </strong>
          </div>

        `;

      }


      if (type === "manufacturing") {

        html += `

          <div>
            🧱 Raw Material
            <strong>
              ${op.rawMaterial}
            </strong>
          </div>

          <div>
            🏭 Produced
            <strong>
              ${op.production}
            </strong>
          </div>

          <div>
            📦 Inventory
            <strong>
              ${op.inventory}
            </strong>
          </div>

          <div>
            💰 Sales
            <strong>
              ${money(op.sales)}
            </strong>
          </div>

        `;

      }


      if (type === "services") {

        html += `

          <div>
            👥 Clients
            <strong>
              ${op.clients}
            </strong>
          </div>

          <div>
            📋 Projects
            <strong>
              ${op.projects}
            </strong>
          </div>

          <div>
            ✅ Completed
            <strong>
              ${op.completedProjects}
            </strong>
          </div>

          <div>
            ⭐ Reputation
            <strong>
              ${Math.round(
                op.reputation
              )}
            </strong>
          </div>

        `;

      }


      html += `

            </div>

          </div>


          <div class="bto-section">

            <h3>
              Workforce
            </h3>

            <div class="bto-workforce">

              Employees:
              <strong>
                ${
                  company.employees
                    ? company.employees.length
                    : 0
                }
              </strong>

            </div>

          </div>


          <div class="bto-section">

            <h3>
              Operating Days
            </h3>

            <div class="bto-days">

              ${op.operationalDays}

            </div>

          </div>


        </div>

      `;


      panel.innerHTML =
        html;


      /* ==========================================================
         EVENTS
         ========================================================== */

      document
        .getElementById(
          "btoClose"
        )
        .onclick =
        close;


      document
        .getElementById(
          "runBusinessOperation"
        )
        .onclick =
        runOperation;


      panel
        .querySelectorAll(
          "[data-company]"
        )
        .forEach(
          function (button) {

            button.onclick =
              function () {

                activeCompanyId =
                  button.dataset.company;

                render();

              };

          }
        );

    }


    /* ============================================================
       OPEN / CLOSE
       ============================================================ */

    function open(
      companyId
    ) {

      create();


      if (companyId) {

        activeCompanyId =
          companyId;

      }


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
          "businessTypeOperationsUI"
        )
      ) {

        panel =
          document.getElementById(
            "businessTypeOperationsUI"
          );

        return;

      }


      const style =
        document.createElement(
          "style"
        );


      style.textContent = `

        #businessTypeOperationsUI {

          position:fixed;
          inset:0;

          z-index:99996;

          display:none;

          color:#fff;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

        }


        #businessTypeOperationsUI
        .bto-backdrop {

          position:absolute;
          inset:0;

          background:
            rgba(0,0,0,.80);

          backdrop-filter:
            blur(8px);

        }


        #businessTypeOperationsUI
        .bto-window {

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
              #0c1420,
              #192839
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


        #businessTypeOperationsUI
        .bto-close {

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


        #businessTypeOperationsUI h1 {

          margin:
            0 0 5px;

          font-size:28px;

        }


        .bto-subtitle {

          color:#94a5b8;

          margin-bottom:18px;

        }


        .bto-company-selector {

          display:flex;

          gap:8px;

          overflow-x:auto;

          margin-bottom:18px;

        }


        .bto-company-tab {

          white-space:nowrap;

          border:0;

          border-radius:9px;

          padding:
            9px 13px;

          background:#253443;

          color:#fff;

          cursor:pointer;

        }


        .bto-company-tab.active {

          background:#3478f6;

        }


        .bto-header {

          display:flex;

          justify-content:
            space-between;

          align-items:center;

        }


        .bto-header h2 {

          margin:
            0 0 4px;

        }


        .bto-status {

          background:#247a50;

          padding:
            7px 11px;

          border-radius:9px;

          font-size:12px;

          font-weight:bold;

        }


        .bto-muted {

          color:#94a5b8;

          font-size:13px;

        }


        .bto-metrics {

          display:grid;

          grid-template-columns:
            repeat(4,1fr);

          gap:10px;

          margin:
            18px 0;

        }


        .bto-metrics > div {

          background:
            rgba(255,255,255,.06);

          padding:13px;

          border-radius:12px;

        }


        .bto-metrics small {

          display:block;

          color:#91a3b7;

          margin-bottom:5px;

        }


        .bto-metrics strong {

          font-size:17px;

        }


        .bto-section {

          margin-top:20px;

        }


        .bto-section h3 {

          margin:
            0 0 10px;

        }


        .bto-main-action button {

          width:100%;

          border:0;

          border-radius:12px;

          padding:15px;

          background:#3478f6;

          color:#fff;

          font-size:16px;

          font-weight:bold;

          cursor:pointer;

        }


        .bto-main-action button:hover {

          filter:
            brightness(1.12);

        }


        .bto-activity {

          display:grid;

          grid-template-columns:
            repeat(4,1fr);

          gap:9px;

        }


        .bto-activity > div {

          background:
            rgba(255,255,255,.05);

          border-radius:11px;

          padding:12px;

        }


        .bto-activity strong {

          display:block;

          margin-top:7px;

          font-size:17px;

        }


        .bto-workforce {

          background:
            rgba(255,255,255,.05);

          padding:13px;

          border-radius:11px;

        }


        .bto-days {

          font-size:28px;

          font-weight:bold;

        }


        .bto-empty {

          text-align:center;

          padding:70px 20px;

          color:#94a5b8;

        }


        /* RESULT */

        #businessOperationResult {

          position:fixed;

          inset:0;

          z-index:100002;

          color:#fff;

        }


        .bor-backdrop {

          position:absolute;

          inset:0;

          background:
            rgba(0,0,0,.72);

          backdrop-filter:
            blur(6px);

        }


        .bor-window {

          position:absolute;

          left:50%;
          top:50%;

          transform:
            translate(-50%,-50%);

          width:
            min(450px,90vw);

          background:
            #142131;

          border-radius:18px;

          padding:24px;

          box-shadow:
            0 30px 80px
            rgba(0,0,0,.7);

        }


        .bor-lines {

          margin:
            15px 0;

        }


        .bor-lines div {

          padding:
            9px 0;

          border-bottom:
            1px solid
            rgba(255,255,255,.07);

        }


        .bor-window button {

          width:100%;

          border:0;

          border-radius:10px;

          padding:12px;

          background:#3478f6;

          color:#fff;

          font-weight:bold;

        }


        @media(max-width:700px) {

          .bto-metrics {

            grid-template-columns:
              repeat(2,1fr);

          }


          .bto-activity {

            grid-template-columns:
              repeat(2,1fr);

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
        "businessTypeOperationsUI";


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
          "businessOperationsLiveButton"
        )
      ) {
        return;
      }


      const button =
        document.createElement(
          "button"
        );


      button.id =
        "businessOperationsLiveButton";


      button.textContent =
        "OPERATIONS";


      button.style.cssText = `

        position:fixed;

        right:20px;

        bottom:122px;

        z-index:5000;

        padding:
          11px 16px;

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
       EVENTS
       ============================================================ */

    window.addEventListener(
      "EmpireBusinessLaunched",
      function (event) {

        if (
          event.detail &&
          event.detail.id
        ) {

          activeCompanyId =
            event.detail.id;

        }

        create();
        createButton();

      }
    );


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

    window.EmpireBusinessTypeOperations = {

      open,

      close,

      render,

      runOperation,

      runFoodOperation,

      runRetailOperation,

      runSoftwareOperation,

      runManufacturingOperation,

      runServicesOperation,

      getBusinessType:
        typeOf

    };


    /* ============================================================
       INITIALIZE
       ============================================================ */

    create();
    createButton();

  });

})();
