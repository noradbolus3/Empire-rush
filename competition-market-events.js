(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH — COMPETITION + MARKET EVENTS
   * ============================================================
   *
   * WORLD
   *   ↓
   * Market Conditions
   *   ↓
   * Competitors + Economic Events
   *   ↓
   * Demand / Costs / Prices
   *   ↓
   * Company Performance
   *
   * This module does NOT replace company accounting.
   * It modifies the economic environment around businesses.
   * ============================================================
   */

  const Game = window.EmpireGameState;

  if (!Game) {
    console.warn(
      "EmpireGameState not found. Market events stopped."
    );
    return;
  }

  const MarketEvents = {

    /* ==========================================================
       WORLD MARKET STATE
       ========================================================== */

    ensureWorld() {

      const state = Game.getState();

      if (!state.world) {
        state.world = {};
      }

      if (!state.world.market) {

        state.world.market = {

          demandIndex: 100,

          inflationIndex: 100,

          supplyIndex: 100,

          laborCostIndex: 100,

          interestRateIndex: 100,

          consumerConfidence: 70,

          businessConfidence: 70,

          activeEvents: [],

          eventHistory: [],

          lastEventDay: 0

        };

      }

      const market =
        state.world.market;

      if (!Array.isArray(market.activeEvents)) {
        market.activeEvents = [];
      }

      if (!Array.isArray(market.eventHistory)) {
        market.eventHistory = [];
      }

      if (market.demandIndex === undefined) {
        market.demandIndex = 100;
      }

      if (market.inflationIndex === undefined) {
        market.inflationIndex = 100;
      }

      if (market.supplyIndex === undefined) {
        market.supplyIndex = 100;
      }

      if (market.laborCostIndex === undefined) {
        market.laborCostIndex = 100;
      }

      if (market.interestRateIndex === undefined) {
        market.interestRateIndex = 100;
      }

      if (market.consumerConfidence === undefined) {
        market.consumerConfidence = 70;
      }

      if (market.businessConfidence === undefined) {
        market.businessConfidence = 70;
      }

      return market;
    },

    /* ==========================================================
       BUSINESS TYPE
       ========================================================== */

    getBusinessType(company) {

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

    /* ==========================================================
       COMPETITION STATE
       ========================================================== */

    ensureCompetition(company) {

      if (!company) return null;

      if (!company.competition) {

        company.competition = {

          competitors: [],

          pressure: 0,

          pricePressure: 0,

          qualityPressure: 0,

          customerLossRate: 0

        };

      }

      if (
        !Array.isArray(
          company.competition.competitors
        )
      ) {
        company.competition.competitors = [];
      }

      return company.competition;
    },

    /* ==========================================================
       COMPETITOR DATABASE
       ========================================================== */

    competitorNames: {

      food: [
        "Fresh Bites",
        "Urban Kitchen",
        "Taste Street",
        "Daily Foods",
        "Royal Meals"
      ],

      retail: [
        "City Mart",
        "Value Store",
        "Smart Retail",
        "Daily Needs",
        "Market Hub"
      ],

      software: [
        "NovaSoft",
        "CloudCore",
        "TechNova",
        "Pixel Systems",
        "NextGen Apps"
      ],

      manufacturing: [
        "Prime Industries",
        "Metro Manufacturing",
        "Alpha Components",
        "National Works",
        "Industrial Hub"
      ],

      services: [
        "ProServe",
        "Business Solutions",
        "ExpertWorks",
        "Prime Consultants",
        "Smart Services"
      ],

      freelance: [
        "Independent Pro",
        "Creative Works",
        "Freelance Hub",
        "Expert Network"
      ],

      generic: [
        "Local Enterprise",
        "Prime Business",
        "City Enterprise",
        "Market Leader"
      ]

    },

    /* ==========================================================
       ADD COMPETITOR
       ========================================================== */

    addCompetitor(company) {

      const competition =
        this.ensureCompetition(company);

      const type =
        this.getBusinessType(company);

      const names =
        this.competitorNames[type] ||
        this.competitorNames.generic;

      /*
       * Prevent excessive competitors.
       */

      if (
        competition.competitors.length >= 8
      ) {
        return null;
      }

      const name =
        names[
          Math.floor(
            Math.random() * names.length
          )
        ];

      const competitor = {

        id:
          "COMP-" +
          Date.now() +
          "-" +
          Math.floor(
            Math.random() * 10000
          ),

        name,

        type,

        reputation:
          Math.round(
            40 +
            Math.random() * 45
          ),

        marketShare:
          Math.round(
            3 +
            Math.random() * 12
          ),

        priceLevel:
          Math.round(
            85 +
            Math.random() * 30
          ),

        quality:
          Math.round(
            50 +
            Math.random() * 45
          ),

        aggressiveness:
          Math.round(
            30 +
            Math.random() * 60
          ),

        active:
          true,

        monthsActive:
          0

      };

      competition.competitors.push(
        competitor
      );

      this.recalculateCompetition(
        company
      );

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireCompetitorEntered",
          {
            detail: {
              company,
              competitor
            }
          }
        )
      );

      return competitor;
    },

    /* ==========================================================
       COMPETITION CALCULATION
       ========================================================== */

    recalculateCompetition(company) {

      const competition =
        this.ensureCompetition(company);

      const competitors =
        competition.competitors.filter(
          competitor =>
            competitor.active !== false
        );

      if (competitors.length === 0) {

        competition.pressure = 0;
        competition.pricePressure = 0;
        competition.qualityPressure = 0;
        competition.customerLossRate = 0;

        return competition;
      }

      let pressure = 0;
      let pricePressure = 0;
      let qualityPressure = 0;

      competitors.forEach(
        competitor => {

          pressure +=
            competitor.aggressiveness *
            0.15;

          pricePressure +=
            Math.max(
              0,
              competitor.aggressiveness -
              30
            ) *
            0.20;

          qualityPressure +=
            competitor.quality *
            0.10;

        }
      );

      competition.pressure =
        Math.min(
          100,
          Math.round(
            pressure
          )
        );

      competition.pricePressure =
        Math.min(
          100,
          Math.round(
            pricePressure
          )
        );

      competition.qualityPressure =
        Math.min(
          100,
          Math.round(
            qualityPressure
          )
        );

      competition.customerLossRate =
        Math.min(
          0.35,
          competition.pressure /
          1000
        );

      return competition;
    },

    /* ==========================================================
       GET MARKET MULTIPLIERS
       ========================================================== */

    getDemandMultiplier(company) {

      const market =
        this.ensureWorld();

      const competition =
        this.ensureCompetition(company);

      let multiplier =
        market.demandIndex / 100;

      /*
       * Consumer confidence.
       */

      multiplier *=
        0.75 +
        (
          market.consumerConfidence /
          100
        ) *
        0.50;

      /*
       * Competition reduces demand.
       */

      multiplier *=
        1 -
        competition.customerLossRate;

      /*
       * Active market events.
       */

      market.activeEvents.forEach(
        event => {

          if (
            !event.demandEffect
          ) {
            return;
          }

          if (
            event.businessType &&
            event.businessType !==
              this.getBusinessType(company)
          ) {
            return;
          }

          multiplier *=
            event.demandEffect;

        }
      );

      return Math.max(
        0.20,
        Math.min(
          2.50,
          multiplier
        )
      );
    },

    getCostMultiplier(company) {

      const market =
        this.ensureWorld();

      let multiplier =
        market.inflationIndex / 100;

      market.activeEvents.forEach(
        event => {

          if (
            !event.costEffect
          ) {
            return;
          }

          if (
            event.businessType &&
            event.businessType !==
              this.getBusinessType(company)
          ) {
            return;
          }

          multiplier *=
            event.costEffect;

        }
      );

      return Math.max(
        0.50,
        Math.min(
          3.00,
          multiplier
        )
      );
    },

    /* ==========================================================
       MARKET EVENTS
       ========================================================== */

    events: [

      {
        id: "consumer-boom",

        name: "Consumer Spending Boom",

        description:
          "Consumer spending has increased across the market.",

        demandEffect:
          1.25,

        costEffect:
          1.00,

        confidence:
          5,

        probability:
          0.025
      },

      {
        id: "consumer-slowdown",

        name: "Consumer Spending Slowdown",

        description:
          "Consumers are reducing discretionary spending.",

        demandEffect:
          0.75,

        costEffect:
          1.00,

        confidence:
          -7,

        probability:
          0.025
      },

      {
        id: "inflation",

        name: "Inflation Spike",

        description:
          "Input and operating costs have increased.",

        demandEffect:
          0.95,

        costEffect:
          1.18,

        confidence:
          -4,

        probability:
          0.025
      },

      {
        id: "supply-crisis",

        name: "Supply Chain Disruption",

        description:
          "Suppliers are facing delays and shortages.",

        demandEffect:
          0.90,

        costEffect:
          1.25,

        confidence:
          -5,

        probability:
          0.020
      },

      {
        id: "interest-rate-rise",

        name: "Interest Rate Increase",

        description:
          "Banks have tightened financing conditions.",

        demandEffect:
          0.95,

        costEffect:
          1.03,

        confidence:
          -4,

        probability:
          0.020,

        interestEffect:
          12
      },

      {
        id: "interest-rate-cut",

        name: "Interest Rate Reduction",

        description:
          "Financing has become cheaper.",

        demandEffect:
          1.08,

        costEffect:
          0.98,

        confidence:
          5,

        probability:
          0.015,

        interestEffect:
          -10
      },

      {
        id: "economic-recovery",

        name: "Economic Recovery",

        description:
          "Business activity is accelerating.",

        demandEffect:
          1.18,

        costEffect:
          1.02,

        confidence:
          8,

        probability:
          0.015
      },

      {
        id: "recession",

        name: "Economic Recession",

        description:
          "Economic activity has contracted.",

        demandEffect:
          0.65,

        costEffect:
          1.08,

        confidence:
          -12,

        probability:
          0.010
      },

      {
        id: "labor-shortage",

        name: "Labor Shortage",

        description:
          "Hiring has become more expensive.",

        demandEffect:
          0.98,

        costEffect:
          1.10,

        confidence:
          -3,

        probability:
          0.018
      },

      {
        id: "digital-boom",

        name: "Digital Adoption Boom",

        description:
          "Demand for digital products and services is rising.",

        businessType:
          "software",

        demandEffect:
          1.40,

        costEffect:
          1.00,

        confidence:
          6,

        probability:
          0.020
      },

      {
        id: "food-demand",

        name: "Food Demand Surge",

        description:
          "Local demand for food businesses has increased.",

        businessType:
          "food",

        demandEffect:
          1.30,

        costEffect:
          1.05,

        confidence:
          4,

        probability:
          0.018
      },

      {
        id: "retail-festival",

        name: "Retail Festival Season",

        description:
          "Retail footfall has increased significantly.",

        businessType:
          "retail",

        demandEffect:
          1.35,

        costEffect:
          1.03,

        confidence:
          5,

        probability:
          0.020
      },

      {
        id: "manufacturing-demand",

        name: "Industrial Order Surge",

        description:
          "Industrial buyers are placing larger orders.",

        businessType:
          "manufacturing",

        demandEffect:
          1.40,

        costEffect:
          1.04,

        confidence:
          5,

        probability:
          0.015
      }

    ],

    /* ==========================================================
       CREATE RANDOM EVENT
       ========================================================== */

    generateEvent() {

      const market =
        this.ensureWorld();

      /*
       * Only one major event at a time
       * to keep gameplay understandable.
       */

      if (
        market.activeEvents.length >= 2
      ) {
        return null;
      }

      const roll =
        Math.random();

      let cursor = 0;

      for (
        let i = 0;
        i < this.events.length;
        i++
      ) {

        const event =
          this.events[i];

        cursor +=
          event.probability;

        if (
          roll <= cursor
        ) {

          const activeEvent = {

            ...event,

            id:
              event.id +
              "-" +
              Date.now(),

            startedDay:
              Game.getState()?.world?.day || 1,

            duration:
              7 +
              Math.floor(
                Math.random() * 14
              ),

            remainingDays:
              7 +
              Math.floor(
                Math.random() * 14
              )

          };

          market.activeEvents.push(
            activeEvent
          );

          market.eventHistory.push(
            activeEvent
          );

          market.lastEventDay =
            Game.getState()?.world?.day || 1;

          /*
           * Confidence effect.
           */

          market.consumerConfidence =
            Math.max(
              10,
              Math.min(
                100,
                market.consumerConfidence +
                (
                  event.confidence || 0
                )
              )
            );

          market.businessConfidence =
            Math.max(
              10,
              Math.min(
                100,
                market.businessConfidence +
                (
                  event.confidence || 0
                )
              )
            );

          if (
            event.interestEffect
          ) {

            market.interestRateIndex =
              Math.max(
                50,
                Math.min(
                  200,
                  market.interestRateIndex +
                  event.interestEffect
                )
              );

          }

          Game.save();

          window.dispatchEvent(
            new CustomEvent(
              "EmpireMarketEvent",
              {
                detail: {
                  event:
                    activeEvent
                }
              }
            )
          );

          return activeEvent;
        }

      }

      return null;
    },

    /* ==========================================================
       UPDATE ACTIVE EVENTS
       ========================================================== */

    updateEvents() {

      const market =
        this.ensureWorld();

      market.activeEvents =
        market.activeEvents.filter(
          event => {

            event.remainingDays =
              Number(
                event.remainingDays || 0
              ) - 1;

            return (
              event.remainingDays > 0
            );

          }
        );

      /*
       * Slowly normalize confidence.
       */

      if (
        market.consumerConfidence < 70
      ) {
        market.consumerConfidence +=
          0.25;
      }

      if (
        market.consumerConfidence > 70
      ) {
        market.consumerConfidence -=
          0.25;
      }

      if (
        market.businessConfidence < 70
      ) {
        market.businessConfidence +=
          0.25;
      }

      if (
        market.businessConfidence > 70
      ) {
        market.businessConfidence -=
          0.25;
      }

      /*
       * Inflation slowly moves toward 100.
       */

      if (
        market.inflationIndex > 100
      ) {
        market.inflationIndex -=
          0.20;
      }

      if (
        market.inflationIndex < 100
      ) {
        market.inflationIndex +=
          0.20;
      }

      /*
       * Demand slowly normalizes.
       */

      if (
        market.demandIndex > 100
      ) {
        market.demandIndex -=
          0.30;
      }

      if (
        market.demandIndex < 100
      ) {
        market.demandIndex +=
          0.30;
      }

      Game.save();
    },

    /* ==========================================================
       DAILY MARKET MOVEMENT
       ========================================================== */

    runDailyMarket() {

      const market =
        this.ensureWorld();

      /*
       * Small natural movement.
       */

      market.demandIndex =
        Math.max(
          60,
          Math.min(
            150,
            market.demandIndex +
            (
              Math.random() * 4 - 2
            )
          )
        );

      /*
       * Inflation noise.
       */

      market.inflationIndex =
        Math.max(
          85,
          Math.min(
            160,
            market.inflationIndex +
            (
              Math.random() * 0.8 - 0.3
            )
          )
        );

      /*
       * Labor market.
       */

      market.laborCostIndex =
        Math.max(
          80,
          Math.min(
            150,
            market.laborCostIndex +
            (
              Math.random() * 1.2 - 0.4
            )
          )
        );

      /*
       * Generate event.
       */

      this.generateEvent();

      /*
       * Update event duration.
       */

      this.updateEvents();

      /*
       * Update all companies.
       */

      const state =
        Game.getState();

      if (
        state &&
        Array.isArray(state.companies)
      ) {

        state.companies.forEach(
          company => {

            this.ensureCompetition(
              company
            );

            this.recalculateCompetition(
              company
            );

            /*
             * Existing market data can
             * react to the world market.
             */

            if (
              company.market
            ) {

              const multiplier =
                this.getDemandMultiplier(
                  company
                );

              company.market.demand =
                Math.max(
                  1,
                  Math.round(
                    Number(
                      company.market.demand || 20
                    ) *
                    multiplier
                  )
                );

            }

          }
        );

      }

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireMarketUpdated",
          {
            detail: {
              market
            }
          }
        )
      );

      return market;
    },

    /* ==========================================================
       MONTHLY COMPETITOR MOVEMENT
       ========================================================== */

    runMonthlyCompetition() {

      const state =
        Game.getState();

      if (
        !state ||
        !Array.isArray(state.companies)
      ) {
        return;
      }

      state.companies.forEach(
        company => {

          if (
            company.status !== "Operating"
          ) {
            return;
          }

          const competition =
            this.ensureCompetition(
              company
            );

          /*
           * Existing competitors mature.
           */

          competition.competitors.forEach(
            competitor => {

              competitor.monthsActive++;

              /*
               * Reputation changes.
               */

              competitor.reputation =
                Math.max(
                  20,
                  Math.min(
                    95,
                    competitor.reputation +
                    (
                      Math.random() * 6 - 3
                    )
                  )
                );

            }
          );

          /*
           * Chance of new competitor.
           */

          if (
            Math.random() < 0.20
          ) {

            this.addCompetitor(
              company
            );

          }

          /*
           * Weak competitors can leave.
           */

          competition.competitors =
            competition.competitors.filter(
              competitor => {

                if (
                  competitor.marketShare < 2 &&
                  Math.random() < 0.20
                ) {

                  return false;

                }

                return true;

              }
            );

          this.recalculateCompetition(
            company
          );

        }
      );

      Game.save();
    },

    /* ==========================================================
       PRICE PRESSURE
       ========================================================== */

    getRecommendedPriceMultiplier(
      company
    ) {

      const competition =
        this.ensureCompetition(
          company
        );

      let multiplier = 1;

      if (
        competition.pricePressure > 60
      ) {
        multiplier -= 0.10;
      } else if (
        competition.pricePressure > 35
      ) {
        multiplier -= 0.05;
      }

      return multiplier;
    },

    /* ==========================================================
       SUMMARY
       ========================================================== */

    getSummary(company) {

      const market =
        this.ensureWorld();

      const competition =
        this.ensureCompetition(
          company
        );

      return {

        marketDemand:
          Math.round(
            market.demandIndex
          ),

        inflation:
          Math.round(
            market.inflationIndex
          ),

        supply:
          Math.round(
            market.supplyIndex
          ),

        laborCost:
          Math.round(
            market.laborCostIndex
          ),

        interestRate:
          Math.round(
            market.interestRateIndex
          ),

        consumerConfidence:
          Math.round(
            market.consumerConfidence
          ),

        businessConfidence:
          Math.round(
            market.businessConfidence
          ),

        demandMultiplier:
          Number(
            this.getDemandMultiplier(
              company
            ).toFixed(2)
          ),

        costMultiplier:
          Number(
            this.getCostMultiplier(
              company
            ).toFixed(2)
          ),

        competitors:
          competition.competitors.length,

        competitionPressure:
          competition.pressure,

        pricePressure:
          competition.pricePressure,

        customerLossRate:
          Number(
            (
              competition.customerLossRate *
              100
            ).toFixed(1)
          ),

        activeEvents:
          market.activeEvents

      };
    }
  };

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireMarketEvents =
    MarketEvents;

  /* ============================================================
     DAILY EVENT
     ============================================================ */

  window.addEventListener(
    "EmpireDayAdvanced",
    function () {

      MarketEvents.runDailyMarket();

    }
  );

  /* ============================================================
     MONTHLY EVENT
     ============================================================ */

  window.addEventListener(
    "EmpireMonthAdvanced",
    function () {

      MarketEvents.runMonthlyCompetition();

    }
  );

  /* ============================================================
     BUSINESS EVENTS
     ============================================================ */

  window.addEventListener(
    "EmpireBusinessStarted",
    function (event) {

      const company =
        event.detail?.company;

      if (!company) return;

      MarketEvents.ensureCompetition(
        company
      );

      Game.save();

    }
  );

  window.addEventListener(
    "EmpireBusinessLaunched",
    function (event) {

      const company =
        event.detail?.company;

      if (!company) return;

      MarketEvents.ensureCompetition(
        company
      );

      /*
       * A new business gets its first
       * competitor only occasionally.
       */

      if (
        Math.random() < 0.25
      ) {

        MarketEvents.addCompetitor(
          company
        );

      }

      Game.save();

    }
  );

  console.log(
    "Empire Rush: Competition + Market Events loaded."
  );

})();
