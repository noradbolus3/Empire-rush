(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH — PRODUCT DEVELOPMENT SYSTEM
   * ============================================================
   *
   * IDEA
   *  ↓
   * DESIGN
   *  ↓
   * PROTOTYPE
   *  ↓
   * COMPONENTS / MATERIALS
   *  ↓
   * PRODUCTION
   *  ↓
   * TESTING
   *  ↓
   * LAUNCH
   *  ↓
   * SALES / REVIEWS
   *  ↓
   * PRODUCT UPGRADES
   *
   * GAME LANGUAGE: ENGLISH
   * ============================================================
   */

  const Game = window.EmpireGameState;

  if (!Game) {
    console.warn(
      "EmpireGameState not found. Product system stopped."
    );
    return;
  }

  const ProductSystem = {

    /* ==========================================================
       PRODUCT CATEGORIES
       ========================================================== */

    categories: {

      software: {
        name: "Software",
        baseCost: 15000,
        baseQuality: 55,
        baseDevelopment: 25
      },

      electronics: {
        name: "Electronics",
        baseCost: 50000,
        baseQuality: 55,
        baseDevelopment: 20
      },

      automotive: {
        name: "Automotive",
        baseCost: 500000,
        baseQuality: 50,
        baseDevelopment: 10
      },

      clothing: {
        name: "Clothing",
        baseCost: 30000,
        baseQuality: 60,
        baseDevelopment: 25
      },

      food: {
        name: "Food Product",
        baseCost: 20000,
        baseQuality: 60,
        baseDevelopment: 30
      },

      appliance: {
        name: "Home Appliance",
        baseCost: 100000,
        baseQuality: 55,
        baseDevelopment: 15
      },

      machinery: {
        name: "Industrial Machinery",
        baseCost: 300000,
        baseQuality: 50,
        baseDevelopment: 10
      },

      consumerGoods: {
        name: "Consumer Goods",
        baseCost: 75000,
        baseQuality: 55,
        baseDevelopment: 20
      },

      digital: {
        name: "Digital Product",
        baseCost: 10000,
        baseQuality: 55,
        baseDevelopment: 30
      }
    },

    /* ==========================================================
       INITIALIZE COMPANY
       ========================================================== */

    ensureCompany(company) {

      if (!company) return null;

      if (!Array.isArray(company.products)) {
        company.products = [];
      }

      if (!company.productPortfolio) {
        company.productPortfolio = {
          activeProducts: 0,
          launchedProducts: 0,
          productsInDevelopment: 0,
          totalProductRevenue: 0
        };
      }

      return company;
    },

    /* ==========================================================
       COMPANY TYPE
       ========================================================== */

    getCompanyType(company) {

      const text = (
        (company.type || "") +
        " " +
        (company.name || "") +
        " " +
        (company.category || "")
      ).toLowerCase();

      if (
        text.includes("software") ||
        text.includes("startup") ||
        text.includes("tech") ||
        text.includes("app")
      ) {
        return "software";
      }

      if (
        text.includes("manufacturing") ||
        text.includes("factory")
      ) {
        return "machinery";
      }

      if (
        text.includes("food") ||
        text.includes("restaurant") ||
        text.includes("kitchen")
      ) {
        return "food";
      }

      if (
        text.includes("retail") ||
        text.includes("store")
      ) {
        return "consumerGoods";
      }

      return "consumerGoods";
    },

    /* ==========================================================
       CREATE PRODUCT
       ========================================================== */

    createProduct(
      company,
      name,
      category
    ) {

      this.ensureCompany(company);

      category =
        category ||
        this.getCompanyType(company);

      const categoryData =
        this.categories[category] ||
        this.categories.consumerGoods;

      const product = {

        id:
          "PROD-" +
          Date.now() +
          "-" +
          Math.floor(
            Math.random() * 10000
          ),

        companyId:
          company.id,

        name:
          name ||
          "New Product",

        category,

        stage:
          "Idea",

        status:
          "In Development",

        designProgress:
          0,

        prototypeProgress:
          0,

        productionProgress:
          0,

        testingProgress:
          0,

        quality:
          categoryData.baseQuality,

        innovation:
          50,

        features:
          0,

        reliability:
          50,

        productionCost:
          categoryData.baseCost,

        sellingPrice:
          Math.round(
            categoryData.baseCost * 1.8
          ),

        unitsProduced:
          0,

        unitsSold:
          0,

        revenue:
          0,

        reviews:
          [],

        rating:
          0,

        developmentCost:
          0,

        launchDay:
          null,

        version:
          1,

        upgrades:
          0,

        demandMultiplier:
          1,

        createdDay:
          Game.getState()?.world?.day || 1

      };

      company.products.push(
        product
      );

      this.updatePortfolio(
        company
      );

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireProductCreated",
          {
            detail: {
              company,
              product
            }
          }
        )
      );

      return product;
    },

    /* ==========================================================
       DESIGN
       ========================================================== */

    developDesign(
      company,
      productId
    ) {

      const product =
        this.getProduct(
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

      if (
        product.stage !== "Idea" &&
        product.stage !== "Design"
      ) {
        return {
          success: false,
          reason:
            "Product is not currently in design."
        };
      }

      product.stage =
        "Design";

      const cost =
        Math.round(
          product.productionCost *
          0.08
        );

      if (
        !this.spendCompanyMoney(
          company,
          cost,
          "Product design"
        )
      ) {
        return {
          success: false,
          reason:
            "Insufficient company funds."
        };
      }

      product.developmentCost +=
        cost;

      product.designProgress =
        Math.min(
          100,
          product.designProgress +
          25
        );

      product.quality =
        Math.min(
          100,
          product.quality + 3
        );

      if (
        product.designProgress >= 100
      ) {
        product.stage =
          "Prototype";
      }

      Game.save();

      return {
        success: true,
        cost,
        progress:
          product.designProgress,
        quality:
          product.quality
      };
    },

    /* ==========================================================
       PROTOTYPE
       ========================================================== */

    buildPrototype(
      company,
      productId
    ) {

      const product =
        this.getProduct(
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

      if (
        product.designProgress < 100
      ) {
        return {
          success: false,
          reason:
            "Complete product design first."
        };
      }

      if (
        product.stage !== "Prototype"
      ) {
        return {
          success: false,
          reason:
            "Product is not ready for prototyping."
        };
      }

      const cost =
        Math.round(
          product.productionCost *
          0.20
        );

      if (
        !this.spendCompanyMoney(
          company,
          cost,
          "Prototype development"
        )
      ) {
        return {
          success: false,
          reason:
            "Insufficient company funds."
        };
      }

      product.developmentCost +=
        cost;

      product.prototypeProgress =
        Math.min(
          100,
          product.prototypeProgress +
          50
        );

      /*
       * Prototype testing can reveal
       * quality and reliability changes.
       */

      product.reliability =
        Math.min(
          100,
          product.reliability +
          5
        );

      if (
        product.prototypeProgress >= 100
      ) {
        product.stage =
          "Production Ready";
      }

      Game.save();

      return {
        success: true,
        cost,
        progress:
          product.prototypeProgress,
        reliability:
          product.reliability
      };
    },

    /* ==========================================================
       ADD FEATURES
       ========================================================== */

    addFeature(
      company,
      productId
    ) {

      const product =
        this.getProduct(
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

      if (
        product.stage === "Launched"
      ) {
        return {
          success: false,
          reason:
            "Use product upgrade after launch."
        };
      }

      const cost =
        Math.round(
          product.productionCost *
          0.05
        );

      if (
        !this.spendCompanyMoney(
          company,
          cost,
          "Product feature development"
        )
      ) {
        return {
          success: false,
          reason:
            "Insufficient company funds."
        };
      }

      product.features++;

      product.innovation =
        Math.min(
          100,
          product.innovation + 5
        );

      product.quality =
        Math.min(
          100,
          product.quality + 2
        );

      product.demandMultiplier =
        Math.min(
          2,
          product.demandMultiplier +
          0.04
        );

      product.developmentCost +=
        cost;

      Game.save();

      return {
        success: true,
        cost,
        features:
          product.features,
        innovation:
          product.innovation
      };
    },

    /* ==========================================================
       TESTING
       ========================================================== */

    testProduct(
      company,
      productId
    ) {

      const product =
        this.getProduct(
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

      if (
        product.prototypeProgress < 100
      ) {
        return {
          success: false,
          reason:
            "Complete the prototype first."
        };
      }

      product.stage =
        "Testing";

      const cost =
        Math.round(
          product.productionCost *
          0.10
        );

      if (
        !this.spendCompanyMoney(
          company,
          cost,
          "Product testing"
        )
      ) {
        return {
          success: false,
          reason:
            "Insufficient company funds."
        };
      }

      product.developmentCost +=
        cost;

      product.testingProgress =
        Math.min(
          100,
          product.testingProgress +
          50
        );

      /*
       * Random test outcome.
       */

      const testQuality =
        (
          product.quality +
          product.reliability +
          product.innovation
        ) / 3;

      if (
        testQuality >= 75
      ) {

        product.reliability =
          Math.min(
            100,
            product.reliability + 4
          );

      } else if (
        testQuality < 50
      ) {

        product.reliability =
          Math.max(
            0,
            product.reliability - 3
          );

      }

      if (
        product.testingProgress >= 100
      ) {

        if (
          product.reliability < 45
        ) {

          product.stage =
            "Rework Required";

        } else {

          product.stage =
            "Ready for Launch";

        }

      }

      Game.save();

      return {
        success: true,
        cost,
        testing:
          product.testingProgress,
        reliability:
          product.reliability,
        stage:
          product.stage
      };
    },

    /* ==========================================================
       REWORK
       ========================================================== */

    reworkProduct(
      company,
      productId
    ) {

      const product =
        this.getProduct(
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

      if (
        product.stage !==
        "Rework Required"
      ) {
        return {
          success: false,
          reason:
            "Product does not require rework."
        };
      }

      const cost =
        Math.round(
          product.productionCost *
          0.12
        );

      if (
        !this.spendCompanyMoney(
          company,
          cost,
          "Product rework"
        )
      ) {
        return {
          success: false,
          reason:
            "Insufficient company funds."
        };
      }

      product.developmentCost +=
        cost;

      product.reliability =
        Math.min(
          100,
          product.reliability + 10
        );

      product.quality =
        Math.min(
          100,
          product.quality + 5
        );

      product.testingProgress =
        50;

      product.stage =
        "Testing";

      Game.save();

      return {
        success: true,
        cost,
        reliability:
          product.reliability
      };
    },

    /* ==========================================================
       PRODUCTION
       ========================================================== */

    produceUnits(
      company,
      productId,
      units
    ) {

      const product =
        this.getProduct(
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

      if (
        product.stage !==
        "Ready for Launch" &&
        product.stage !==
        "Launched"
      ) {
        return {
          success: false,
          reason:
            "Product is not ready for production."
        };
      }

      units =
        Math.max(
          1,
          Math.round(
            Number(units || 1)
          )
        );

      /*
       * Bulk production gets a small
       * efficiency benefit.
       */

      const unitCost =
        Math.max(
          1,
          Math.round(
            product.productionCost *
            (
              units >= 100
                ? 0.92
                : 1
            )
          )
        );

      const totalCost =
        unitCost * units;

      if (
        !this.spendCompanyMoney(
          company,
          totalCost,
          "Product manufacturing"
        )
      ) {
        return {
          success: false,
          reason:
            "Insufficient company funds."
        };
      }

      product.unitsProduced +=
        units;

      product.productionProgress =
        Math.min(
          100,
          product.productionProgress +
          10
        );

      Game.save();

      return {
        success: true,
        units,
        unitCost,
        totalCost,
        totalProduced:
          product.unitsProduced
      };
    },

    /* ==========================================================
       LAUNCH
       ========================================================== */

    launchProduct(
      company,
      productId
    ) {

      const product =
        this.getProduct(
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

      if (
        product.stage !==
        "Ready for Launch"
      ) {
        return {
          success: false,
          reason:
            "Product is not ready for launch."
        };
      }

      if (
        product.unitsProduced <= 0
      ) {
        return {
          success: false,
          reason:
            "Produce inventory before launch."
        };
      }

      product.stage =
        "Launched";

      product.status =
        "Active";

      product.launchDay =
        Game.getState()?.world?.day || 1;

      product.demandMultiplier =
        Math.max(
          0.5,
          product.demandMultiplier
        );

      company.productPortfolio.launchedProducts++;

      this.updatePortfolio(
        company
      );

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireProductLaunched",
          {
            detail: {
              company,
              product
            }
          }
        )
      );

      return {
        success: true,
        product
      };
    },

    /* ==========================================================
       PRODUCT SALE
       ========================================================== */

    sellUnits(
      company,
      productId,
      units
    ) {

      const product =
        this.getProduct(
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

      if (
        product.stage !== "Launched"
      ) {
        return {
          success: false,
          reason:
            "Product is not launched."
        };
      }

      units =
        Math.max(
          1,
          Math.round(
            Number(units || 1)
          )
        );

      const available =
        Math.max(
          0,
          product.unitsProduced -
          product.unitsSold
        );

      units =
        Math.min(
          units,
          available
        );

      if (
        units <= 0
      ) {
        return {
          success: false,
          reason:
            "No inventory available."
        };
      }

      /*
       * Quality influences actual
       * selling price realization.
       */

      const qualityFactor =
        0.75 +
        (
          product.quality /
          100
        ) *
        0.50;

      const actualPrice =
        Math.round(
          product.sellingPrice *
          qualityFactor
        );

      const revenue =
        actualPrice * units;

      const cost =
        Math.round(
          product.productionCost *
          units
        );

      const grossProfit =
        revenue - cost;

      /*
       * Company receives revenue.
       */

      if (
        window.EmpireAccounting
      ) {

        window.EmpireAccounting.addRevenue(
          company,
          revenue,
          "Product sales: " +
          product.name,
          cost
        );

      } else {

        company.finance =
          company.finance || {};

        company.finance.cash =
          Number(
            company.finance.cash || 0
          ) + revenue;

        company.finance.totalRevenue =
          Number(
            company.finance.totalRevenue || 0
          ) + revenue;

      }

      product.unitsSold +=
        units;

      product.revenue +=
        revenue;

      company.productPortfolio.totalProductRevenue +=
        revenue;

      /*
       * Customer review.
       */

      this.generateReview(
        product
      );

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireProductSale",
          {
            detail: {
              company,
              product,
              units,
              revenue,
              cost,
              grossProfit
            }
          }
        )
      );

      return {
        success: true,
        units,
        actualPrice,
        revenue,
        cost,
        grossProfit,
        rating:
          product.rating
      };
    },

    /* ==========================================================
       REVIEW
       ========================================================== */

    generateReview(product) {

      const score =
        (
          product.quality *
          0.40 +
          product.reliability *
          0.30 +
          product.innovation *
          0.20 +
          Math.random() * 100 *
          0.10
        );

      let rating;

      if (score >= 90) {
        rating = 5;
      } else if (score >= 75) {
        rating = 4;
      } else if (score >= 60) {
        rating = 3;
      } else if (score >= 45) {
        rating = 2;
      } else {
        rating = 1;
      }

      product.reviews.push({

        rating,

        day:
          Game.getState()?.world?.day || 1,

        verified:
          true

      });

      /*
       * Average rating.
       */

      const total =
        product.reviews.reduce(
          (
            sum,
            review
          ) =>
            sum +
            review.rating,
          0
        );

      product.rating =
        Number(
          (
            total /
            product.reviews.length
          ).toFixed(1)
        );

      /*
       * Rating affects demand.
       */

      if (
        product.rating >= 4.5
      ) {

        product.demandMultiplier =
          Math.min(
            2.5,
            product.demandMultiplier +
            0.05
          );

      } else if (
        product.rating < 3
      ) {

        product.demandMultiplier =
          Math.max(
            0.40,
            product.demandMultiplier -
            0.05
          );

      }

      return rating;
    },

    /* ==========================================================
       PRODUCT UPGRADE
       ========================================================== */

    upgradeProduct(
      company,
      productId
    ) {

      const product =
        this.getProduct(
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

      if (
        product.stage !== "Launched"
      ) {
        return {
          success: false,
          reason:
            "Only launched products can be upgraded."
        };
      }

      const upgradeCost =
        Math.round(
          product.productionCost *
          (
            0.15 +
            product.upgrades * 0.05
          )
        );

      if (
        !this.spendCompanyMoney(
          company,
          upgradeCost,
          "Product upgrade"
        )
      ) {
        return {
          success: false,
          reason:
            "Insufficient company funds."
        };
      }

      product.upgrades++;

      product.version =
        Number(
          product.version || 1
        ) + 0.1;

      product.version =
        Number(
          product.version.toFixed(1)
        );

      product.quality =
        Math.min(
          100,
          product.quality + 4
        );

      product.reliability =
        Math.min(
          100,
          product.reliability + 4
        );

      product.innovation =
        Math.min(
          100,
          product.innovation + 5
        );

      product.demandMultiplier =
        Math.min(
          2.5,
          product.demandMultiplier +
          0.08
        );

      product.developmentCost +=
        upgradeCost;

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireProductUpgraded",
          {
            detail: {
              company,
              product,
              cost:
                upgradeCost
            }
          }
        )
      );

      return {
        success: true,
        cost:
          upgradeCost,
        version:
          product.version,
        quality:
          product.quality,
        reliability:
          product.reliability,
        innovation:
          product.innovation
      };
    },

    /* ==========================================================
       PRODUCT LOOKUP
       ========================================================== */

    getProduct(
      company,
      productId
    ) {

      this.ensureCompany(company);

      return company.products.find(
        product =>
          product.id === productId
      );
    },

    /* ==========================================================
       COMPANY MONEY
       ========================================================== */

    spendCompanyMoney(
      company,
      amount,
      description
    ) {

      amount =
        Math.round(
          Number(amount || 0)
        );

      if (
        amount <= 0
      ) {
        return true;
      }

      if (
        window.EmpireAccounting
      ) {

        return window.EmpireAccounting.spendCash(
          company,
          amount,
          description,
          "Operating"
        );

      }

      company.finance =
        company.finance || {};

      const cash =
        Number(
          company.finance.cash || 0
        );

      if (
        cash < amount
      ) {
        return false;
      }

      company.finance.cash =
        cash - amount;

      company.finance.totalExpenses =
        Number(
          company.finance.totalExpenses || 0
        ) + amount;

      return true;
    },

    /* ==========================================================
       PORTFOLIO
       ========================================================== */

    updatePortfolio(company) {

      this.ensureCompany(company);

      const products =
        company.products;

      company.productPortfolio.activeProducts =
        products.filter(
          product =>
            product.stage === "Launched"
        ).length;

      company.productPortfolio.productsInDevelopment =
        products.filter(
          product =>
            product.stage !== "Launched"
        ).length;

    },

    /* ==========================================================
       SUMMARY
       ========================================================== */

    getProductSummary(product) {

      if (!product) {
        return null;
      }

      return {

        name:
          product.name,

        category:
          product.category,

        stage:
          product.stage,

        status:
          product.status,

        designProgress:
          product.designProgress,

        prototypeProgress:
          product.prototypeProgress,

        testingProgress:
          product.testingProgress,

        quality:
          Math.round(
            product.quality
          ),

        reliability:
          Math.round(
            product.reliability
          ),

        innovation:
          Math.round(
            product.innovation
          ),

        features:
          product.features,

        productionCost:
          product.productionCost,

        sellingPrice:
          product.sellingPrice,

        unitsProduced:
          product.unitsProduced,

        unitsSold:
          product.unitsSold,

        revenue:
          product.revenue,

        rating:
          product.rating,

        version:
          product.version,

        upgrades:
          product.upgrades

      };
    },

    getCompanySummary(company) {

      this.ensureCompany(company);

      this.updatePortfolio(
        company
      );

      return {

        totalProducts:
          company.products.length,

        activeProducts:
          company.productPortfolio.activeProducts,

        productsInDevelopment:
          company.productPortfolio.productsInDevelopment,

        launchedProducts:
          company.productPortfolio.launchedProducts,

        totalProductRevenue:
          company.productPortfolio.totalProductRevenue,

        products:
          company.products.map(
            product =>
              this.getProductSummary(
                product
              )
          )

      };
    }
  };

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireProductSystem =
    ProductSystem;

  /* ============================================================
     BUSINESS EVENTS
     ============================================================ */

  window.addEventListener(
    "EmpireBusinessStarted",
    function (event) {

      const company =
        event.detail?.company;

      if (!company) return;

      ProductSystem.ensureCompany(
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

      ProductSystem.ensureCompany(
        company
      );

      Game.save();

    }
  );

  console.log(
    "Empire Rush: Product Development System loaded."
  );

})();
