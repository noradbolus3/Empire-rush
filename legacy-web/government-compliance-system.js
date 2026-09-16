(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH — GOVERNMENT + TAX + COMPLIANCE SYSTEM
   * ============================================================
   *
   * BUSINESS
   *   ↓
   * Registration
   *   ↓
   * Tax Registration
   *   ↓
   * Licenses / Permits
   *   ↓
   * Periodic Filing
   *   ↓
   * Compliance Score
   *   ↓
   * Inspection / Penalty / Suspension Risk
   *
   * NOTE:
   * This is a GAME simulation, not real-world tax advice.
   * ============================================================
   */

  const Game = window.EmpireGameState;

  if (!Game) {
    console.warn(
      "EmpireGameState not found. Compliance system stopped."
    );
    return;
  }

  const Compliance = {

    /* ==========================================================
       BUSINESS REQUIREMENTS
       ========================================================== */

    requirements: {

      food: {
        registration: true,
        tax: true,
        bank: true,
        license: true,
        accounting: true,
        safety: true,
        foodPermit: true,
        environmental: false
      },

      retail: {
        registration: true,
        tax: true,
        bank: true,
        license: true,
        accounting: true,
        safety: false,
        foodPermit: false,
        environmental: false
      },

      software: {
        registration: true,
        tax: true,
        bank: true,
        license: false,
        accounting: true,
        safety: false,
        foodPermit: false,
        environmental: false
      },

      manufacturing: {
        registration: true,
        tax: true,
        bank: true,
        license: true,
        accounting: true,
        safety: true,
        foodPermit: false,
        environmental: true
      },

      services: {
        registration: true,
        tax: true,
        bank: true,
        license: false,
        accounting: true,
        safety: false,
        foodPermit: false,
        environmental: false
      },

      freelance: {
        registration: true,
        tax: true,
        bank: true,
        license: false,
        accounting: true,
        safety: false,
        foodPermit: false,
        environmental: false
      },

      generic: {
        registration: true,
        tax: true,
        bank: true,
        license: false,
        accounting: true,
        safety: false,
        foodPermit: false,
        environmental: false
      }
    },

    /* ==========================================================
       INITIALIZE COMPANY
       ========================================================== */

    ensureCompany(company) {

      if (!company) return null;

      if (!company.compliance) {

        company.compliance = {

          registration: false,

          taxRegistration: false,

          bankAccount: false,

          license: false,

          accounting: false,

          safety: false,

          foodPermit: false,

          environmental: false,

          score: 0,

          inspections: 0,

          violations: 0,

          penalties: 0,

          warnings: 0,

          filingHistory: [],

          violationsHistory: [],

          nextTaxFilingDay: 30,

          lastTaxFilingDay: 0,

          suspended: false

        };
      }

      const c = company.compliance;

      if (!Array.isArray(c.filingHistory)) {
        c.filingHistory = [];
      }

      if (!Array.isArray(c.violationsHistory)) {
        c.violationsHistory = [];
      }

      if (c.score === undefined) {
        c.score = 0;
      }

      if (c.inspections === undefined) {
        c.inspections = 0;
      }

      if (c.violations === undefined) {
        c.violations = 0;
      }

      if (c.penalties === undefined) {
        c.penalties = 0;
      }

      if (c.warnings === undefined) {
        c.warnings = 0;
      }

      if (c.suspended === undefined) {
        c.suspended = false;
      }

      return company;
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
       REQUIREMENTS
       ========================================================== */

    getRequirements(company) {

      const type =
        this.getBusinessType(company);

      return (
        this.requirements[type] ||
        this.requirements.generic
      );
    },

    /* ==========================================================
       COSTS
       ========================================================== */

    costs: {

      registration: 5000,

      taxRegistration: 3000,

      bankAccount: 2000,

      license: 4000,

      accounting: 6000,

      safety: 7500,

      foodPermit: 5000,

      environmental: 12000

    },

    /* ==========================================================
       COMPANY CASH HELPERS
       ========================================================== */

    getCompanyCash(company) {

      if (
        window.EmpireAccounting
      ) {
        return window.EmpireAccounting.getCash(
          company
        );
      }

      company.finance =
        company.finance || {};

      return Number(
        company.finance.cash || 0
      );
    },

    spendCompanyCash(
      company,
      amount,
      description
    ) {

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

      const cash =
        this.getCompanyCash(company);

      if (cash < amount) {
        return false;
      }

      company.finance.cash -= amount;

      return true;
    },

    /* ==========================================================
       COMPLETE COMPLIANCE SCORE
       ========================================================== */

    calculateScore(company) {

      this.ensureCompany(company);

      const requirements =
        this.getRequirements(company);

      const c =
        company.compliance;

      let required = 0;
      let completed = 0;

      Object.keys(requirements).forEach(
        key => {

          if (
            requirements[key] !== true
          ) {
            return;
          }

          required++;

          if (c[key] === true) {
            completed++;
          }

        }
      );

      let score =
        required === 0
          ? 100
          : Math.round(
              (completed / required) * 100
            );

      /*
       * Filing history effect.
       */

      const lateFilings =
        c.filingHistory.filter(
          filing =>
            filing.late === true
        ).length;

      score -=
        lateFilings * 5;

      /*
       * Violations.
       */

      score -=
        Number(c.violations || 0) * 8;

      /*
       * Penalties.

       * */

      score -=
        Number(c.penalties || 0) * 3;

      c.score =
        Math.max(
          0,
          Math.min(
            100,
            score
          )
        );

      return c.score;
    },

    /* ==========================================================
       COMPLIANCE RATING
       ========================================================== */

    getRating(score) {

      score =
        Number(score || 0);

      if (score >= 90) return "Excellent";
      if (score >= 75) return "Good";
      if (score >= 60) return "Fair";
      if (score >= 40) return "Weak";

      return "Critical";
    },

    /* ==========================================================
       COMPLETE TASK
       ========================================================== */

    completeRequirement(
      company,
      requirement
    ) {

      this.ensureCompany(company);

      const requirements =
        this.getRequirements(company);

      const c =
        company.compliance;

      if (
        requirements[requirement] !== true
      ) {
        return {
          success: true,
          message:
            "This requirement is not mandatory for this business."
        };
      }

      if (
        c[requirement] === true
      ) {
        return {
          success: true,
          message:
            "Requirement already completed."
        };
      }

      const cost =
        this.costs[requirement] || 0;

      if (
        cost > 0 &&
        !this.spendCompanyCash(
          company,
          cost,
          "Compliance: " + requirement
        )
      ) {
        return {
          success: false,
          reason:
            "Insufficient company cash."
        };
      }

      c[requirement] = true;

      this.calculateScore(
        company
      );

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireComplianceUpdated",
          {
            detail: {
              company,
              requirement,
              cost,
              score: c.score
            }
          }
        )
      );

      return {
        success: true,
        requirement,
        cost,
        score: c.score
      };
    },

    /* ==========================================================
       TAX RATE
       ========================================================== */

    getTaxRate(company) {

      const profit =
        Number(
          company.finance?.totalProfit || 0
        );

      /*
       * Game progression tax model.
       */

      if (profit <= 0) {
        return 0.10;
      }

      if (profit <= 500000) {
        return 0.15;
      }

      if (profit <= 2000000) {
        return 0.20;
      }

      return 0.25;
    },

    /* ==========================================================
       ESTIMATE TAX
       ========================================================== */

    calculateTax(company) {

      const profit =
        Number(
          company.finance?.totalProfit || 0
        );

      if (profit <= 0) {
        return 0;
      }

      const rate =
        this.getTaxRate(company);

      return Math.round(
        profit * rate
      );
    },

    /* ==========================================================
       TAX FILING
       ========================================================== */

    fileTax(company) {

      this.ensureCompany(company);

      const c =
        company.compliance;

      if (
        !c.taxRegistration
      ) {
        return {
          success: false,
          reason:
            "Tax registration is required first."
        };
      }

      const state =
        Game.getState();

      const currentDay =
        Number(
          state.world?.day || 1
        );

      const tax =
        this.calculateTax(
          company
        );

      if (
        tax > 0 &&
        !this.spendCompanyCash(
          company,
          tax,
          "Tax payment",
          "Tax"
        )
      ) {
        c.warnings++;

        this.calculateScore(
          company
        );

        Game.save();

        return {
          success: false,
          reason:
            "Company cannot pay its tax liability."
        };
      }

      const late =
        currentDay >
        Number(
          c.nextTaxFilingDay || 30
        );

      c.filingHistory.push({

        day:
          currentDay,

        tax,

        late,

        status:
          late
            ? "Late"
            : "Filed"

      });

      if (late) {
        c.warnings++;

        /*
         * Late filing penalty.
         */

        const penalty =
          Math.round(
            tax * 0.05
          );

        if (
          penalty > 0 &&
          this.getCompanyCash(company) >= penalty
        ) {

          this.spendCompanyCash(
            company,
            penalty,
            "Late tax filing penalty",
            "Tax"
          );

          c.penalties++;

        }

      }

      c.lastTaxFilingDay =
        currentDay;

      c.nextTaxFilingDay =
        currentDay + 30;

      this.calculateScore(
        company
      );

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireTaxFiled",
          {
            detail: {
              company,
              tax,
              late
            }
          }
        )
      );

      return {

        success: true,

        tax,

        late,

        nextFilingDay:
          c.nextTaxFilingDay,

        complianceScore:
          c.score

      };
    },

    /* ==========================================================
       INSPECTION
       ========================================================== */

    runInspection(company) {

      this.ensureCompany(company);

      const c =
        company.compliance;

      c.inspections++;

      const score =
        this.calculateScore(
          company
        );

      /*
       * Higher compliance =
       * lower violation probability.
       */

      let violationChance =
        0.30;

      if (score >= 90) {
        violationChance = 0.03;
      } else if (score >= 75) {
        violationChance = 0.08;
      } else if (score >= 60) {
        violationChance = 0.15;
      } else if (score >= 40) {
        violationChance = 0.25;
      }

      const violation =
        Math.random() <
        violationChance;

      if (!violation) {

        Game.save();

        return {

          success: true,

          violation: false,

          message:
            "Inspection passed."

        };
      }

      c.violations++;

      /*
       * Penalty scales with business size.
       */

      const revenue =
        Number(
          company.finance?.totalRevenue || 0
        );

      const basePenalty =
        Math.max(
          5000,
          Math.round(
            Math.min(
              100000,
              Math.max(
                5000,
                revenue * 0.01
              )
            )
          )
        );

      const penalty =
        basePenalty *
        (
          1 +
          Math.random() * 1.5
        );

      const finalPenalty =
        Math.round(
          penalty
        );

      if (
        this.getCompanyCash(company) >=
        finalPenalty
      ) {

        this.spendCompanyCash(
          company,
          finalPenalty,
          "Government inspection penalty",
          "Operating"
        );

        c.penalties++;

      } else {

        c.warnings++;

      }

      c.violationsHistory.push({

        day:
          Game.getState()?.world?.day || 1,

        type:
          "Regulatory Violation",

        penalty:
          finalPenalty,

        paid:
          this.getCompanyCash(company) >= 0

      });

      /*
       * Very poor compliance can cause suspension.
       */

      this.calculateScore(
        company
      );

      if (
        c.score < 25 &&
        c.violations >= 3
      ) {

        c.suspended = true;

        company.status =
          "Suspended";

        company.operating =
          false;

      }

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireComplianceViolation",
          {
            detail: {
              company,
              penalty: finalPenalty,
              score: c.score,
              suspended: c.suspended
            }
          }
        )
      );

      return {

        success: true,

        violation: true,

        penalty:
          finalPenalty,

        score:
          c.score,

        suspended:
          c.suspended

      };
    },

    /* ==========================================================
       RESTORE BUSINESS
       ========================================================== */

    resolveSuspension(company) {

      this.ensureCompany(company);

      const c =
        company.compliance;

      if (
        !c.suspended
      ) {
        return {
          success: false,
          reason:
            "Business is not suspended."
        };
      }

      const score =
        this.calculateScore(
          company
        );

      if (
        score < 60
      ) {
        return {
          success: false,
          reason:
            "Improve compliance score to at least 60."
        };
      }

      c.suspended =
        false;

      company.status =
        "Operating";

      company.operating =
        true;

      c.warnings++;

      Game.save();

      return {
        success: true,
        score
      };
    },

    /* ==========================================================
       DAILY COMPLIANCE CHECK
       ========================================================== */

    dailyCheck(company) {

      this.ensureCompany(company);

      if (
        company.status !== "Operating"
      ) {
        return null;
      }

      const c =
        company.compliance;

      const state =
        Game.getState();

      const day =
        Number(
          state.world?.day || 1
        );

      /*
       * Tax filing warning.
       */

      if (
        c.taxRegistration &&
        day >=
        Number(c.nextTaxFilingDay || 30) - 5
      ) {

        window.dispatchEvent(
          new CustomEvent(
            "EmpireComplianceWarning",
            {
              detail: {
                company,
                type:
                  "Tax Filing Due Soon",
                dueDay:
                  c.nextTaxFilingDay
              }
            }
          )
        );

      }

      /*
       * Random government inspection.
       */

      if (
        Math.random() < 0.015
      ) {

        return this.runInspection(
          company
        );

      }

      return null;
    },

    /* ==========================================================
       MONTHLY CHECK
       ========================================================== */

    monthlyCheck(company) {

      this.ensureCompany(company);

      /*
       * Missing mandatory compliance
       * slowly reduces score.
       */

      this.calculateScore(
        company
      );

      const c =
        company.compliance;

      if (
        c.score < 40
      ) {

        c.warnings++;

      }

      Game.save();

      return this.getSummary(
        company
      );
    },

    /* ==========================================================
       SUMMARY
       ========================================================== */

    getSummary(company) {

      this.ensureCompany(company);

      const requirements =
        this.getRequirements(company);

      const c =
        company.compliance;

      this.calculateScore(
        company
      );

      const required = [];

      Object.keys(requirements).forEach(
        key => {

          if (
            requirements[key] !== true
          ) {
            return;
          }

          required.push({

            name:
              key,

            completed:
              c[key] === true,

            cost:
              this.costs[key] || 0

          });

        }
      );

      return {

        business:
          company.name,

        businessType:
          this.getBusinessType(company),

        score:
          c.score,

        rating:
          this.getRating(c.score),

        inspections:
          c.inspections,

        violations:
          c.violations,

        penalties:
          c.penalties,

        warnings:
          c.warnings,

        suspended:
          c.suspended,

        nextTaxFilingDay:
          c.nextTaxFilingDay,

        required

      };
    }
  };

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireCompliance =
    Compliance;

  /* ============================================================
     BUSINESS EVENTS
     ============================================================ */

  window.addEventListener(
    "EmpireBusinessStarted",
    function (event) {

      const company =
        event.detail?.company;

      if (!company) return;

      Compliance.ensureCompany(
        company
      );

      Compliance.calculateScore(
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

      Compliance.ensureCompany(
        company
      );

      Compliance.calculateScore(
        company
      );

      Game.save();
    }
  );

  /* ============================================================
     DAILY EVENT
     ============================================================ */

  window.addEventListener(
    "EmpireDayAdvanced",
    function () {

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

          Compliance.dailyCheck(
            company
          );

        }
      );

      Game.save();
    }
  );

  /* ============================================================
     MONTHLY EVENT
     ============================================================ */

  window.addEventListener(
    "EmpireMonthAdvanced",
    function () {

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

          Compliance.monthlyCheck(
            company
          );

        }
      );

      Game.save();
    }
  );

  console.log(
    "Empire Rush: Government + Tax + Compliance System loaded."
  );

})();
