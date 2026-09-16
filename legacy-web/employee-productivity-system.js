(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH — EMPLOYEE PRODUCTIVITY + PAYROLL SYSTEM
   * ============================================================
   *
   * Employee
   *   ↓
   * Skills + Experience + Morale
   *   ↓
   * Productivity
   *   ↓
   * Business Capacity
   *   ↓
   * Revenue / Operations
   *
   * Salary is a COMPANY expense.
   * Personal player cash is kept separate.
   * ============================================================
   */

  const Game = window.EmpireGameState;

  if (!Game) {
    console.warn(
      "EmpireGameState not found. Employee system stopped."
    );
    return;
  }

  const EmployeeSystem = {

    /* ==========================================================
       ROLE DATABASE
       ========================================================== */

    roles: {

      "Business Assistant": {
        department: "Administration",
        baseProductivity: 55,
        skillWeight: 0.35,
        salary: 16000
      },

      "Sales Executive": {
        department: "Sales",
        baseProductivity: 65,
        skillWeight: 0.50,
        salary: 22000
      },

      "Accountant": {
        department: "Finance",
        baseProductivity: 60,
        skillWeight: 0.45,
        salary: 28000
      },

      "Operations Manager": {
        department: "Operations",
        baseProductivity: 75,
        skillWeight: 0.55,
        salary: 45000
      },

      "Software Developer": {
        department: "Technology",
        baseProductivity: 70,
        skillWeight: 0.60,
        salary: 50000
      },

      "Marketing Executive": {
        department: "Marketing",
        baseProductivity: 60,
        skillWeight: 0.50,
        salary: 30000
      },

      "Production Worker": {
        department: "Production",
        baseProductivity: 65,
        skillWeight: 0.40,
        salary: 24000
      }
    },

    /* ==========================================================
       EMPLOYEE INITIALIZATION
       ========================================================== */

    ensureEmployee(employee) {

      if (!employee) {
        return null;
      }

      if (!employee.role) {
        employee.role = "Business Assistant";
      }

      const role =
        this.roles[employee.role] ||
        this.roles["Business Assistant"];

      if (!employee.department) {
        employee.department = role.department;
      }

      if (employee.salary === undefined) {
        employee.salary = role.salary;
      }

      if (employee.experience === undefined) {
        employee.experience = 0;
      }

      if (employee.skill === undefined) {
        employee.skill = 50;
      }

      if (employee.morale === undefined) {
        employee.morale = 75;
      }

      if (employee.productivity === undefined) {
        employee.productivity = 50;
      }

      if (!employee.status) {
        employee.status = "Working";
      }

      if (employee.monthlySalaryPaid === undefined) {
        employee.monthlySalaryPaid = 0;
      }

      if (employee.trainingCount === undefined) {
        employee.trainingCount = 0;
      }

      if (employee.tasksCompleted === undefined) {
        employee.tasksCompleted = 0;
      }

      if (employee.unpaidSalaryMonths === undefined) {
        employee.unpaidSalaryMonths = 0;
      }

      return employee;
    },

    /* ==========================================================
       COMPANY INITIALIZATION
       ========================================================== */

    ensureCompany(company) {

      if (!company) {
        return null;
      }

      if (!Array.isArray(company.employees)) {
        company.employees = [];
      }

      if (!company.finance) {
        company.finance = {
          cash: 0,
          bankBalance: 0,
          totalRevenue: 0,
          totalExpenses: 0,
          totalProfit: 0,
          payrollPaid: 0
        };
      }

      if (company.finance.payrollPaid === undefined) {
        company.finance.payrollPaid = 0;
      }

      company.employees.forEach(employee => {
        this.ensureEmployee(employee);
      });

      return company;
    },

    /* ==========================================================
       EMPLOYEE SKILL
       ========================================================== */

    getSkill(employee) {

      this.ensureEmployee(employee);

      return Math.max(
        0,
        Math.min(
          100,
          Number(employee.skill || 0)
        )
      );
    },

    /* ==========================================================
       EXPERIENCE
       ========================================================== */

    getExperience(employee) {

      this.ensureEmployee(employee);

      return Math.max(
        0,
        Number(employee.experience || 0)
      );
    },

    /* ==========================================================
       MORALE
       ========================================================== */

    getMorale(employee) {

      this.ensureEmployee(employee);

      return Math.max(
        0,
        Math.min(
          100,
          Number(employee.morale || 0)
        )
      );
    },

    /* ==========================================================
       PRODUCTIVITY CALCULATION
       ========================================================== */

    calculateProductivity(employee) {

      this.ensureEmployee(employee);

      const role =
        this.roles[employee.role] ||
        this.roles["Business Assistant"];

      const skill =
        this.getSkill(employee);

      const experience =
        this.getExperience(employee);

      const morale =
        this.getMorale(employee);

      /*
       * Skill contribution
       */

      const skillFactor =
        0.50 +
        (skill / 100) *
        role.skillWeight;

      /*
       * Experience contribution
       */

      const experienceFactor =
        1 +
        Math.min(
          0.25,
          experience * 0.025
        );

      /*
       * Morale contribution
       */

      const moraleFactor =
        0.60 +
        (morale / 100) * 0.40;

      /*
       * Small natural variation.
       */

      const dailyVariation =
        0.95 +
        Math.random() * 0.10;

      let productivity =
        role.baseProductivity *
        skillFactor *
        experienceFactor *
        moraleFactor *
        dailyVariation;

      /*
       * Unpaid salaries hurt productivity.
       */

      if (
        Number(employee.unpaidSalaryMonths || 0) > 0
      ) {
        productivity *= 0.70;
      }

      /*
       * Employee status.
       */

      if (employee.status === "On Leave") {
        productivity = 0;
      }

      if (employee.status === "Absent") {
        productivity *= 0.30;
      }

      if (employee.status === "Fired") {
        productivity = 0;
      }

      productivity =
        Math.max(
          0,
          Math.min(
            100,
            Math.round(productivity)
          )
        );

      employee.productivity =
        productivity;

      return productivity;
    },

    /* ==========================================================
       COMPANY PRODUCTIVITY
       ========================================================== */

    calculateCompanyProductivity(company) {

      this.ensureCompany(company);

      if (
        company.employees.length === 0
      ) {
        return 0;
      }

      let total = 0;
      let active = 0;

      company.employees.forEach(employee => {

        this.ensureEmployee(employee);

        if (
          employee.status === "Fired" ||
          employee.status === "On Leave"
        ) {
          return;
        }

        total +=
          this.calculateProductivity(employee);

        active++;

      });

      if (active === 0) {
        return 0;
      }

      return Math.round(
        total / active
      );
    },

    /* ==========================================================
       BUSINESS CAPACITY
       ========================================================== */

    calculateBusinessCapacity(company) {

      this.ensureCompany(company);

      const employeeCount =
        company.employees.filter(
          employee =>
            employee.status !== "Fired" &&
            employee.status !== "On Leave"
        ).length;

      const productivity =
        this.calculateCompanyProductivity(
          company
        );

      /*
       * Base capacity + employee contribution.
       */

      const capacity =
        employeeCount === 0
          ? 0
          : Math.round(
              employeeCount *
              (0.75 + productivity / 100)
            );

      return capacity;
    },

    /* ==========================================================
       TRAINING
       ========================================================== */

    trainEmployee(employee) {

      this.ensureEmployee(employee);

      if (
        employee.status === "Fired"
      ) {
        return {
          success: false,
          reason: "Employee is no longer working."
        };
      }

      const trainingCost =
        2500;

      const playerState =
        Game.getState();

      /*
       * Training is company expense.
       */

      const company =
        playerState.companies.find(
          company =>
            Array.isArray(company.employees) &&
            company.employees.includes(employee)
        );

      if (!company) {
        return {
          success: false,
          reason: "Employee company not found."
        };
      }

      this.ensureCompany(company);

      if (
        Number(company.finance.cash || 0) <
        trainingCost
      ) {
        return {
          success: false,
          reason: "Company does not have enough cash."
        };
      }

      company.finance.cash -=
        trainingCost;

      company.finance.totalExpenses +=
        trainingCost;

      employee.skill =
        Math.min(
          100,
          Number(employee.skill || 0) + 5
        );

      employee.morale =
        Math.min(
          100,
          Number(employee.morale || 0) + 3
        );

      employee.trainingCount++;

      this.calculateProductivity(
        employee
      );

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireEmployeeTrained",
          {
            detail: {
              employee,
              company,
              cost: trainingCost
            }
          }
        )
      );

      return {
        success: true,
        cost: trainingCost,
        skill: employee.skill,
        morale: employee.morale,
        productivity:
          employee.productivity
      };
    },

    /* ==========================================================
       DAILY EMPLOYEE SIMULATION
       ========================================================== */

    runDailyWork(company) {

      this.ensureCompany(company);

      if (
        company.status !== "Operating"
      ) {
        return {
          success: false,
          reason: "Company is not operating."
        };
      }

      let completedTasks = 0;

      company.employees.forEach(
        employee => {

          this.ensureEmployee(employee);

          if (
            employee.status === "Fired" ||
            employee.status === "On Leave"
          ) {
            return;
          }

          const productivity =
            this.calculateProductivity(
              employee
            );

          /*
           * Approximate daily task output.
           */

          const tasks =
            Math.max(
              1,
              Math.round(
                productivity / 20
              )
            );

          employee.tasksCompleted =
            Number(
              employee.tasksCompleted || 0
            ) + tasks;

          completedTasks += tasks;

          /*
           * Experience grows slowly.
           */

          if (
            Math.random() < 0.15
          ) {
            employee.experience =
              Number(
                employee.experience || 0
              ) + 0.1;
          }

          /*
           * Small morale changes.
           */

          if (
            productivity >= 70
          ) {
            employee.morale =
              Math.min(
                100,
                employee.morale + 0.2
              );
          }

          if (
            productivity < 40
          ) {
            employee.morale =
              Math.max(
                0,
                employee.morale - 0.5
              );
          }

        }
      );

      Game.save();

      return {
        success: true,
        productivity:
          this.calculateCompanyProductivity(
            company
          ),
        capacity:
          this.calculateBusinessCapacity(
            company
          ),
        tasks:
          completedTasks
      };
    },

    /* ==========================================================
       MONTHLY PAYROLL
       ========================================================== */

    processPayroll(company) {

      this.ensureCompany(company);

      let payroll = 0;
      let paidEmployees = 0;
      let unpaidEmployees = 0;

      company.employees.forEach(
        employee => {

          this.ensureEmployee(employee);

          if (
            employee.status === "Fired"
          ) {
            return;
          }

          const salary =
            Number(
              employee.salary || 0
            );

          payroll += salary;

        }
      );

      /*
       * Company must pay payroll.
       */

      const companyCash =
        Number(
          company.finance.cash || 0
        );

      if (
        companyCash >= payroll
      ) {

        company.finance.cash -=
          payroll;

        company.finance.totalExpenses +=
          payroll;

        company.finance.payrollPaid +=
          payroll;

        company.employees.forEach(
          employee => {

            if (
              employee.status === "Fired"
            ) {
              return;
            }

            employee.monthlySalaryPaid =
              Number(
                employee.monthlySalaryPaid || 0
              ) + Number(employee.salary || 0);

            employee.unpaidSalaryMonths = 0;

            employee.morale =
              Math.min(
                100,
                Number(employee.morale || 0) + 4
              );

            paidEmployees++;

          }
        );

      } else {

        /*
         * Payroll failure.
         */

        company.employees.forEach(
          employee => {

            if (
              employee.status === "Fired"
            ) {
              return;
            }

            employee.unpaidSalaryMonths =
              Number(
                employee.unpaidSalaryMonths || 0
              ) + 1;

            employee.morale =
              Math.max(
                0,
                Number(employee.morale || 0) - 15
              );

            employee.productivity =
              this.calculateProductivity(
                employee
              );

            unpaidEmployees++;

          }
        );

      }

      Game.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpirePayrollProcessed",
          {
            detail: {
              company,
              payroll,
              paidEmployees,
              unpaidEmployees,
              successful:
                companyCash >= payroll
            }
          }
        )
      );

      return {
        success:
          companyCash >= payroll,

        payroll,

        paidEmployees,

        unpaidEmployees,

        remainingCash:
          company.finance.cash
      };
    },

    /* ==========================================================
       HIRE EMPLOYEE
       ========================================================== */

    createEmployee(
      name,
      role,
      salary
    ) {

      const roleData =
        this.roles[role] ||
        this.roles["Business Assistant"];

      return {

        id:
          "EMP-" +
          Date.now() +
          "-" +
          Math.floor(
            Math.random() * 10000
          ),

        name:
          name ||
          "New Employee",

        role:
          role ||
          "Business Assistant",

        department:
          roleData.department,

        salary:
          Number(
            salary ||
            roleData.salary
          ),

        skill:
          50,

        experience:
          0,

        morale:
          75,

        productivity:
          50,

        status:
          "Working",

        monthlySalaryPaid:
          0,

        unpaidSalaryMonths:
          0,

        trainingCount:
          0,

        tasksCompleted:
          0
      };
    },

    /* ==========================================================
       EMPLOYEE SUMMARY
       ========================================================== */

    getSummary(employee) {

      this.ensureEmployee(employee);

      return {

        name:
          employee.name,

        role:
          employee.role,

        department:
          employee.department,

        salary:
          employee.salary,

        skill:
          Math.round(
            employee.skill
          ),

        experience:
          Number(
            employee.experience
          ).toFixed(1),

        morale:
          Math.round(
            employee.morale
          ),

        productivity:
          this.calculateProductivity(
            employee
          ),

        status:
          employee.status,

        unpaidSalaryMonths:
          employee.unpaidSalaryMonths,

        tasksCompleted:
          employee.tasksCompleted

      };
    },

    /* ==========================================================
       COMPANY SUMMARY
       ========================================================== */

    getCompanySummary(company) {

      this.ensureCompany(company);

      let payroll = 0;

      company.employees.forEach(
        employee => {

          if (
            employee.status === "Fired"
          ) {
            return;
          }

          payroll +=
            Number(
              employee.salary || 0
            );

        }
      );

      return {

        employees:
          company.employees.filter(
            employee =>
              employee.status !== "Fired"
          ).length,

        productivity:
          this.calculateCompanyProductivity(
            company
          ),

        capacity:
          this.calculateBusinessCapacity(
            company
          ),

        monthlyPayroll:
          payroll,

        companyCash:
          Number(
            company.finance.cash || 0
          )

      };
    }
  };

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireEmployeeSystem =
    EmployeeSystem;

  /* ============================================================
     EMPLOYEE HIRED EVENT
     ============================================================ */

  window.addEventListener(
    "EmpireEmployeeHired",
    function (event) {

      const company =
        event.detail?.company;

      const employee =
        event.detail?.employee;

      if (!company || !employee) {
        return;
      }

      EmployeeSystem.ensureCompany(
        company
      );

      EmployeeSystem.ensureEmployee(
        employee
      );

      Game.save();
    }
  );

  /* ============================================================
     DAILY WORK EVENT
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

          if (
            company.status !== "Operating"
          ) {
            return;
          }

          EmployeeSystem.runDailyWork(
            company
          );

        }
      );

      Game.save();
    }
  );

  /* ============================================================
     MONTHLY PAYROLL EVENT
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

          EmployeeSystem.processPayroll(
            company
          );

        }
      );

      Game.save();
    }
  );

  console.log(
    "Empire Rush: Employee Productivity + Payroll loaded."
  );

})();
