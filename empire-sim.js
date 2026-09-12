/* =========================================================
   EMPIRE RUSH — SIMULATION CORE v1
   Living Business Simulation Layer

   Systems:
   • Company
   • Departments
   • Employees
   • Finance
   • Business
   • Products
   • Projects
   • Market
   • Events
   • Management Dashboard
   • Save / Load
   • Day progression
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "empireRushSimulationV1";

  /* =======================================================
     DEFAULT GAME STATE
     ======================================================= */

  const DEFAULT_STATE = {
    version: 1,

    company: {
      name: "Empire Rush Holdings",
      type: "Private Company",
      reputation: 58,
      level: 2,
      foundedDay: 1
    },

    player: {
      cash: 709000,
      day: 32,
      debt: 0,
      influence: 12,
      risk: 18
    },

    finance: {
      revenueToday: 0,
      expensesToday: 0,
      profitToday: 0,
      lifetimeRevenue: 0,
      lifetimeProfit: 0
    },

    business: {
      name: "Empire Rush Services",
      industry: "Business Services",
      status: "Operating",
      employees: 8,
      capacity: 100,
      utilization: 72,
      priceIndex: 1,
      demandIndex: 1,
      marketing: 1,
      operations: 1,
      reputation: 55
    },

    departments: [
      {
        id: "operations",
        name: "Operations",
        head: "Aarav",
        budget: 90000,
        productivity: 84,
        workload: 72
      },
      {
        id: "finance",
        name: "Finance",
        head: "Riya",
        budget: 70000,
        productivity: 91,
        workload: 61
      },
      {
        id: "sales",
        name: "Sales",
        head: "Kabir",
        budget: 85000,
        productivity: 78,
        workload: 79
      },
      {
        id: "hr",
        name: "Human Resources",
        head: "Anaya",
        budget: 65000,
        productivity: 89,
        workload: 58
      },
      {
        id: "product",
        name: "Product",
        head: "Vivaan",
        budget: 95000,
        productivity: 83,
        workload: 76
      },
      {
        id: "rd",
        name: "R&D",
        head: "Arjun",
        budget: 120000,
        productivity: 94,
        workload: 84
      },
      {
        id: "marketing",
        name: "Marketing",
        head: "Ishita",
        budget: 80000,
        productivity: 85,
        workload: 70
      }
    ],

    employees: [
      {
        name: "Aarav",
        role: "Operations Manager",
        department: "Operations",
        salary: 42000,
        performance: 86,
        experience: 4,
        morale: 82,
        status: "Working"
      },
      {
        name: "Riya",
        role: "Finance Analyst",
        department: "Finance",
        salary: 38000,
        performance: 91,
        experience: 3,
        morale: 88,
        status: "Working"
      },
      {
        name: "Kabir",
        role: "Sales Executive",
        department: "Sales",
        salary: 35000,
        performance: 78,
        experience: 2,
        morale: 76,
        status: "Working"
      },
      {
        name: "Anaya",
        role: "HR Manager",
        department: "Human Resources",
        salary: 45000,
        performance: 89,
        experience: 5,
        morale: 84,
        status: "Working"
      },
      {
        name: "Vivaan",
        role: "Product Manager",
        department: "Product",
        salary: 40000,
        performance: 83,
        experience: 4,
        morale: 80,
        status: "Working"
      },
      {
        name: "Meera",
        role: "Marketing Specialist",
        department: "Marketing",
        salary: 32000,
        performance: 87,
        experience: 2,
        morale: 90,
        status: "Working"
      },
      {
        name: "Arjun",
        role: "R&D Engineer",
        department: "R&D",
        salary: 48000,
        performance: 94,
        experience: 6,
        morale: 86,
        status: "Working"
      },
      {
        name: "Ishita",
        role: "Marketing Executive",
        department: "Marketing",
        salary: 30000,
        performance: 85,
        experience: 2,
        morale: 88,
        status: "Working"
      }
    ],

    products: [
      {
        id: "product_001",
        name: "Empire Core",
        category: "Business Service",
        stage: "Growth",
        price: 2500,
        unitCost: 900,
        demand: 72,
        quality: 78,
        unitsSold: 0,
        development: 100
      }
    ],

    projects: [
      {
        id: "project_001",
        name: "Next Generation Service",
        type: "Product Development",
        department: "R&D",
        progress: 38,
        budget: 150000,
        spent: 57000,
        status: "In Development"
      }
    ],

    market: {
      demand: 1,
      inflation: 1,
      competition: 1,
      consumerConfidence: 72,
      interestRate: 6.5
    },

    events: [],

    ledger: [],

    notifications: [
      {
        day: 32,
        title: "HQ Operational",
        message: "Empire Rush headquarters is fully operational."
      }
    ]
  };

  /* =======================================================
     UTILITIES
     ======================================================= */

  function clone(object) {
    return JSON.parse(JSON.stringify(object));
  }

  function money(value) {
    value = Number(value) || 0;

    if (Math.abs(value) >= 10000000) {
      return "₹" + (value / 10000000).toFixed(2) + "Cr";
    }

    if (Math.abs(value) >= 100000) {
      return "₹" + (value / 100000).toFixed(2) + "L";
    }

    if (Math.abs(value) >= 1000) {
      return "₹" + (value / 1000).toFixed(1) + "K";
    }

    return "₹" + Math.round(value).toLocaleString("en-IN");
  }

  function number(value) {
    return Math.round(Number(value) || 0).toLocaleString("en-IN");
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /* =======================================================
     LOAD / SAVE
     ======================================================= */

  function loadState() {

    try {

      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return clone(DEFAULT_STATE);
      }

      const parsed =
        JSON.parse(saved);

      return mergeState(
        clone(DEFAULT_STATE),
        parsed
      );

    } catch (error) {

      console.warn(
        "Empire simulation load failed:",
        error
      );

      return clone(DEFAULT_STATE);
    }
  }

  function mergeState(base, saved) {

    Object.keys(saved || {}).forEach(key => {

      if (
        saved[key] &&
        typeof saved[key] === "object" &&
        !Array.isArray(saved[key]) &&
        typeof base[key] === "object"
      ) {

        base[key] = {
          ...base[key],
          ...saved[key]
        };

      } else {

        base[key] = saved[key];

      }

    });

    return base;
  }

  let state = loadState();

  function saveState() {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

    updateHUD();
  }

  /* =======================================================
     LEDGER
     ======================================================= */

  function addLedger(
    type,
    amount,
    description
  ) {

    state.ledger.unshift({
      day: state.player.day,
      type,
      amount,
      description,
      timestamp: Date.now()
    });

    if (state.ledger.length > 100) {
      state.ledger.length = 100;
    }
  }

  /* =======================================================
     NOTIFICATIONS
     ======================================================= */

  function notify(title, message) {

    state.notifications.unshift({
      day: state.player.day,
      title,
      message
    });

    if (state.notifications.length > 30) {
      state.notifications.length = 30;
    }

    showToast(
      title,
      message
    );
  }

  /* =======================================================
     TOAST
     ======================================================= */

  function showToast(title, message) {

    let toast =
      document.getElementById(
        "empire-toast"
      );

    if (!toast) {

      toast =
        document.createElement("div");

      toast.id =
        "empire-toast";

      toast.style.cssText = `
        position:fixed;
        left:50%;
        bottom:80px;
        transform:translateX(-50%);
        width:min(90vw,420px);
        background:rgba(18,22,30,.97);
        color:white;
        border:1px solid rgba(255,255,255,.12);
        border-radius:16px;
        padding:14px 16px;
        z-index:100000;
        box-shadow:0 20px 50px rgba(0,0,0,.4);
        font-family:Arial,sans-serif;
        backdrop-filter:blur(12px);
      `;

      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <div style="
        font-weight:800;
        font-size:14px;
        margin-bottom:4px;
      ">
        ${title}
      </div>

      <div style="
        color:#b9c0cc;
        font-size:12px;
        line-height:1.5;
      ">
        ${message}
      </div>
    `;

    clearTimeout(
      toast._timer
    );

    toast._timer =
      setTimeout(() => {
        toast.remove();
      }, 3000);
  }

  /* =======================================================
     DAILY BUSINESS ENGINE
     ======================================================= */

  function calculateDailyBusiness() {

    const business =
      state.business;

    const market =
      state.market;

    const baseRevenue =
      18000 *
      business.utilization / 100 *
      business.demandIndex *
      market.demand *
      market.consumerConfidence / 70;

    const marketingMultiplier =
      1 +
      ((business.marketing - 1) * 0.08);

    const reputationMultiplier =
      0.8 +
      state.company.reputation / 250;

    const competitionMultiplier =
      1 / Math.max(
        0.7,
        market.competition
      );

    const revenue =
      baseRevenue *
      marketingMultiplier *
      reputationMultiplier *
      competitionMultiplier;

    const salaryExpense =
      state.employees.reduce(
        (sum, employee) =>
          sum + employee.salary / 30,
        0
      );

    const operatingExpense =
      6500 *
      market.inflation;

    const marketingExpense =
      1800 *
      business.marketing;

    const RnDExpense =
      state.projects.reduce(
        (sum, project) =>
          sum +
          (project.status === "In Development"
            ? 1500
            : 0),
        0
      );

    const interestExpense =
      state.player.debt *
      (market.interestRate / 100) /
      365;

    const expenses =
      salaryExpense +
      operatingExpense +
      marketingExpense +
      RnDExpense +
      interestExpense;

    const profit =
      revenue - expenses;

    return {
      revenue,
      expenses,
      profit
    };
  }

  /* =======================================================
     ADVANCE DAY
     ======================================================= */

  function advanceDay() {

    const result =
      calculateDailyBusiness();

    state.finance.revenueToday =
      result.revenue;

    state.finance.expensesToday =
      result.expenses;

    state.finance.profitToday =
      result.profit;

    state.finance.lifetimeRevenue +=
      result.revenue;

    state.finance.lifetimeProfit +=
      result.profit;

    state.player.cash +=
      result.profit;

    state.player.day += 1;

    /* employee evolution */

    state.employees.forEach(
      employee => {

        const performanceDrift =
          (employee.morale - 50) * 0.015;

        employee.performance =
          clamp(
            employee.performance +
            performanceDrift +
            (Math.random() - 0.5),
            35,
            100
          );

        if (
          employee.status === "Working"
        ) {
          employee.experience =
            Math.round(
              (employee.experience +
                0.01) * 100
            ) / 100;
        }
      }
    );

    /* department workload */

    state.departments.forEach(
      department => {

        department.workload =
          clamp(
            department.workload +
            (Math.random() - 0.5) * 5,
            30,
            100
          );

        if (
          department.workload > 90
        ) {

          department.productivity =
            clamp(
              department.productivity - 1,
              30,
              100
            );

        } else if (
          department.workload < 60
        ) {

          department.productivity =
            clamp(
              department.productivity + 0.5,
              30,
              100
            );
        }
      }
    );

    progressProjects();

    maybeMarketEvent();

    addLedger(
      "daily",
      result.profit,
      "Daily business result"
    );

    notify(
      "Day " + state.player.day,
      "Daily profit: " +
      money(result.profit)
    );

    saveState();

    renderDashboard();
  }

  /* =======================================================
     PROJECT ENGINE
     ======================================================= */

  function progressProjects() {

    state.projects.forEach(
      project => {

        if (
          project.status !==
          "In Development"
        ) {
          return;
        }

        const department =
          state.departments.find(
            d =>
              d.name ===
              project.department
          );

        const teamPerformance =
          department
            ? department.productivity
            : 70;

        const progress =
          0.4 +
          teamPerformance / 100 * 0.7;

        project.progress =
          clamp(
            project.progress +
            progress,
            0,
            100
          );

        project.spent +=
          1500;

        if (
          project.spent >=
          project.budget
        ) {

          project.status =
            "Budget Exhausted";

          notify(
            "Project Alert",
            project.name +
            " has exhausted its budget."
          );
        }

        if (
          project.progress >= 100
        ) {

          project.progress = 100;

          project.status =
            "Completed";

          notify(
            "Project Completed",
            project.name +
            " is ready for launch."
          );
        }
      }
    );
  }

  /* =======================================================
     MARKET EVENTS
     ======================================================= */

  const MARKET_EVENTS = [

    {
      title: "Consumer Confidence Rises",
      message:
        "Consumer confidence increased. Demand is stronger.",
      effect() {
        state.market.consumerConfidence =
          clamp(
            state.market.consumerConfidence + 7,
            30,
            120
          );
      }
    },

    {
      title: "Demand Slowdown",
      message:
        "Customers are delaying purchases.",
      effect() {
        state.market.demand =
          clamp(
            state.market.demand - 0.08,
            0.65,
            1.4
          );
      }
    },

    {
      title: "Competitor Price War",
      message:
        "A competitor has started aggressive pricing.",
      effect() {
        state.market.competition =
          clamp(
            state.market.competition + 0.12,
            0.7,
            1.8
          );
      }
    },

    {
      title: "Market Expansion",
      message:
        "Your industry is experiencing rapid demand growth.",
      effect() {
        state.market.demand =
          clamp(
            state.market.demand + 0.1,
            0.65,
            1.4
          );
      }
    },

    {
      title: "Inflation Pressure",
      message:
        "Operating costs increased.",
      effect() {
        state.market.inflation =
          clamp(
            state.market.inflation + 0.04,
            0.8,
            1.6
          );
      }
    },

    {
      title: "Interest Rate Increase",
      message:
        "Financing has become more expensive.",
      effect() {
        state.market.interestRate =
          clamp(
            state.market.interestRate + 0.5,
            3,
            15
          );
      }
    }
  ];

  function maybeMarketEvent() {

    if (
      Math.random() > 0.22
    ) {
      return;
    }

    const event =
      MARKET_EVENTS[
        Math.floor(
          Math.random() *
          MARKET_EVENTS.length
        )
      ];

    event.effect();

    state.events.unshift({
      day: state.player.day,
      title: event.title,
      message: event.message
    });

    if (
      state.events.length > 30
    ) {
      state.events.length = 30;
    }

    notify(
      event.title,
      event.message
    );
  }

  /* =======================================================
     MANAGEMENT ACTIONS
     ======================================================= */

  function findEmployee(name) {

    return state.employees.find(
      employee =>
        employee.name === name
    );
  }

  function giveRaise(name) {

    const employee =
      findEmployee(name);

    if (!employee) return;

    employee.salary =
      Math.round(
        employee.salary * 1.10
      );

    employee.morale =
      clamp(
        employee.morale + 8,
        0,
        100
      );

    addLedger(
      "hr",
      0,
      "10% salary raise approved for " +
      name
    );

    notify(
      "Raise Approved",
      name +
      " received a 10% salary increase."
    );

    saveState();
    renderDashboard();
  }

  function training(name) {

    const cost = 5000;

    if (
      state.player.cash < cost
    ) {

      notify(
        "Insufficient Cash",
        "Training requires " +
        money(cost) +
        "."
      );

      return false;
    }

    const employee =
      findEmployee(name);

    if (!employee) return false;

    state.player.cash -= cost;

    employee.performance =
      clamp(
        employee.performance + 5,
        0,
        100
      );

    employee.experience =
      Math.round(
        (employee.experience + 0.2) *
        10
      ) / 10;

    employee.morale =
      clamp(
        employee.morale + 3,
        0,
        100
      );

    addLedger(
      "training",
      -cost,
      "Training for " + name
    );

    notify(
      "Training Completed",
      name +
      " improved performance."
    );

    saveState();
    renderDashboard();

    return true;
  }

  function promote(name) {

    const employee =
      findEmployee(name);

    if (!employee) return;

    employee.salary =
      Math.round(
        employee.salary * 1.20
      );

    employee.performance =
      clamp(
        employee.performance + 4,
        0,
        100
      );

    employee.morale =
      clamp(
        employee.morale + 5,
        0,
        100
      );

    employee.role =
      "Senior " +
      employee.role;

    addLedger(
      "hr",
      0,
      "Promotion approved for " +
      name
    );

    notify(
      "Promotion Approved",
      name +
      " has been promoted."
    );

    saveState();
    renderDashboard();
  }

  function assignTask(name) {

    const employee =
      findEmployee(name);

    if (!employee) return;

    employee.performance =
      clamp(
        employee.performance + 2,
        0,
        100
      );

    employee.morale =
      clamp(
        employee.morale - 1,
        0,
        100
      );

    const project =
      state.projects.find(
        p =>
          p.status ===
          "In Development"
      );

    if (project) {

      project.progress =
        clamp(
          project.progress + 2,
          0,
          100
        );
    }

    notify(
      "Task Assigned",
      "Important task assigned to " +
      name + "."
    );

    saveState();
    renderDashboard();
  }

  /* =======================================================
     DASHBOARD STYLES
     ======================================================= */

  function installStyles() {

    if (
      document.getElementById(
        "empire-sim-style"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "empire-sim-style";

    style.textContent = `

      #empire-command-button{
        position:fixed;
        left:16px;
        bottom:18px;
        z-index:9000;
        border:0;
        border-radius:14px;
        padding:12px 15px;
        background:rgba(18,22,30,.94);
        color:#fff;
        font-weight:800;
        font-size:12px;
        box-shadow:0 10px 30px rgba(0,0,0,.3);
      }

      #empire-dashboard{
        position:fixed;
        inset:0;
        z-index:50000;
        display:none;
        background:rgba(6,9,13,.76);
        backdrop-filter:blur(12px);
        font-family:Arial,sans-serif;
        color:white;
        overflow:auto;
      }

      .empire-dash{
        width:min(94vw,900px);
        margin:30px auto;
        padding-bottom:40px;
      }

      .empire-header{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        margin-bottom:16px;
      }

      .empire-header h1{
        margin:0;
        font-size:25px;
      }

      .empire-header p{
        margin:5px 0 0;
        color:#9da6b4;
        font-size:12px;
      }

      .empire-close{
        width:42px;
        height:42px;
        border:0;
        border-radius:50%;
        background:#242a35;
        color:white;
        font-size:22px;
      }

      .empire-grid{
        display:grid;
        grid-template-columns:
          repeat(4,minmax(0,1fr));
        gap:10px;
      }

      .empire-card{
        background:#151a23;
        border:1px solid rgba(255,255,255,.07);
        border-radius:16px;
        padding:15px;
      }

      .empire-card small{
        display:block;
        color:#8d97a6;
        font-size:11px;
        margin-bottom:7px;
      }

      .empire-card strong{
        font-size:20px;
      }

      .empire-section{
        margin-top:14px;
        background:#151a23;
        border-radius:18px;
        padding:17px;
        border:1px solid rgba(255,255,255,.07);
      }

      .empire-section h3{
        margin:0 0 13px;
        font-size:16px;
      }

      .empire-row{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        padding:12px 0;
        border-bottom:1px solid
          rgba(255,255,255,.06);
      }

      .empire-row:last-child{
        border-bottom:0;
      }

      .empire-muted{
        color:#929baa;
        font-size:11px;
        margin-top:3px;
      }

      .empire-progress{
        width:110px;
        height:7px;
        border-radius:10px;
        overflow:hidden;
        background:#292f3b;
      }

      .empire-progress span{
        display:block;
        height:100%;
        background:#8bc34a;
      }

      .empire-action{
        border:0;
        border-radius:10px;
        padding:10px 13px;
        background:#252c38;
        color:white;
        font-weight:700;
      }

      .empire-primary{
        background:#8bc34a;
        color:#111;
      }

      @media(max-width:650px){

        .empire-dash{
          margin:18px auto;
        }

        .empire-grid{
          grid-template-columns:
            repeat(2,minmax(0,1fr));
        }

        .empire-card strong{
          font-size:17px;
        }

      }

    `;

    document.head.appendChild(style);
  }

  /* =======================================================
     COMMAND BUTTON
     ======================================================= */

  function createCommandButton() {

    if (
      document.getElementById(
        "empire-command-button"
      )
    ) {
      return;
    }

    const button =
      document.createElement("button");

    button.id =
      "empire-command-button";

    button.textContent =
      "☰ COMMAND CENTER";

    button.onclick =
      openDashboard;

    document.body.appendChild(button);
  }

  /* =======================================================
     DASHBOARD
     ======================================================= */

  function createDashboard() {

    if (
      document.getElementById(
        "empire-dashboard"
      )
    ) {
      return;
    }

    const overlay =
      document.createElement("div");

    overlay.id =
      "empire-dashboard";

    overlay.innerHTML = `
      <div class="empire-dash">

        <div class="empire-header">

          <div>
            <h1>Empire Command Center</h1>
            <p>
              Company management & simulation
            </p>
          </div>

          <button
            class="empire-close"
            id="empire-close"
          >
            ×
          </button>

        </div>

        <div
          class="empire-grid"
          id="empire-summary"
        ></div>

        <div
          class="empire-section"
          id="empire-business-section"
        ></div>

        <div
          class="empire-section"
          id="empire-department-section"
        ></div>

        <div
          class="empire-section"
          id="empire-project-section"
        ></div>

        <div
          class="empire-section"
          id="empire-market-section"
        ></div>

        <div
          class="empire-section"
          id="empire-event-section"
        ></div>

        <div
          class="empire-section"
          id="empire-ledger-section"
        ></div>

      </div>
    `;

    document.body.appendChild(
      overlay
    );

    document
      .getElementById(
        "empire-close"
      )
      .onclick =
      closeDashboard;

    renderDashboard();
  }

  function openDashboard() {

    createDashboard();

    document.getElementById(
      "empire-dashboard"
    ).style.display = "block";

    renderDashboard();
  }

  function closeDashboard() {

    const dashboard =
      document.getElementById(
        "empire-dashboard"
      );

    if (dashboard) {
      dashboard.style.display =
        "none";
    }
  }

  /* =======================================================
     RENDER DASHBOARD
     ======================================================= */

  function renderDashboard() {

    if (
      !document.getElementById(
        "empire-dashboard"
      )
    ) {
      return;
    }

    const summary =
      document.getElementById(
        "empire-summary"
      );

    const daily =
      calculateDailyBusiness();

    summary.innerHTML = `

      <div class="empire-card">
        <small>CASH</small>
        <strong>
          ${money(state.player.cash)}
        </strong>
      </div>

      <div class="empire-card">
        <small>DAY</small>
        <strong>
          ${state.player.day}
        </strong>
      </div>

      <div class="empire-card">
        <small>DAILY PROFIT</small>
        <strong>
          ${money(daily.profit)}
        </strong>
      </div>

      <div class="empire-card">
        <small>EMPLOYEES</small>
        <strong>
          ${state.employees.length}
        </strong>
      </div>

      <div class="empire-card">
        <small>REPUTATION</small>
        <strong>
          ${Math.round(state.company.reputation)}%
        </strong>
      </div>

      <div class="empire-card">
        <small>DEBT</small>
        <strong>
          ${money(state.player.debt)}
        </strong>
      </div>

      <div class="empire-card">
        <small>MARKET DEMAND</small>
        <strong>
          ${Math.round(
            state.market.demand * 100
          )}%
        </strong>
      </div>

      <div class="empire-card">
        <button
          class="empire-action empire-primary"
          id="advance-day-btn"
          style="width:100%;"
        >
          ⏭ Advance Day
        </button>
      </div>
    `;

    document
      .getElementById(
        "advance-day-btn"
      )
      .onclick =
      advanceDay;

    renderBusiness();
    renderDepartments();
    renderProjects();
    renderMarket();
    renderEvents();
    renderLedger();
  }

  /* =======================================================
     BUSINESS
     ======================================================= */

  function renderBusiness() {

    const box =
      document.getElementById(
        "empire-business-section"
      );

    const business =
      state.business;

    box.innerHTML = `

      <h3>🏢 Business Operations</h3>

      <div class="empire-row">

        <div>
          <strong>
            ${business.name}
          </strong>

          <div class="empire-muted">
            ${business.industry}
            · ${business.status}
          </div>
        </div>

        <strong>
          ${business.utilization}%
        </strong>

      </div>

      <div class="empire-row">

        <div>
          Capacity Utilization
        </div>

        <div class="empire-progress">
          <span style="
            width:${business.utilization}%;
          "></span>
        </div>

      </div>

      <div class="empire-row">

        <div>
          Marketing Level
        </div>

        <button
          class="empire-action"
          id="upgrade-marketing"
        >
          Upgrade · ₹10K
        </button>

      </div>

      <div class="empire-row">

        <div>
          Operations Level
        </div>

        <button
          class="empire-action"
          id="upgrade-operations"
        >
          Upgrade · ₹15K
        </button>

      </div>
    `;

    document
      .getElementById(
        "upgrade-marketing"
      )
      .onclick =
      upgradeMarketing;

    document
      .getElementById(
        "upgrade-operations"
      )
      .onclick =
      upgradeOperations;
  }

  function upgradeMarketing() {

    const cost = 10000;

    if (
      state.player.cash < cost
    ) {

      notify(
        "Insufficient Cash",
        "Marketing upgrade requires " +
        money(cost)
      );

      return;
    }

    state.player.cash -= cost;

    state.business.marketing += 1;

    state.company.reputation =
      clamp(
        state.company.reputation + 2,
        0,
        100
      );

    addLedger(
      "marketing",
      -cost,
      "Marketing upgrade"
    );

    notify(
      "Marketing Upgraded",
      "Customer acquisition potential increased."
    );

    saveState();
    renderDashboard();
  }

  function upgradeOperations() {

    const cost = 15000;

    if (
      state.player.cash < cost
    ) {

      notify(
        "Insufficient Cash",
        "Operations upgrade requires " +
        money(cost)
      );

      return;
    }

    state.player.cash -= cost;

    state.business.operations += 1;

    state.business.capacity += 15;

    state.business.utilization =
      clamp(
        state.business.utilization + 3,
        0,
        100
      );

    addLedger(
      "operations",
      -cost,
      "Operations capacity upgrade"
    );

    notify(
      "Operations Upgraded",
      "Business capacity increased."
    );

    saveState();
    renderDashboard();
  }

  /* =======================================================
     DEPARTMENTS
     ======================================================= */

  function renderDepartments() {

    const box =
      document.getElementById(
        "empire-department-section"
      );

    box.innerHTML =
      `<h3>🏛 Departments</h3>`;

    state.departments.forEach(
      department => {

        const row =
          document.createElement("div");

        row.className =
          "empire-row";

        row.innerHTML = `

          <div>

            <strong>
              ${department.name}
            </strong>

            <div class="empire-muted">
              Head: ${department.head}
              · Workload:
              ${Math.round(
                department.workload
              )}%
            </div>

          </div>

          <div style="
            text-align:right;
          ">

            <strong>
              ${Math.round(
                department.productivity
              )}%
            </strong>

            <div class="empire-muted">
              Productivity
            </div>

          </div>
        `;

        box.appendChild(row);
      }
    );
  }

  /* =======================================================
     PROJECTS
     ======================================================= */

  function renderProjects() {

    const box =
      document.getElementById(
        "empire-project-section"
      );

    box.innerHTML =
      `<h3>🧪 Projects & R&D</h3>`;

    state.projects.forEach(
      project => {

        const row =
          document.createElement("div");

        row.className =
          "empire-row";

        row.innerHTML = `

          <div>

            <strong>
              ${project.name}
            </strong>

            <div class="empire-muted">
              ${project.type}
              · ${project.status}
            </div>

          </div>

          <div style="
            text-align:right;
          ">

            <strong>
              ${Math.round(
                project.progress
              )}%
            </strong>

            <div class="empire-progress">
              <span style="
                width:${project.progress}%;
              "></span>
            </div>

          </div>
        `;

        box.appendChild(row);
      }
    );
  }

  /* =======================================================
     MARKET
     ======================================================= */

  function renderMarket() {

    const box =
      document.getElementById(
        "empire-market-section"
      );

    box.innerHTML = `

      <h3>📈 Market</h3>

      <div class="empire-row">
        <div>Demand</div>
        <strong>
          ${Math.round(
            state.market.demand * 100
          )}%
        </strong>
      </div>

      <div class="empire-row">
        <div>Consumer Confidence</div>
        <strong>
          ${Math.round(
            state.market.consumerConfidence
          )}%
        </strong>
      </div>

      <div class="empire-row">
        <div>Competition Pressure</div>
        <strong>
          ${Math.round(
            state.market.competition * 100
          )}%
        </strong>
      </div>

      <div class="empire-row">
        <div>Inflation</div>
        <strong>
          ${(
            state.market.inflation * 100
          ).toFixed(0)}%
        </strong>
      </div>

      <div class="empire-row">
        <div>Interest Rate</div>
        <strong>
          ${state.market.interestRate.toFixed(1)}%
        </strong>
      </div>
    `;
  }

  /* =======================================================
     EVENTS
     ======================================================= */

  function renderEvents() {

    const box =
      document.getElementById(
        "empire-event-section"
      );

    box.innerHTML =
      `<h3>⚡ Recent Events</h3>`;

    const events =
      state.events.slice(0, 5);

    if (!events.length) {

      box.innerHTML += `
        <div class="empire-muted">
          No major events yet.
        </div>
      `;

      return;
    }

    events.forEach(
      event => {

        const row =
          document.createElement("div");

        row.className =
          "empire-row";

        row.innerHTML = `

          <div>
            <strong>
              ${event.title}
            </strong>

            <div class="empire-muted">
              Day ${event.day}
              · ${event.message}
            </div>
          </div>
        `;

        box.appendChild(row);
      }
    );
  }

  /* =======================================================
     LEDGER
     ======================================================= */

  function renderLedger() {

    const box =
      document.getElementById(
        "empire-ledger-section"
      );

    box.innerHTML =
      `<h3>📒 Recent Ledger</h3>`;

    state.ledger
      .slice(0, 7)
      .forEach(entry => {

        const row =
          document.createElement("div");

        row.className =
          "empire-row";

        const sign =
          entry.amount >= 0
            ? "+"
            : "";

        row.innerHTML = `

          <div>
            <strong>
              ${entry.description}
            </strong>

            <div class="empire-muted">
              Day ${entry.day}
              · ${entry.type}
            </div>
          </div>

          <strong>
            ${sign}${money(entry.amount)}
          </strong>
        `;

        box.appendChild(row);
      });
  }

  /* =======================================================
     HUD
     ======================================================= */

  function updateHUD() {

    const stats =
      document.querySelectorAll(
        "#top .stat strong"
      );

    if (stats.length >= 2) {

      stats[0].textContent =
        money(state.player.cash);

      stats[1].textContent =
        state.player.day;
    }
  }

  /* =======================================================
     CONNECT EMPLOYEE ACTIONS
     ======================================================= */

  function connectEmployeeActions() {

    document.addEventListener(
      "click",
      function (event) {

        const button =
          event.target.closest(
            "#raiseBtn,#trainBtn,#promoteBtn,#taskBtn"
          );

        if (!button) {
          return;
        }

        setTimeout(() => {

          const nameElement =
            document.getElementById(
              "detailName"
            );

          if (!nameElement) {
            return;
          }

          const name =
            nameElement.textContent.trim();

          if (!name) {
            return;
          }

          if (
            button.id ===
            "raiseBtn"
          ) {

            giveRaise(name);

          } else if (
            button.id ===
            "trainBtn"
          ) {

            training(name);

          } else if (
            button.id ===
            "promoteBtn"
          ) {

            promote(name);

          } else if (
            button.id ===
            "taskBtn"
          ) {

            assignTask(name);
          }

        }, 80);
      },
      true
    );
  }

  /* =======================================================
     EXPOSE API
     ======================================================= */

  window.EmpireSimulation = {

    state,

    save: saveState,

    load: loadState,

    advanceDay,

    openDashboard,

    closeDashboard,

    getEmployee(name) {
      return findEmployee(name);
    },

    train(name) {
      return training(name);
    },

    promote,

    raise(name) {
      giveRaise(name);
    },

    task(name) {
      assignTask(name);
    }

  };

  /* =======================================================
     START
     ======================================================= */

  function start() {

    installStyles();

    createCommandButton();

    createDashboard();

    connectEmployeeActions();

    updateHUD();

    console.log(
      "Empire Rush Simulation Core loaded."
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  } else {

    start();
  }

})();
