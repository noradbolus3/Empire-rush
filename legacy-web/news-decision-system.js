(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH — NEWS + DECISION SYSTEM
   * ============================================================
   *
   * World Event
   *      ↓
   *     News
   *      ↓
   * Player Decision
   *      ↓
   * Immediate / Delayed Consequence
   *      ↓
   * Company / Market / Finance
   *
   * GAME LANGUAGE: ENGLISH
   * ============================================================
   */

  const Game = window.EmpireGameState;
  const Market = window.EmpireMarketEvents;

  if (!Game) {
    console.warn(
      "EmpireGameState not found. News system stopped."
    );
    return;
  }

  const NewsSystem = {

    /* ==========================================================
       INITIALIZATION
       ========================================================== */

    ensureState() {

      const state = Game.getState();

      if (!state.world) {
        state.world = {};
      }

      if (!state.world.news) {

        state.world.news = {

          current: null,

          history: [],

          pendingDecisions: [],

          decisionsMade: 0,

          positiveDecisions: 0,

          negativeDecisions: 0

        };
      }

      const news =
        state.world.news;

      if (!Array.isArray(news.history)) {
        news.history = [];
      }

      if (!Array.isArray(news.pendingDecisions)) {
        news.pendingDecisions = [];
      }

      return news;
    },

    /* ==========================================================
       NEWS DATABASE
       ========================================================== */

    templates: [

      {
        id: "interest-rate-news",

        category: "Finance",

        headline:
          "Central Bank Raises Interest Rates",

        body:
          "Borrowing costs are rising as monetary policy becomes tighter.",

        relatedEvent:
          "interest-rate-rise",

        decisions: [

          {
            id: "preserve-cash",

            title:
              "Preserve Cash",

            description:
              "Reduce discretionary spending and strengthen your company's cash position.",

            effects: {
              companyCash:
                5000,

              reputation:
                0,

              demand:
                -0.02
            }
          },

          {
            id: "borrow-now",

            title:
              "Borrow Before Rates Rise Further",

            description:
              "Increase borrowing to accelerate expansion despite higher interest costs.",

            effects: {
              companyCash:
                0,

              expansionPressure:
                10,

              risk:
                8
            }
          },

          {
            id: "ignore",

            title:
              "Ignore the Change",

            description:
              "Continue operating without changing your strategy.",

            effects: {
              risk:
                3
            }
          }

        ]
      },

      {
        id: "recession-news",

        category: "Economy",

        headline:
          "Economic Slowdown Raises Recession Concerns",

        body:
          "Consumer confidence is weakening and businesses are preparing for lower demand.",

        relatedEvent:
          "recession",

        decisions: [

          {
            id: "cut-costs",

            title:
              "Cut Operating Costs",

            description:
              "Reduce unnecessary spending to protect profitability.",

            effects: {
              costReduction:
                0.08,

              morale:
                -4
            }
          },

          {
            id: "retain-staff",

            title:
              "Protect Employee Jobs",

            description:
              "Maintain staffing levels and protect employee morale during the downturn.",

            effects: {
              morale:
                8,

              costIncrease:
                0.04
            }
          },

          {
            id: "expand-downturn",

            title:
              "Expand During the Downturn",

            description:
              "Take advantage of weaker competitors and invest aggressively.",

            effects: {
              expansionPressure:
                15,

              risk:
                15
            }
          }

        ]
      },

      {
        id: "inflation-news",

        category: "Economy",

        headline:
          "Input Costs Continue to Rise",

        body:
          "Suppliers are increasing prices as inflation puts pressure on businesses.",

        relatedEvent:
          "inflation",

        decisions: [

          {
            id: "raise-prices",

            title:
              "Increase Prices",

            description:
              "Pass part of the increased cost onto customers.",

            effects: {
              priceIncrease:
                0.08,

              demand:
                -0.04
            }
          },

          {
            id: "absorb-cost",

            title:
              "Absorb the Cost",

            description:
              "Keep prices stable and accept lower margins.",

            effects: {
              profitMargin:
                -0.08,

              reputation:
                3
            }
          },

          {
            id: "find-suppliers",

            title:
              "Search for New Suppliers",

            description:
              "Spend resources to find cheaper or more reliable suppliers.",

            effects: {
              companyCash:
                -5000,

              costReduction:
                0.06
            }
          }

        ]
      },

      {
        id: "digital-boom-news",

        category: "Technology",

        headline:
          "Digital Adoption Accelerates",

        body:
          "Businesses and consumers are rapidly adopting digital products and services.",

        relatedEvent:
          "digital-boom",

        decisions: [

          {
            id: "launch-product",

            title:
              "Accelerate Product Development",

            description:
              "Invest in development and launch a new digital product faster.",

            effects: {
              companyCash:
                -15000,

              demand:
                0.15,

              growth:
                12
            }
          },

          {
            id: "increase-marketing",

            title:
              "Increase Marketing",

            description:
              "Spend more on customer acquisition while demand is strong.",

            effects: {
              companyCash:
                -10000,

              demand:
                0.10
            }
          },

          {
            id: "stay-conservative",

            title:
              "Stay Conservative",

            description:
              "Avoid additional spending and maintain current operations.",

            effects: {
              risk:
                -2
            }
          }

        ]
      },

      {
        id: "supply-crisis-news",

        category: "Supply Chain",

        headline:
          "Supply Chain Disruption Reported",

        body:
          "Several suppliers are reporting delays and shortages.",

        relatedEvent:
          "supply-crisis",

        decisions: [

          {
            id: "stock-inventory",

            title:
              "Build Inventory",

            description:
              "Purchase additional inventory before shortages worsen.",

            effects: {
              companyCash:
                -20000,

              inventory:
                20,

              risk:
                -3
            }
          },

          {
            id: "reduce-production",

            title:
              "Reduce Production",

            description:
              "Lower production to conserve materials and cash.",

            effects: {
              production:
                -10,

              costReduction:
                0.05
            }
          },

          {
            id: "find-alternative",

            title:
              "Find Alternative Suppliers",

            description:
              "Search for alternative sources at higher short-term cost.",

            effects: {
              companyCash:
                -8000,

              supplySecurity:
                15
            }
          }

        ]
      },

      {
        id: "consumer-boom-news",

        category: "Consumer",

        headline:
          "Consumer Spending Surges",

        body:
          "Household spending is increasing and businesses are reporting stronger demand.",

        relatedEvent:
          "consumer-boom",

        decisions: [

          {
            id: "increase-capacity",

            title:
              "Increase Capacity",

            description:
              "Invest in additional employees, equipment or inventory.",

            effects: {
              companyCash:
                -20000,

              growth:
                12,

              capacity:
                15
            }
          },

          {
            id: "premium-pricing",

            title:
              "Introduce Premium Pricing",

            description:
              "Use strong demand to improve margins.",

            effects: {
              priceIncrease:
                0.10,

              demand:
                0.02
            }
          },

          {
            id: "maintain",

            title:
              "Maintain Current Strategy",

            description:
              "Take advantage of higher demand without additional investment.",

            effects: {
              growth:
                3
            }
          }

        ]
      }

    ],

    /* ==========================================================
       CREATE NEWS EVENT
       ========================================================== */

    createNews(template) {

      const news =
        this.ensureState();

      const state =
        Game.getState();

      const currentDay =
        Number(
          state.world?.day || 1
        );

      const item = {

        id:
          template.id +
          "-" +
          Date.now(),

        category:
          template.category,

        headline:
          template.headline,

        body:
          template.body,

        relatedEvent:
          template.relatedEvent,

        day:
          currentDay,

        createdAt:
          Date.now(),

        decisions:
          template.decisions.map(
            decision => ({
              ...decision,
              used: false
            })
          ),

        expiresDay:
          currentDay + 5

      };

      news.current =
        item;

      news.pendingDecisions.push(
        item
      );

      news.history.push(
        item
      );

      /*
       * Keep history manageable.
       */

      if (
        news.history.length > 100
      ) {
        news.history =
          news.history.slice(-100);
      }

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireNewsCreated",
          {
            detail: {
              news: item
            }
          }
        )
      );

      return item;
    },

    /* ==========================================================
       GENERATE RANDOM NEWS
       ========================================================== */

    generateNews() {

      const news =
        this.ensureState();

      /*
       * Don't flood player with news.
       */

      if (
        news.pendingDecisions.length >= 2
      ) {
        return null;
      }

      if (
        this.templates.length === 0
      ) {
        return null;
      }

      const template =
        this.templates[
          Math.floor(
            Math.random() *
            this.templates.length
          )
        ];

      return this.createNews(
        template
      );
    },

    /* ==========================================================
       APPLY DECISION
       ========================================================== */

    makeDecision(
      newsId,
      decisionId
    ) {

      const newsState =
        this.ensureState();

      const news =
        newsState.pendingDecisions.find(
          item =>
            item.id === newsId
        );

      if (!news) {

        return {
          success: false,
          reason:
            "News decision is no longer available."
        };

      }

      if (
        Number(
          Game.getState()?.world?.day || 1
        ) >
        Number(news.expiresDay)
      ) {

        return {
          success: false,
          reason:
            "Decision deadline has expired."
        };

      }

      const decision =
        news.decisions.find(
          item =>
            item.id === decisionId
        );

      if (!decision) {

        return {
          success: false,
          reason:
            "Decision not found."
        };

      }

      if (decision.used) {

        return {
          success: false,
          reason:
            "Decision has already been used."
        };

      }

      decision.used =
        true;

      const effects =
        decision.effects || {};

      const state =
        Game.getState();

      const affectedCompanies = [];

      /*
       * Apply effects to all operating
       * player companies.
       */

      if (
        Array.isArray(
          state.companies
        )
      ) {

        state.companies.forEach(
          company => {

            if (
              company.status !==
              "Operating"
            ) {
              return;
            }

            company.newsEffects =
              company.newsEffects || {};

            const e =
              company.newsEffects;

            /*
             * Company cash.
             */

            if (
              effects.companyCash
            ) {

              const amount =
                Number(
                  effects.companyCash
                );

              if (
                amount > 0
              ) {

                if (
                  window.EmpireAccounting
                ) {

                  window.EmpireAccounting.addCash(
                    company,
                    amount,
                    "Strategic decision"

                  );

                } else {

                  company.finance =
                    company.finance || {};

                  company.finance.cash =
                    Number(
                      company.finance.cash || 0
                    ) + amount;

                }

              } else {

                const cost =
                  Math.abs(amount);

                if (
                  window.EmpireAccounting
                ) {

                  window.EmpireAccounting.spendCash(
                    company,
                    cost,
                    "Strategic decision",
                    "Operating"
                  );

                } else {

                  company.finance =
                    company.finance || {};

                  company.finance.cash =
                    Math.max(
                      0,
                      Number(
                        company.finance.cash || 0
                      ) - cost
                    );

                }

              }

            }

            /*
             * Demand.
             */

            if (
              effects.demand
            ) {

              e.demandModifier =
                Number(
                  e.demandModifier || 0
                ) +
                Number(
                  effects.demand
                );

            }

            /*
             * Growth.
             */

            if (
              effects.growth
            ) {

              e.growth =
                Number(
                  e.growth || 0
                ) +
                Number(
                  effects.growth
                );

            }

            /*
             * Risk.
             */

            if (
              effects.risk
            ) {

              e.risk =
                Number(
                  e.risk || 0
                ) +
                Number(
                  effects.risk
                );

            }

            /*
             * Morale.
             */

            if (
              effects.morale &&
              Array.isArray(
                company.employees
              )
            ) {

              company.employees.forEach(
                employee => {

                  employee.morale =
                    Math.max(
                      0,
                      Math.min(
                        100,
                        Number(
                          employee.morale || 0
                        ) +
                        Number(
                          effects.morale
                        )
                      )
                    );

                }
              );

            }

            /*
             * Cost reduction.
             */

            if (
              effects.costReduction
            ) {

              e.costReduction =
                Number(
                  e.costReduction || 0
                ) +
                Number(
                  effects.costReduction
                );

            }

            /*
             * Capacity.
             */

            if (
              effects.capacity
            ) {

              e.capacity =
                Number(
                  e.capacity || 0
                ) +
                Number(
                  effects.capacity
                );

            }

            /*
             * Price.
             */

            if (
              effects.priceIncrease
            ) {

              e.priceIncrease =
                Number(
                  e.priceIncrease || 0
                ) +
                Number(
                  effects.priceIncrease
                );

            }

            /*
             * Inventory.
             */

            if (
              effects.inventory
            ) {

              e.inventory =
                Number(
                  e.inventory || 0
                ) +
                Number(
                  effects.inventory
                );

            }

            /*
             * Production.
             */

            if (
              effects.production
            ) {

              e.production =
                Number(
                  e.production || 0
                ) +
                Number(
                  effects.production
                );

            }

            /*
             * Supply security.
             */

            if (
              effects.supplySecurity
            ) {

              e.supplySecurity =
                Number(
                  e.supplySecurity || 0
                ) +
                Number(
                  effects.supplySecurity
                );

            }

            affectedCompanies.push(
              company
            );

          }
        );

      }

      /*
       * Decision history.
       */

      newsState.decisionsMade++;

      if (
        (
          effects.growth || 0
        ) +
        (
          effects.capacity || 0
        ) +
        (
          effects.demand || 0
        ) >
        0
      ) {

        newsState.positiveDecisions++;

      } else {

        newsState.negativeDecisions++;

      }

      news.decisionMade = {
        id:
          decision.id,

        title:
          decision.title,

        day:
          state.world?.day || 1
      };

      /*
       * Remove from pending decisions.
       */

      newsState.pendingDecisions =
        newsState.pendingDecisions.filter(
          item =>
            item.id !== newsId
        );

      if (
        newsState.current?.id ===
        newsId
      ) {

        newsState.current =
          null;

      }

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireDecisionMade",
          {
            detail: {
              news,
              decision,
              affectedCompanies
            }
          }
        )
      );

      return {

        success: true,

        news,

        decision,

        affectedCompanies

      };
    },

    /* ==========================================================
       EXPIRE OLD NEWS
       ========================================================== */

    expireOldNews() {

      const newsState =
        this.ensureState();

      const day =
        Number(
          Game.getState()?.world?.day || 1
        );

      newsState.pendingDecisions =
        newsState.pendingDecisions.filter(
          item =>
            Number(
              item.expiresDay
            ) >= day
        );

      if (
        newsState.current &&
        Number(
          newsState.current.expiresDay
        ) < day
      ) {

        newsState.current =
          null;

      }

      Game.save();
    },

    /* ==========================================================
       GET CURRENT NEWS
       ========================================================== */

    getCurrentNews() {

      const news =
        this.ensureState();

      return news.current;
    },

    /* ==========================================================
       GET PENDING DECISIONS
       ========================================================== */

    getPendingDecisions() {

      const news =
        this.ensureState();

      return news.pendingDecisions;
    },

    /* ==========================================================
       GET NEWS HISTORY
       ========================================================== */

    getHistory() {

      const news =
        this.ensureState();

      return news.history;
    },

    /* ==========================================================
       GET COMPANY EFFECTS
       ========================================================== */

    getCompanyEffects(company) {

      if (!company) {
        return {};
      }

      return (
        company.newsEffects ||
        {}
      );
    },

    /* ==========================================================
       APPLY MARKET EVENT → NEWS
       ========================================================== */

    syncWithMarketEvent(event) {

      if (!event) {
        return null;
      }

      /*
       * Find matching news template.
       */

      const template =
        this.templates.find(
          item =>
            item.relatedEvent ===
            event.id
        );

      if (!template) {
        return null;
      }

      return this.createNews(
        template
      );
    },

    /* ==========================================================
       DAILY UPDATE
       ========================================================== */

    dailyUpdate() {

      this.ensureState();

      this.expireOldNews();

      /*
       * Moderate chance of a new
       * player-facing news story.
       */

      if (
        Math.random() < 0.12
      ) {

        this.generateNews();

      }

      Game.save();
    },

    /* ==========================================================
       SUMMARY
       ========================================================== */

    getSummary() {

      const news =
        this.ensureState();

      return {

        current:
          news.current,

        pending:
          news.pendingDecisions.length,

        totalNews:
          news.history.length,

        decisionsMade:
          news.decisionsMade,

        positiveDecisions:
          news.positiveDecisions,

        negativeDecisions:
          news.negativeDecisions

      };
    }
  };

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireNewsSystem =
    NewsSystem;

  /* ============================================================
     DAILY EVENT
     ============================================================ */

  window.addEventListener(
    "EmpireDayAdvanced",
    function () {

      NewsSystem.dailyUpdate();

    }
  );

  /* ============================================================
     MARKET EVENT → NEWS
     ============================================================ */

  window.addEventListener(
    "EmpireMarketEvent",
    function (event) {

      const marketEvent =
        event.detail?.event;

      if (!marketEvent) {
        return;
      }

      /*
       * Give the player a news story
       * for important market events.
       */

      NewsSystem.syncWithMarketEvent(
        marketEvent
      );

    }
  );

  /* ============================================================
     DECISION EVENT
     ============================================================ */

  window.addEventListener(
    "EmpireDecisionMade",
    function (event) {

      const detail =
        event.detail;

      console.log(
        "Empire Rush decision:",
        detail?.decision?.title
      );

    }
  );

  console.log(
    "Empire Rush: News + Decision System loaded."
  );

})();
