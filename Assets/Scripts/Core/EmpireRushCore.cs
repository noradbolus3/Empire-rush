using System;
using System.Collections.Generic;
using System.Linq;

namespace EmpireRush
{
    // ============================================================
    // EMPIRE RUSH
    // CORE SIMULATION FOUNDATION
    // ============================================================

    public enum SkillType
    {
        Communication,
        Technical,
        Sales,
        Management,
        Finance,
        Operations,
        Marketing,
        Leadership
    }

    public enum BusinessType
    {
        Freelancing,
        HomeFood,
        RetailShop,
        RepairCenter,
        CarWash,
        Restaurant,
        Logistics,
        Clothing,
        SoftwareCompany,
        SmallManufacturing,
        Construction,
        Agriculture,
        ConsumerProducts,
        Technology
    }

    public enum BusinessStatus
    {
        Planning,
        Setup,
        Operating,
        Expanding,
        Closed
    }

    // ============================================================
    // SKILL
    // ============================================================

    [Serializable]
    public class PlayerSkill
    {
        public SkillType Type;
        public float Level;
        public float Experience;

        public PlayerSkill(SkillType type, float level = 5f)
        {
            Type = type;
            Level = level;
            Experience = 0f;
        }

        public void AddExperience(float amount)
        {
            if (amount <= 0f)
                return;

            Experience += amount;

            while (Experience >= 100f && Level < 100f)
            {
                Experience -= 100f;
                Level += 1f;
            }

            Level = Math.Min(Level, 100f);
        }
    }

    // ============================================================
    // JOB
    // ============================================================

    [Serializable]
    public class JobDefinition
    {
        public string Id;
        public string Title;
        public float MonthlySalary;
        public int RequiredExperienceMonths;
        public SkillType MainSkill;

        public JobDefinition(
            string id,
            string title,
            float monthlySalary,
            int requiredExperienceMonths,
            SkillType mainSkill)
        {
            Id = id;
            Title = title;
            MonthlySalary = monthlySalary;
            RequiredExperienceMonths = requiredExperienceMonths;
            MainSkill = mainSkill;
        }
    }

    // ============================================================
    // BUSINESS DEFINITION
    // ============================================================

    [Serializable]
    public class BusinessDefinition
    {
        public string Id;
        public BusinessType Type;
        public string Name;

        public float MinimumCapital;
        public float RecommendedCapital;

        public float MonthlyFixedCost;
        public float AverageMonthlyRevenue;

        public int MinimumEmployees;

        // 0 = low risk, 1 = extreme risk
        public float Risk;

        public SkillType MainSkill;

        public BusinessDefinition(
            string id,
            BusinessType type,
            string name,
            float minimumCapital,
            float recommendedCapital,
            float monthlyFixedCost,
            float averageMonthlyRevenue,
            int minimumEmployees,
            float risk,
            SkillType mainSkill)
        {
            Id = id;
            Type = type;
            Name = name;
            MinimumCapital = minimumCapital;
            RecommendedCapital = recommendedCapital;
            MonthlyFixedCost = monthlyFixedCost;
            AverageMonthlyRevenue = averageMonthlyRevenue;
            MinimumEmployees = minimumEmployees;
            Risk = risk;
            MainSkill = mainSkill;
        }

        public bool CanStartWith(float capital)
        {
            return capital >= MinimumCapital;
        }
    }

    // ============================================================
    // EMPLOYEE
    // ============================================================

    [Serializable]
    public class Employee
    {
        public string Id;
        public string Name;
        public string Role;

        public float MonthlySalary;
        public float Productivity;
        public float Morale;

        public Employee(
            string id,
            string name,
            string role,
            float monthlySalary)
        {
            Id = id;
            Name = name;
            Role = role;
            MonthlySalary = monthlySalary;

            Productivity = 1f;
            Morale = 1f;
        }

        public float MonthlyCost()
        {
            return MonthlySalary;
        }
    }

    // ============================================================
    // BUSINESS
    // ============================================================

    [Serializable]
    public class Business
    {
        public string Id;
        public string Name;

        public BusinessDefinition Definition;

        public BusinessStatus Status;

        public string Location;

        public float Cash;

        public float TotalRevenue;
        public float TotalExpenses;
        public float TotalProfit;

        public int AgeInMonths;

        public List<Employee> Employees;

        public Business(
            string id,
            BusinessDefinition definition,
            string location,
            float startingCash)
        {
            Id = id;
            Definition = definition;

            Name = definition.Name;

            Status = BusinessStatus.Setup;

            Location = location;

            Cash = startingCash;

            Employees = new List<Employee>();
        }

        public float Payroll()
        {
            return Employees.Sum(employee => employee.MonthlyCost());
        }

        public float CalculateRevenue(float marketMultiplier)
        {
            marketMultiplier = Math.Max(0.2f, marketMultiplier);

            float employeeFactor =
                Employees.Count == 0
                    ? 1f
                    : 1f + Employees.Count * 0.08f;

            return Definition.AverageMonthlyRevenue
                   * marketMultiplier
                   * employeeFactor;
        }

        public float CalculateExpenses()
        {
            return Definition.MonthlyFixedCost + Payroll();
        }

        public void StartOperations()
        {
            if (Status == BusinessStatus.Setup ||
                Status == BusinessStatus.Planning)
            {
                Status = BusinessStatus.Operating;
            }
        }

        public void SimulateMonth(float marketMultiplier)
        {
            if (Status == BusinessStatus.Closed)
                return;

            StartOperations();

            float revenue = CalculateRevenue(marketMultiplier);
            float expenses = CalculateExpenses();

            float profit = revenue - expenses;

            Cash += profit;

            TotalRevenue += revenue;
            TotalExpenses += expenses;
            TotalProfit += profit;

            AgeInMonths++;
        }

        public void HireEmployee(Employee employee)
        {
            if (employee == null)
                return;

            Employees.Add(employee);
        }

        public void PrintSummary()
        {
            Console.WriteLine();
            Console.WriteLine("------------------------------------------");
            Console.WriteLine($"BUSINESS: {Name}");
            Console.WriteLine("------------------------------------------");
            Console.WriteLine($"Type              : {Definition.Type}");
            Console.WriteLine($"Status            : {Status}");
            Console.WriteLine($"Location          : {Location}");
            Console.WriteLine($"Cash              : ₹{Cash:0}");
            Console.WriteLine($"Employees         : {Employees.Count}");
            Console.WriteLine($"Revenue           : ₹{TotalRevenue:0}");
            Console.WriteLine($"Expenses          : ₹{TotalExpenses:0}");
            Console.WriteLine($"Profit/Loss       : ₹{TotalProfit:0}");
            Console.WriteLine($"Age               : {AgeInMonths} months");
            Console.WriteLine("------------------------------------------");
        }
    }

    // ============================================================
    // PLAYER
    // ============================================================

    [Serializable]
    public class Player
    {
        public string Name;

        public float Cash;
        public float Savings;

        public float MonthlyLivingExpenses;

        public int Age;
        public int ExperienceMonths;

        public JobDefinition CurrentJob;

        public List<PlayerSkill> Skills;
        public List<Business> Businesses;

        public Player(
            string name,
            float startingCash = 0f)
        {
            Name = name;

            Cash = startingCash;
            Savings = 0f;

            MonthlyLivingExpenses = 12000f;

            Age = 20;
            ExperienceMonths = 0;

            Skills = new List<PlayerSkill>();
            Businesses = new List<Business>();

            foreach (SkillType type in Enum.GetValues(typeof(SkillType)))
            {
                Skills.Add(new PlayerSkill(type));
            }
        }

        public float TotalCapital()
        {
            return Cash + Savings;
        }

        public PlayerSkill GetSkill(SkillType type)
        {
            return Skills.FirstOrDefault(skill => skill.Type == type);
        }

        public float GetSkillLevel(SkillType type)
        {
            PlayerSkill skill = GetSkill(type);

            return skill == null ? 0f : skill.Level;
        }

        public void SetJob(JobDefinition job)
        {
            CurrentJob = job;
        }

        public void ReceiveSalary()
        {
            if (CurrentJob == null)
                return;

            Cash += CurrentJob.MonthlySalary;
        }

        public bool PayLivingExpenses()
        {
            if (Cash < MonthlyLivingExpenses)
                return false;

            Cash -= MonthlyLivingExpenses;
            return true;
        }

        public void Save(float amount)
        {
            if (amount <= 0f)
                return;

            amount = Math.Min(amount, Cash);

            Cash -= amount;
            Savings += amount;
        }

        public bool Spend(float amount)
        {
            if (amount <= 0f)
                return true;

            if (Cash < amount)
                return false;

            Cash -= amount;
            return true;
        }

        public void GainCareerExperience()
        {
            ExperienceMonths++;

            foreach (PlayerSkill skill in Skills)
            {
                skill.AddExperience(2f);
            }
        }

        public void AddBusiness(Business business)
        {
            if (business == null)
                return;

            Businesses.Add(business);
        }

        public void PrintStatus()
        {
            Console.WriteLine();
            Console.WriteLine("==========================================");
            Console.WriteLine("PLAYER");
            Console.WriteLine("==========================================");

            Console.WriteLine($"Name              : {Name}");
            Console.WriteLine($"Age               : {Age}");
            Console.WriteLine($"Cash              : ₹{Cash:0}");
            Console.WriteLine($"Savings           : ₹{Savings:0}");
            Console.WriteLine($"Total Capital     : ₹{TotalCapital():0}");
            Console.WriteLine($"Experience        : {ExperienceMonths} months");

            if (CurrentJob != null)
            {
                Console.WriteLine($"Job               : {CurrentJob.Title}");
                Console.WriteLine($"Salary            : ₹{CurrentJob.MonthlySalary:0}/month");
            }
            else
            {
                Console.WriteLine("Job               : Unemployed");
            }

            Console.WriteLine($"Businesses        : {Businesses.Count}");

            Console.WriteLine("==========================================");
        }
    }

    // ============================================================
    // JOB DATABASE
    // ============================================================

    public static class JobDatabase
    {
        public static List<JobDefinition> GetJobs()
        {
            return new List<JobDefinition>
            {
                new JobDefinition(
                    "job_office_assistant",
                    "Office Assistant",
                    18000f,
                    0,
                    SkillType.Communication),

                new JobDefinition(
                    "job_sales_executive",
                    "Sales Executive",
                    28000f,
                    0,
                    SkillType.Sales),

                new JobDefinition(
                    "job_junior_executive",
                    "Junior Executive",
                    30000f,
                    0,
                    SkillType.Management),

                new JobDefinition(
                    "job_technician",
                    "Technician",
                    32000f,
                    0,
                    SkillType.Technical),

                new JobDefinition(
                    "job_software_developer",
                    "Junior Software Developer",
                    45000f,
                    0,
                    SkillType.Technical),

                new JobDefinition(
                    "job_manager",
                    "Business Manager",
                    80000f,
                    24,
                    SkillType.Management),

                new JobDefinition(
                    "job_senior_developer",
                    "Senior Software Engineer",
                    120000f,
                    30,
                    SkillType.Technical),

                new JobDefinition(
                    "job_finance_manager",
                    "Finance Manager",
                    110000f,
                    36,
                    SkillType.Finance),

                new JobDefinition(
                    "job_operations_manager",
                    "Operations Manager",
                    90000f,
                    30,
                    SkillType.Operations)
            };
        }
    }

    // ============================================================
    // BUSINESS DATABASE
    // ============================================================

    public static class BusinessDatabase
    {
        public static List<BusinessDefinition> GetBusinesses()
        {
            return new List<BusinessDefinition>
            {
                new BusinessDefinition(
                    "business_freelance",
                    BusinessType.Freelancing,
                    "Freelance Service",
                    5000f,
                    25000f,
                    2000f,
                    25000f,
                    0,
                    0.20f,
                    SkillType.Technical),

                new BusinessDefinition(
                    "business_home_food",
                    BusinessType.HomeFood,
                    "Home Food Business",
                    15000f,
                    60000f,
                    6000f,
                    40000f,
                    1,
                    0.25f,
                    SkillType.Operations),

                new BusinessDefinition(
                    "business_retail",
                    BusinessType.RetailShop,
                    "Retail Shop",
                    100000f,
                    250000f,
                    30000f,
                    120000f,
                    2,
                    0.35f,
                    SkillType.Sales),

                new BusinessDefinition(
                    "business_repair",
                    BusinessType.RepairCenter,
                    "Repair Center",
                    120000f,
                    300000f,
                    35000f,
                    150000f,
                    2,
                    0.40f,
                    SkillType.Technical),

                new BusinessDefinition(
                    "business_carwash",
                    BusinessType.CarWash,
                    "Car Wash",
                    250000f,
                    600000f,
                    50000f,
                    220000f,
                    4,
                    0.35f,
                    SkillType.Operations),

                new BusinessDefinition(
                    "business_clothing",
                    BusinessType.Clothing,
                    "Clothing Brand",
                    300000f,
                    800000f,
                    100000f,
                    400000f,
                    5,
                    0.50f,
                    SkillType.Marketing),

                new BusinessDefinition(
                    "business_restaurant",
                    BusinessType.Restaurant,
                    "Restaurant",
                    500000f,
                    1200000f,
                    150000f,
                    500000f,
                    8,
                    0.55f,
                    SkillType.Operations),

                new BusinessDefinition(
                    "business_logistics",
                    BusinessType.Logistics,
                    "Logistics Company",
                    800000f,
                    2000000f,
                    250000f,
                    900000f,
                    10,
                    0.60f,
                    SkillType.Operations),

                new BusinessDefinition(
                    "business_software",
                    BusinessType.SoftwareCompany,
                    "Software Company",
                    200000f,
                    1000000f,
                    80000f,
                    600000f,
                    4,
                    0.60f,
                    SkillType.Technical),

                new BusinessDefinition(
                    "business_agriculture",
                    BusinessType.Agriculture,
                    "Agriculture Business",
                    200000f,
                    800000f,
                    50000f,
                    300000f,
                    5,
                    0.65f,
                    SkillType.Operations),

                new BusinessDefinition(
                    "business_construction",
                    BusinessType.Construction,
                    "Construction Company",
                    1000000f,
                    5000000f,
                    400000f,
                    2000000f,
                    15,
                    0.70f,
                    SkillType.Management),

                new BusinessDefinition(
                    "business_manufacturing",
                    BusinessType.SmallManufacturing,
                    "Small Manufacturing Unit",
                    1500000f,
                    5000000f,
                    500000f,
                    1800000f,
                    20,
                    0.65f,
                    SkillType.Operations),

                new BusinessDefinition(
                    "business_consumer",
                    BusinessType.ConsumerProducts,
                    "Consumer Products Company",
                    3000000f,
                    10000000f,
                    800000f,
                    4000000f,
                    30,
                    0.70f,
                    SkillType.Marketing),

                new BusinessDefinition(
                    "business_technology",
                    BusinessType.Technology,
                    "Technology Company",
                    1000000f,
                    5000000f,
                    300000f,
                    3000000f,
                    15,
                    0.75f,
                    SkillType.Technical)
            };
        }
    }

    // ============================================================
    // BUSINESS SELECTION
    // ============================================================

    public static class BusinessSelectionSystem
    {
        public static List<BusinessDefinition> GetAffordableBusinesses(
            float availableCapital)
        {
            return BusinessDatabase
                .GetBusinesses()
                .Where(business =>
                    business.CanStartWith(availableCapital))
                .OrderBy(business =>
                    business.MinimumCapital)
                .ToList();
        }

        public static void PrintAffordableBusinesses(
            float availableCapital)
        {
            List<BusinessDefinition> businesses =
                GetAffordableBusinesses(availableCapital);

            Console.WriteLine();
            Console.WriteLine("==========================================");
            Console.WriteLine("BUSINESSES YOU CAN AFFORD");
            Console.WriteLine("==========================================");

            if (businesses.Count == 0)
            {
                Console.WriteLine("No business currently fits your capital.");
                return;
            }

            foreach (BusinessDefinition business in businesses)
            {
                Console.WriteLine(
                    $"{business.Name} | " +
                    $"Start ₹{business.MinimumCapital:0} | " +
                    $"Recommended ₹{business.RecommendedCapital:0} | " +
                    $"Risk {business.Risk * 100:0}%");
            }

            Console.WriteLine("==========================================");
        }
    }

    // ============================================================
    // BUSINESS SETUP
    // ============================================================

    public static class BusinessSetupSystem
    {
        private static int businessCounter = 0;

        public static Business CreateBusiness(
            Player player,
            BusinessDefinition definition,
            string location)
        {
            if (player == null)
                throw new ArgumentNullException(nameof(player));

            if (definition == null)
                throw new ArgumentNullException(nameof(definition));

            if (!definition.CanStartWith(player.Cash))
                return null;

            float setupCost = definition.MinimumCapital;

            if (!player.Spend(setupCost))
                return null;

            businessCounter++;

            Business business = new Business(
                "company_" + businessCounter,
                definition,
                location,
                0f);

            business.Status = BusinessStatus.Setup;

            player.AddBusiness(business);

            return business;
        }
    }

    // ============================================================
    // MARKET
    // ============================================================

    public class MarketSystem
    {
        private Random random;

        public float DemandMultiplier { get; private set; }

        public MarketSystem(int seed = 0)
        {
            random = seed == 0
                ? new Random()
                : new Random(seed);

            DemandMultiplier = 1f;
        }

        public void SimulateMonth()
        {
            double shock = random.NextDouble();

            if (shock < 0.08)
            {
                // Major negative market shock
                DemandMultiplier = 0.65f;
            }
            else if (shock < 0.18)
            {
                // Mild slowdown
                DemandMultiplier = 0.85f;
            }
            else if (shock > 0.92)
            {
                // Strong market
                DemandMultiplier = 1.25f;
            }
            else
            {
                DemandMultiplier = 0.95f + (float)random.NextDouble() * 0.15f;
            }
        }
    }

    // ============================================================
    // GAME SIMULATION
    // ============================================================

    public class EmpireSimulation
    {
        public Player Player { get; private set; }

        public MarketSystem Market { get; private set; }

        public int Month { get; private set; }

        public EmpireSimulation(string playerName)
        {
            Player = new Player(playerName);
            Market = new MarketSystem();

            Month = 0;
        }

        public void StartJob(JobDefinition job)
        {
            Player.SetJob(job);
        }

        public void AdvanceMonth()
        {
            Month++;

            Player.ReceiveSalary();

            Player.PayLivingExpenses();

            Player.GainCareerExperience();

            Market.SimulateMonth();

            foreach (Business business in Player.Businesses)
            {
                business.SimulateMonth(
                    Market.DemandMultiplier);
            }
        }

        public void PrintMonthReport()
        {
            Console.WriteLine();
            Console.WriteLine("==========================================");
            Console.WriteLine($"MONTH {Month}");
            Console.WriteLine("==========================================");

            Console.WriteLine(
                $"Market Demand     : " +
                $"{Market.DemandMultiplier * 100:0}%");

            Console.WriteLine(
                $"Personal Cash      : ₹{Player.Cash:0}");

            Console.WriteLine(
                $"Personal Savings   : ₹{Player.Savings:0}");

            Console.WriteLine(
                $"Total Capital      : ₹{Player.TotalCapital():0}");

            Console.WriteLine(
                $"Businesses         : {Player.Businesses.Count}");

            Console.WriteLine("==========================================");
        }
    }

    // ============================================================
    // SIMPLE DEVELOPMENT TEST
    // ============================================================

    public static class EmpireRushCoreTest
    {
        public static void Run()
        {
            Console.WriteLine();
            Console.WriteLine("==========================================");
            Console.WriteLine("       EMPIRE RUSH CORE ONLINE");
            Console.WriteLine("==========================================");

            EmpireSimulation simulation =
                new EmpireSimulation("Player");

            List<JobDefinition> jobs =
                JobDatabase.GetJobs();

            simulation.StartJob(jobs[2]);

            Console.WriteLine();
            Console.WriteLine(
                $"Starting Career: " +
                $"{simulation.Player.CurrentJob.Title}");

            for (int i = 0; i < 6; i++)
            {
                simulation.AdvanceMonth();
                simulation.PrintMonthReport();
            }

            BusinessSelectionSystem
                .PrintAffordableBusinesses(
                    simulation.Player.TotalCapital());

            simulation.Player.PrintStatus();

            Console.WriteLine();
            Console.WriteLine("CORE TEST COMPLETE");
            Console.WriteLine("==========================================");
        }
    }
}
