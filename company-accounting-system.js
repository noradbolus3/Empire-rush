(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH — COMPANY ACCOUNTING + BANK SYSTEM
   * ============================================================
   *
   * PERSONAL MONEY
   *      ≠
   * COMPANY MONEY
   *
   * Company:
   * Revenue
   * - COGS
   * - Payroll
   * - Operating Expenses
   * - Tax
   * = Net Profit
   *
   * Bank:
   * Company Cash → Bank Deposit
   * Bank → Company Cash Withdrawal
   *
   * ============================================================
   */

  const Game = window.EmpireGameState;

  if (!Game) {
    console.warn(
      "EmpireGameState not found. Accounting system stopped."
    );
    return;
  }

  const Accounting = {

    /* ==========================================================
       INITIALIZE COMPANY
       ========================================================== */

    ensureCompany(company) {

      if (!company) return null;

      if (!company.finance) {
        company.finance = {};
      }

      const f = company.finance;

      f.cash = Number(f.cash || 0);
      f.bankBalance = Number(f.bankBalance || 0);

      f.totalRevenue = Number(f.totalRevenue || 0);
      f.totalExpenses = Number(f.totalExpenses || 0);
      f.totalProfit = Number(f.totalProfit || 0);

      f.payrollPaid = Number(f.payrollPaid || 0);

      if (f.cogs === undefined) f.cogs = 0;
      if (f.operatingExpenses === undefined) {
        f.operatingExpenses = 0;
      }

      if (f.taxPaid === undefined) {
        f.taxPaid = 0;
      }

      if (f.ownerInvestment === undefined) {
        f.ownerInvestment = 0;
      }

      if (f.withdrawals === undefined) {
        f.withdrawals = 0;
      }

      if (f.loanPrincipal === undefined) {
        f.loanPrincipal = 0;
      }

      if (f.loanInterestPaid === undefined) {
        f.loanInterestPaid = 0;
      }

      if (!f.transactions) {
        f.transactions = [];
      }

      if (!f.monthlyAccounts) {
        f.monthlyAccounts = [];
      }

      if (!company.bank) {
        company.bank = {
          accountNumber:
            "ER-" +
            Date.now().toString().slice(-8),

          accountType:
            "Business Current Account",

          bankName:
            "Empire National Bank",

          opened:
            false,

          balance: 0,

          deposits: 0,

          withdrawals: 0,

          interestEarned: 0
        };
      }

      return company;
    },

    /* ==========================================================
       TRANSACTION
       ========================================================== */

    recordTransaction(
      company,
      type,
      amount,
      description
    ) {

      this.ensureCompany(company);

      amount =
        Math.round(
          Number(amount || 0)
        );

      if (amount <= 0) return;

      company.finance.transactions.push({

        id:
          "TX-" +
          Date.now() +
          "-" +
          Math.floor(
            Math.random() * 10000
          ),

        day:
          Game.getState()?.world?.day || 1,

        month:
          Game.getState()?.world?.month || 1,

        year:
          Game.getState()?.world?.year || 1,

        type,

        amount,

        description

      });

      /*
       * Keep transaction history manageable.
       */

      if (
        company.finance.transactions.length > 500
      ) {
        company.finance.transactions =
          company.finance.transactions.slice(-500);
      }
    },

    /* ==========================================================
       COMPANY CASH
       ========================================================== */

    getCash(company) {

      this.ensureCompany(company);

      return Math.round(
        company.finance.cash
      );
    },

    addCash(
      company,
      amount,
      description
    ) {

      this.ensureCompany(company);

      amount =
        Number(amount || 0);

      if (amount <= 0) return false;

      company.finance.cash += amount;

      this.recordTransaction(
        company,
        "Income",
        amount,
        description ||
          "Company cash received"
      );

      Game.save();

      return true;
    },

    spendCash(
      company,
      amount,
      description,
      expenseType
    ) {

      this.ensureCompany(company);

      amount =
        Number(amount || 0);

      if (amount <= 0) {
        return true;
      }

      if (
        company.finance.cash < amount
      ) {
        return false;
      }

      company.finance.cash -=
        amount;

      company.finance.totalExpenses +=
        amount;

      if (
        expenseType === "COGS"
      ) {
        company.finance.cogs +=
          amount;
      }

      if (
        expenseType === "Operating"
      ) {
        company.finance.operatingExpenses +=
          amount;
      }

      if (
        expenseType === "Payroll"
      ) {
        company.finance.payrollPaid +=
          amount;
      }

      if (
        expenseType === "Tax"
      ) {
        company.finance.taxPaid +=
          amount;
      }

      this.recordTransaction(
        company,
        "Expense",
        amount,
        description ||
          "Company expense"
      );

      this.recalculateProfit(
        company
      );

      Game.save();

      return true;
    },

    /* ==========================================================
       REVENUE
       ========================================================== */

    addRevenue(
      company,
      amount,
      description,
      cogs
    ) {

      this.ensureCompany(company);

      amount =
        Number(amount || 0);

      cogs =
        Number(cogs || 0);

      if (amount <= 0) {
        return false;
      }

      company.finance.cash +=
        amount;

      company.finance.totalRevenue +=
        amount;

      this.recordTransaction(
        company,
        "Revenue",
        amount,
        description ||
          "Sales revenue"
      );

      if (cogs > 0) {

        /*
         * COGS is an accounting expense.
         */

        const actualCogs =
          Math.min(
            cogs,
            company.finance.cash
          );

        company.finance.cash -=
          actualCogs;

        company.finance.cogs +=
          actualCogs;

        company.finance.totalExpenses +=
          actualCogs;

        this.recordTransaction(
          company,
          "COGS",
          actualCogs,
          "Cost of goods sold"
        );
      }

      this.recalculateProfit(
        company
      );

      Game.save();

      return true;
    },

    /* ==========================================================
       OPERATING EXPENSE
       ========================================================== */

    addOperatingExpense(
      company,
      amount,
      description
    ) {

      return this.spendCash(
        company,
        amount,
        description ||
          "Operating expense",
        "Operating"
      );
    },

    /* ==========================================================
       PROFIT
       ========================================================== */

    recalculateProfit(company) {

      this.ensureCompany(company);

      const revenue =
        Number(
          company.finance.totalRevenue || 0
        );

      const expenses =
        Number(
          company.finance.totalExpenses || 0
        );

      company.finance.totalProfit =
        revenue - expenses;

      return company.finance.totalProfit;
    },

    /* ==========================================================
       OWNER INVESTMENT
       ========================================================== */

    investIntoCompany(
      company,
      amount
    ) {

      this.ensureCompany(company);

      amount =
        Math.round(
          Number(amount || 0)
        );

      if (amount <= 0) {
        return {
          success: false,
          reason: "Invalid investment."
        };
      }

      const state =
        Game.getState();

      if (
        Number(state.player.cash || 0) <
        amount
      ) {
        return {
          success: false,
          reason:
          "Player does not have enough personal cash."
        };
      }

      /*
       * Personal → Company
       */

      state.player.cash -=
        amount;

      company.finance.cash +=
        amount;

      company.finance.ownerInvestment +=
        amount;

      this.recordTransaction(
        company,
        "Owner Investment",
        amount,
        "Founder investment"
      );

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireCompanyFunded",
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
        amount,
        companyCash:
          company.finance.cash,
        playerCash:
          state.player.cash
      };
    },

    /* ==========================================================
       OWNER WITHDRAWAL
       ========================================================== */

    withdrawFromCompany(
      company,
      amount
    ) {

      this.ensureCompany(company);

      amount =
        Math.round(
          Number(amount || 0)
        );

      if (
        amount <= 0
      ) {
        return {
          success: false,
          reason: "Invalid withdrawal."
        };
      }

      if (
        company.finance.cash <
        amount
      ) {
        return {
          success: false,
          reason:
            "Company does not have enough cash."
        };
      }

      const state =
        Game.getState();

      company.finance.cash -=
        amount;

      company.finance.withdrawals +=
        amount;

      state.player.cash +=
        amount;

      this.recordTransaction(
        company,
        "Owner Withdrawal",
        amount,
        "Founder withdrawal"
      );

      Game.save();

      return {
        success: true,
        amount,
        companyCash:
          company.finance.cash,
        playerCash:
          state.player.cash
      };
    },

    /* ==========================================================
       BANK ACCOUNT
       ========================================================== */

    openBankAccount(company) {

      this.ensureCompany(company);

      if (
        company.bank.opened
      ) {
        return {
          success: true,
          message:
            "Business bank account already open."
        };
      }

      const openingFee =
        2000;

      if (
        company.finance.cash <
        openingFee
      ) {
        return {
          success: false,
          reason:
            "Need ₹2,000 company cash to open bank account."
        };
      }

      company.finance.cash -=
        openingFee;

      company.finance.totalExpenses +=
        openingFee;

      company.bank.opened =
        true;

      this.recordTransaction(
        company,
        "Bank Fee",
        openingFee,
        "Business bank account opening"
      );

      Game.save();

      return {
        success: true,
        accountNumber:
          company.bank.accountNumber
      };
    },

    /* ==========================================================
       DEPOSIT
       ========================================================== */

    depositToBank(
      company,
      amount
    ) {

      this.ensureCompany(company);

      if (
        !company.bank.opened
      ) {
        return {
          success: false,
          reason:
            "Open a business bank account first."
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
            "Invalid deposit."
        };
      }

      if (
        company.finance.cash <
        amount
      ) {
        return {
          success: false,
          reason:
            "Insufficient company cash."
        };
      }

      company.finance.cash -=
        amount;

      company.finance.bankBalance +=
        amount;

      company.bank.balance =
        company.finance.bankBalance;

      company.bank.deposits +=
        amount;

      this.recordTransaction(
        company,
        "Bank Deposit",
        amount,
        "Cash deposited into bank"
      );

      Game.save();

      return {
        success: true,
        amount,
        cash:
          company.finance.cash,
        bank:
          company.finance.bankBalance
      };
    },

    /* ==========================================================
       WITHDRAW FROM BANK
       ========================================================== */

    withdrawFromBank(
      company,
      amount
    ) {

      this.ensureCompany(company);

      if (
        !company.bank.opened
      ) {
        return {
          success: false,
          reason:
            "Business bank account is not open."
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
            "Invalid withdrawal."
        };
      }

      if (
        company.finance.bankBalance <
        amount
      ) {
        return {
          success: false,
          reason:
            "Insufficient bank balance."
        };
      }

      company.finance.bankBalance -=
        amount;

      company.finance.cash +=
        amount;

      company.bank.balance =
        company.finance.bankBalance;

      company.bank.withdrawals +=
        amount;

      this.recordTransaction(
        company,
        "Bank Withdrawal",
        amount,
        "Money withdrawn from business bank"
      );

      Game.save();

      return {
        success: true,
        amount,
        cash:
          company.finance.cash,
        bank:
          company.finance.bankBalance
      };
    },

    /* ==========================================================
       BANK INTEREST
       ========================================================== */

    applyMonthlyBankInterest(
      company
    ) {

      this.ensureCompany(company);

      if (
        !company.bank.opened ||
        company.finance.bankBalance <= 0
      ) {
        return 0;
      }

      /*
       * 0.25% monthly business deposit interest.
       */

      const interest =
        Math.round(
          company.finance.bankBalance *
          0.0025
        );

      if (
        interest <= 0
      ) {
        return 0;
      }

      company.finance.bankBalance +=
        interest;

      company.bank.balance =
        company.finance.bankBalance;

      company.bank.interestEarned +=
        interest;

      company.finance.totalRevenue +=
        interest;

      this.recordTransaction(
        company,
        "Interest Income",
        interest,
        "Business bank interest"
      );

      this.recalculateProfit(
        company
      );

      return interest;
    },

    /* ==========================================================
       TAX CALCULATION
       ========================================================== */

    calculateTax(
      company
    ) {

      this.ensureCompany(company);

      const profit =
        Number(
          company.finance.totalProfit || 0
        );

      /*
       * Simplified game tax model.
       * Negative/zero profit = no income tax.
       */

      if (
        profit <= 0
      ) {
        return 0;
      }

      let rate = 0.15;

      if (
        profit > 500000
      ) {
        rate = 0.20;
      }

      if (
        profit > 2000000
      ) {
        rate = 0.25;
      }

      return Math.round(
        profit * rate
      );
    },

    /* ==========================================================
       PAY TAX
       ========================================================== */

    payTax(company) {

      this.ensureCompany(company);

      const tax =
        this.calculateTax(
          company
        );

      if (
        tax <= 0
      ) {
        return {
          success: true,
          tax: 0,
          message:
            "No tax payable."
        };
      }

      if (
        company.finance.cash <
        tax
      ) {
        return {
          success: false,
          tax,
          reason:
            "Company does not have enough cash to pay tax."
        };
      }

      company.finance.cash -=
        tax;

      company.finance.totalExpenses +=
        tax;

      company.finance.taxPaid +=
        tax;

      this.recordTransaction(
        company,
        "Tax",
        tax,
        "Business tax payment"
      );

      this.recalculateProfit(
        company
      );

      Game.save();

      return {
        success: true,
        tax,
        remainingCash:
          company.finance.cash
      };
    },

    /* ==========================================================
       MONTHLY CLOSE
       ========================================================== */

    closeMonth(company) {

      this.ensureCompany(company);

      this.recalculateProfit(
        company
      );

      const state =
        Game.getState();

      const snapshot = {

        day:
          state.world?.day || 1,

        month:
          state.world?.month || 1,

        year:
          state.world?.year || 1,

        revenue:
          company.finance.totalRevenue,

        cogs:
          company.finance.cogs,

        payroll:
          company.finance.payrollPaid,

        operatingExpenses:
          company.finance.operatingExpenses,

        tax:
          company.finance.taxPaid,

        totalExpenses:
          company.finance.totalExpenses,

        profit:
          company.finance.totalProfit,

        cash:
          company.finance.cash,

        bankBalance:
          company.finance.bankBalance

      };

      company.finance.monthlyAccounts.push(
        snapshot
      );

      /*
       * Keep last 24 months.
       */

      if (
        company.finance.monthlyAccounts.length >
        24
      ) {
        company.finance.monthlyAccounts =
          company.finance.monthlyAccounts.slice(-24);
      }

      Game.save();

      return snapshot;
    },

    /* ==========================================================
       BALANCE SHEET SNAPSHOT
       ========================================================== */

    getBalanceSheet(company) {

      this.ensureCompany(company);

      const cash =
        company.finance.cash;

      const bank =
        company.finance.bankBalance;

      const assets =
        cash + bank;

      const liabilities =
        Number(
          company.finance.loanPrincipal || 0
        );

      const equity =
        assets - liabilities;

      return {

        assets: {
          cash,
          bank
        },

        totalAssets:
          assets,

        liabilities: {
          loans:
            liabilities
        },

        totalLiabilities:
          liabilities,

        equity

      };
    },

    /* ==========================================================
       PROFIT & LOSS
       ========================================================== */

    getProfitLoss(company) {

      this.ensureCompany(company);

      const revenue =
        Number(
          company.finance.totalRevenue || 0
        );

      const cogs =
        Number(
          company.finance.cogs || 0
        );

      const grossProfit =
        revenue - cogs;

      const payroll =
        Number(
          company.finance.payrollPaid || 0
        );

      const operating =
        Number(
          company.finance.operatingExpenses || 0
        );

      const tax =
        Number(
          company.finance.taxPaid || 0
        );

      const netProfit =
        revenue -
        cogs -
        payroll -
        operating -
        tax;

      return {

        revenue,

        cogs,

        grossProfit,

        payroll,

        operatingExpenses:
          operating,

        tax,

        netProfit

      };
    },

    /* ==========================================================
       COMPLETE FINANCIAL SUMMARY
       ========================================================== */

    getSummary(company) {

      this.ensureCompany(company);

      const pnl =
        this.getProfitLoss(
          company
        );

      const balance =
        this.getBalanceSheet(
          company
        );

      return {

        company:
          company.name,

        status:
          company.status,

        cash:
          company.finance.cash,

        bankBalance:
          company.finance.bankBalance,

        totalLiquidity:
          company.finance.cash +
          company.finance.bankBalance,

        revenue:
          pnl.revenue,

        cogs:
          pnl.cogs,

        grossProfit:
          pnl.grossProfit,

        payroll:
          pnl.payroll,

        operatingExpenses:
          pnl.operatingExpenses,

        tax:
          pnl.tax,

        netProfit:
          pnl.netProfit,

        assets:
          balance.totalAssets,

        liabilities:
          balance.totalLiabilities,

        equity:
          balance.equity,

        bankOpened:
          company.bank.opened,

        accountNumber:
          company.bank.accountNumber

      };
    }
  };

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireAccounting =
    Accounting;

  /* ============================================================
     COMPANY START
     ============================================================ */

  window.addEventListener(
    "EmpireBusinessStarted",
    function (event) {

      const company =
        event.detail?.company;

      if (!company) return;

      Accounting.ensureCompany(
        company
      );

      Game.save();
    }
  );

  /* ============================================================
     COMPANY LAUNCH
     ============================================================ */

  window.addEventListener(
    "EmpireBusinessLaunched",
    function (event) {

      const company =
        event.detail?.company;

      if (!company) return;

      Accounting.ensureCompany(
        company
      );

      Game.save();
    }
  );

  /* ============================================================
     EMPLOYEE HIRED
     ============================================================ */

  window.addEventListener(
    "EmpireEmployeeHired",
    function (event) {

      const company =
        event.detail?.company;

      if (!company) return;

      Accounting.ensureCompany(
        company
      );

      Game.save();
    }
  );

  /* ============================================================
     MONTH END
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

          if (
            company.status !== "Operating"
          ) {
            return;
          }

          Accounting.applyMonthlyBankInterest(
            company
          );

          Accounting.closeMonth(
            company
          );

        }
      );

      Game.save();
    }
  );

  console.log(
    "Empire Rush: Company Accounting + Bank System loaded."
  );

})();
