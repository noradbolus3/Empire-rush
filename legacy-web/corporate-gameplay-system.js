(function () {
  "use strict";

  const Game = window.EmpireGameState;
  const Groups = window.EmpireCompanyGroup;

  if (!Game || !Groups) {
    console.warn("Corporate Gameplay System waiting for core systems.");
    return;
  }

  /*
   * ============================================================
   * EMPIRE RUSH — CORPORATE GAMEPLAY SYSTEM
   * ============================================================
   *
   * Ownership
   * Voting Control
   * Subsidiary Performance
   * Group KPIs
   * Corporate Actions
   * Acquisition Readiness
   * Management Control
   *
   * ============================================================
   */

  const Corporate = {

    /* ==========================================================
       CONSTANTS
       ========================================================== */

    ACTIONS: {
      ACQUIRE: "acquire",
      INVEST: "invest",
      DIVIDEND: "dividend",
      APPOINT_MANAGER: "appoint_manager",
      RESTRUCTURE: "restructure"
    },

    /* ==========================================================
       COMPANY INITIALIZATION
       ========================================================== */

    ensure(company) {
      if (!company) return null;

      Groups.ensureCompany(company);

      if (!company.corporate) {
        company.corporate = {};
      }

      if (!Array.isArray(company.corporate.board)) {
        company.corporate.board = [];
      }

      if (!Array.isArray(company.corporate.decisions)) {
        company.corporate.decisions = [];
      }

      if (!company.corporate.control) {
        company.corporate.control = {
          managementControl: 100,
          strategicControl: 100,
          operationalControl: 100
        };
      }

      if (!company.corporate.kpi) {
        company.corporate.kpi = {
          revenue: 0,
          profit: 0,
          cash: 0,
          debt: 0,
          employees: 0,
          subsidiaries: 0,
          valuation: 0
        };
      }

      if (!company.corporate.management) {
        company.corporate.management = {
          ceo: null,
          cfo: null,
          coo: null
        };
      }

      return company;
    },

    /* ==========================================================
       INITIALIZE ALL
       ========================================================== */

    initialize() {
      const state = Game.getState();

      if (!state) return;

      (state.companies || []).forEach(
        company => this.ensure(company)
      );

      this.refreshAllKPIs();

      Game.save();
    },

    /* ==========================================================
       OWNERSHIP
       ========================================================== */

    getOwnership(parent, subsidiary) {
      if (!parent || !subsidiary) return 0;

      const entry =
        (
          parent.corporate?.controlledCompanies ||
          []
        ).find(
          item =>
            String(item.companyId) ===
            String(subsidiary.id)
        );

      return Number(
        entry?.ownershipPercentage || 0
      );
    },

    getVotingPower(parent, subsidiary) {
      if (!parent || !subsidiary) return 0;

      const entry =
        (
          parent.corporate?.controlledCompanies ||
          []
        ).find(
          item =>
            String(item.companyId) ===
            String(subsidiary.id)
        );

      return Number(
        entry?.votingPercentage ||
        entry?.ownershipPercentage ||
        0
      );
    },

    hasControl(parent, subsidiary) {
      return (
        this.getVotingPower(
          parent,
          subsidiary
        ) > 50
      );
    },

    /* ==========================================================
       MANAGEMENT CONTROL
       ========================================================== */

    calculateManagementControl(
      parent,
      subsidiary
    ) {
      if (!parent || !subsidiary) return 0;

      const ownership =
        this.getOwnership(
          parent,
          subsidiary
        );

      const voting =
        this.getVotingPower(
          parent,
          subsidiary
        );

      let control =
        ownership * 0.45 +
        voting * 0.55;

      /*
       * Strong operational integration
       * improves practical control.
       */

      if (
        parent.corporate?.isHoldingCompany
      ) {
        control += 5;
      }

      if (
        subsidiary.corporate?.management
          ?.parentAppointed
      ) {
        control += 10;
      }

      return Math.max(
        0,
        Math.min(
          100,
          Math.round(control)
        )
      );
    },

    updateControl(
      parent,
      subsidiary
    ) {
      this.ensure(parent);
      this.ensure(subsidiary);

      const control =
        this.calculateManagementControl(
          parent,
          subsidiary
        );

      subsidiary.corporate.control =
        subsidiary.corporate.control ||
        {};

      subsidiary.corporate.control.managementControl =
        control;

      subsidiary.corporate.control.strategicControl =
        control;

      subsidiary.corporate.control.operationalControl =
        control;

      return control;
    },

    /* ==========================================================
       SUBSIDIARY PERFORMANCE
       ========================================================== */

    getSubsidiaryPerformance(
      subsidiary
    ) {
      if (!subsidiary) return null;

      this.ensure(subsidiary);

      const finance =
        subsidiary.finance || {};

      const employees =
        Array.isArray(
          subsidiary.employees
        )
          ? subsidiary.employees.length
          : 0;

      const revenue =
        Number(
          finance.totalRevenue || 0
        );

      const expenses =
        Number(
          finance.totalExpenses || 0
        );

      const profit =
        Number(
          finance.totalProfit ??
          (revenue - expenses)
        );

      const cash =
        Number(
          finance.cash || 0
        );

      const debt =
        Number(
          finance.loanPrincipal || 0
        );

      const valuation =
        Number(
          finance.valuation || 0
        );

      return {
        companyId:
          subsidiary.id,

        name:
          subsidiary.name,

        revenue:
          Math.round(revenue),

        expenses:
          Math.round(expenses),

        profit:
          Math.round(profit),

        cash:
          Math.round(cash),

        debt:
          Math.round(debt),

        employees,

        valuation:
          Math.round(valuation),

        margin:
          revenue > 0
            ? Number(
                (
                  profit /
                  revenue *
                  100
                ).toFixed(2)
              )
            : 0
      };
    },

    /* ==========================================================
       GROUP KPI
       ========================================================== */

    refreshCompanyKPI(company) {
      if (!company) return;

      this.ensure(company);

      const performance =
        this.getSubsidiaryPerformance(
          company
        );

      const controlled =
        Groups.getControlledCompanies(
          company.id
        );

      company.corporate.kpi = {
        revenue:
          performance.revenue,

        profit:
          performance.profit,

        cash:
          performance.cash,

        debt:
          performance.debt,

        employees:
          performance.employees,

        subsidiaries:
          controlled.length,

        valuation:
          performance.valuation
      };
    },

    refreshAllKPIs() {
      this.getCompanies().forEach(
        company =>
          this.refreshCompanyKPI(
            company
          )
      );
    },

    getCompanies() {
      return (
        Game.getState()?.companies ||
        []
      );
    },

    /* ==========================================================
       GROUP KPI
       ========================================================== */

    getGroupKPI(companyId) {
      const company =
        Groups.getCompany(
          companyId
        );

      if (!company) return null;

      const financials =
        Groups.getGroupFinancials(
          company.id
        );

      const companies =
        Groups.getGroupCompanies(
          company.id
        );

      let employees = 0;

      companies.forEach(
        item => {
          employees +=
            Array.isArray(
              item.employees
            )
              ? item.employees.length
              : 0;
        }
      );

      return {
        companies:
          companies.length,

        revenue:
          financials.revenue,

        expenses:
          financials.expenses,

        profit:
          financials.profit,

        cash:
          financials.cash,

        debt:
          financials.debt,

        valuation:
          financials.valuation,

        employees
      };
    },

    /* ==========================================================
       ACQUISITION READINESS
       ========================================================== */

    getAcquisitionReadiness(
      parentId,
      targetId
    ) {
      const parent =
        Groups.getCompany(
          parentId
        );

      const target =
        Groups.getCompany(
          targetId
        );

      if (!parent || !target) {
        return {
          eligible: false,
          score: 0,
          reasons: [
            "Company not found."
          ]
        };
      }

      const reasons = [];
      let score = 0;

      const parentCash =
        Number(
          parent.finance?.cash || 0
        );

      const targetValuation =
        Number(
          target.finance?.valuation || 0
        );

      const minimumCapital =
        Math.max(
          25000,
          targetValuation * 0.60
        );

      if (
        parentCash >=
        minimumCapital
      ) {
        score += 35;
      } else {
        reasons.push(
          "Insufficient parent company cash."
        );
      }

      const parentProfit =
        Number(
          parent.finance?.totalProfit || 0
        );

      if (
        parentProfit > 0
      ) {
        score += 20;
      } else {
        reasons.push(
          "Parent company should demonstrate positive profitability."
        );
      }

      const targetDebt =
        Number(
          target.finance?.loanPrincipal || 0
        );

      if (
        targetDebt <=
        targetValuation * 0.50
      ) {
        score += 20;
      } else {
        reasons.push(
          "Target company has relatively high debt."
        );
      }

      if (
        target.status === "Operating"
      ) {
        score += 15;
      } else {
        reasons.push(
          "Target company is not currently operating."
        );
      }

      if (
        target === parent
      ) {
        reasons.push(
          "A company cannot acquire itself."
        );
        score = 0;
      }

      const eligible =
        score >= 60 &&
        reasons.length === 0;

      return {
        eligible,
        score,
        reasons,
        estimatedPurchasePrice:
          Math.round(
            targetValuation *
            1.10
          )
      };
    },

    /* ==========================================================
       ACQUIRE COMPANY
       ========================================================== */

    acquireCompany(
      parentId,
      targetId
    ) {
      const parent =
        Groups.getCompany(
          parentId
        );

      const target =
        Groups.getCompany(
          targetId
        );

      if (!parent || !target) {
        return {
          success: false,
          reason:
            "Company not found."
        };
      }

      if (
        parent.id ===
        target.id
      ) {
        return {
          success: false,
          reason:
            "A company cannot acquire itself."
        };
      }

      const readiness =
        this.getAcquisitionReadiness(
          parent.id,
          target.id
        );

      if (!readiness.eligible) {
        return {
          success: false,
          reason:
            "Acquisition requirements are not satisfied.",
          readiness
        };
      }

      const price =
        readiness.estimatedPurchasePrice;

      const cash =
        Number(
          parent.finance?.cash || 0
        );

      if (cash < price) {
        return {
          success: false,
          reason:
            "Insufficient parent company cash.",
          required:
            price
        };
      }

      /*
       * Acquisition payment.
       */

      parent.finance.cash =
        cash - price;

      /*
       * Transfer control.
       */

      const attachment =
        Groups.addSubsidiary(
          parent.id,
          target.id,
          100
        );

      if (!attachment.success) {

        parent.finance.cash +=
          price;

        return {
          success: false,
          reason:
            attachment.reason
        };
      }

      target.corporate.acquisition = {
        acquired: true,

        acquiredBy:
          parent.id,

        acquisitionPrice:
          price,

        acquisitionDay:
          Game.getState()
            ?.world
            ?.day || 1
      };

      this.ensure(parent);
      this.ensure(target);

      target.corporate.control =
        target.corporate.control ||
        {};

      target.corporate.control.managementControl =
        100;

      target.corporate.control.strategicControl =
        100;

      target.corporate.control.operationalControl =
        100;

      this.recordDecision(
        parent,
        {
          type:
            "Acquisition",

          targetCompanyId:
            target.id,

          amount:
            price,

          day:
            Game.getState()
              ?.world
              ?.day || 1
        }
      );

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireCompanyAcquired",
          {
            detail: {
              parent,
              target,
              price
            }
          }
        )
      );

      return {
        success: true,

        parent,
        target,

        price
      };
    },

    /* ==========================================================
       APPOINT MANAGEMENT
       ========================================================== */

    appointManager(
      parentId,
      subsidiaryId,
      employeeId,
      position
    ) {
      const parent =
        Groups.getCompany(
          parentId
        );

      const subsidiary =
        Groups.getCompany(
          subsidiaryId
        );

      if (
        !parent ||
        !subsidiary
      ) {
        return {
          success: false,
          reason:
            "Company not found."
        };
      }

      if (
        !Groups.getControlledCompanies(
          parent.id
        ).some(
          item =>
            item.company.id ===
            subsidiary.id
        )
      ) {
        return {
          success: false,
          reason:
            "Parent does not control this subsidiary."
        };
      }

      this.ensure(
        subsidiary
      );

      position =
        String(
          position ||
          "CEO"
        ).toUpperCase();

      if (
        !["CEO", "CFO", "COO"]
          .includes(position)
      ) {
        return {
          success: false,
          reason:
            "Invalid management position."
        };
      }

      subsidiary.corporate.management =
        subsidiary.corporate.management ||
        {};

      subsidiary.corporate.management[
        position.toLowerCase()
      ] = employeeId;

      subsidiary.corporate.management
        .parentAppointed = true;

      this.updateControl(
        parent,
        subsidiary
      );

      this.recordDecision(
        parent,
        {
          type:
            "Management Appointment",

          subsidiaryId:
            subsidiary.id,

          position,

          employeeId,

          day:
            Game.getState()
              ?.world
              ?.day || 1
        }
      );

      Game.save();

      return {
        success: true,

        position,

        employeeId
      };
    },

    /* ==========================================================
       RESTRUCTURE
       ========================================================== */

    restructureCompany(
      companyId,
      newRole
    ) {
      const company =
        Groups.getCompany(
          companyId
        );

      if (!company) {
        return {
          success: false,
          reason:
            "Company not found."
        };
      }

      this.ensure(
        company
      );

      const allowed = [
        "Holding Company",
        "Operating Company",
        "Subsidiary"
      ];

      if (
        !allowed.includes(
          newRole
        )
      ) {
        return {
          success: false,
          reason:
            "Invalid corporate role."
        };
      }

      company.corporate.role =
        newRole;

      company.corporate.isHoldingCompany =
        newRole ===
        "Holding Company";

      company.corporate.isSubsidiary =
        newRole ===
        "Subsidiary";

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireCompanyRestructured",
          {
            detail: {
              company,
              role:
                newRole
            }
          }
        )
      );

      return {
        success: true,
        role:
          newRole
      };
    },

    /* ==========================================================
       CORPORATE DECISION LOG
       ========================================================== */

    recordDecision(
      company,
      decision
    ) {
      this.ensure(
        company
      );

      company.corporate.decisions
        .push(
          decision
        );

      if (
        company.corporate.decisions
          .length > 100
      ) {
        company.corporate.decisions =
          company.corporate.decisions
            .slice(-100);
      }
    },

    /* ==========================================================
       CORPORATE REPORT
       ========================================================== */

    getCorporateReport(
      companyId
    ) {
      const company =
        Groups.getCompany(
          companyId
        );

      if (!company) return null;

      this.ensure(
        company
      );

      const group =
        this.getGroupKPI(
          company.id
        );

      const subsidiaries =
        Groups.getControlledCompanies(
          company.id
        ).map(
          item => {

            const child =
              item.company;

            const performance =
              this.getSubsidiaryPerformance(
                child
              );

            const control =
              this.updateControl(
                company,
                child
              );

            return {

              id:
                child.id,

              name:
                child.name,

              ownership:
                item.ownership,

              voting:
                item.voting,

              control,

              performance

            };
          }
        );

      return {

        company: {
          id:
            company.id,

          name:
            company.name,

          role:
            company.corporate.role
        },

        group,

        subsidiaries,

        management:
          company.corporate.management,

        recentDecisions:
          (
            company.corporate.decisions ||
            []
          ).slice(-10)

      };
    },

    /* ==========================================================
       MONTHLY CORPORATE UPDATE
       ========================================================== */

    monthlyUpdate() {
      this.getCompanies().forEach(
        company => {

          this.ensure(
            company
          );

          this.refreshCompanyKPI(
            company
          );

          const children =
            Groups.getControlledCompanies(
              company.id
            );

          children.forEach(
            item => {

              this.updateControl(
                company,
                item.company
              );

            }
          );
        }
      );

      Game.save();
    }
  };

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireCorporateGameplay =
    Corporate;

  /* ============================================================
     EVENTS
     ============================================================ */

  window.addEventListener(
    "EmpireBusinessStarted",
    () => {
      Corporate.initialize();
    }
  );

  window.addEventListener(
    "EmpireHoldingCompanyCreated",
    () => {
      Corporate.initialize();
    }
  );

  window.addEventListener(
    "EmpireSubsidiaryAdded",
    event => {

      const parent =
        event.detail?.parent;

      const subsidiary =
        event.detail?.subsidiary;

      if (
        parent &&
        subsidiary
      ) {
        Corporate.updateControl(
          parent,
          subsidiary
        );
      }

      Corporate.refreshAllKPIs();
      Game.save();
    }
  );

  window.addEventListener(
    "EmpireDayAdvanced",
    () => {
      Corporate.refreshAllKPIs();
    }
  );

  window.addEventListener(
    "EmpireMonthAdvanced",
    () => {
      Corporate.monthlyUpdate();
    }
  );

  /*
   * Initialize after page load.
   */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      () => Corporate.initialize()
    );
  } else {
    Corporate.initialize();
  }

  console.log(
    "Empire Rush: Corporate Gameplay System loaded."
  );

})();
