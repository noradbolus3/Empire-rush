(function () {
  "use strict";

  /*
   * =========================================================
   * EMPIRE RUSH — GAME STATE
   * Phase 1
   *
   * Shared browser-side simulation state.
   *
   * This mirrors the important concepts of the C# core:
   * Player → Job → Salary → Savings → Business → Company
   *
   * Later this contract can be connected directly to Unity C#.
   * =========================================================
   */

  const STORAGE_KEY = "empire_rush_game_state_v1";


  /* =========================================================
     DEFAULT STATE
  ========================================================= */

  const defaultState = {

    version: 1,

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

      weather: "Clear"

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
          typeof incoming[key] === "object" &&
          !Array.isArray(incoming[key]) &&
          base[key] &&
          typeof base[key] === "object" &&
          !Array.isArray(base[key])
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
     STATE
  ========================================================= */

  const state =
    loadState();


  /* =========================================================
     MONEY
  ========================================================= */

  function addCash(
    amount
  ) {

    amount =
      Number(amount) || 0;


    state.player.cash +=
      amount;


    refreshBusinessAvailability();

    saveState();

    emitChange(
      "cash"
    );

  }


  function spendCash(
    amount
  ) {

    amount =
      Number(amount) || 0;


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
      "cash"
    );


    return true;

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


    state.player.currentJob =
      job.title ||
      "Employee";


    state.player.jobLevel =
      job.level ||
      "Entry";


    state.player.monthlyIncome =
      Number(
        job.monthlySalary || 0
      );


    saveState();

    emitChange(
      "job"
    );


    return true;

  }


  /* =========================================================
     SALARY
  ========================================================= */

  function paySalary() {

    const salary =
      Number(
        state.player.monthlyIncome
      ) || 0;


    if (salary <= 0) {

      return;

    }


    state.player.cash +=
      salary;


    emitChange(
      "salary"
    );


    saveState();

  }


  /* =========================================================
     MONTHLY EXPENSE
  ========================================================= */

  function payLivingExpenses() {

    const expense =
      Number(
        state.player.monthlyExpenses
      ) || 0;


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


      state.player.cash = 0;

      state.player.debt +=
        shortage;

    }


    saveState();

    emitChange(
      "expenses"
    );

  }


  /* =========================================================
     SAVE MONEY
  ========================================================= */

  function transferToSavings(
    amount
  ) {

    amount =
      Number(amount) || 0;


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
      "savings"
    );


    return true;

  }


  /* =========================================================
     CAPITAL
  ========================================================= */

  function getAvailableCapital() {

    return (
      Number(state.player.cash) +
      Number(state.player.savings)
    );

  }


  /* =========================================================
     BUSINESS AVAILABILITY
  ========================================================= */

  function refreshBusinessAvailability() {

    const capital =
      getAvailableCapital();


    state.businesses.forEach(
      function (business) {

        if (
          capital >=
          business.minimumCapital
        ) {

          if (
            business.status ===
            "Locked"
          ) {

            business.status =
              "Available";

          }

        }
        else {

          if (
            business.status !==
            "Owned"
          ) {

            business.status =
              "Locked";

          }

        }

      }
    );

  }


  /* =========================================================
     GET AVAILABLE BUSINESSES
  ========================================================= */

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
     START BUSINESS
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
        reason: "Business not found"
      };

    }


    if (
      getAvailableCapital() <
      business.setupCost
    ) {

      return {
        success: false,
        reason: "Insufficient capital"
      };

    }


    let remaining =
      business.setupCost;


    if (
      state.player.cash >=
      remaining
    ) {

      state.player.cash -=
        remaining;

      remaining = 0;

    }
    else {

      remaining -=
        state.player.cash;

      state.player.cash = 0;

    }


    if (remaining > 0) {

      if (
        state.player.savings <
        remaining
      ) {

        return {
          success: false,
          reason: "Insufficient savings"
        };

      }


      state.player.savings -=
        remaining;

    }


    const company = {

      id:
        "company_" +
        Date.now(),

      legalName:
        companyName ||
        business.name,

      businessId:
        business.id,

      businessName:
        business.name,

      type:
        business.type,

      status:
        "Operating",

      cash: 0,

      revenue: 0,

      operatingCost: 0,

      payroll: 0,

      taxes: 0,

      employees: [],

      reputation: 50,

      marketShare: 1,

      valuation: 0,

      subsidiaries: []

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


    return {
      success: true,
      company: company
    };

  }


  /* =========================================================
     HIRE EMPLOYEE
  ========================================================= */

  function hireEmployee(
    companyId,
    employee
  ) {

    const company =
      state.companies.find(
        function (item) {

          return (
            item.id ===
            companyId
          );

        }
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
        Number(
          employee.salary || 30000
        ),

      performance:
        Number(
          employee.performance || 75
        ),

      morale:
        Number(
          employee.morale || 75
        ),

      experience:
        Number(
          employee.experience || 1
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
          detail: {
            name:
              newEmployee.name,

            role:
              newEmployee.role,

            department:
              newEmployee.department,

            salary:
              newEmployee.salary
          }
        }
      )
    );


    return true;

  }


  /* =========================================================
     PAYROLL
  ========================================================= */

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
      function (total, employee) {

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
          Number(
            employee.salary || 0
          )
        );

      },
      0
    );

  }


  /* =========================================================
     WORLD CLOCK
  ========================================================= */

  function advanceDay() {

    state.world.day +=
      1;


    state.world.timeOfDay +=
      0.5;


    if (
      state.world.timeOfDay >=
      24
    ) {

      state.world.timeOfDay = 0;

    }


    if (
      state.world.day % 30 ===
      0
    ) {

      advanceMonth();

    }


    saveState();


    emitChange(
      "day"
    );

  }


  function advanceMonth() {

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


    paySalary();

    payLivingExpenses();


    state.companies.forEach(
      processCompanyMonth
    );


    saveState();


    emitChange(
      "month"
    );

  }


  /* =========================================================
     COMPANY ECONOMICS
  ========================================================= */

  function processCompanyMonth(
    company
  ) {

    if (!company) {

      return;

    }


    const employeeCount =
      company.employees.length;


    const baseRevenue =
      Math.max(
        0,
        employeeCount * 30000
      );


    const reputationFactor =
      0.7 +
      (
        Number(
          company.reputation
        ) / 100
      ) * 0.6;


    const marketFactor =
      0.8 +
      (
        Number(
          company.marketShare
        ) / 100
      );


    company.revenue =
      baseRevenue *
      reputationFactor *
      marketFactor;


    company.payroll =
      calculatePayroll(
        company
      );


    company.operatingCost =
      Math.max(
        1000,
        company.revenue *
        0.25
      );


    company.taxes =
      Math.max(
        0,
        company.revenue *
        0.10
      );


    const profit =
      company.revenue -
      company.payroll -
      company.operatingCost -
      company.taxes;


    company.cash +=
      profit;


    company.valuation =
      Math.max(
        0,
        company.cash *
        8
      );


    if (
      profit > 0
    ) {

      company.status =
        "Growing";

      company.reputation =
        Math.min(
          100,
          company.reputation + 1
        );

    }
    else {

      company.status =
        "Distressed";

      company.reputation =
        Math.max(
          0,
          company.reputation - 2
        );

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

            type:
              type,

            data:
              detail || state,

            state:
              state

          }
        }
      )
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
     PUBLIC API
  ========================================================= */

  window.EmpireGameState = {

    state: state,

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
        getAvailableCapital

    },


    player: {

      setJob:
        setJob,

      paySalary:
        paySalary,

      payExpenses:
        payLivingExpenses,

      saveMoney:
        transferToSavings

    },


    business: {

      available:
        getAvailableBusinesses,

      start:
        startBusiness

    },


    company: {

      hire:
        hireEmployee,

      payroll:
        calculatePayroll

    },


    world: {

      advanceDay:
        advanceDay,

      advanceMonth:
        advanceMonth

    }

  };


  /* =========================================================
     INITIAL REFRESH
  ========================================================= */

  refreshBusinessAvailability();

  saveState();


  console.log(
    "EMPIRE RUSH GAME STATE ONLINE"
  );


})();
