(function () {
  "use strict";

  const Game = window.EmpireGameState;

  if (!Game) {
    console.warn("EmpireGameState not found.");
    return;
  }

  /*
   * ============================================================
   * EMPIRE RUSH — COMPANY GROUP / HOLDING SYSTEM
   * ============================================================
   *
   * INDIVIDUAL
   *     ↓
   * BUSINESS
   *     ↓
   * COMPANY
   *     ↓
   * HOLDING COMPANY
   *     ↓
   * SUBSIDIARIES
   *     ↓
   * BUSINESS GROUP
   *
   * ============================================================
   */

  const GroupSystem = {

    /* ==========================================================
       GROUP TYPES
       ========================================================== */

    groupTypes: {
      holding: "Holding Company",
      operating: "Operating Company",
      subsidiary: "Subsidiary",
      group: "Business Group"
    },

    /* ==========================================================
       INITIALIZE COMPANY
       ========================================================== */

    ensureCompany(company) {

      if (!company) return null;

      if (!company.corporate) {
        company.corporate = {
          role: "Operating Company",
          parentCompanyId: null,
          groupId: null,
          ownershipPercentage: 100,
          votingPercentage: 100,
          isHoldingCompany: false,
          isSubsidiary: false,
          controlledCompanies: []
        };
      }

      if (!Array.isArray(
        company.corporate.controlledCompanies
      )) {
        company.corporate.controlledCompanies = [];
      }

      return company;
    },

    /* ==========================================================
       INITIALIZE ALL COMPANIES
       ========================================================== */

    initialize() {

      const state =
        Game.getState();

      if (!state) return;

      if (!Array.isArray(state.companies)) {
        state.companies = [];
      }

      state.companies.forEach(
        company => {
          this.ensureCompany(company);
        }
      );

      Game.save();
    },

    /* ==========================================================
       GET COMPANIES
       ========================================================== */

    getCompanies() {

      const state =
        Game.getState();

      return state?.companies || [];
    },

    getCompany(companyId) {

      return this.getCompanies()
        .find(
          company =>
            String(company.id) ===
            String(companyId)
        );
    },

    /* ==========================================================
       CREATE HOLDING COMPANY
       ========================================================== */

    createHoldingCompany(
      name,
      founderCompanyId
    ) {

      const state =
        Game.getState();

      if (!state) {
        return {
          success: false,
          reason: "Game state unavailable."
        };
      }

      name =
        String(
          name || "Empire Holdings"
        ).trim();

      if (!name) {
        return {
          success: false,
          reason:
            "Holding company name is required."
        };
      }

      /*
       * Existing operating company can
       * become the first controlled company.
       */

      const founderCompany =
        founderCompanyId
          ? this.getCompany(
              founderCompanyId
            )
          : null;

      if (
        founderCompany
      ) {
        this.ensureCompany(
          founderCompany
        );
      }

      const creationCost =
        50000;

      /*
       * Holding company is funded
       * from player capital.
       */

      if (
        Number(state.player?.cash || 0) <
        creationCost
      ) {

        return {
          success: false,
          reason:
            "Insufficient player capital.",
          required:
            creationCost
        };

      }

      state.player.cash -=
        creationCost;

      const holding = {

        id:
          "HOLD-" +
          Date.now(),

        name,

        type:
          "Holding Company",

        category:
          "Holding",

        status:
          "Operating",

        operating:
          true,

        createdDay:
          state.world?.day || 1,

        finance: {

          cash: 0,

          totalRevenue: 0,

          totalExpenses: 0,

          totalProfit: 0,

          valuation: creationCost

        },

        employees: [],

        subsidiaries: [],

        products: [],

        corporate: {

          role:
            "Holding Company",

          parentCompanyId:
            null,

          groupId:
            null,

          ownershipPercentage:
            100,

          votingPercentage:
            100,

          isHoldingCompany:
            true,

          isSubsidiary:
            false,

          controlledCompanies: []

        }

      };

      state.companies.push(
        holding
      );

      /*
       * If an existing company was selected,
       * attach it to the holding company.
       */

      if (
        founderCompany
      ) {

        const result =
          this.addSubsidiary(
            holding.id,
            founderCompany.id,
            100
          );

        if (!result.success) {

          console.warn(
            "Holding created but first subsidiary attachment failed.",
            result
          );

        }

      }

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireHoldingCompanyCreated",
          {
            detail: {
              holding
            }
          }
        )
      );

      return {
        success: true,
        company:
          holding,
        cost:
          creationCost
      };
    },

    /* ==========================================================
       ADD SUBSIDIARY
       ========================================================== */

    addSubsidiary(
      parentCompanyId,
      subsidiaryCompanyId,
      ownershipPercentage
    ) {

      const parent =
        this.getCompany(
          parentCompanyId
        );

      const subsidiary =
        this.getCompany(
          subsidiaryCompanyId
        );

      if (!parent || !subsidiary) {

        return {
          success: false,
          reason:
            "Parent or subsidiary company not found."
        };

      }

      if (
        parent.id ===
        subsidiary.id
      ) {

        return {
          success: false,
          reason:
            "A company cannot own itself."
        };

      }

      this.ensureCompany(
        parent
      );

      this.ensureCompany(
        subsidiary
      );

      /*
       * Prevent circular ownership.
       */

      if (
        this.wouldCreateCircularOwnership(
          parent.id,
          subsidiary.id
        )
      ) {

        return {
          success: false,
          reason:
            "Circular ownership is not allowed."
        };

      }

      ownershipPercentage =
        Number(
          ownershipPercentage ?? 100
        );

      ownershipPercentage =
        Math.max(
          1,
          Math.min(
            100,
            ownershipPercentage
          )
        );

      /*
       * If subsidiary already belongs
       * to another parent, reject it.
       */

      if (
        subsidiary.corporate.parentCompanyId &&
        String(
          subsidiary.corporate.parentCompanyId
        ) !==
        String(parent.id)
      ) {

        return {
          success: false,
          reason:
            "Company already has another parent company."
        };

      }

      /*
       * Avoid duplicate attachment.
       */

      const existing =
        parent.corporate.controlledCompanies
          .find(
            item =>
              String(
                item.companyId
              ) ===
              String(
                subsidiary.id
              )
          );

      if (existing) {

        existing.ownershipPercentage =
          ownershipPercentage;

      } else {

        parent.corporate.controlledCompanies
          .push({

            companyId:
              subsidiary.id,

            ownershipPercentage,

            votingPercentage:
              ownershipPercentage,

            acquiredDay:
              Game.getState()
                ?.world
                ?.day || 1

          });

      }

      subsidiary.corporate.parentCompanyId =
        parent.id;

      subsidiary.corporate.ownershipPercentage =
        ownershipPercentage;

      subsidiary.corporate.votingPercentage =
        ownershipPercentage;

      subsidiary.corporate.isSubsidiary =
        true;

      subsidiary.corporate.role =
        "Subsidiary";

      /*
       * Maintain compatibility with
       * older code that expects subsidiaries.
       */

      if (!Array.isArray(
        parent.subsidiaries
      )) {
        parent.subsidiaries = [];
      }

      if (
        !parent.subsidiaries.includes(
          subsidiary.id
        )
      ) {

        parent.subsidiaries.push(
          subsidiary.id
        );

      }

      /*
       * Group ID.
       */

      const groupId =
        parent.corporate.groupId ||
        parent.id;

      parent.corporate.groupId =
        groupId;

      subsidiary.corporate.groupId =
        groupId;

      this.propagateGroupId(
        subsidiary,
        groupId
      );

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireSubsidiaryAdded",
          {
            detail: {
              parent,
              subsidiary,
              ownershipPercentage
            }
          }
        )
      );

      return {
        success: true,
        parent,
        subsidiary
      };
    },

    /* ==========================================================
       REMOVE SUBSIDIARY
       ========================================================== */

    removeSubsidiary(
      parentCompanyId,
      subsidiaryCompanyId
    ) {

      const parent =
        this.getCompany(
          parentCompanyId
        );

      const subsidiary =
        this.getCompany(
          subsidiaryCompanyId
        );

      if (!parent || !subsidiary) {

        return {
          success: false,
          reason:
            "Company not found."
        };

      }

      this.ensureCompany(
        parent
      );

      this.ensureCompany(
        subsidiary
      );

      parent.corporate.controlledCompanies =
        parent.corporate.controlledCompanies
          .filter(
            item =>
              String(
                item.companyId
              ) !==
              String(
                subsidiary.id
              )
          );

      parent.subsidiaries =
        (
          parent.subsidiaries || []
        ).filter(
          id =>
            String(id) !==
            String(subsidiary.id)
        );

      subsidiary.corporate.parentCompanyId =
        null;

      subsidiary.corporate.isSubsidiary =
        false;

      subsidiary.corporate.role =
        "Operating Company";

      subsidiary.corporate.ownershipPercentage =
        100;

      subsidiary.corporate.votingPercentage =
        100;

      subsidiary.corporate.groupId =
        null;

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireSubsidiaryRemoved",
          {
            detail: {
              parent,
              subsidiary
            }
          }
        )
      );

      return {
        success: true
      };
    },

    /* ==========================================================
       OWNERSHIP TRANSFER
       ========================================================== */

    changeOwnership(
      parentCompanyId,
      subsidiaryCompanyId,
      newPercentage
    ) {

      const parent =
        this.getCompany(
          parentCompanyId
        );

      const subsidiary =
        this.getCompany(
          subsidiaryCompanyId
        );

      if (!parent || !subsidiary) {

        return {
          success: false,
          reason:
            "Company not found."
        };

      }

      newPercentage =
        Number(
          newPercentage
        );

      if (
        !Number.isFinite(
          newPercentage
        ) ||
        newPercentage <= 0 ||
        newPercentage > 100
      ) {

        return {
          success: false,
          reason:
            "Ownership must be between 1% and 100%."
        };

      }

      const entry =
        (
          parent.corporate
            ?.controlledCompanies ||
          []
        ).find(
          item =>
            String(
              item.companyId
            ) ===
            String(
              subsidiary.id
            )
        );

      if (!entry) {

        return {
          success: false,
          reason:
            "Company is not a subsidiary."
        };

      }

      entry.ownershipPercentage =
        newPercentage;

      entry.votingPercentage =
        newPercentage;

      subsidiary.corporate
        .ownershipPercentage =
        newPercentage;

      subsidiary.corporate
        .votingPercentage =
        newPercentage;

      /*
       * More than 50% means control.
       */

      if (
        newPercentage >= 50
      ) {

        subsidiary.corporate.isSubsidiary =
          true;

      } else {

        subsidiary.corporate.isSubsidiary =
          false;

      }

      Game.save();

      return {
        success: true,
        ownership:
          newPercentage
      };
    },

    /* ==========================================================
       INTER-COMPANY INVESTMENT
       ========================================================== */

    investInSubsidiary(
      parentCompanyId,
      subsidiaryCompanyId,
      amount
    ) {

      const parent =
        this.getCompany(
          parentCompanyId
        );

      const subsidiary =
        this.getCompany(
          subsidiaryCompanyId
        );

      if (!parent || !subsidiary) {

        return {
          success: false,
          reason:
            "Company not found."
        };

      }

      amount =
        Math.round(
          Number(amount || 0)
        );

      if (
        amount <= 0
      ) {

        return {
          success: false,
          reason:
            "Investment amount must be positive."
        };

      }

      const parentCash =
        Number(
          parent.finance?.cash || 0
        );

      if (
        parentCash < amount
      ) {

        return {
          success: false,
          reason:
            "Parent company has insufficient cash."
        };

      }

      parent.finance.cash =
        parentCash -
        amount;

      subsidiary.finance =
        subsidiary.finance || {};

      subsidiary.finance.cash =
        Number(
          subsidiary.finance.cash || 0
        ) + amount;

      subsidiary.finance.ownerInvestment =
        Number(
          subsidiary.finance.ownerInvestment || 0
        ) + amount;

      this.recordTransaction(
        parent,
        {
          type:
            "Subsidiary Investment",

          amount,

          targetCompanyId:
            subsidiary.id,

          day:
            Game.getState()
              ?.world
              ?.day || 1

        }
      );

      this.recordTransaction(
        subsidiary,
        {
          type:
            "Parent Investment",

          amount,

          sourceCompanyId:
            parent.id,

          day:
            Game.getState()
              ?.world
              ?.day || 1

        }
      );

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireInterCompanyInvestment",
          {
            detail: {
              parent,
              subsidiary,
              amount
            }
          }
        )
      );

      return {
        success: true,
        amount
      };
    },

    /* ==========================================================
       GROUP TREE
       ========================================================== */

    getGroupTree(
      companyId
    ) {

      const root =
        this.getCompany(
          companyId
        );

      if (!root) {
        return null;
      }

      this.ensureCompany(
        root
      );

      return this.buildTree(
        root
      );
    },

    buildTree(company) {

      this.ensureCompany(
        company
      );

      const children =
        company.corporate
          .controlledCompanies
          .map(
            entry =>
              this.getCompany(
                entry.companyId
              )
          )
          .filter(Boolean);

      return {

        id:
          company.id,

        name:
          company.name,

        role:
          company.corporate.role,

        ownership:
          company.corporate
            .ownershipPercentage,

        status:
          company.status,

        children:
          children.map(
            child =>
              this.buildTree(
                child
              )
          )

      };
    },

    /* ==========================================================
       GROUP COMPANIES
       ========================================================== */

    getGroupCompanies(
      companyId
    ) {

      const company =
        this.getCompany(
          companyId
        );

      if (!company) {
        return [];
      }

      const groupId =
        company.corporate
          ?.groupId ||
        company.id;

      return this.getCompanies()
        .filter(
          item =>
            item.corporate
              ?.groupId ===
            groupId ||
            item.id === company.id
        );
    },

    /* ==========================================================
       GROUP FINANCIALS
       ========================================================== */

    getGroupFinancials(
      companyId
    ) {

      const companies =
        this.getGroupCompanies(
          companyId
        );

      let revenue = 0;
      let expenses = 0;
      let profit = 0;
      let cash = 0;
      let valuation = 0;
      let debt = 0;

      companies.forEach(
        company => {

          const finance =
            company.finance || {};

          const ownership =
            company.id === companyId
              ? 1
              : Number(
                  company.corporate
                    ?.ownershipPercentage ||
                  100
                ) / 100;

          revenue +=
            Number(
              finance.totalRevenue || 0
            ) *
            ownership;

          expenses +=
            Number(
              finance.totalExpenses || 0
            ) *
            ownership;

          profit +=
            Number(
              finance.totalProfit || 0
            ) *
            ownership;

          cash +=
            Number(
              finance.cash || 0
            );

          valuation +=
            Number(
              finance.valuation || 0
            ) *
            ownership;

          debt +=
            Number(
              finance.loanPrincipal || 0
            ) *
            ownership;

        }
      );

      return {

        companies:
          companies.length,

        revenue:
          Math.round(revenue),

        expenses:
          Math.round(expenses),

        profit:
          Math.round(profit),

        cash:
          Math.round(cash),

        valuation:
          Math.round(valuation),

        debt:
          Math.round(debt)

      };
    },

    /* ==========================================================
       GROUP REVENUE
       ========================================================== */

    getGroupRevenue(
      companyId
    ) {

      return this.getGroupFinancials(
        companyId
      ).revenue;

    },

    /* ==========================================================
       GROUP VALUATION
       ========================================================== */

    getGroupValuation(
      companyId
    ) {

      const financials =
        this.getGroupFinancials(
          companyId
        );

      return Math.max(
        0,
        Math.round(
          financials.valuation
        )
      );
    },

    /* ==========================================================
       CONTROLLED COMPANIES
       ========================================================== */

    getControlledCompanies(
      companyId
    ) {

      const company =
        this.getCompany(
          companyId
        );

      if (!company) {
        return [];
      }

      this.ensureCompany(
        company
      );

      return company.corporate
        .controlledCompanies
        .map(
          entry => {

            const child =
              this.getCompany(
                entry.companyId
              );

            if (!child) {
              return null;
            }

            return {

              company: child,

              ownership:
                entry.ownershipPercentage,

              voting:
                entry.votingPercentage

            };

          }
        )
        .filter(Boolean);

    },

    /* ==========================================================
       SUBSIDIARY COUNT
       ========================================================== */

    countSubsidiaries(
      companyId
    ) {

      return this.getControlledCompanies(
        companyId
      ).length;

    },

    /* ==========================================================
       GROUP LEVEL DIVIDEND
       ========================================================== */

    withdrawFromSubsidiary(
      parentCompanyId,
      subsidiaryCompanyId,
      amount
    ) {

      const parent =
        this.getCompany(
          parentCompanyId
        );

      const subsidiary =
        this.getCompany(
          subsidiaryCompanyId
        );

      if (!parent || !subsidiary) {

        return {
          success: false,
          reason:
            "Company not found."
        };

      }

      const relationship =
        this.getControlledCompanies(
          parent.id
        ).find(
          item =>
            item.company.id ===
            subsidiary.id
        );

      if (!relationship) {

        return {
          success: false,
          reason:
            "Company is not controlled by the parent."
        };

      }

      amount =
        Math.round(
          Number(amount || 0)
        );

      if (
        amount <= 0
      ) {

        return {
          success: false,
          reason:
            "Withdrawal amount must be positive."
        };

      }

      const subsidiaryCash =
        Number(
          subsidiary.finance?.cash || 0
        );

      if (
        subsidiaryCash < amount
      ) {

        return {
          success: false,
          reason:
            "Subsidiary has insufficient cash."
        };

      }

      subsidiary.finance.cash =
        subsidiaryCash -
        amount;

      parent.finance =
        parent.finance || {};

      parent.finance.cash =
        Number(
          parent.finance.cash || 0
        ) + amount;

      this.recordTransaction(
        subsidiary,
        {
          type:
            "Dividend / Group Transfer",

          amount,

          targetCompanyId:
            parent.id,

          day:
            Game.getState()
              ?.world
              ?.day || 1

        }
      );

      this.recordTransaction(
        parent,
        {
          type:
            "Subsidiary Dividend",

          amount,

          sourceCompanyId:
            subsidiary.id,

          day:
            Game.getState()
              ?.world
              ?.day || 1

        }
      );

      Game.save();

      return {
        success: true,
        amount
      };
    },

    /* ==========================================================
       TRANSACTION LEDGER
       ========================================================== */

    recordTransaction(
      company,
      transaction
    ) {

      if (!company) return;

      if (
        !Array.isArray(
          company.intercompanyTransactions
        )
      ) {

        company.intercompanyTransactions =
          [];

      }

      company.intercompanyTransactions
        .push(transaction);

      /*
       * Keep prototype saves manageable.
       */

      if (
        company.intercompanyTransactions
          .length > 100
      ) {

        company.intercompanyTransactions =
          company.intercompanyTransactions
            .slice(-100);

      }

    },

    /* ==========================================================
       CIRCULAR OWNERSHIP CHECK
       ========================================================== */

    wouldCreateCircularOwnership(
      parentId,
      childId
    ) {

      let current =
        this.getCompany(
          parentId
        );

      const visited =
        new Set();

      while (current) {

        if (
          visited.has(
            current.id
          )
        ) {
          return true;
        }

        visited.add(
          current.id
        );

        const parentId =
          current.corporate
            ?.parentCompanyId;

        if (!parentId) {
          break;
        }

        if (
          String(parentId) ===
          String(childId)
        ) {
          return true;
        }

        current =
          this.getCompany(
            parentId
          );

      }

      return false;
    },

    /* ==========================================================
       GROUP ID PROPAGATION
       ========================================================== */

    propagateGroupId(
      company,
      groupId
    ) {

      this.ensureCompany(
        company
      );

      company.corporate.groupId =
        groupId;

      const children =
        company.corporate
          .controlledCompanies || [];

      children.forEach(
        entry => {

          const child =
            this.getCompany(
              entry.companyId
            );

          if (child) {

            this.propagateGroupId(
              child,
              groupId
            );

          }

        }
      );
    },

    /* ==========================================================
       CORPORATE SUMMARY
       ========================================================== */

    getCorporateSummary(
      companyId
    ) {

      const company =
        this.getCompany(
          companyId
        );

      if (!company) {
        return null;
      }

      this.ensureCompany(
        company
      );

      const financials =
        this.getGroupFinancials(
          company.id
        );

      return {

        company:
          company.name,

        role:
          company.corporate.role,

        isHoldingCompany:
          company.corporate
            .isHoldingCompany,

        isSubsidiary:
          company.corporate
            .isSubsidiary,

        parentCompanyId:
          company.corporate
            .parentCompanyId,

        groupId:
          company.corporate
            .groupId,

        ownership:
          company.corporate
            .ownershipPercentage,

        subsidiaries:
          this.countSubsidiaries(
            company.id
          ),

        groupCompanies:
          financials.companies,

        groupRevenue:
          financials.revenue,

        groupProfit:
          financials.profit,

        groupCash:
          financials.cash,

        groupDebt:
          financials.debt,

        groupValuation:
          financials.valuation

      };
    }

  };

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireCompanyGroup =
    GroupSystem;

  /* ============================================================
     INITIALIZE
     ============================================================ */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      () => {
        GroupSystem.initialize();
      }
    );

  } else {

    GroupSystem.initialize();

  }

  /*
   * Initialize newly created businesses.
   */

  window.addEventListener(
    "EmpireBusinessStarted",
    event => {

      const company =
        event.detail?.company;

      if (!company) return;

      GroupSystem.ensureCompany(
        company
      );

      Game.save();

    }
  );

  console.log(
    "Empire Rush: Company Group / Holding System loaded."
  );

})();
