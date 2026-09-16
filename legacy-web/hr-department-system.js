(function () {
  "use strict";

  const Game = window.EmpireGameState;

  if (!Game) {
    console.warn("HR Department System waiting for EmpireGameState.");
    return;
  }

  const HR = {

    /* ============================================================
       DEPARTMENTS
       ============================================================ */

    departments: {
      management: {
        name: "Management",
        description: "Leadership, strategy and corporate decisions."
      },

      finance: {
        name: "Finance & Accounting",
        description: "Accounting, cash flow, tax and financial control."
      },

      hr: {
        name: "Human Resources",
        description: "Recruitment, employee relations and workforce management."
      },

      sales: {
        name: "Sales",
        description: "Customers, deals, revenue and sales growth."
      },

      marketing: {
        name: "Marketing",
        description: "Brand awareness, advertising and customer acquisition."
      },

      operations: {
        name: "Operations",
        description: "Daily business execution and operational efficiency."
      },

      rnd: {
        name: "R&D",
        description: "Research, product development and innovation."
      },

      production: {
        name: "Production",
        description: "Manufacturing, production capacity and quality."
      },

      technology: {
        name: "Technology",
        description: "Software, systems and technical infrastructure."
      },

      procurement: {
        name: "Procurement",
        description: "Suppliers, purchasing and inventory."
      }
    },

    /* ============================================================
       ROLE DATABASE
       ============================================================ */

    roles: {

      CEO: {
        department: "management",
        salary: 100000,
        leadership: 90,
        productivity: 1.25
      },

      CFO: {
        department: "finance",
        salary: 80000,
        leadership: 75,
        productivity: 1.20
      },

      HRManager: {
        department: "hr",
        salary: 60000,
        leadership: 75,
        productivity: 1.15
      },

      SalesManager: {
        department: "sales",
        salary: 55000,
        leadership: 70,
        productivity: 1.20
      },

      MarketingManager: {
        department: "marketing",
        salary: 55000,
        leadership: 70,
        productivity: 1.18
      },

      OperationsManager: {
        department: "operations",
        salary: 45000,
        leadership: 75,
        productivity: 1.20
      },

      ResearchEngineer: {
        department: "rnd",
        salary: 60000,
        leadership: 50,
        productivity: 1.15
      },

      ProductionWorker: {
        department: "production",
        salary: 24000,
        leadership: 20,
        productivity: 1.00
      },

      SoftwareDeveloper: {
        department: "technology",
        salary: 50000,
        leadership: 35,
        productivity: 1.10
      },

      ProcurementOfficer: {
        department: "procurement",
        salary: 35000,
        leadership: 40,
        productivity: 1.08
      },

      Accountant: {
        department: "finance",
        salary: 28000,
        leadership: 25,
        productivity: 1.05
      },

      SalesExecutive: {
        department: "sales",
        salary: 22000,
        leadership: 20,
        productivity: 1.05
      },

      MarketingExecutive: {
        department: "marketing",
        salary: 30000,
        leadership: 20,
        productivity: 1.05
      },

      BusinessAssistant: {
        department: "operations",
        salary: 16000,
        leadership: 15,
        productivity: 1.00
      }
    },

    /* ============================================================
       HELPERS
       ============================================================ */

    getState() {
      return Game.getState();
    },

    getCompanies() {
      return this.getState()?.companies || [];
    },

    getCompany(companyId) {
      return this.getCompanies().find(
        company => String(company.id) === String(companyId)
      );
    },

    getEmployees(company) {
      if (!company) return [];

      if (!Array.isArray(company.employees)) {
        company.employees = [];
      }

      return company.employees;
    },

    save() {
      if (typeof Game.save === "function") {
        Game.save();
      }
    },

    /* ============================================================
       EMPLOYEE INITIALIZATION
       ============================================================ */

    ensureEmployee(employee) {

      if (!employee) return null;

      if (!employee.hr) {
        employee.hr = {};
      }

      if (!employee.hr.department) {
        employee.hr.department = this.inferDepartment(employee);
      }

      if (!employee.hr.role) {
        employee.hr.role =
          employee.role ||
          "BusinessAssistant";
      }

      if (!employee.hr.level) {
        employee.hr.level = "Entry";
      }

      if (
        typeof employee.hr.performance !== "number"
      ) {
        employee.hr.performance =
          Number(employee.performance || 50);
      }

      if (
        typeof employee.hr.attendance !== "number"
      ) {
        employee.hr.attendance = 95;
      }

      if (
        typeof employee.hr.trainingPoints !== "number"
      ) {
        employee.hr.trainingPoints = 0;
      }

      if (
        typeof employee.hr.leadership !== "number"
      ) {
        employee.hr.leadership = 20;
      }

      if (
        typeof employee.hr.salary !== "number"
      ) {
        employee.hr.salary =
          Number(employee.salary || 0);
      }

      if (
        typeof employee.hr.isManager !== "boolean"
      ) {
        employee.hr.isManager =
          this.isManagerRole(employee.hr.role);
      }

      return employee;
    },

    inferDepartment(employee) {

      const role =
        String(
          employee.role ||
          employee.hr?.role ||
          ""
        ).toLowerCase();

      if (
        role.includes("account") ||
        role.includes("finance") ||
        role.includes("cfo")
      ) return "finance";

      if (
        role.includes("sales")
      ) return "sales";

      if (
        role.includes("marketing")
      ) return "marketing";

      if (
        role.includes("software") ||
        role.includes("developer") ||
        role.includes("technology")
      ) return "technology";

      if (
        role.includes("production") ||
        role.includes("worker")
      ) return "production";

      if (
        role.includes("operation") ||
        role.includes("assistant")
      ) return "operations";

      if (
        role.includes("research") ||
        role.includes("engineer") ||
        role.includes("developer")
      ) return "rnd";

      if (
        role.includes("hr")
      ) return "hr";

      if (
        role.includes("procurement")
      ) return "procurement";

      return "operations";
    },

    isManagerRole(role) {

      return [
        "CEO",
        "CFO",
        "HRManager",
        "SalesManager",
        "MarketingManager",
        "OperationsManager"
      ].includes(role);
    },

    /* ============================================================
       INITIALIZE COMPANY
       ============================================================ */

    initializeCompany(company) {

      if (!company) return;

      const employees =
        this.getEmployees(company);

      employees.forEach(
        employee => this.ensureEmployee(employee)
      );

      if (!company.hr) {
        company.hr = {};
      }

      if (!company.hr.departments) {
        company.hr.departments = {};
      }

      Object.keys(this.departments)
        .forEach(department => {

          if (
            typeof company.hr.departments[department]
            !== "object"
          ) {
            company.hr.departments[department] = {
              employeeCount: 0,
              managers: 0,
              productivity: 0
            };
          }

        });

      this.recalculateCompany(company);
    },

    initializeAll() {

      this.getCompanies().forEach(
        company =>
          this.initializeCompany(company)
      );

      this.save();
    },

    /* ============================================================
       HIRING
       ============================================================ */

    hire(
      companyId,
      role,
      name
    ) {

      const company =
        this.getCompany(companyId);

      if (!company) {
        return {
          success: false,
          reason: "Company not found."
        };
      }

      const definition =
        this.roles[role];

      if (!definition) {
        return {
          success: false,
          reason: "Invalid employee role."
        };
      }

      const employeeName =
        name ||
        `${role} ${this.getEmployees(company).length + 1}`;

      const employee = {

        id:
          "EMP-" +
          Date.now() +
          "-" +
          Math.floor(
            Math.random() * 10000
          ),

        name:
          employeeName,

        role:
          role,

        salary:
          definition.salary,

        performance:
          60,

        experience:
          0,

        morale:
          75,

        status:
          "Working",

        hr: {

          department:
            definition.department,

          role:
            role,

          level:
            "Entry",

          performance:
            60,

          attendance:
            95,

          trainingPoints:
            0,

          leadership:
            definition.leadership,

          salary:
            definition.salary,

          isManager:
            this.isManagerRole(role),

          hiredDay:
            this.getState()?.world?.day || 1

        }

      };

      this.getEmployees(company)
        .push(employee);

      this.initializeCompany(company);

      this.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireHRHired",
          {
            detail: {
              company,
              employee
            }
          }
        )
      );

      return {
        success: true,
        employee
      };
    },

    /* ============================================================
       DEPARTMENT ASSIGNMENT
       ============================================================ */

    assignDepartment(
      companyId,
      employeeId,
      department
    ) {

      const company =
        this.getCompany(companyId);

      if (!company) {
        return {
          success: false,
          reason: "Company not found."
        };
      }

      if (
        !this.departments[department]
      ) {
        return {
          success: false,
          reason: "Invalid department."
        };
      }

      const employee =
        this.getEmployees(company)
          .find(
            item =>
              String(item.id) ===
              String(employeeId)
          );

      if (!employee) {
        return {
          success: false,
          reason: "Employee not found."
        };
      }

      this.ensureEmployee(employee);

      employee.hr.department =
        department;

      this.recalculateCompany(
        company
      );

      this.save();

      return {
        success: true,
        employee
      };
    },

    /* ============================================================
       PROMOTION
       ============================================================ */

    promote(
      companyId,
      employeeId
    ) {

      const company =
        this.getCompany(companyId);

      if (!company) {
        return {
          success: false,
          reason: "Company not found."
        };
      }

      const employee =
        this.getEmployees(company)
          .find(
            item =>
              String(item.id) ===
              String(employeeId)
          );

      if (!employee) {
        return {
          success: false,
          reason: "Employee not found."
        };
      }

      this.ensureEmployee(employee);

      const performance =
        Number(
          employee.hr.performance || 0
        );

      const experience =
        Number(
          employee.experience || 0
        );

      if (
        performance < 75 ||
        experience < 30
      ) {
        return {
          success: false,
          reason:
            "Employee needs at least 75 performance and 30 experience."
        };
      }

      const currentRole =
        employee.hr.role;

      const promotionMap = {

        BusinessAssistant:
          "OperationsManager",

        SalesExecutive:
          "SalesManager",

        MarketingExecutive:
          "MarketingManager",

        Accountant:
          "CFO",

        SoftwareDeveloper:
          "ResearchEngineer",

        ProductionWorker:
          "OperationsManager",

        ProcurementOfficer:
          "OperationsManager"
      };

      const nextRole =
        promotionMap[currentRole];

      if (!nextRole) {
        return {
          success: false,
          reason:
            "No automatic promotion path for this role."
        };
      }

      const definition =
        this.roles[nextRole];

      employee.hr.role =
        nextRole;

      employee.hr.department =
        definition.department;

      employee.hr.salary =
        definition.salary;

      employee.salary =
        definition.salary;

      employee.hr.level =
        "Manager";

      employee.hr.isManager =
        true;

      employee.hr.leadership =
        Math.min(
          100,
          Number(
            employee.hr.leadership || 0
          ) + 10
        );

      this.recalculateCompany(
        company
      );

      this.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireEmployeePromoted",
          {
            detail: {
              company,
              employee,
              previousRole:
                currentRole,
              newRole:
                nextRole
            }
          }
        )
      );

      return {
        success: true,
        employee,
        previousRole:
          currentRole,
        newRole:
          nextRole
      };
    },

    /* ============================================================
       TRAINING
       ============================================================ */

    train(
      companyId,
      employeeId
    ) {

      const company =
        this.getCompany(companyId);

      if (!company) {
        return {
          success: false,
          reason: "Company not found."
        };
      }

      const employee =
        this.getEmployees(company)
          .find(
            item =>
              String(item.id) ===
              String(employeeId)
          );

      if (!employee) {
        return {
          success: false,
          reason: "Employee not found."
        };
      }

      this.ensureEmployee(employee);

      const trainingCost = 2500;

      /*
       * Use accounting system if available.
       */

      if (
        window.EmpireAccounting &&
        typeof window.EmpireAccounting
          .spendCash === "function"
      ) {

        const result =
          window.EmpireAccounting.spendCash(
            company,
            trainingCost,
            "Employee training",
            "HR"
          );

        if (!result) {
          return {
            success: false,
            reason:
              "Insufficient company cash."
          };
        }

      } else {

        const cash =
          Number(
            company.finance?.cash || 0
          );

        if (cash < trainingCost) {
          return {
            success: false,
            reason:
              "Insufficient company cash."
          };
        }

        company.finance.cash =
          cash - trainingCost;
      }

      employee.hr.trainingPoints += 1;

      employee.hr.performance =
        Math.min(
          100,
          employee.hr.performance + 4
        );

      employee.performance =
        employee.hr.performance;

      employee.morale =
        Math.min(
          100,
          Number(employee.morale || 0) + 3
        );

      this.recalculateCompany(
        company
      );

      this.save();

      return {
        success: true,
        employee,
        cost:
          trainingCost
      };
    },

    /* ============================================================
       PERFORMANCE CALCULATION
       ============================================================ */

    calculateEmployeeProductivity(
      employee
    ) {

      this.ensureEmployee(
        employee
      );

      const performance =
        Number(
          employee.hr.performance || 50
        );

      const morale =
        Number(
          employee.morale || 50
        );

      const attendance =
        Number(
          employee.hr.attendance || 95
        );

      const role =
        this.roles[
          employee.hr.role
        ];

      const base =
        role?.productivity || 1;

      return Number(
        (
          base *
          (
            performance / 100
          ) *
          (
            morale / 100
          ) *
          (
            attendance / 100
          )
        ).toFixed(3)
      );
    },

    /* ============================================================
       COMPANY RECALCULATION
       ============================================================ */

    recalculateCompany(
      company
    ) {

      if (!company) return;

      this.initializeCompanyData(
        company
      );

      const employees =
        this.getEmployees(company);

      const departmentStats = {};

      Object.keys(
        this.departments
      ).forEach(
        department => {

          departmentStats[
            department
          ] = {

            employeeCount: 0,

            managers: 0,

            productivity: 0,

            averagePerformance: 0,

            averageMorale: 0

          };

        }
      );

      employees.forEach(
        employee => {

          this.ensureEmployee(
            employee
          );

          const department =
            employee.hr.department;

          if (
            !departmentStats[
              department
            ]
          ) {
            departmentStats[
              department
            ] = {
              employeeCount: 0,
              managers: 0,
              productivity: 0,
              averagePerformance: 0,
              averageMorale: 0
            };
          }

          const stats =
            departmentStats[
              department
            ];

          stats.employeeCount++;

          if (
            employee.hr.isManager
          ) {
            stats.managers++;
          }

          stats.productivity +=
            this.calculateEmployeeProductivity(
              employee
            );

          stats.averagePerformance +=
            Number(
              employee.hr.performance ||
              0
            );

          stats.averageMorale +=
            Number(
              employee.morale ||
              0
            );

        }
      );

      Object.keys(
        departmentStats
      ).forEach(
        department => {

          const stats =
            departmentStats[
              department
            ];

          if (
            stats.employeeCount > 0
          ) {

            stats.averagePerformance =
              Math.round(
                stats.averagePerformance /
                stats.employeeCount
              );

            stats.averageMorale =
              Math.round(
                stats.averageMorale /
                stats.employeeCount
              );

          }

          stats.productivity =
            Number(
              stats.productivity.toFixed(2)
            );

        }
      );

      company.hr.departments =
        departmentStats;

      company.hr.totalEmployees =
        employees.length;

      company.hr.totalManagers =
        employees.filter(
          employee =>
            employee.hr?.isManager
        ).length;

      company.hr.totalPayroll =
        employees.reduce(
          (
            total,
            employee
          ) =>
            total +
            Number(
              employee.hr?.salary ||
              employee.salary ||
              0
            ),
          0
        );

      company.hr.productivity =
        employees.length > 0
          ? Number(
              (
                employees.reduce(
                  (
                    total,
                    employee
                  ) =>
                    total +
                    this.calculateEmployeeProductivity(
                      employee
                    ),
                  0
                ) /
                employees.length
              ).toFixed(3)
            )
          : 0;

    },

    initializeCompanyData(
      company
    ) {

      if (!company.hr) {
        company.hr = {};
      }

      if (!company.hr.departments) {
        company.hr.departments = {};
      }
    },

    /* ============================================================
       DEPARTMENT SUMMARY
       ============================================================ */

    getDepartmentSummary(
      companyId,
      department
    ) {

      const company =
        this.getCompany(
          companyId
        );

      if (!company) return null;

      this.recalculateCompany(
        company
      );

      return (
        company.hr
          ?.departments
          ?.[department] ||
        null
      );
    },

    /* ============================================================
       HR SUMMARY
       ============================================================ */

    getSummary(
      companyId
    ) {

      const company =
        this.getCompany(
          companyId
        );

      if (!company) return null;

      this.recalculateCompany(
        company
      );

      return {

        employees:
          company.hr.totalEmployees,

        managers:
          company.hr.totalManagers,

        payroll:
          company.hr.totalPayroll,

        productivity:
          company.hr.productivity,

        departments:
          company.hr.departments

      };
    },

    /* ============================================================
       EMPLOYEE LIST
       ============================================================ */

    getEmployeeList(
      companyId
    ) {

      const company =
        this.getCompany(
          companyId
        );

      if (!company) return [];

      return this.getEmployees(
        company
      ).map(
        employee => {

          this.ensureEmployee(
            employee
          );

          return {

            id:
              employee.id,

            name:
              employee.name,

            role:
              employee.hr.role,

            department:
              employee.hr.department,

            salary:
              employee.hr.salary,

            performance:
              employee.hr.performance,

            morale:
              employee.morale,

            experience:
              employee.experience,

            productivity:
              this.calculateEmployeeProductivity(
                employee
              ),

            manager:
              employee.hr.isManager

          };

        }
      );
    }

  };

  /* ==============================================================
     EVENTS
     ============================================================== */

  window.addEventListener(
    "EmpireBusinessStarted",
    event => {

      const company =
        event.detail?.company;

      if (company) {
        HR.initializeCompany(
          company
        );

        HR.save();
      }

    }
  );

  window.addEventListener(
    "EmpireBusinessLaunched",
    event => {

      const company =
        event.detail?.company;

      if (company) {
        HR.initializeCompany(
          company
        );

        HR.save();
      }

    }
  );

  window.addEventListener(
    "EmpireEmployeeHired",
    event => {

      const company =
        event.detail?.company;

      const employee =
        event.detail?.employee;

      if (employee) {
        HR.ensureEmployee(
          employee
        );
      }

      if (company) {
        HR.recalculateCompany(
          company
        );
      }

      HR.save();

    }
  );

  window.addEventListener(
    "EmpireDayAdvanced",
    () => {

      HR.getCompanies()
        .forEach(
          company => {

            HR.getEmployees(
              company
            ).forEach(
              employee => {

                HR.ensureEmployee(
                  employee
                );

                /*
                 * Small daily performance
                 * fluctuation.
                 */

                const fluctuation =
                  (
                    Math.random() *
                    2
                  ) - 1;

                employee.hr.performance =
                  Math.max(
                    0,
                    Math.min(
                      100,
                      employee.hr.performance +
                      fluctuation
                    )
                  );

                employee.performance =
                  employee.hr.performance;

              }
            );

            HR.recalculateCompany(
              company
            );

          }
        );

    }
  );

  /* ============================================================
     PUBLIC API
     ============================================================== */

  window.EmpireHR =
    HR;

  /*
   * Initialize after everything loads.
   */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      () => HR.initializeAll()
    );

  } else {

    HR.initializeAll();

  }

  console.log(
    "Empire Rush: HR + Department System loaded."
  );

})();
