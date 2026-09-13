(function () {
  "use strict";

  const Game = window.EmpireGameState;

  if (!Game) {
    console.warn(
      "Banking & Investment System waiting for EmpireGameState."
    );
    return;
  }

  const Banking = {

    /* ============================================================
       BANK PRODUCTS
       ============================================================ */

    bank: {
      savingsInterest: 0.055,
      businessInterest: 0.025,
      fixedDepositInterest: 0.07
    },

    investmentTypes: {
      founder: "Founder Capital",
      investor: "External Investor",
      subsidiary: "Subsidiary Investment",
      group: "Group Investment"
    },

    /* ============================================================
       HELPERS
       ============================================================ */

    state() {
      return Game.getState();
    },

    player() {
      return this.state()?.player;
    },

    companies() {
      return this.state()?.companies || [];
    },

    company(companyId) {
      return this.companies().find(
        company =>
          String(company.id) ===
          String(companyId)
      );
    },

    save() {
      Game.save?.();
    },

    /* ============================================================
       PERSONAL BANK
       ============================================================ */

    ensurePersonalBank() {

      const player =
        this.player();

      if (!player) return null;

      if (!player.bank) {
        player.bank = {};
      }

      if (
        typeof player.bank.current !==
        "number"
      ) {
        player.bank.current = 0;
      }

      if (
        typeof player.bank.savings !==
        "number"
      ) {
        player.bank.savings = 0;
      }

      if (
        typeof player.bank.fixedDeposit !==
        "number"
      ) {
        player.bank.fixedDeposit = 0;
      }

      if (
        typeof player.bank.totalInterest !==
        "number"
      ) {
        player.bank.totalInterest = 0;
      }

      if (!Array.isArray(
        player.bank.transactions
      )) {
        player.bank.transactions = [];
      }

      return player.bank;
    },

    personalDeposit(
      amount,
      account = "current"
    ) {

      const player =
        this.player();

      const bank =
        this.ensurePersonalBank();

      amount =
        Number(amount);

      if (
        !player ||
        !bank ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return {
          success: false,
          reason:
            "Invalid deposit."
        };
      }

      if (
        Number(player.cash || 0) <
        amount
      ) {
        return {
          success: false,
          reason:
            "Insufficient cash."
        };
      }

      if (
        !["current", "savings"]
          .includes(account)
      ) {
        account = "current";
      }

      player.cash -= amount;

      bank[account] += amount;

      this.transaction(
        bank,
        "deposit",
        amount,
        `Deposit to ${account} account`
      );

      this.save();

      return {
        success: true,
        amount,
        account,
        balance:
          bank[account]
      };
    },

    personalWithdraw(
      amount,
      account = "current"
    ) {

      const player =
        this.player();

      const bank =
        this.ensurePersonalBank();

      amount =
        Number(amount);

      if (
        !player ||
        !bank ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return {
          success: false,
          reason:
            "Invalid withdrawal."
        };
      }

      if (
        !["current", "savings"]
          .includes(account)
      ) {
        account = "current";
      }

      if (
        Number(bank[account] || 0) <
        amount
      ) {
        return {
          success: false,
          reason:
            "Insufficient bank balance."
        };
      }

      bank[account] -= amount;

      player.cash =
        Number(player.cash || 0) +
        amount;

      this.transaction(
        bank,
        "withdrawal",
        amount,
        `Withdrawal from ${account} account`
      );

      this.save();

      return {
        success: true,
        amount,
        account,
        balance:
          bank[account]
      };
    },

    /* ============================================================
       FIXED DEPOSIT
       ============================================================ */

    createFixedDeposit(
      amount
    ) {

      const player =
        this.player();

      const bank =
        this.ensurePersonalBank();

      amount =
        Number(amount);

      if (
        !player ||
        !bank ||
        amount <= 0
      ) {
        return {
          success: false,
          reason:
            "Invalid amount."
        };
      }

      if (
        bank.savings <
        amount
      ) {
        return {
          success: false,
          reason:
            "Insufficient savings balance."
        };
      }

      bank.savings -= amount;

      bank.fixedDeposit += amount;

      this.transaction(
        bank,
        "fixed_deposit",
        amount,
        "Fixed deposit created"
      );

      this.save();

      return {
        success: true,
        amount,
        balance:
          bank.fixedDeposit
      };
    },

    /* ============================================================
       PERSONAL INTEREST
       ============================================================ */

    applyPersonalInterest() {

      const bank =
        this.ensurePersonalBank();

      if (!bank) return;

      const savingsInterest =
        bank.savings *
        this.bank.savingsInterest /
        12;

      const fdInterest =
        bank.fixedDeposit *
        this.bank.fixedDepositInterest /
        12;

      const total =
        savingsInterest +
        fdInterest;

      bank.savings +=
        savingsInterest;

      bank.fixedDeposit +=
        fdInterest;

      bank.totalInterest +=
        total;

      this.transaction(
        bank,
        "interest",
        total,
        "Monthly bank interest"
      );
    },

    /* ============================================================
       COMPANY BANK
       ============================================================ */

    ensureCompanyBank(
      company
    ) {

      if (!company) return null;

      if (!company.bank) {
        company.bank = {};
      }

      if (
        typeof company.bank.current !==
        "number"
      ) {
        company.bank.current = 0;
      }

      if (
        typeof company.bank.savings !==
        "number"
      ) {
        company.bank.savings = 0;
      }

      if (
        typeof company.bank.totalInterest !==
        "number"
      ) {
        company.bank.totalInterest = 0;
      }

      if (!Array.isArray(
        company.bank.transactions
      )) {
        company.bank.transactions = [];
      }

      return company.bank;
    },

    companyDeposit(
      companyId,
      amount
    ) {

      const company =
        this.company(companyId);

      const bank =
        this.ensureCompanyBank(
          company
        );

      amount =
        Number(amount);

      if (
        !company ||
        !bank ||
        amount <= 0
      ) {
        return {
          success: false,
          reason:
            "Invalid deposit."
        };
      }

      const cash =
        Number(
          company.finance?.cash || 0
        );

      if (
        cash < amount
      ) {
        return {
          success: false,
          reason:
            "Insufficient company cash."
        };
      }

      company.finance.cash =
        cash - amount;

      bank.current +=
        amount;

      this.transaction(
        bank,
        "deposit",
        amount,
        "Company cash deposited"
      );

      this.save();

      return {
        success: true,
        amount,
        balance:
          bank.current
      };
    },

    companyWithdraw(
      companyId,
      amount
    ) {

      const company =
        this.company(companyId);

      const bank =
        this.ensureCompanyBank(
          company
        );

      amount =
        Number(amount);

      if (
        !company ||
        !bank ||
        amount <= 0
      ) {
        return {
          success: false,
          reason:
            "Invalid withdrawal."
        };
      }

      if (
        bank.current <
        amount
      ) {
        return {
          success: false,
          reason:
            "Insufficient company bank balance."
        };
      }

      bank.current -=
        amount;

      company.finance.cash =
        Number(
          company.finance?.cash || 0
        ) +
        amount;

      this.transaction(
        bank,
        "withdrawal",
        amount,
        "Company bank withdrawal"
      );

      this.save();

      return {
        success: true,
        amount,
        balance:
          bank.current
      };
    },

    /* ============================================================
       COMPANY BANK INTEREST
       ============================================================ */

    applyCompanyInterest() {

      this.companies()
        .forEach(
          company => {

            const bank =
              this.ensureCompanyBank(
                company
              );

            const interest =
              bank.current *
              this.bank.businessInterest /
              12;

            bank.current +=
              interest;

            bank.totalInterest +=
              interest;

          }
        );
    },

    /* ============================================================
       TRANSACTIONS
       ============================================================ */

    transaction(
      account,
      type,
      amount,
      description
    ) {

      if (
        !account.transactions
      ) {
        account.transactions = [];
      }

      account.transactions.push({

        id:
          "BANK-" +
          Date.now() +
          "-" +
          Math.floor(
            Math.random() * 10000
          ),

        type,

        amount:
          Math.round(amount),

        description,

        day:
          this.state()
            ?.world
            ?.day || 1

      });

      if (
        account.transactions.length >
        200
      ) {
        account.transactions =
          account.transactions.slice(
            -200
          );
      }
    },

    /* ============================================================
       FOUNDER INVESTMENT
       ============================================================ */

    investFounderCapital(
      companyId,
      amount
    ) {

      const player =
        this.player();

      const company =
        this.company(
          companyId
        );

      amount =
        Number(amount);

      if (
        !player ||
        !company ||
        amount <= 0
      ) {
        return {
          success: false,
          reason:
            "Invalid investment."
        };
      }

      if (
        Number(player.cash || 0) <
        amount
      ) {
        return {
          success: false,
          reason:
            "Insufficient personal cash."
        };
      }

      player.cash -=
        amount;

      if (!company.finance) {
        company.finance = {};
      }

      company.finance.cash =
        Number(
          company.finance.cash || 0
        ) +
        amount;

      company.finance.ownerInvestment =
        Number(
          company.finance.ownerInvestment || 0
        ) +
        amount;

      this.recordInvestment(
        company,
        {
          type:
            this.investmentTypes.founder,

          investor:
            "Founder",

          amount,

          ownership:
            100
        }
      );

      this.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireFounderInvestment",
          {
            detail: {
              company,
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

    /* ============================================================
       EXTERNAL INVESTOR
       ============================================================ */

    calculateEquityOffer(
      companyId,
      investment
    ) {

      const company =
        this.company(
          companyId
        );

      investment =
        Number(
          investment
        );

      if (
        !company ||
        investment <= 0
      ) {
        return null;
      }

      const valuation =
        Number(
          company.finance?.valuation ||
          0
        );

      /*
       * Pre-money valuation.
       */

      const preMoney =
        Math.max(
          1,
          valuation
        );

      const postMoney =
        preMoney +
        investment;

      const ownership =
        (
          investment /
          postMoney
        ) *
        100;

      return {

        investment,

        preMoney,

        postMoney,

        investorOwnership:
          Number(
            ownership.toFixed(2)
          ),

        founderRemaining:
          Number(
            (
              100 -
              ownership
            ).toFixed(2)
          )

      };
    },

    acceptExternalInvestment(
      companyId,
      investorName,
      amount
    ) {

      const company =
        this.company(
          companyId
        );

      const offer =
        this.calculateEquityOffer(
          companyId,
          amount
        );

      if (
        !company ||
        !offer
      ) {
        return {
          success: false,
          reason:
            "Invalid investment."
        };
      }

      if (!company.investors) {
        company.investors = [];
      }

      company.investors.push({

        id:
          "INV-" +
          Date.now(),

        name:
          investorName ||
          "Private Investor",

        amount:
          offer.investment,

        ownership:
          offer.investorOwnership,

        investmentDay:
          this.state()
            ?.world
            ?.day || 1

      });

      if (!company.finance) {
        company.finance = {};
      }

      company.finance.cash =
        Number(
          company.finance.cash || 0
        ) +
        offer.investment;

      company.finance.externalCapital =
        Number(
          company.finance.externalCapital || 0
        ) +
        offer.investment;

      this.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireExternalInvestment",
          {
            detail: {
              company,
              investor:
                investorName,
              amount:
                offer.investment,
              ownership:
                offer.investorOwnership
            }
          }
        )
      );

      return {
        success: true,
        company,
        investor:
          investorName,
        amount:
          offer.investment,
        ownership:
          offer.investorOwnership
      };
    },

    /* ============================================================
       INTERCOMPANY INVESTMENT
       ============================================================ */

    investInCompany(
      parentId,
      subsidiaryId,
      amount
    ) {

      const parent =
        this.company(
          parentId
        );

      const subsidiary =
        this.company(
          subsidiaryId
        );

      amount =
        Number(amount);

      if (
        !parent ||
        !subsidiary ||
        amount <= 0
      ) {
        return {
          success: false,
          reason:
            "Invalid investment."
        };
      }

      if (
        Number(
          parent.finance?.cash || 0
        ) <
        amount
      ) {
        return {
          success: false,
          reason:
            "Insufficient parent company cash."
        };
      }

      parent.finance.cash -=
        amount;

      subsidiary.finance =
        subsidiary.finance || {};

      subsidiary.finance.cash =
        Number(
          subsidiary.finance.cash || 0
        ) +
        amount;

      subsidiary.finance.groupInvestment =
        Number(
          subsidiary.finance.groupInvestment || 0
        ) +
        amount;

      this.recordInvestment(
        subsidiary,
        {
          type:
            this.investmentTypes.group,

          investor:
            parent.name,

          investorCompanyId:
            parent.id,

          amount,

          ownership:
            0
        }
      );

      this.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireIntercompanyInvestment",
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

    /* ============================================================
       INVESTMENT LEDGER
       ============================================================ */

    recordInvestment(
      company,
      investment
    ) {

      if (
        !company.investments
      ) {
        company.investments = [];
      }

      company.investments.push({

        id:
          "CAP-" +
          Date.now() +
          "-" +
          Math.floor(
            Math.random() * 1000
          ),

        ...investment,

        day:
          this.state()
            ?.world
            ?.day || 1

      });
    },

    /* ============================================================
       TOTAL CAPITAL
       ============================================================ */

    getTotalCapital(
      companyId
    ) {

      const company =
        this.company(
          companyId
        );

      if (!company) {
        return 0;
      }

      const finance =
        company.finance || {};

      return Math.round(
        Number(
          finance.ownerInvestment || 0
        ) +
        Number(
          finance.externalCapital || 0
        ) +
        Number(
          finance.groupInvestment || 0
        )
      );
    },

    /* ============================================================
       PERSONAL NET WORTH
       ============================================================ */

    getPersonalNetWorth() {

      const player =
        this.player();

      if (!player) return 0;

      const bank =
        this.ensurePersonalBank();

      const companies =
        this.companies();

      let companyInvestments =
        0;

      companies.forEach(
        company => {

          companyInvestments +=
            Number(
              company.finance
                ?.ownerInvestment ||
              0
            );

        }
      );

      return Math.round(
        Number(
          player.cash || 0
        ) +

        Number(
          player.savings || 0
        ) +

        Number(
          bank.current || 0
        ) +

        Number(
          bank.savings || 0
        ) +

        Number(
          bank.fixedDeposit || 0
        ) +

        companyInvestments
      );
    },

    /* ============================================================
       MONTHLY UPDATE
       ============================================================ */

    monthlyUpdate() {

      this.ensurePersonalBank();

      this.applyPersonalInterest();

      this.applyCompanyInterest();

      this.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireBankingMonthlyUpdate"
        )
      );
    },

    /* ============================================================
       SUMMARY
       ============================================================ */

    getPersonalSummary() {

      const player =
        this.player();

      const bank =
        this.ensurePersonalBank();

      if (!player) return null;

      return {

        cash:
          Math.round(
            player.cash || 0
          ),

        current:
          Math.round(
            bank.current || 0
          ),

        savings:
          Math.round(
            bank.savings || 0
          ),

        fixedDeposit:
          Math.round(
            bank.fixedDeposit || 0
          ),

        totalInterest:
          Math.round(
            bank.totalInterest || 0
          ),

        netWorth:
          this.getPersonalNetWorth()

      };
    },

    getCompanySummary(
      companyId
    ) {

      const company =
        this.company(
          companyId
        );

      if (!company) return null;

      const bank =
        this.ensureCompanyBank(
          company
        );

      return {

        cash:
          Math.round(
            company.finance
              ?.cash || 0
          ),

        bank:
          Math.round(
            bank.current || 0
          ),

        totalLiquidCapital:
          Math.round(
            Number(
              company.finance
                ?.cash || 0
            ) +
            Number(
              bank.current || 0
            )
          ),

        capitalRaised:
          this.getTotalCapital(
            company.id
          ),

        externalInvestors:
          (
            company.investors ||
            []
          ).length,

        interestEarned:
          Math.round(
            bank.totalInterest || 0
          )

      };
    }
  };

  /* ============================================================
     EVENTS
     ============================================================ */

  window.addEventListener(
    "EmpireBusinessStarted",
    event => {

      const company =
        event.detail?.company;

      if (company) {
        Banking.ensureCompanyBank(
          company
        );
      }

      Banking.ensurePersonalBank();

      Banking.save();
    }
  );

  window.addEventListener(
    "EmpireMonthAdvanced",
    () => {

      Banking.monthlyUpdate();

    }
  );

  /* ============================================================
     INITIALIZE
     ============================================================ */

  Banking.ensurePersonalBank();

  Banking.companies()
    .forEach(
      company =>
        Banking.ensureCompanyBank(
          company
        )
    );

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireBanking =
    Banking;

  console.log(
    "Empire Rush: Banking & Investment System loaded."
  );

})();
