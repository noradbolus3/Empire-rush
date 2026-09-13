(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH — PRODUCT ↔ MARKET INTEGRATION
   * ============================================================
   *
   * PRODUCT
   *   ↓
   * QUALITY / PRICE / REVIEWS / INNOVATION
   *   ↓
   * MARKET DEMAND
   *   ↓
   * CUSTOMER ORDERS
   *   ↓
   * SALES
   *   ↓
   * REVENUE / PROFIT
   *
   * ============================================================
   */

  const Game = window.EmpireGameState;
  const Products = window.EmpireProductSystem;

  if (!Game || !Products) {
    console.warn(
      "Product Market Integration waiting for core systems."
    );
    return;
  }

  const MarketIntegration = {

    /* ==========================================================
       MARKET CONFIGURATION
       ========================================================== */

    categoryRules: {

      software: {
        baseDemand: 35,
        repeatRate: 0.90,
        priceSensitivity: 0.35,
        qualityWeight: 0.45
      },

      digital: {
        baseDemand: 40,
        repeatRate: 0.85,
        priceSensitivity: 0.40,
        qualityWeight: 0.40
      },

      food: {
        baseDemand: 55,
        repeatRate: 0.75,
        priceSensitivity: 0.50,
        qualityWeight: 0.35
      },

      clothing: {
        baseDemand: 40,
        repeatRate: 0.45,
        priceSensitivity: 0.55,
        qualityWeight: 0.35
      },

      consumerGoods: {
        baseDemand: 35,
        repeatRate: 0.40,
        priceSensitivity: 0.50,
        qualityWeight: 0.40
      },

      electronics: {
        baseDemand: 30,
        repeatRate: 0.35,
        priceSensitivity: 0.40,
        qualityWeight: 0.50
      },

      appliance: {
        baseDemand: 25,
        repeatRate: 0.30,
        priceSensitivity: 0.35,
        qualityWeight: 0.55
      },

      automotive: {
        baseDemand: 12,
        repeatRate: 0.12,
        priceSensitivity: 0.25,
        qualityWeight: 0.65
      },

      machinery: {
        baseDemand: 10,
        repeatRate: 0.15,
        priceSensitivity: 0.20,
        qualityWeight: 0.70
      }

    },

    /* ==========================================================
       ENSURE PRODUCT MARKET DATA
       ========================================================== */

    ensureProductMarket(product) {

      if (!product.market) {

        product.market = {

          awareness: 0,

          demand: 0,

          marketShare: 0,

          customers: 0,

          repeatCustomers: 0,

          lostCustomers: 0,

          lastSalesDay: 0,

          totalOrders: 0,

          totalUnitsSold: 0,

          lastDemandScore: 0,

          lastMarketMultiplier: 1

        };

      }

      return product.market;
    },

    /* ==========================================================
       CATEGORY RULE
       ========================================================== */

    getRules(product) {

      return (
        this.categoryRules[
          product.category
        ] ||
        this.categoryRules.consumerGoods
      );

    },

    /* ==========================================================
       WORLD MARKET MULTIPLIER
       ========================================================== */

    getWorldMarketMultiplier(company) {

      let multiplier = 1;

      const market =
        window.EmpireMarketEvents;

      if (market) {

        const summary =
          market.getSummary?.();

        if (summary) {

          if (
            Number.isFinite(
              summary.demandIndex
            )
          ) {

            multiplier *=
              summary.demandIndex;

          }

          if (
            Number.isFinite(
              summary.consumerConfidence
            )
          ) {

            multiplier *=
              summary.consumerConfidence;

          }

        }

      }

      /*
       * Existing customer market system.
       */

      if (
        company?.market &&
        Number.isFinite(
          company.market.demand
        )
      ) {

        multiplier *=
          Math.max(
            0.50,
            Math.min(
              1.50,
              Number(
                company.market.demand
              )
            )
          );

      }

      return Math.max(
        0.20,
        Math.min(
          2.50,
          multiplier
        )
      );

    },

    /* ==========================================================
       COMPETITION
       ========================================================== */

    getCompetitionMultiplier(
      company,
      product
    ) {

      let multiplier = 1;

      const market =
        window.EmpireMarketEvents;

      if (!market) {
        return multiplier;
      }

      try {

        const pressure =
          market.getCompetitionPressure?.(
            company
          );

        if (
          Number.isFinite(
            pressure
          )
        ) {

          multiplier *=
            Math.max(
              0.40,
              1 - pressure
            );

        }

      } catch (error) {

        console.warn(
          "Competition integration:",
          error
        );

      }

      return Math.max(
        0.40,
        Math.min(
          1.20,
          multiplier
        )
      );

    },

    /* ==========================================================
       PRICE ATTRACTIVENESS
       ========================================================== */

    getPriceMultiplier(product) {

      const rules =
        this.getRules(product);

      const productionCost =
        Math.max(
          1,
          Number(
            product.productionCost || 1
          )
        );

      const price =
        Math.max(
          1,
          Number(
            product.sellingPrice || 1
          )
        );

      const markup =
        price /
        productionCost;

      /*
       * Ideal markup depends on
       * category and customer behavior.
       */

      let idealMarkup = 2;

      if (
        product.category === "software" ||
        product.category === "digital"
      ) {
        idealMarkup = 3;
      }

      if (
        product.category === "automotive" ||
        product.category === "machinery"
      ) {
        idealMarkup = 2.5;
      }

      const difference =
        Math.abs(
          markup -
          idealMarkup
        ) /
        idealMarkup;

      let multiplier =
        1 -
        difference *
        rules.priceSensitivity;

      return Math.max(
        0.35,
        Math.min(
          1.15,
          multiplier
        )
      );

    },

    /* ==========================================================
       QUALITY SCORE
       ========================================================== */

    getQualityScore(product) {

      const quality =
        Number(
          product.quality || 0
        );

      const reliability =
        Number(
          product.reliability || 0
        );

      const innovation =
        Number(
          product.innovation || 0
        );

      const rating =
        Number(
          product.rating || 0
        );

      const reviewScore =
        rating > 0
          ? rating * 20
          : 50;

      return (
        quality * 0.35 +
        reliability * 0.25 +
        innovation * 0.15 +
        reviewScore * 0.25
      );

    },

    /* ==========================================================
       AWARENESS
       ========================================================== */

    updateAwareness(
      product
    ) {

      const market =
        this.ensureProductMarket(
          product
        );

      /*
       * Launch creates initial awareness.
       * Sales and reviews build it over time.
       */

      if (
        product.stage === "Launched"
      ) {

        market.awareness =
          Math.min(
            100,
            market.awareness +
            2 +
            product.features * 0.05
          );

      }

      if (
        product.reviews?.length
      ) {

        market.awareness =
          Math.min(
            100,
            market.awareness +
            Math.min(
              3,
              product.reviews.length *
              0.05
            )
          );

      }

      return market.awareness;

    },

    /* ==========================================================
       DEMAND CALCULATION
       ========================================================== */

    calculateDemand(
      company,
      product
    ) {

      if (
        product.stage !== "Launched"
      ) {
        return 0;
      }

      const rules =
        this.getRules(product);

      const market =
        this.ensureProductMarket(
          product
        );

      const quality =
        this.getQualityScore(
          product
        );

      const qualityMultiplier =
        0.50 +
        (
          quality /
          100
        ) *
        rules.qualityWeight;

      const awarenessMultiplier =
        0.25 +
        (
          market.awareness /
          100
        ) *
        0.75;

      const priceMultiplier =
        this.getPriceMultiplier(
          product
        );

      const worldMultiplier =
        this.getWorldMarketMultiplier(
          company
        );

      const competitionMultiplier =
        this.getCompetitionMultiplier(
          company,
          product
        );

      const productMultiplier =
        Math.max(
          0.30,
          Number(
            product.demandMultiplier || 1
          )
        );

      let demand =
        rules.baseDemand *
        qualityMultiplier *
        awarenessMultiplier *
        priceMultiplier *
        worldMultiplier *
        competitionMultiplier *
        productMultiplier;

      /*
       * Small randomness keeps the
       * market from feeling mechanical.
       */

      const randomFactor =
        0.85 +
        Math.random() *
        0.30;

      demand *=
        randomFactor;

      market.demand =
        Math.max(
          0,
          Math.round(
            demand
          )
        );

      market.lastDemandScore =
        market.demand;

      market.lastMarketMultiplier =
        worldMultiplier;

      return market.demand;

    },

    /* ==========================================================
       AVAILABLE INVENTORY
       ========================================================== */

    getInventory(
      product
    ) {

      return Math.max(
        0,
        Number(
          product.unitsProduced || 0
        ) -
        Number(
          product.unitsSold || 0
        )
      );

    },

    /* ==========================================================
       DAILY SALES
       ========================================================== */

    runDailySales(
      company,
      product
    ) {

      if (
        product.stage !== "Launched"
      ) {

        return {
          success: false,
          reason:
            "Product is not launched."
        };

      }

      const market =
        this.ensureProductMarket(
          product
        );

      this.updateAwareness(
        product
      );

      const demand =
        this.calculateDemand(
          company,
          product
        );

      const inventory =
        this.getInventory(
          product
        );

      if (
        inventory <= 0
      ) {

        market.lostCustomers +=
          Math.round(
            demand
          );

        return {
          success: false,
          reason:
            "Out of inventory.",
          demand,
          inventory: 0
        };

      }

      /*
       * Demand represents potential
       * customer orders.
       */

      let units =
        Math.min(
          inventory,
          Math.max(
            1,
            Math.round(
              demand
            )
          )
        );

      /*
       * Avoid huge instant sales
       * during early game.
       */

      const maximumDailySales =
        product.category ===
          "automotive"
          ? 5
          : product.category ===
            "machinery"
            ? 3
            : 100;

      units =
        Math.min(
          units,
          maximumDailySales
        );

      const result =
        Products.sellUnits(
          company,
          product.id,
          units
        );

      if (
        !result?.success
      ) {

        return {
          success: false,
          reason:
            result?.reason ||
            "Sale failed.",
          demand,
          inventory
        };

      }

      market.customers +=
        units;

      market.totalOrders +=
        units;

      market.totalUnitsSold +=
        units;

      market.lastSalesDay =
        Game.getState()?.world?.day ||
        1;

      /*
       * Repeat customer logic.
       */

      const rules =
        this.getRules(product);

      if (
        Math.random() <
        rules.repeatRate
      ) {

        market.repeatCustomers +=
          Math.round(
            units * 0.15
          );

      }

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireProductMarketSale",
          {
            detail: {
              company,
              product,
              units,
              demand,
              revenue:
                result.revenue,
              profit:
                result.grossProfit
            }
          }
        )
      );

      return {
        success: true,

        units,

        demand,

        remainingInventory:
          this.getInventory(
            product
          ),

        revenue:
          result.revenue,

        grossProfit:
          result.grossProfit,

        rating:
          product.rating

      };

    },

    /* ==========================================================
       DAILY COMPANY SALES
       ========================================================== */

    runCompanySales(
      company
    ) {

      if (!company) {
        return {
          success: false,
          products: []
        };
      }

      Products.ensureCompany(
        company
      );

      const launchedProducts =
        company.products.filter(
          product =>
            product.stage ===
            "Launched"
        );

      const results =
        launchedProducts.map(
          product =>
            this.runDailySales(
              company,
              product
            )
        );

      return {
        success: true,
        products:
          results
      };

    },

    /* ==========================================================
       PRICE UPDATE
       ========================================================== */

    setPrice(
      company,
      productId,
      newPrice
    ) {

      const product =
        Products.getProduct(
          company,
          productId
        );

      if (!product) {
        return {
          success: false,
          reason:
            "Product not found."
        };
      }

      newPrice =
        Math.round(
          Number(
            newPrice
          )
        );

      if (
        newPrice <= 0
      ) {

        return {
          success: false,
          reason:
            "Price must be greater than zero."
        };

      }

      product.sellingPrice =
        newPrice;

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireProductPriceChanged",
          {
            detail: {
              company,
              product,
              price:
                newPrice
            }
          }
        )
      );

      return {
        success: true,
        price:
          newPrice
      };

    },

    /* ==========================================================
       MARKET SUMMARY
       ========================================================== */

    getSummary(
      company,
      product
    ) {

      if (!product) {
        return null;
      }

      const market =
        this.ensureProductMarket(
          product
        );

      return {

        product:
          product.name,

        category:
          product.category,

        stage:
          product.stage,

        awareness:
          Math.round(
            market.awareness
          ),

        demand:
          market.demand,

        marketShare:
          Number(
            market.marketShare ||
            0
          ).toFixed(2),

        customers:
          market.customers,

        repeatCustomers:
          market.repeatCustomers,

        lostCustomers:
          market.lostCustomers,

        inventory:
          this.getInventory(
            product
          ),

        unitsSold:
          product.unitsSold,

        revenue:
          product.revenue,

        rating:
          product.rating,

        quality:
          Math.round(
            product.quality
          ),

        innovation:
          Math.round(
            product.innovation
          ),

        sellingPrice:
          product.sellingPrice,

        demandMultiplier:
          Number(
            product.demandMultiplier ||
            1
          ).toFixed(2)

      };

    },

    /* ==========================================================
       ALL COMPANY PRODUCTS
       ========================================================== */

    getCompanyMarketSummary(
      company
    ) {

      Products.ensureCompany(
        company
      );

      return company.products.map(
        product =>
          this.getSummary(
            company,
            product
          )
      );

    }

  };

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireProductMarket =
    MarketIntegration;

  /* ============================================================
     DAILY GAME LOOP
     ============================================================ */

  window.addEventListener(
    "EmpireDayAdvanced",
    function () {

      const state =
        Game.getState();

      if (!state) return;

      const companies =
        state.companies || [];

      companies.forEach(
        company => {

          if (
            company.status !==
            "Operating"
          ) {
            return;
          }

          Products.ensureCompany(
            company
          );

          MarketIntegration.runCompanySales(
            company
          );

        }
      );

      Game.save();

    }
  );

  /* ============================================================
     PRODUCT LAUNCH
     ============================================================ */

  window.addEventListener(
    "EmpireProductLaunched",
    function (event) {

      const product =
        event.detail?.product;

      if (!product) return;

      const market =
        MarketIntegration.ensureProductMarket(
          product
        );

      /*
       * Initial launch awareness.
       */

      market.awareness =
        Math.max(
          market.awareness,
          10
        );

      Game.save();

    }
  );

  console.log(
    "Empire Rush: Product ↔ Market Integration loaded."
  );

})();
