(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH — CUSTOMER + MARKET DEMAND SYSTEM
   * ============================================================
   *
   * Flow:
   * Customer → Demand → Visit → Purchase → Revenue
   *                         ↓
   *                   Reputation
   *
   * Company money is kept separate from player's personal cash.
   * ============================================================
   */

  const Game = window.EmpireGameState;

  if (!Game) {
    console.warn("EmpireGameState not found.");
    return;
  }

  const Market = {

    /* ----------------------------------------------------------
       CONFIG
    ---------------------------------------------------------- */

    baseDemand: {
      food: 42,
      retail: 32,
      software: 18,
      manufacturing: 20,
      services: 25,
      freelance: 15,
      generic: 20
    },

    locationMultiplier: {
      "Home / Residential": 0.65,
      "Local Market": 1.00,
      "Commercial Area": 1.25,
      "Business District": 1.45,
      "Industrial Area": 1.20
    },

    /* ----------------------------------------------------------
       INITIALIZE COMPANY ECONOMY
    ---------------------------------------------------------- */

    ensureCompany(company) {

      if (!company) return null;

      if (!company.finance) {
        company.finance = {
          cash: 0,
          bankBalance: 0,
          totalRevenue: 0,
          totalExpenses: 0,
          totalProfit: 0
        };
      }

      if (!company.market) {
        company.market = {
          demand: 0,
          customersToday: 0,
          salesToday: 0,
          revenueToday: 0,
          repeatCustomers: 0,
          reputation: 50,
          marketShare: 0,
          lastDemand: 0
        };
      }

      if (!company.operations) {
        company.operations = {};
      }

      return company;
    },

    /* ----------------------------------------------------------
       BUSINESS TYPE
    ---------------------------------------------------------- */

    getType(company) {

      const text = (
        (company.type || "") +
        " " +
        (company.name || "") +
        " " +
        (company.category || "")
      ).toLowerCase();

      if (
        text.includes("food") ||
        text.includes("restaurant") ||
        text.includes("cafe") ||
        text.includes("kitchen")
      ) {
        return "food";
      }

      if (
        text.includes("retail") ||
        text.includes("store") ||
        text.includes("shop")
      ) {
        return "retail";
      }

      if (
        text.includes("software") ||
        text.includes("startup") ||
        text.includes("app") ||
        text.includes("tech")
      ) {
        return "software";
      }

      if (
        text.includes("manufacturing") ||
        text.includes("factory") ||
        text.includes("manufacture")
      ) {
        return "manufacturing";
      }

      if (
        text.includes("freelance")
      ) {
        return "freelance";
      }

      if (
        text.includes("service") ||
        text.includes("consult")
      ) {
        return "services";
      }

      return "generic";
    },

    /* ----------------------------------------------------------
       LOCATION
    ---------------------------------------------------------- */

    getLocationMultiplier(company) {

      const location =
        company.location ||
        company.setup?.location ||
        "Local Market";

      return this.locationMultiplier[location] || 1;
    },

    /* ----------------------------------------------------------
       REPUTATION
    ---------------------------------------------------------- */

    getReputation(company) {

      this.ensureCompany(company);

      let reputation = Number(
        company.market.reputation ?? 50
      );

      return Math.max(0, Math.min(100, reputation));
    },

    setReputation(company, value) {

      this.ensureCompany(company);

      company.market.reputation =
        Math.max(0, Math.min(100, Math.round(value)));

      return company.market.reputation;
    },

    /* ----------------------------------------------------------
       DEMAND CALCULATION
    ---------------------------------------------------------- */

    calculateDemand(company) {

      this.ensureCompany(company);

      const type = this.getType(company);

      const base =
        this.baseDemand[type] ||
        this.baseDemand.generic;

      const reputation =
        this.getReputation(company);

      /*
       * Reputation factor:
       *
       * 0 reputation  → 0.40x
       * 50 reputation → 1.00x
       * 100 reputation → 1.60x
       */

      const reputationMultiplier =
        0.4 + (reputation / 100) * 1.2;

      const locationMultiplier =
        this.getLocationMultiplier(company);

      /*
       * Employee capacity
       */

      const employees =
        Array.isArray(company.employees)
          ? company.employees.length
          : 0;

      const employeeMultiplier =
        employees === 0
          ? 0.75
          : Math.min(1.5, 0.85 + employees * 0.08);

      /*
       * Random market movement
       */

      const marketVariation =
        0.90 + Math.random() * 0.20;

      const demand =
        base *
        reputationMultiplier *
        locationMultiplier *
        employeeMultiplier *
        marketVariation;

      company.market.lastDemand =
        company.market.demand || 0;

      company.market.demand =
        Math.max(1, Math.round(demand));

      return company.market.demand;
    },

    /* ----------------------------------------------------------
       AVERAGE CUSTOMER VALUE
    ---------------------------------------------------------- */

    getAverageCustomerValue(company) {

      const type = this.getType(company);

      switch (type) {

        case "food":
          return 650;

        case "retail":
          return 1800;

        case "software":
          return 900;

        case "manufacturing":
          return 12000;

        case "services":
          return 5000;

        case "freelance":
          return 3500;

        default:
          return 1200;
      }
    },

    /* ----------------------------------------------------------
       COMPANY CASH
    ---------------------------------------------------------- */

    getCompanyCash(company) {

      this.ensureCompany(company);

      return Number(
        company.finance.cash || 0
      );
    },

    addCompanyCash(company, amount) {

      this.ensureCompany(company);

      company.finance.cash =
        Math.max(
          0,
          Number(company.finance.cash || 0) +
          Number(amount || 0)
        );

      return company.finance.cash;
    },

    spendCompanyCash(company, amount) {

      this.ensureCompany(company);

      amount = Number(amount || 0);

      if (amount <= 0) return true;

      if (
        Number(company.finance.cash || 0) < amount
      ) {
        return false;
      }

      company.finance.cash -= amount;

      return true;
    },

    /* ----------------------------------------------------------
       CUSTOMER TRANSACTION
    ---------------------------------------------------------- */

    processCustomer(company) {

      this.ensureCompany(company);

      if (company.status !== "Operating") {
        return {
          success: false,
          reason: "Business is not operating."
        };
      }

      const type = this.getType(company);

      let value =
        this.getAverageCustomerValue(company);

      /*
       * Customer spending variation
       */

      value *=
        0.75 + Math.random() * 0.50;

      value = Math.round(value);

      /*
       * Business-specific COGS
       */

      let costRate = 0.30;

      if (type === "food") {
        costRate = 0.32;
      }

      if (type === "retail") {
        costRate = 0.58;
      }

      if (type === "software") {
        costRate = 0.18;
      }

      if (type === "manufacturing") {
        costRate = 0.62;
      }

      if (type === "services") {
        costRate = 0.20;
      }

      if (type === "freelance") {
        costRate = 0.12;
      }

      const cost =
        Math.round(value * costRate);

      const grossProfit =
        value - cost;

      /*
       * Company receives revenue.
       */

      this.addCompanyCash(
        company,
        value
      );

      company.finance.totalRevenue =
        Number(company.finance.totalRevenue || 0) +
        value;

      company.finance.totalExpenses =
        Number(company.finance.totalExpenses || 0) +
        cost;

      company.finance.totalProfit =
        Number(company.finance.totalProfit || 0) +
        grossProfit;

      company.market.customersToday =
        Number(company.market.customersToday || 0) +
        1;

      company.market.salesToday =
        Number(company.market.salesToday || 0) +
        1;

      company.market.revenueToday =
        Number(company.market.revenueToday || 0) +
        value;

      /*
       * Small reputation improvement.
       */

      this.setReputation(
        company,
        this.getReputation(company) + 0.05
      );

      return {
        success: true,
        type,
        revenue: value,
        cost,
        grossProfit
      };
    },

    /* ----------------------------------------------------------
       RUN DAILY MARKET
    ---------------------------------------------------------- */

    runDailyMarket(company) {

      this.ensureCompany(company);

      if (company.status !== "Operating") {
        return {
          success: false,
          reason: "Business is not operating."
        };
      }

      const demand =
        this.calculateDemand(company);

      /*
       * Demand represents potential customers.
       */

      const potentialCustomers =
        Math.max(
          1,
          Math.round(
            demand *
            (0.75 + Math.random() * 0.5)
          )
        );

      let processed = 0;
      let revenue = 0;
      let profit = 0;

      /*
       * Process transactions.
       *
       * Limit prevents browser slowdown.
       */

      const maxCustomers =
        Math.min(
          potentialCustomers,
          100
        );

      for (
        let i = 0;
        i < maxCustomers;
        i++
      ) {

        const transaction =
          this.processCustomer(company);

        if (!transaction.success) {
          break;
        }

        processed++;

        revenue +=
          transaction.revenue;

        profit +=
          transaction.grossProfit;
      }

      /*
       * Market share approximation.
       */

      company.market.marketShare =
        Math.min(
          100,
          Math.round(
            company.market.reputation *
            0.25 +
            demand *
            0.35
          ) / 10
        );

      /*
       * Notify world.
       */

      window.dispatchEvent(
        new CustomEvent(
          "EmpireMarketActivity",
          {
            detail: {
              company,
              customers: processed,
              revenue,
              profit,
              demand
            }
          }
        )
      );

      Game.save();

      return {
        success: true,
        demand,
        customers: processed,
        revenue,
        profit,
        reputation:
          company.market.reputation
      };
    },

    /* ----------------------------------------------------------
       RESET DAILY STATS
    ---------------------------------------------------------- */

    resetDaily(company) {

      this.ensureCompany(company);

      company.market.customersToday = 0;
      company.market.salesToday = 0;
      company.market.revenueToday = 0;
    },

    /* ----------------------------------------------------------
       COMPANY SUMMARY
    ---------------------------------------------------------- */

    getSummary(company) {

      this.ensureCompany(company);

      return {
        name: company.name,
        type: this.getType(company),
        status: company.status,

        cash:
          this.getCompanyCash(company),

        demand:
          Math.round(
            company.market.demand || 0
          ),

        customersToday:
          company.market.customersToday || 0,

        salesToday:
          company.market.salesToday || 0,

        revenueToday:
          company.market.revenueToday || 0,

        reputation:
          Math.round(
            company.market.reputation || 0
          ),

        marketShare:
          company.market.marketShare || 0,

        totalRevenue:
          company.finance.totalRevenue || 0,

        totalExpenses:
          company.finance.totalExpenses || 0,

        totalProfit:
          company.finance.totalProfit || 0
      };
    },

    /* ----------------------------------------------------------
       RUN ALL COMPANIES
    ---------------------------------------------------------- */

    runWorldMarket() {

      const state =
        Game.getState();

      if (!state || !Array.isArray(state.companies)) {
        return [];
      }

      const results = [];

      state.companies.forEach(company => {

        if (company.status !== "Operating") {
          return;
        }

        const result =
          this.runDailyMarket(company);

        results.push({
          company,
          result
        });

      });

      Game.save();

      return results;
    }
  };

  /* ============================================================
     PUBLIC API
  ============================================================ */

  window.EmpireCustomerMarket = Market;

  /* ============================================================
     GAME EVENTS
  ============================================================ */

  window.addEventListener(
    "EmpireBusinessLaunched",
    function (event) {

      const company =
        event.detail?.company;

      if (!company) return;

      Market.ensureCompany(company);

      /*
       * Opening reputation.
       */

      if (
        company.market.reputation === undefined
      ) {
        company.market.reputation = 50;
      }

      Game.save();
    }
  );

  /* ============================================================
     DAILY MARKET EVENT
     ============================================================ */

  window.addEventListener(
    "EmpireDayAdvanced",
    function () {

      /*
       * New business day.
       */

      Market.runWorldMarket();

    }
  );

  /* ============================================================
     BUSINESS START EVENT
     ============================================================ */

  window.addEventListener(
    "EmpireBusinessStarted",
    function (event) {

      const company =
        event.detail?.company;

      if (!company) return;

      Market.ensureCompany(company);

      Game.save();
    }
  );

  console.log(
    "Empire Rush: Customer + Market Demand System loaded."
  );

})();
