using System;
using System.Collections.Generic;
using UnityEngine;

namespace EmpireRush
{
    /*
     * =========================================================
     * EMPIRE RUSH — CORE SIMULATION
     * Phase 1
     *
     * This layer contains game logic.
     *
     * 3D presentation is intentionally separate.
     * Later Unity systems can read this state and
     * visualize it in the world.
     * =========================================================
     */


    #region ENUMS

    public enum SkillType
    {
        Communication,
        Finance,
        Sales,
        Marketing,
        Operations,
        Management,
        Technology,
        Leadership,
        Product,
        HumanResources
    }


    public enum JobLevel
    {
        Entry,
        Junior,
        Mid,
        Senior,
        Manager,
        Director,
        Executive
    }


    public enum BusinessType
    {
        Freelance,
        HomeFood,
        Retail,
        Restaurant,
        Service,
        Manufacturing,
        Software,
        Technology,
        Logistics,
        Construction,
        RealEstate,
        Finance,
        Education,
        Healthcare,
        Automotive
    }


    public enum BusinessStatus
    {
        Planning,
        Registration,
        Setup,
        Operating,
        Growing,
        Distressed,
        Closed
    }


    public enum EmployeeStatus
    {
        Available,
        Working,
        Meeting,
        Training,
        Break,
        Sick,
        Resigned,
        Fired
    }


    public enum CompanyStatus
    {
        Planning,
        Active,
        Growing,
        Distressed,
        Closed
    }


    #endregion


    #region PLAYER

    [Serializable]
    public class PlayerSkill
    {
        public SkillType type;

        [Range(0, 100)]
        public float level;

        public float experience;
    }


    [Serializable]
    public class Player
    {
        public string playerName = "Founder";

        public int age = 22;

        public decimal cash = 0;

        public decimal savings = 0;

        public decimal monthlyExpenses = 15000;

        public decimal monthlyIncome = 0;

        public decimal debt = 0;

        public JobLevel jobLevel =
            JobLevel.Entry;

        public string currentJob =
            "Unemployed";


        public List<PlayerSkill> skills =
            new List<PlayerSkill>();


        public Player()
        {
            InitializeSkills();
        }


        public void InitializeSkills()
        {
            if (skills.Count > 0)
                return;


            foreach (
                SkillType skill in
                Enum.GetValues(
                    typeof(SkillType)
                )
            )
            {
                skills.Add(
                    new PlayerSkill
                    {
                        type = skill,
                        level = 10,
                        experience = 0
                    }
                );
            }
        }


        public PlayerSkill GetSkill(
            SkillType type
        )
        {
            return skills.Find(
                x => x.type == type
            );
        }


        public void AddSkillExperience(
            SkillType type,
            float amount
        )
        {
            PlayerSkill skill =
                GetSkill(type);


            if (skill == null)
                return;


            skill.experience += amount;


            while (
                skill.experience >= 100 &&
                skill.level < 100
            )
            {
                skill.experience -= 100;
                skill.level += 1;
            }
        }


        public void ReceiveSalary(
            decimal salary
        )
        {
            monthlyIncome =
                salary;

            cash += salary;
        }


        public bool Spend(
            decimal amount
        )
        {
            if (amount <= 0)
                return true;


            if (cash < amount)
                return false;


            cash -= amount;

            return true;
        }


        public void SaveMoney()
        {
            decimal amount =
                Math.Max(
                    0,
                    cash - monthlyExpenses
                );


            if (amount <= 0)
                return;


            cash -= amount;

            savings += amount;
        }


        public decimal AvailableCapital
        {
            get
            {
                return cash + savings;
            }
        }
    }

    #endregion


    #region JOBS

    [Serializable]
    public class JobDefinition
    {
        public string title;

        public JobLevel level;

        public decimal monthlySalary;

        public int minimumSkill;

        public int requiredExperience;

        public SkillType primarySkill;
    }


    public static class JobDatabase
    {
        public static List<JobDefinition>
            GetJobs()
        {
            return new List<JobDefinition>
            {
                new JobDefinition
                {
                    title =
                        "Junior Executive",

                    level =
                        JobLevel.Junior,

                    monthlySalary =
                        30000,

                    minimumSkill =
                        10,

                    requiredExperience =
                        0,

                    primarySkill =
                        SkillType.Communication
                },

                new JobDefinition
                {
                    title =
                        "Business Analyst",

                    level =
                        JobLevel.Mid,

                    monthlySalary =
                        45000,

                    minimumSkill =
                        20,

                    requiredExperience =
                        1,

                    primarySkill =
                        SkillType.Finance
                },

                new JobDefinition
                {
                    title =
                        "Operations Manager",

                    level =
                        JobLevel.Manager,

                    monthlySalary =
                        70000,

                    minimumSkill =
                        35,

                    requiredExperience =
                        3,

                    primarySkill =
                        SkillType.Operations
                },

                new JobDefinition
                {
                    title =
                        "Product Manager",

                    level =
                        JobLevel.Manager,

                    monthlySalary =
                        85000,

                    minimumSkill =
                        40,

                    requiredExperience =
                        4,

                    primarySkill =
                        SkillType.Product
                },

                new JobDefinition
                {
                    title =
                        "Director",

                    level =
                        JobLevel.Director,

                    monthlySalary =
                        140000,

                    minimumSkill =
                        55,

                    requiredExperience =
                        7,

                    primarySkill =
                        SkillType.Leadership
                },

                new JobDefinition
                {
                    title =
                        "Executive",

                    level =
                        JobLevel.Executive,

                    monthlySalary =
                        250000,

                    minimumSkill =
                        70,

                    requiredExperience =
                        10,

                    primarySkill =
                        SkillType.Management
                }
            };
        }
    }

    #endregion


    #region BUSINESS

    [Serializable]
    public class BusinessDefinition
    {
        public string name;

        public BusinessType type;

        public decimal minimumCapital;

        public decimal recommendedCapital;

        public decimal setupCost;

        public decimal monthlyFixedCost;

        public decimal expectedMonthlyRevenue;

        public int minimumSkill;

        public SkillType usefulSkill;

        public bool requiresPremises;

        public bool requiresEmployees;
    }


    [Serializable]
    public class Business
    {
        public string id;

        public string companyName;

        public BusinessDefinition definition;

        public BusinessStatus status =
            BusinessStatus.Planning;

        public decimal cash;

        public decimal revenue;

        public decimal operatingCost;

        public decimal payroll;

        public decimal taxes;

        public decimal debt;

        public int employees;

        public int reputation = 50;

        public int marketShare = 1;


        public decimal MonthlyProfit
        {
            get
            {
                return
                    revenue -
                    operatingCost -
                    payroll -
                    taxes;
            }
        }
    }


    public static class BusinessDatabase
    {
        public static List<BusinessDefinition>
            GetBusinesses()
        {
            return new List<BusinessDefinition>
            {
                new BusinessDefinition
                {
                    name =
                        "Freelance Services",

                    type =
                        BusinessType.Freelance,

                    minimumCapital =
                        0,

                    recommendedCapital =
                        10000,

                    setupCost =
                        2000,

                    monthlyFixedCost =
                        1000,

                    expectedMonthlyRevenue =
                        20000,

                    minimumSkill =
                        10,

                    usefulSkill =
                        SkillType.Communication,

                    requiresPremises =
                        false,

                    requiresEmployees =
                        false
                },

                new BusinessDefinition
                {
                    name =
                        "Home Food Business",

                    type =
                        BusinessType.HomeFood,

                    minimumCapital =
                        15000,

                    recommendedCapital =
                        30000,

                    setupCost =
                        12000,

                    monthlyFixedCost =
                        5000,

                    expectedMonthlyRevenue =
                        35000,

                    minimumSkill =
                        10,

                    usefulSkill =
                        SkillType.Operations,

                    requiresPremises =
                        false,

                    requiresEmployees =
                        false
                },

                new BusinessDefinition
                {
                    name =
                        "Retail Store",

                    type =
                        BusinessType.Retail,

                    minimumCapital =
                        100000,

                    recommendedCapital =
                        200000,

                    setupCost =
                        75000,

                    monthlyFixedCost =
                        25000,

                    expectedMonthlyRevenue =
                        150000,

                    minimumSkill =
                        20,

                    usefulSkill =
                        SkillType.Sales,

                    requiresPremises =
                        true,

                    requiresEmployees =
                        true
                },

                new BusinessDefinition
                {
                    name =
                        "Restaurant",

                    type =
                        BusinessType.Restaurant,

                    minimumCapital =
                        500000,

                    recommendedCapital =
                        1000000,

                    setupCost =
                        350000,

                    monthlyFixedCost =
                        100000,

                    expectedMonthlyRevenue =
                        600000,

                    minimumSkill =
                        25,

                    usefulSkill =
                        SkillType.Operations,

                    requiresPremises =
                        true,

                    requiresEmployees =
                        true
                },

                new BusinessDefinition
                {
                    name =
                        "Software Startup",

                    type =
                        BusinessType.Software,

                    minimumCapital =
                        100000,

                    recommendedCapital =
                        300000,

                    setupCost =
                        60000,

                    monthlyFixedCost =
                        35000,

                    expectedMonthlyRevenue =
                        250000,

                    minimumSkill =
                        30,

                    usefulSkill =
                        SkillType.Technology,

                    requiresPremises =
                        false,

                    requiresEmployees =
                        true
                },

                new BusinessDefinition
                {
                    name =
                        "Manufacturing Unit",

                    type =
                        BusinessType.Manufacturing,

                    minimumCapital =
                        2500000,

                    recommendedCapital =
                        5000000,

                    setupCost =
                        1800000,

                    monthlyFixedCost =
                        450000,

                    expectedMonthlyRevenue =
                        2500000,

                    minimumSkill =
                        40,

                    usefulSkill =
                        SkillType.Operations,

                    requiresPremises =
                        true,

                    requiresEmployees =
                        true
                }
            };
        }
    }

    #endregion


    #region BUSINESS SELECTION

    public static class BusinessSelectionSystem
    {
        public static List<BusinessDefinition>
            GetAffordableBusinesses(
                Player player
            )
        {
            List<BusinessDefinition>
                result =
                new List<BusinessDefinition>();


            foreach (
                BusinessDefinition business
                in BusinessDatabase.GetBusinesses()
            )
            {
                if (
                    player.AvailableCapital >=
                    business.minimumCapital
                )
                {
                    result.Add(
                        business
                    );
                }
            }


            return result;
        }


        public static bool CanStartBusiness(
            Player player,
            BusinessDefinition business
        )
        {
            if (player == null)
                return false;

            if (business == null)
                return false;


            return
                player.AvailableCapital >=
                business.setupCost;
        }
    }

    #endregion


    #region BUSINESS SETUP

    public static class BusinessSetupSystem
    {
        public static Business StartBusiness(
            Player player,
            BusinessDefinition definition,
            string companyName
        )
        {
            if (
                player == null ||
                definition == null
            )
            {
                return null;
            }


            if (
                player.AvailableCapital <
                definition.setupCost
            )
            {
                return null;
            }


            if (
                player.cash >=
                definition.setupCost
            )
            {
                player.cash -=
                    definition.setupCost;
            }
            else
            {
                decimal remaining =
                    definition.setupCost -
                    player.cash;

                player.cash = 0;

                player.savings -=
                    remaining;
            }


            Business business =
                new Business();


            business.id =
                Guid.NewGuid().ToString();


            business.companyName =
                companyName;


            business.definition =
                definition;


            business.status =
                BusinessStatus.Operating;


            business.cash =
                0;


            return business;
        }
    }

    #endregion


    #region EMPLOYEES

    [Serializable]
    public class Employee
    {
        public string id;

        public string name;

        public string role;

        public string department;

        public decimal monthlySalary;

        public int performance;

        public int morale;

        public int experience;

        public EmployeeStatus status =
            EmployeeStatus.Available;


        public Employee(
            string employeeName,
            string employeeRole,
            string employeeDepartment,
            decimal salary
        )
        {
            id =
                Guid.NewGuid().ToString();

            name =
                employeeName;

            role =
                employeeRole;

            department =
                employeeDepartment;

            monthlySalary =
                salary;

            performance =
                75;

            morale =
                75;

            experience =
                1;
        }


        public void Train()
        {
            performance =
                Math.Min(
                    100,
                    performance + 4
                );

            morale =
                Math.Min(
                    100,
                    morale + 2
                );

            status =
                EmployeeStatus.Training;
        }


        public void GiveRaise(
            decimal amount
        )
        {
            monthlySalary +=
                amount;

            morale =
                Math.Min(
                    100,
                    morale + 5
                );
        }


        public void Promote(
            string newRole,
            decimal newSalary
        )
        {
            role =
                newRole;

            monthlySalary =
                newSalary;

            experience += 1;

            performance =
                Math.Min(
                    100,
                    performance + 3
                );

            morale =
                Math.Min(
                    100,
                    morale + 3
                );
        }
    }

    #endregion


    #region COMPANY

    [Serializable]
    public class Company
    {
        public string id;

        public string legalName;

        public CompanyStatus status =
            CompanyStatus.Planning;

        public Business business;

        public List<Employee> employees =
            new List<Employee>();

        public List<Company> subsidiaries =
            new List<Company>();

        public decimal valuation;

        public decimal retainedEarnings;


        public decimal MonthlyPayroll
        {
            get
            {
                decimal total = 0;

                foreach (
                    Employee employee
                    in employees
                )
                {
                    if (
                        employee.status !=
                        EmployeeStatus.Fired &&
                        employee.status !=
                        EmployeeStatus.Resigned
                    )
                    {
                        total +=
                            employee.monthlySalary;
                    }
                }

                return total;
            }
        }


        public void AddEmployee(
            Employee employee
        )
        {
            if (employee == null)
                return;


            employees.Add(
                employee
            );


            if (business != null)
            {
                business.employees =
                    employees.Count;

                business.payroll =
                    MonthlyPayroll;
            }
        }


        public void AddSubsidiary(
            Company subsidiary
        )
        {
            if (subsidiary == null)
                return;


            if (
                subsidiaries.Contains(
                    subsidiary
                )
            )
            {
                return;
            }


            subsidiaries.Add(
                subsidiary
            );
        }
    }

    #endregion


    #region MARKET

    public static class MarketSystem
    {
        public static decimal
            CalculateRevenue(
                Business business
            )
        {
            if (business == null)
                return 0;


            decimal baseRevenue =
                business.definition
                    .expectedMonthlyRevenue;


            float reputationFactor =
                0.7f +
                (
                    business.reputation /
                    100f
                ) * 0.6f;


            float marketFactor =
                0.8f +
                (
                    business.marketShare /
                    100f
                );


            return
                baseRevenue *
                (decimal)reputationFactor *
                (decimal)marketFactor;
        }


        public static void ApplyMonthlyMarket(
            Business business
        )
        {
            if (business == null)
                return;


            float shock =
                UnityEngine.Random.Range(
                    0.90f,
                    1.10f
                );


            business.revenue =
                CalculateRevenue(
                    business
                ) *
                (decimal)shock;


            business.operatingCost =
                business.definition
                    .monthlyFixedCost;


            business.taxes =
                Math.Max(
                    0,
                    business.revenue * 0.10m
                );
        }
    }

    #endregion


    #region SIMULATION

    public class EmpireSimulation
    {
        public Player player;

        public List<Company> companies =
            new List<Company>();

        public int day = 1;

        public int month = 1;


        public EmpireSimulation()
        {
            player =
                new Player();
        }


        public void AdvanceDay()
        {
            day++;


            if (
                day % 30 == 0
            )
            {
                AdvanceMonth();
            }
        }


        public void AdvanceMonth()
        {
            month++;


            player.age =
                player.age;


            foreach (
                Company company
                in companies
            )
            {
                ProcessCompanyMonth(
                    company
                );
            }


            player.SaveMoney();
        }


        private void ProcessCompanyMonth(
            Company company
        )
        {
            if (
                company == null ||
                company.business == null
            )
            {
                return;
            }


            Business business =
                company.business;


            MarketSystem.ApplyMonthlyMarket(
                business
            );


            business.payroll =
                company.MonthlyPayroll;


            decimal profit =
                business.MonthlyProfit;


            company.retainedEarnings +=
                profit;


            business.cash +=
                profit;


            if (profit > 0)
            {
                business.status =
                    BusinessStatus.Growing;

                company.status =
                    CompanyStatus.Growing;

                company.valuation =
                    Math.Max(
                        company.valuation,
                        company.retainedEarnings * 8
                    );
            }
            else
            {
                business.status =
                    BusinessStatus.Distressed;

                company.status =
                    CompanyStatus.Distressed;
            }
        }


        public bool StartBusiness(
            BusinessDefinition definition,
            string companyName
        )
        {
            Business business =
                BusinessSetupSystem.StartBusiness(
                    player,
                    definition,
                    companyName
                );


            if (business == null)
                return false;


            Company company =
                new Company();


            company.id =
                Guid.NewGuid().ToString();


            company.legalName =
                companyName;


            company.business =
                business;


            company.status =
                CompanyStatus.Active;


            companies.Add(
                company
            );


            return true;
        }


        public Company CreateSubsidiary(
            Company parent,
            BusinessDefinition definition,
            string name
        )
        {
            if (
                parent == null ||
                definition == null
            )
            {
                return null;
            }


            Company subsidiary =
                new Company();


            subsidiary.id =
                Guid.NewGuid().ToString();


            subsidiary.legalName =
                name;


            subsidiary.status =
                CompanyStatus.Active;


            subsidiary.business =
                new Business
                {
                    id =
                        Guid.NewGuid().ToString(),

                    companyName =
                        name,

                    definition =
                        definition,

                    status =
                        BusinessStatus.Operating
                };


            parent.AddSubsidiary(
                subsidiary
            );


            companies.Add(
                subsidiary
            );


            return subsidiary;
        }
    }

    #endregion


    #region UNITY BRIDGE

    /*
     * This MonoBehaviour is the bridge
     * between the simulation and Unity.
     *
     * No Blueprint is required.
     */

    public class EmpireRushCore :
        MonoBehaviour
    {
        public EmpireSimulation simulation;


        [Header("Simulation Settings")]

        public bool runSimulation =
            true;

        public float daysPerSecond =
            1f;


        private float timer;


        private void Awake()
        {
            simulation =
                new EmpireSimulation();


            Debug.Log(
                "EMPIRE RUSH C# CORE ONLINE"
            );
        }


        private void Update()
        {
            if (!runSimulation)
                return;


            timer +=
                Time.deltaTime;


            if (
                timer >=
                daysPerSecond
            )
            {
                timer = 0;

                simulation.AdvanceDay();
            }
        }


        public Player GetPlayer()
        {
            return simulation.player;
        }


        public List<BusinessDefinition>
            GetAffordableBusinesses()
        {
            return
                BusinessSelectionSystem
                    .GetAffordableBusinesses(
                        simulation.player
                    );
        }


        public bool StartBusiness(
            int businessIndex,
            string companyName
        )
        {
            List<BusinessDefinition>
                businesses =
                BusinessDatabase
                    .GetBusinesses();


            if (
                businessIndex < 0 ||
                businessIndex >=
                businesses.Count
            )
            {
                return false;
            }


            return
                simulation.StartBusiness(
                    businesses[
                        businessIndex
                    ],
                    companyName
                );
        }
    }

    #endregion
}
