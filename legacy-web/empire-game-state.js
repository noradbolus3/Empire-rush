(function () {
  "use strict";

  /*
   * =========================================================
   * EMPIRE RUSH — CENTRAL GAME STATE
   * Integration / Stability Version
   *
   * Player
   *   ↓
   * Job
   *   ↓
   * Salary
   *   ↓
   * Personal Cash / Savings
   *   ↓
   * Business
   *   ↓
   * Company
   *   ↓
   * Employees / Operations / Accounting / Market
   *
   * This is the browser simulation state contract.
   * Future Unity/C# migration can map onto this contract.
   * =========================================================
   */

  const STORAGE_KEY =
    "empire_rush_game_state_v1";

  const STATE_VERSION = 2;


  /* =========================================================
     DEFAULT STATE
  ========================================================= */

  const defaultState = {

    version: STATE_VERSION,

    player: {

      name: "Founder",

      age: 22,

      cash: 0,

      savings: 0,

      monthlyExpenses: 15000,

      monthlyIncome: 0,

      debt: 0,

      currentJob: "Unemployed",

      jobLevel: "Entry",

      experience: 0,

      careerLevel: 1,

      careerXP: 0,

      skills: {

        Communication: 10,
        Finance: 10,
        Sales: 10,
        Marketing: 10,
        Operations: 10,
        Management: 10,
        Technology: 10,
        Leadership: 10,
        Product: 10,
        HumanResources: 10

      }

    },


    world: {

      day: 1,

      month: 1,

      year: 1,

      timeOfDay: 8,

      weather: "Clear",

      totalDays: 1

    },


    companies: [],


    employees: [],


    businesses: [

      {
        id: "freelance",
        name: "Freelance Services",
        type: "Freelance",
        minimumCapital: 0,
        setupCost: 2000,
        status: "Available"
      },

      {
        id: "home-food",
        name: "Home Food Business",
        type: "HomeFood",
        minimumCapital: 15000,
        setupCost: 12000,
        status: "Available"
      },

      {
        id: "retail",
        name: "Retail Store",
        type: "Retail",
        minimumCapital: 100000,
        setupCost: 75000,
        status: "Locked"
      },

      {
        id: "restaurant",
        name: "Restaurant",
        type: "Restaurant",
        minimumCapital: 500000,
        setupCost: 350000,
        status: "Locked"
      },

      {
        id: "software",
        name: "Software Startup",
        type: "Software",
        minimumCapital: 100000,
        setupCost: 60000,
        status: "Locked"
      },

      {
        id: "manufacturing",
        name: "Manufacturing Unit",
        type: "Manufacturing",
        minimumCapital: 2500000,
        setupCost: 1800000,
        status: "Locked"
      }

    ]

  };


  /* =========================================================
     CLONE
  ========================================================= */

  function clone(object) {

    return JSON.parse(
      JSON.stringify(object)
    );

  }


  /* =========================================================
     SAFE NUMBER
  ========================================================= */

  function num(value, fallback = 0) {

    const n =
      Number(value);

    return Number.isFinite(n)
      ? n
      : fallback;

  }


  /* =========================================================
     LOAD
  ========================================================= */

  function loadState() {

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {

        return clone(
          defaultState
        );

      }

      const parsed =
        JSON.parse(saved);

      return mergeState(
        clone(defaultState),
        parsed
      );

    }
    catch (error) {

      console.error(
        "Empire Rush state load failed:",
        error
      );

      return clone(
        defaultState
      );

    }

  }


  /* =========================================================
     MERGE
  ========================================================= */

  function mergeState(
    base,
    incoming
  ) {

    if (
      !incoming ||
      typeof incoming !== "object"
    ) {

      return base;

    }


    Object.keys(incoming).forEach(
      function (key) {

        if (

          incoming[key] &&

          typeof incoming[key] ===
          "object" &&

          !Array.isArray(
            incoming[key]
          ) &&

          base[key] &&

          typeof base[key] ===
          "object" &&

          !Array.isArray(
            base[key]
          )

        ) {

          base[key] =
            mergeState(
              base[key],
              incoming[key]
            );

        }
        else {

          base[key] =
            incoming[key];

        }

      }
    );


    return base;

  }


  /* =========================================================
     STATE
  ========================================================= */

  const state =
    loadState();


  /* =========================================================
     MIGRATION / NORMALIZATION
  ========================================================= */

  function normalizeState() {

    state.version =
      STATE_VERSION;


    if (!state.player) {

      state.player =
        clone(
          defaultState.player
        );

    }


    if (!state.world) {

      state.world =
        clone(
          defaultState.world
        );

    }


    if (
      !Array.isArray(
        state.companies
      )
    ) {

      state.companies = [];

    }


    if (
      !Array.isArray(
        state.employees
      )
    ) {

      state.employees = [];

    }


    if (
      !Array.isArray(
        state.businesses
      )
    ) {

      state.businesses =
        clone(
          defaultState.businesses
        );

    }


    state.player.cash =
      Math.max(
        0,
        num(
          state.player.cash
        )
      );


    state.player.savings =
      Math.max(
        0,
        num(
          state.player.savings
        )
      );


    state.player.debt =
      Math.max(
        0,
        num(
          state.player.debt
        )
      );


    state.player.age =
      Math.max(
        18,
        num(
          state.player.age,
          22
        )
      );


    state.world.day =
      Math.max(
        1,
        num(
          state.world.day,
          1
        )
      );


    state.world.month =
      Math.max(
        1,
        Math.min(
          12,
          num(
            state.world.month,
            1
          )
        )
      );


    state.world.year =
      Math.max(
        1,
        num(
          state.world.year,
          1
        )
      );


    state.world.totalDays =
      Math.max(
        1,
        num(
          state.world.totalDays,
          state.world.day
        )
      );


    state.companies.forEach(
      normalizeCompany
    );

  }


  function normalizeCompany(
    company
  ) {

    if (!company.id) {

      company.id =
        "company_" +
        Date.now() +
        "_" +
        Math.floor(
          Math.random() * 10000
        );

    }


    if (
      !Array.isArray(
        company.employees
      )
    ) {

      company.employees = [];

    }


    if (
      !Array.isArray(
        company.subsidiaries
      )
    ) {

      company.subsidiaries = [];

    }


    company.revenue =
      num(
        company.revenue
      );


    company.operatingCost =
      num(
        company.operatingCost
      );


    company.payroll =
      num(
        company.payroll
      );


    company.taxes =
      num(
        company.taxes
      );


    company.valuation =
      num(
        company.valuation
      );


    /*
     * Central company finance object.
     *
     * Older modules may use:
     * company.cash
     *
     * Newer modules may use:
     * company.finance.cash
     *
     * Both point to the same economic balance.
     */

    if (
      !company.finance ||
      typeof company.finance !==
      "object"
    ) {

      company.finance = {};

    }


    if (
      company.finance.cash ===
      undefined
    ) {

      company.finance.cash =
        num(
          company.cash
        );

    }


    company.cash =
      num(
        company.finance.cash
      );


    company.finance.cash =
      company.cash;


    company.finance.totalRevenue =
      num(
        company.finance.totalRevenue ||
        company.revenue
      );


    company.finance.totalExpenses =
      num(
        company.finance.totalExpenses
      );


    company.finance.profit =
      num(
        company.finance.profit
      );


    company.status =
      company.status ||
      "Setup Required";


    company.operating =
      company.operating === true ||
      company.status === "Operating" ||
      company.status === "Growing";

  }


  normalizeState();


  /* =========================================================
     SAVE
  ========================================================= */

  function saveState() {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );


      window.dispatchEvent(
        new CustomEvent(
          "EmpireGameStateSaved",
          {
            detail: state
          }
        )
      );


      return true;

    }
    catch (error) {

      console.error(
        "Empire Rush state save failed:",
        error
      );

      return false;

    }

  }


  /* =========================================================
     EVENT
  ========================================================= */

  function emitChange(
    type,
    detail
  ) {

    window.dispatchEvent(
      new CustomEvent(
        "EmpireGameStateChanged",
        {
          detail: {

            type,

            data:
              detail || state,

            state

          }
        }
      )
    );

  }


  /* =========================================================
     PERSONAL MONEY
  ========================================================= */

  function addCash(
    amount,
    reason = "Income"
  ) {

    amount =
      num(amount);

    if (amount <= 0) {
      return true;
    }


    state.player.cash +=
      amount;


    refreshBusinessAvailability();


    saveState();


    emitChange(
      "cash-added",
      {
        amount,
        reason,
        cash:
          state.player.cash
      }
    );


    return true;

  }


  function spendCash(
    amount,
    reason = "Expense"
  ) {

    amount =
      num(amount);


    if (amount <= 0) {
      return true;
    }


    if (
      state.player.cash <
      amount
    ) {

      return false;

    }


    state.player.cash -=
      amount;


    refreshBusinessAvailability();


    saveState();


    emitChange(
      "cash-spent",
      {
        amount,
        reason,
        cash:
          state.player.cash
      }
    );


    return true;

  }


  /* =========================================================
     SAVINGS
  ========================================================= */

  function transferToSavings(
    amount
  ) {

    amount =
      num(amount);


    if (
      amount <= 0 ||
      state.player.cash <
      amount
    ) {

      return false;

    }


    state.player.cash -=
      amount;


    state.player.savings +=
      amount;


    saveState();


    emitChange(
      "savings-deposit",
      {
        amount
      }
    );


    return true;

  }


  function withdrawSavings(
    amount
  ) {

    amount =
      num(amount);


    if (
      amount <= 0 ||
      state.player.savings <
      amount
    ) {

      return false;

    }


    state.player.savings -=
      amount;


    state.player.cash +=
      amount;


    refreshBusinessAvailability();


    saveState();


    emitChange(
      "savings-withdraw",
      {
        amount
      }
    );


    return true;

  }


  function getAvailableCapital() {

    return (

      num(
        state.player.cash
      ) +

      num(
        state.player.savings
      )

    );

  }


  function getNetWorth() {

    let companyValue = 0;

    state.companies.forEach(
      function (company) {

        companyValue +=
          num(
            company.valuation
          );

      }
    );


    return (

      num(
        state.player.cash
      ) +

      num(
        state.player.savings
      ) +

      companyValue -

      num(
        state.player.debt
      )

    );

  }


  /* =========================================================
     JOB
  ========================================================= */

  function setJob(
    job
  ) {

    if (!job) {

      return false;

    }


    /*
     * Supports both:
     *
     * setJob(jobObject)
     *
     * and older style calls if another module uses them.
     */

    if (
      typeof job === "string"
    ) {

      state.player.currentJob =
        job;

      saveState();

      emitChange(
        "job"
      );

      return true;

    }


    state.player.currentJob =
      job.title ||
      job.name ||
      "Employee";


    state.player.jobLevel =
      job.level ||
      "Entry";


    state.player.monthlyIncome =
      num(
        job.monthlySalary ??
        job.salary ??
        0
      );


    if (
      job.careerLevel !==
      undefined
    ) {

      state.player.careerLevel =
        num(
          job.careerLevel,
          1
        );

    }


    saveState();


    emitChange(
      "job",
      job
    );


    return true;

  }


  /* =========================================================
     SALARY
  ========================================================= */

  function paySalary() {

    const salary =
      num(
        state.player.monthlyIncome
      );


    if (
      salary <= 0
    ) {

      return 0;

    }


    state.player.cash +=
      salary;


    emitChange(
      "salary",
      {
        amount:
          salary
      }
    );


    saveState();


    return salary;

  }


  /* =========================================================
     LIVING EXPENSES
  ========================================================= */

  function payLivingExpenses() {

    const expense =
      Math.max(
        0,
        num(
          state.player.monthlyExpenses
        )
      );


    if (
      expense <= 0
    ) {

      return 0;

    }


    if (
      state.player.cash >=
      expense
    ) {

      state.player.cash -=
        expense;

    }
    else {

      const shortage =
        expense -
        state.player.cash;


      state.player.cash =
        0;


      state.player.debt +=
        shortage;


      emitChange(
        "living-expense-debt",
        {
          expense,
          shortage
        }
      );

    }


    saveState();


    emitChange(
      "expenses",
      {
        amount:
          expense
      }
    );


    return expense;

  }


  /* =========================================================
     BUSINESS AVAILABILITY
  ========================================================= */

  function refreshBusinessAvailability() {

    if (
      !Array.isArray(
        state.businesses
      )
    ) {

      return;

    }


    const capital =
      getAvailableCapital();


    state.businesses.forEach(
      function (business) {

        if (
          business.status ===
          "Owned"
        ) {

          return;

        }


        if (
          capital >=
          num(
            business.minimumCapital
          )
        ) {

          business.status =
            "Available";

        }
        else {

          business.status =
            "Locked";

        }

      }
    );

  }


  function getAvailableBusinesses() {

    refreshBusinessAvailability();


    return state.businesses.filter(
      function (business) {

        return (
          business.status ===
          "Available"
        );

      }
    );

  }


  /* =========================================================
     BUSINESS START
  ========================================================= */

  function startBusiness(
    businessId,
    companyName
  ) {

    const business =
      state.businesses.find(
        function (item) {

          return (
            item.id ===
            businessId
          );

        }
      );


    if (!business) {

      return {
        success: false,
        reason:
          "Business not found"
      };

    }


    if (
      business.status ===
      "Owned"
    ) {

      return {
        success: false,
        reason:
          "Business already owned"
      };

    }


    const setupCost =
      Math.max(
        0,
        num(
          business.setupCost
        )
      );


    /*
     * IMPORTANT:
     * Validate total capital BEFORE
     * deducting anything.
     */

    if (
      getAvailableCapital() <
      setupCost
    ) {

      return {
        success: false,
        reason:
          "Insufficient capital"
      };

    }


    let remaining =
      setupCost;


    /*
     * Cash first.
     */

    const cashUsed =
      Math.min(
        state.player.cash,
        remaining
      );


    state.player.cash -=
      cashUsed;


    remaining -=
      cashUsed;


    /*
     * Then personal savings.
     */

    if (
      remaining > 0
    ) {

      state.player.savings -=
        remaining;

    }


    const companyId =
      "company_" +
      Date.now() +
      "_" +
      Math.floor(
        Math.random() * 10000
      );


    const company = {

      id:
        companyId,

      legalName:
        companyName ||
        business.name,

      name:
        companyName ||
        business.name,

      businessId:
        business.id,

      businessName:
        business.name,

      type:
        business.type,

      /*
       * Company starts in setup.
       * It becomes Operating only after
       * business setup + launch.
       */

      status:
        "Setup Required",

      operating:
        false,

      setupComplete:
        false,

      launchDay:
        null,

      cash:
        0,

      revenue:
        0,

      operatingCost:
        0,

      payroll:
        0,

      taxes:
        0,

      profit:
        0,

      employees:
        [],

      reputation:
        50,

      marketShare:
        1,

      valuation:
        0,

      subsidiaries:
        [],

      finance: {

        cash:
          0,

        totalRevenue:
          0,

        totalExpenses:
          0,

        profit:
          0,

        totalTaxes:
          0

      }

    };


    state.companies.push(
      company
    );


    business.status =
      "Owned";


    refreshBusinessAvailability();


    saveState();


    emitChange(
      "business-started",
      company
    );


    window.dispatchEvent(
      new CustomEvent(
        "EmpireBusinessStarted",
        {
          detail: {
            company
          }
        }
      )
    );


    return {

      success: true,

      company

    };

  }


  /* =========================================================
     COMPANY MONEY
  ========================================================= */

  function getCompany(
    companyId
  ) {

    return state.companies.find(
      function (company) {

        return (
          String(company.id) ===
          String(companyId)
        );

      }
    ) || null;

  }


  function addCompanyCash(
    companyId,
    amount,
    reason = "Company Income"
  ) {

    const company =
      getCompany(
        companyId
      );


    if (!company) {

      return false;

    }


    amount =
      num(amount);


    if (
      amount <= 0
    ) {

      return true;

    }


    normalizeCompany(
      company
    );


    company.finance.cash +=
      amount;


    company.cash =
      company.finance.cash;


    saveState();


    emitChange(
      "company-cash-added",
      {
        companyId,
        amount,
        reason
      }
    );


    return true;

  }


  function spendCompanyCash(
    companyId,
    amount,
    reason = "Company Expense"
  ) {

    const company =
      getCompany(
        companyId
      );


    if (!company) {

      return false;

    }


    amount =
      num(amount);


    if (
      amount <= 0
    ) {

      return true;

    }


    normalizeCompany(
      company
    );


    if (
      company.finance.cash <
      amount
    ) {

      return false;

    }


    company.finance.cash -=
      amount;


    company.cash =
      company.finance.cash;


    saveState();


    emitChange(
      "company-cash-spent",
      {
        companyId,
        amount,
        reason
      }
    );


    return true;

  }


  /* =========================================================
     EMPLOYEES
  ========================================================= */

  function hireEmployee(
    companyId,
    employee
  ) {

    const company =
      getCompany(
        companyId
      );


    if (!company) {

      return false;

    }


    if (!employee) {

      return false;

    }


    const newEmployee = {

      id:
        "employee_" +
        Date.now() +
        "_" +
        Math.floor(
          Math.random() * 10000
        ),

      companyId:
        companyId,

      name:
        employee.name ||
        "Employee",

      role:
        employee.role ||
        "Employee",

      department:
        employee.department ||
        "General",

      salary:
        num(
          employee.salary,
          30000
        ),

      performance:
        num(
          employee.performance,
          75
        ),

      morale:
        num(
          employee.morale,
          75
        ),

      experience:
        num(
          employee.experience,
          1
        ),

      status:
        "Working"

    };


    company.employees.push(
      newEmployee
    );


    state.employees.push(
      newEmployee
    );


    company.payroll =
      calculatePayroll(
        company
      );


    saveState();


    emitChange(
      "employee-hired",
      newEmployee
    );


    window.dispatchEvent(
      new CustomEvent(
        "EmpireEmployeeHired",
        {
          detail:
            newEmployee
        }
      )
    );


    return true;

  }


  function calculatePayroll(
    company
  ) {

    if (
      !company ||
      !Array.isArray(
        company.employees
      )
    ) {

      return 0;

    }


    return company.employees.reduce(
      function (
        total,
        employee
      ) {

        if (
          employee.status ===
          "Fired" ||

          employee.status ===
          "Resigned"
        ) {

          return total;

        }


        return (
          total +
          num(
            employee.salary
          )
        );

      },
      0
    );

  }


  /* =========================================================
     COMPANY LAUNCH
  ========================================================= */

  function launchCompany(
    companyId
  ) {

    const company =
      getCompany(
        companyId
      );


    if (!company) {

      return {
        success: false,
        reason:
          "Company not found"
      };

    }


    company.status =
      "Operating";

    company.operating =
      true;

    company.setupComplete =
      true;

    company.launchDay =
      state.world.totalDays;


    saveState();


    emitChange(
      "company-launched",
      company
    );


    window.dispatchEvent(
      new CustomEvent(
        "EmpireBusinessLaunched",
        {
          detail: {
            company
          }
        }
      )
    );


    return {
      success: true,
      company
    };

  }


  /* =========================================================
     DAY
  ========================================================= */

  function advanceDay() {

    state.world.day +=
      1;

    state.world.totalDays +=
      1;


    /*
     * 8 → 8.5 → 9...
     *
     * Other systems can modify this
     * further when needed.
     */

    state.world.timeOfDay +=
      0.5;


    if (
      state.world.timeOfDay >=
      24
    ) {

      state.world.timeOfDay -=
        24;

    }


    /*
     * Every 30 simulation days
     * represents one game month.
     */

    if (
      state.world.day > 30
    ) {

      state.world.day = 1;

      advanceMonth(
        true
      );

    }


    saveState();


    emitChange(
      "day",
      {
        day:
          state.world.day,

        month:
          state.world.month,

        year:
          state.world.year
      }
    );


    window.dispatchEvent(
      new CustomEvent(
        "EmpireDayAdvanced",
        {
          detail: {
            state
          }
        }
      )
    );

  }


  /* =========================================================
     MONTH
  ========================================================= */

  function advanceMonth(
    fromDay = false
  ) {

    /*
     * Salary + living expenses happen
     * once per month only.
     */

    paySalary();

    payLivingExpenses();


    /*
     * Central company economics is now
     * deliberately conservative.
     *
     * Specialized modules such as:
     *
     * Customer Market
     * Accounting
     * Product Market
     * Business Operations
     *
     * can add their own economic effects.
     */

    state.companies.forEach(
      function (company) {

        normalizeCompany(
          company
        );


        if (
          !company.operating
        ) {

          return;

        }


        const payroll =
          calculatePayroll(
            company
          );


        company.payroll =
          payroll;


        /*
         * Do NOT manufacture a second
         * large revenue stream here.
         *
         * Revenue should primarily come
         * from business-specific systems.
         */

        company.finance.totalExpenses +=
          payroll;


        company.operatingCost =
          payroll;


        company.finance.profit =
          num(
            company.finance.totalRevenue
          ) -
          num(
            company.finance.totalExpenses
          );


        company.profit =
          company.finance.profit;


        /*
         * Valuation remains conservative.
         */

        const annualizedProfit =
          Math.max(
            0,
            company.profit
          ) * 12;


        company.valuation =
          Math.max(
            company.finance.cash,
            annualizedProfit * 5
          );

      }
    );


    state.world.month +=
      1;


    if (
      state.world.month > 12
    ) {

      state.world.month = 1;

      state.world.year +=
        1;

      state.player.age +=
        1;

    }


    saveState();


    emitChange(
      "month",
      {
        fromDay
      }
    );


    window.dispatchEvent(
      new CustomEvent(
        "EmpireMonthAdvanced",
        {
          detail: {
            state
          }
        }
      )
    );

  }


  /* =========================================================
     MANUAL MONTH
  ========================================================= */

  function manualAdvanceMonth() {

    advanceMonth(
      false
    );

  }


  /* =========================================================
     RESET
  ========================================================= */

  function resetGame() {

    localStorage.removeItem(
      STORAGE_KEY
    );

    location.reload();

  }


  /* =========================================================
     SNAPSHOT
  ========================================================= */

  function getState() {

    return state;

  }


  function getPlayer() {

    return state.player;

  }


  function getCompanies() {

    return state.companies;

  }


  function getWorld() {

    return state.world;

  }


  /* =========================================================
     PUBLIC API
  ========================================================= */

  window.EmpireGameState = {

    state,

    getState,

    getPlayer,

    getCompanies,

    getWorld,


    save:
      saveState,

    reset:
      resetGame,


    money: {

      add:
        addCash,

      spend:
        spendCash,

      capital:
        getAvailableCapital,

      netWorth:
        getNetWorth

    },


    player: {

      setJob:
        setJob,

      paySalary:
        paySalary,

      payExpenses:
        payLivingExpenses,

      saveMoney:
        transferToSavings,

      withdrawSavings:
        withdrawSavings,

      netWorth:
        getNetWorth

    },


    business: {

      available:
        getAvailableBusinesses,

      start:
        startBusiness,

      launch:
        launchCompany

    },


    company: {

      get:
        getCompany,

      addCash:
        addCompanyCash,

      spendCash:
        spendCompanyCash,

      hire:
        hireEmployee,

      payroll:
        calculatePayroll

    },


    world: {

      advanceDay:
        advanceDay,

      advanceMonth:
        manualAdvanceMonth

    }

  };


  /* =========================================================
     INITIALIZATION
  ========================================================= */

  refreshBusinessAvailability();

  saveState();


  console.log(
    "EMPIRE RUSH — CENTRAL GAME STATE ONLINE",
    {
      version:
        STATE_VERSION,

      day:
        state.world.day,

      month:
        state.world.month,

      year:
        state.world.year,

      cash:
        state.player.cash,

      savings:
        state.player.savings,

      companies:
        state.companies.length
    }
  );

})();
