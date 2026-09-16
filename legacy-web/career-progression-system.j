(function () {
    "use strict";

    /*
    ============================================================
    EMPIRE RUSH
    CAREER & JOB PROGRESSION SYSTEM
    ============================================================

    RESPONSIBILITY:
    - Job database
    - Job applications
    - Interviews
    - Job acceptance
    - Career XP
    - Experience
    - Skills
    - Performance
    - Stress
    - Reputation
    - Promotions
    - Resignation

    IMPORTANT:
    Money / salary payment is controlled by EmpireGameState.
    This system NEVER directly pays daily salary.

    FLOW:

    Player
      ↓
    Career
      ↓
    Job
      ↓
    Monthly Salary
      ↓
    EmpireGameState
      ↓
    Cash / Savings
      ↓
    Business Capital
    ============================================================
    */

    const Game = window.EmpireGameState;

    if (!Game) {
        console.warn(
            "Career Progression System waiting for EmpireGameState."
        );
        return;
    }


    /* ============================================================
       CAREER OBJECT
    ============================================================ */

    const Career = {


        /* ========================================================
           JOB DATABASE
        ======================================================== */

        jobs: {

            OfficeAssistant: {
                id: "OfficeAssistant",
                title: "Office Assistant",
                department: "Administration",
                salary: 18000,
                level: "Entry",
                requiredExperience: 0,
                requiredSkill: 10,
                stress: 20
            },

            SalesExecutive: {
                id: "SalesExecutive",
                title: "Sales Executive",
                department: "Sales",
                salary: 25000,
                level: "Entry",
                requiredExperience: 0,
                requiredSkill: 12,
                stress: 30
            },

            JuniorAccountant: {
                id: "JuniorAccountant",
                title: "Junior Accountant",
                department: "Finance",
                salary: 32000,
                level: "Junior",
                requiredExperience: 1,
                requiredSkill: 15,
                stress: 25
            },

            JuniorDeveloper: {
                id: "JuniorDeveloper",
                title: "Junior Developer",
                department: "Technology",
                salary: 45000,
                level: "Junior",
                requiredExperience: 1,
                requiredSkill: 15,
                stress: 35
            },

            SeniorExecutive: {
                id: "SeniorExecutive",
                title: "Senior Executive",
                department: "Business",
                salary: 65000,
                level: "Senior",
                requiredExperience: 3,
                requiredSkill: 25,
                stress: 40
            },

            SeniorDeveloper: {
                id: "SeniorDeveloper",
                title: "Senior Developer",
                department: "Technology",
                salary: 85000,
                level: "Senior",
                requiredExperience: 3,
                requiredSkill: 28,
                stress: 45
            },

            FinanceManager: {
                id: "FinanceManager",
                title: "Finance Manager",
                department: "Finance",
                salary: 95000,
                level: "Manager",
                requiredExperience: 5,
                requiredSkill: 35,
                stress: 45
            },

            SalesManager: {
                id: "SalesManager",
                title: "Sales Manager",
                department: "Sales",
                salary: 90000,
                level: "Manager",
                requiredExperience: 5,
                requiredSkill: 35,
                stress: 50
            },

            OperationsManager: {
                id: "OperationsManager",
                title: "Operations Manager",
                department: "Operations",
                salary: 90000,
                level: "Manager",
                requiredExperience: 5,
                requiredSkill: 35,
                stress: 50
            },

            GeneralManager: {
                id: "GeneralManager",
                title: "General Manager",
                department: "Management",
                salary: 130000,
                level: "Executive",
                requiredExperience: 7,
                requiredSkill: 45,
                stress: 55
            },

            Director: {
                id: "Director",
                title: "Director",
                department: "Management",
                salary: 200000,
                level: "Executive",
                requiredExperience: 9,
                requiredSkill: 55,
                stress: 60
            },

            COO: {
                id: "COO",
                title: "Chief Operating Officer",
                department: "Executive",
                salary: 300000,
                level: "C-Level",
                requiredExperience: 12,
                requiredSkill: 65,
                stress: 65
            },

            CFO: {
                id: "CFO",
                title: "Chief Financial Officer",
                department: "Executive",
                salary: 320000,
                level: "C-Level",
                requiredExperience: 12,
                requiredSkill: 65,
                stress: 65
            },

            CTO: {
                id: "CTO",
                title: "Chief Technology Officer",
                department: "Executive",
                salary: 350000,
                level: "C-Level",
                requiredExperience: 12,
                requiredSkill: 65,
                stress: 65
            }
        },


        /* ========================================================
           CAREER LEVELS
        ======================================================== */

        levels: {
            Entry: 1,
            Junior: 2,
            Mid: 3,
            Senior: 4,
            Manager: 5,
            Executive: 6,
            "C-Level": 7
        },


        /* ========================================================
           ENSURE CAREER DATA
        ======================================================== */

        ensurePlayer: function () {

            const player = Game.getPlayer();

            if (!player) {
                return null;
            }


            if (!player.career) {

                player.career = {
                    level: 1,
                    xp: 0,
                    experience: Number(player.experience || 0),

                    performance: 70,
                    stress: 10,
                    reputation: 0,

                    history: [],
                    interviews: [],
                    jobsCompleted: 0,

                    lastWorkDay: 0,
                    daysWorked: 0,
                    promotions: 0
                };
            }


            const career = player.career;


            /* Defensive normalization */

            career.level = Number(career.level || 1);
            career.xp = Number(career.xp || 0);

            career.experience = Number(
                player.experience ??
                career.experience ??
                0
            );

            career.performance = Number(
                career.performance ?? 70
            );

            career.stress = Number(
                career.stress ?? 10
            );

            career.reputation = Number(
                career.reputation ?? 0
            );

            career.history = Array.isArray(career.history)
                ? career.history
                : [];

            career.interviews = Array.isArray(career.interviews)
                ? career.interviews
                : [];

            career.jobsCompleted = Number(
                career.jobsCompleted || 0
            );

            career.daysWorked = Number(
                career.daysWorked || 0
            );

            career.promotions = Number(
                career.promotions || 0
            );

            return career;
        },


        /* ========================================================
           GET PLAYER
        ======================================================== */

        getPlayer: function () {
            return Game.getPlayer();
        },


        /* ========================================================
           GET JOB
        ======================================================== */

        getJob: function (jobId) {

            if (!jobId) {
                return null;
            }

            return this.jobs[jobId] || null;
        },


        /* ========================================================
           GET ALL JOBS
        ======================================================== */

        getJobs: function () {

            return Object.values(this.jobs);
        },


        /* ========================================================
           AVERAGE SKILL
        ======================================================== */

        getAverageSkill: function () {

            const player = this.getPlayer();

            if (!player) {
                return 0;
            }

            const skills = player.skills || {};

            const values = Object.values(skills)
                .map(Number)
                .filter(v => Number.isFinite(v));

            if (!values.length) {
                return 0;
            }

            const total = values.reduce(
                (sum, value) => sum + value,
                0
            );

            return Math.round(
                total / values.length
            );
        },


        /* ========================================================
           REQUIRED SKILL CHECK
        ======================================================== */

        hasRequiredSkill: function (job) {

            if (!job) {
                return false;
            }

            return (
                this.getAverageSkill() >=
                Number(job.requiredSkill || 0)
            );
        },


        /* ========================================================
           EXPERIENCE CHECK
        ======================================================== */

        hasRequiredExperience: function (job) {

            const player = this.getPlayer();

            if (!player || !job) {
                return false;
            }

            const experience = Number(
                player.experience || 0
            );

            return (
                experience >=
                Number(job.requiredExperience || 0)
            );
        },


        /* ========================================================
           CAN APPLY
        ======================================================== */

        canApply: function (jobId) {

            const job = this.getJob(jobId);

            if (!job) {
                return {
                    allowed: false,
                    reason: "Job not found."
                };
            }


            const player = this.getPlayer();

            if (!player) {
                return {
                    allowed: false,
                    reason: "Player unavailable."
                };
            }


            const experience = Number(
                player.experience || 0
            );

            const skill = this.getAverageSkill();


            if (
                experience <
                Number(job.requiredExperience || 0)
            ) {

                return {
                    allowed: false,
                    reason:
                        "More experience required.",
                    requiredExperience:
                        job.requiredExperience,
                    currentExperience:
                        experience
                };
            }


            if (
                skill <
                Number(job.requiredSkill || 0)
            ) {

                return {
                    allowed: false,
                    reason:
                        "Your skills are not high enough.",
                    requiredSkill:
                        job.requiredSkill,
                    currentSkill:
                        skill
                };
            }


            return {
                allowed: true,
                reason: "Eligible to apply."
            };
        },


        /* ========================================================
           INTERVIEW
        ======================================================== */

        interview: function (jobId) {

            const job = this.getJob(jobId);

            if (!job) {
                return {
                    success: false,
                    message: "Job not found."
                };
            }


            const eligibility =
                this.canApply(jobId);


            if (!eligibility.allowed) {

                return {
                    success: false,
                    message:
                        eligibility.reason
                };
            }


            const player = this.getPlayer();
            const career = this.ensurePlayer();


            const skill =
                this.getAverageSkill();

            const experience =
                Number(player.experience || 0);

            const performance =
                Number(career.performance || 70);


            /*
            Interview score.

            Higher:
            - skill
            - experience
            - performance

            Lower:
            - job difficulty
            */

            const skillScore =
                skill * 0.45;

            const experienceScore =
                Math.min(
                    experience * 4,
                    25
                );

            const performanceScore =
                performance * 0.30;


            let score =
                skillScore +
                experienceScore +
                performanceScore;


            score +=
                Math.random() * 15;


            const difficulty =
                Number(job.requiredSkill || 10) *
                0.25;


            score -= difficulty;


            const passed =
                score >= 45;


            const interview = {

                jobId: job.id,

                jobTitle: job.title,

                score: Math.round(score),

                passed: passed,

                day:
                    Number(
                        Game.getState()?.world?.totalDays ||
                        1
                    )
            };


            career.interviews.push(
                interview
            );


            /*
            Keep history manageable.
            */

            if (
                career.interviews.length >
                50
            ) {

                career.interviews =
                    career.interviews.slice(-50);
            }


            Game.save();


            window.dispatchEvent(
                new CustomEvent(
                    "EmpireCareerInterview",
                    {
                        detail: interview
                    }
                )
            );


            return {

                success: true,

                passed: passed,

                score: Math.round(score),

                job: job,

                message: passed
                    ? "Interview passed."
                    : "Interview failed."
            };
        },


        /* ========================================================
           ACCEPT JOB
        ======================================================== */

        acceptJob: function (jobId) {

            const job =
                this.getJob(jobId);


            if (!job) {

                return {
                    success: false,
                    message: "Job not found."
                };
            }


            const eligibility =
                this.canApply(jobId);


            if (!eligibility.allowed) {

                return {
                    success: false,
                    message:
                        eligibility.reason
                };
            }


            const player =
                this.getPlayer();

            const career =
                this.ensurePlayer();


            /*
            IMPORTANT:

            Central salary API:
                Game.player.setJob(job)

            NOT:
                Game.setJob(...)
            */

            if (
                !Game.player ||
                typeof Game.player.setJob !==
                "function"
            ) {

                return {
                    success: false,
                    message:
                        "EmpireGameState player.setJob() is unavailable."
                };
            }


            const previousJob =
                player.currentJob ||
                "Unemployed";


            const previousSalary =
                Number(
                    player.monthlyIncome || 0
                );


            const success =
                Game.player.setJob({

                    id: job.id,

                    title: job.title,

                    department:
                        job.department,

                    level:
                        job.level,

                    monthlySalary:
                        Number(job.salary || 0),

                    salary:
                        Number(job.salary || 0)
                });


            if (success === false) {

                return {
                    success: false,
                    message:
                        "Unable to update player job."
                };
            }


            /*
            Explicitly synchronize career metadata.
            */

            player.jobLevel =
                job.level;

            player.currentJob =
                job.title;

            player.monthlyIncome =
                Number(job.salary || 0);


            /*
            Career level.
            */

            player.careerLevel =
                this.levels[job.level] ||
                player.careerLevel ||
                1;


            career.level =
                player.careerLevel;


            /*
            Job history.
            */

            const historyEntry = {

                jobId: job.id,

                title: job.title,

                department:
                    job.department,

                level:
                    job.level,

                salary:
                    Number(job.salary || 0),

                previousJob:
                    previousJob,

                previousSalary:
                    previousSalary,

                day:
                    Number(
                        Game.getState()?.world?.totalDays ||
                        1
                    )
            };


            career.history.push(
                historyEntry
            );


            if (
                career.history.length >
                50
            ) {

                career.history =
                    career.history.slice(-50);
            }


            career.jobsCompleted += 1;


            Game.save();


            window.dispatchEvent(
                new CustomEvent(
                    "EmpireCareerJobAccepted",
                    {
                        detail: {

                            job: job,

                            previousJob:
                                previousJob,

                            previousSalary:
                                previousSalary
                        }
                    }
                )
            );


            return {

                success: true,

                job: job,

                salary:
                    Number(job.salary || 0),

                message:
                    "Job accepted successfully."
            };
        },


        /* ========================================================
           WORK DAY
        ======================================================== */

        workDay: function () {

            const player =
                this.getPlayer();

            const career =
                this.ensurePlayer();


            if (!player) {

                return {
                    success: false,
                    message: "Player unavailable."
                };
            }


            const employed =
                player.currentJob &&
                player.currentJob !==
                "Unemployed";


            if (!employed) {

                return {
                    success: false,
                    message:
                        "You are currently unemployed."
                };
            }


            const world =
                Game.getWorld() || {};


            const currentDay =
                Number(
                    world.totalDays || 1
                );


            /*
            Prevent duplicate work
            on same game day.
            */

            if (
                Number(career.lastWorkDay || 0) ===
                currentDay
            ) {

                return {
                    success: false,
                    message:
                        "You have already worked today."
                };
            }


            const job =
                Object.values(this.jobs)
                    .find(
                        item =>
                            item.title ===
                            player.currentJob
                    );


            const stress =
                Number(
                    job?.stress || 25
                );


            /*
            Performance changes.
            */

            const performanceChange =
                Math.round(
                    (Math.random() * 6) - 2
                );


            career.performance =
                Math.max(
                    0,
                    Math.min(
                        100,
                        career.performance +
                        performanceChange
                    )
                );


            /*
            Stress.
            */

            career.stress =
                Math.max(
                    0,
                    Math.min(
                        100,
                        career.stress +
                        Math.round(
                            stress * 0.08
                        )
                    )
                );


            /*
            Experience.

            One work day gives
            fractional experience.
            */

            const experienceGain =
                0.05;


            player.experience =
                Number(
                    player.experience || 0
                ) +
                experienceGain;


            career.experience =
                player.experience;


            /*
            Career XP.
            */

            const xpGain =
                Math.max(
                    1,
                    Math.round(
                        5 +
                        career.performance *
                        0.04
                    )
                );


            career.xp +=
                xpGain;


            career.daysWorked += 1;

            career.lastWorkDay =
                currentDay;


            /*
            Skill improvement.

            Only a small chance per day.
            */

            this.improveSkills(
                player
            );


            /*
            Reputation.
            */

            if (
                career.performance >= 80
            ) {

                career.reputation =
                    Math.min(
                        100,
                        career.reputation +
                        0.2
                    );
            }


            Game.save();


            const result = {

                success: true,

                day: currentDay,

                experienceGain:
                    experienceGain,

                xpGain:
                    xpGain,

                performance:
                    career.performance,

                stress:
                    career.stress,

                experience:
                    player.experience
            };


            window.dispatchEvent(
                new CustomEvent(
                    "EmpireCareerWorkDay",
                    {
                        detail: result
                    }
                )
            );


            return result;
        },


        /* ========================================================
           IMPROVE SKILLS
        ======================================================== */

        improveSkills: function (player) {

            if (!player) {
                return;
            }


            if (!player.skills) {

                player.skills = {};
            }


            const skills =
                Object.keys(
                    player.skills
                );


            if (!skills.length) {
                return;
            }


            /*
            35% chance of learning something
            during a work day.
            */

            if (
                Math.random() > 0.35
            ) {
                return;
            }


            const skillName =
                skills[
                    Math.floor(
                        Math.random() *
                        skills.length
                    )
                ];


            const oldValue =
                Number(
                    player.skills[
                        skillName
                    ] || 0
                );


            const increase =
                Math.random() < 0.85
                    ? 1
                    : 2;


            player.skills[
                skillName
            ] =
                Math.min(
                    100,
                    oldValue +
                    increase
                );


            window.dispatchEvent(
                new CustomEvent(
                    "EmpireSkillImproved",
                    {
                        detail: {

                            skill:
                                skillName,

                            oldValue:
                                oldValue,

                            newValue:
                                player.skills[
                                    skillName
                                ]
                        }
                    }
                )
            );
        },


        /* ========================================================
           PROMOTION
        ======================================================== */

        promote: function (jobId) {

            const job =
                this.getJob(jobId);


            if (!job) {

                return {
                    success: false,
                    message: "Job not found."
                };
            }


            const player =
                this.getPlayer();

            const career =
                this.ensurePlayer();


            if (!player) {

                return {
                    success: false,
                    message:
                        "Player unavailable."
                };
            }


            const currentLevel =
                this.levels[
                    player.jobLevel
                ] ||
                Number(
                    player.careerLevel || 1
                );


            const targetLevel =
                this.levels[
                    job.level
                ] || 1;


            /*
            Promotion must move forward.
            */

            if (
                targetLevel <=
                currentLevel
            ) {

                return {
                    success: false,
                    message:
                        "This is not a higher career level."
                };
            }


            const eligibility =
                this.canApply(jobId);


            if (!eligibility.allowed) {

                return {
                    success: false,
                    message:
                        eligibility.reason
                };
            }


            const oldJob =
                player.currentJob ||
                "Unemployed";


            const oldSalary =
                Number(
                    player.monthlyIncome || 0
                );


            /*
            CENTRAL STATE UPDATE.

            This is the critical fix.
            */

            if (
                !Game.player ||
                typeof Game.player.setJob !==
                "function"
            ) {

                return {
                    success: false,
                    message:
                        "EmpireGameState player.setJob() is unavailable."
                };
            }


            const success =
                Game.player.setJob({

                    id: job.id,

                    title: job.title,

                    department:
                        job.department,

                    level:
                        job.level,

                    monthlySalary:
                        Number(job.salary || 0),

                    salary:
                        Number(job.salary || 0)
                });


            if (success === false) {

                return {
                    success: false,
                    message:
                        "Promotion failed."
                };
            }


            /*
            Synchronize all career fields.
            */

            player.currentJob =
                job.title;

            player.jobLevel =
                job.level;

            player.monthlyIncome =
                Number(job.salary || 0);

            player.careerLevel =
                targetLevel;


            career.level =
                targetLevel;

            career.promotions += 1;


            career.history.push({

                type: "promotion",

                jobId:
                    job.id,

                title:
                    job.title,

                level:
                    job.level,

                salary:
                    Number(job.salary || 0),

                previousJob:
                    oldJob,

                previousSalary:
                    oldSalary,

                day:
                    Number(
                        Game.getState()?.world?.totalDays ||
                        1
                    )
            });


            Game.save();


            const result = {

                success: true,

                job: job,

                previousJob:
                    oldJob,

                previousSalary:
                    oldSalary,

                newSalary:
                    Number(job.salary || 0),

                newLevel:
                    job.level
            };


            window.dispatchEvent(
                new CustomEvent(
                    "EmpireCareerPromoted",
                    {
                        detail: result
                    }
                )
            );


            return result;
        },


        /* ========================================================
           RESIGN
        ======================================================== */

        resign: function () {

            const player =
                this.getPlayer();

            const career =
                this.ensurePlayer();


            if (!player) {

                return {
                    success: false,
                    message:
                        "Player unavailable."
                };
            }


            const previousJob =
                player.currentJob ||
                "Unemployed";


            const previousSalary =
                Number(
                    player.monthlyIncome || 0
                );


            /*
            IMPORTANT:

            Clear central monthly income.
            Otherwise GameState could continue
            paying salary every month.
            */

            if (
                Game.player &&
                typeof Game.player.setJob ===
                "function"
            ) {

                Game.player.setJob({

                    title: "Unemployed",

                    level: "Entry",

                    monthlySalary: 0,

                    salary: 0
                });

            } else {

                player.currentJob =
                    "Unemployed";

                player.jobLevel =
                    "Entry";

                player.monthlyIncome =
                    0;
            }


            /*
            Explicit synchronization.
            */

            player.currentJob =
                "Unemployed";

            player.jobLevel =
                "Entry";

            player.monthlyIncome =
                0;


            career.history.push({

                type: "resignation",

                previousJob:
                    previousJob,

                previousSalary:
                    previousSalary,

                day:
                    Number(
                        Game.getState()?.world?.totalDays ||
                        1
                    )
            });


            Game.save();


            const result = {

                success: true,

                previousJob:
                    previousJob,

                previousSalary:
                    previousSalary,

                message:
                    "You resigned from your job."
            };


            window.dispatchEvent(
                new CustomEvent(
                    "EmpireCareerResigned",
                    {
                        detail: result
                    }
                )
            );


            return result;
        },


        /* ========================================================
           RECOVER STRESS
        ======================================================== */

        recoverStress: function (
            amount = 5
        ) {

            const career =
                this.ensurePlayer();


            if (!career) {
                return;
            }


            career.stress =
                Math.max(
                    0,
                    Number(career.stress || 0) -
                    Number(amount || 0)
                );


            Game.save();
        },


        /* ========================================================
           INCREASE REPUTATION
        ======================================================== */

        increaseReputation: function (
            amount = 1
        ) {

            const career =
                this.ensurePlayer();


            if (!career) {
                return;
            }


            career.reputation =
                Math.min(
                    100,
                    Number(career.reputation || 0) +
                    Number(amount || 0)
                );


            Game.save();
        },


        /* ========================================================
           GET CURRENT JOB
        ======================================================== */

        getCurrentJob: function () {

            const player =
                this.getPlayer();


            if (!player) {
                return null;
            }


            return Object.values(
                this.jobs
            ).find(
                job =>
                    job.title ===
                    player.currentJob
            ) || null;
        },


        /* ========================================================
           GET CAREER SUMMARY
        ======================================================== */

        getSummary: function () {

            const player =
                this.getPlayer();

            const career =
                this.ensurePlayer();


            if (!player || !career) {
                return null;
            }


            const currentJob =
                this.getCurrentJob();


            return {

                name:
                    player.name,

                age:
                    player.age,

                currentJob:
                    player.currentJob ||
                    "Unemployed",

                jobLevel:
                    player.jobLevel ||
                    "Entry",

                monthlySalary:
                    Number(
                        player.monthlyIncome || 0
                    ),

                experience:
                    Number(
                        player.experience || 0
                    ),

                careerLevel:
                    Number(
                        player.careerLevel ||
                        career.level ||
                        1
                    ),

                careerXP:
                    Number(
                        career.xp || 0
                    ),

                performance:
                    Number(
                        career.performance || 0
                    ),

                stress:
                    Number(
                        career.stress || 0
                    ),

                reputation:
                    Number(
                        career.reputation || 0
                    ),

                averageSkill:
                    this.getAverageSkill(),

                currentJobData:
                    currentJob,

                daysWorked:
                    Number(
                        career.daysWorked || 0
                    ),

                promotions:
                    Number(
                        career.promotions || 0
                    )
            };
        },


        /* ========================================================
           GET NEXT JOBS
        ======================================================== */

        getAvailableJobs: function () {

            const result = [];


            Object.values(
                this.jobs
            ).forEach(
                job => {

                    const check =
                        this.canApply(
                            job.id
                        );


                    result.push({

                        ...job,

                        eligible:
                            check.allowed,

                        reason:
                            check.reason
                    });
                }
            );


            return result;
        },


        /* ========================================================
           GET PROMOTION OPTIONS
        ======================================================== */

        getPromotionOptions: function () {

            const player =
                this.getPlayer();


            if (!player) {
                return [];
            }


            const currentLevel =
                this.levels[
                    player.jobLevel
                ] ||
                Number(
                    player.careerLevel || 1
                );


            return Object.values(
                this.jobs
            )
            .filter(
                job => {

                    const level =
                        this.levels[
                            job.level
                        ] || 1;

                    return (
                        level >
                        currentLevel
                    );
                }
            )
            .map(
                job => {

                    const check =
                        this.canApply(
                            job.id
                        );

                    return {

                        ...job,

                        eligible:
                            check.allowed,

                        reason:
                            check.reason
                    };
                }
            );
        },


        /* ========================================================
           DAILY CAREER RECOVERY
        ======================================================== */

        onDayAdvanced: function () {

            const player =
                this.getPlayer();

            const career =
                this.ensurePlayer();


            if (!player || !career) {
                return;
            }


            /*
            Stress recovery when not working.

            Employed players can still recover
            slightly, rather than staying permanently
            stressed.
            */

            if (
                player.currentJob ===
                "Unemployed"
            ) {

                this.recoverStress(8);

            } else {

                this.recoverStress(2);
            }


            /*
            Performance slowly normalizes.
            */

            if (
                career.performance < 70
            ) {

                career.performance =
                    Math.min(
                        70,
                        career.performance +
                        0.25
                    );
            }


            Game.save();
        }
    };


    /* ============================================================
       INITIALIZE
    ============================================================ */

    Career.ensurePlayer();


    /* ============================================================
       DAY EVENT
    ============================================================ */

    window.addEventListener(
        "EmpireDayAdvanced",
        function () {

            Career.onDayAdvanced();

        }
    );


    /* ============================================================
       JOB ACCEPTED EVENT
    ============================================================ */

    window.addEventListener(
        "EmpireCareerJobAccepted",
        function (event) {

            const job =
                event.detail?.job;

            if (!job) {
                return;
            }

            console.log(
                "[Career] Job accepted:",
                job.title,
                "₹" + job.salary
            );
        }
    );


    /* ============================================================
       PROMOTION EVENT
    ============================================================ */

    window.addEventListener(
        "EmpireCareerPromoted",
        function (event) {

            const data =
                event.detail;

            if (!data) {
                return;
            }

            console.log(
                "[Career] Promoted to:",
                data.job?.title
            );
        }
    );


    /* ============================================================
       PUBLIC API
    ============================================================ */

    window.EmpireCareer = Career;


    /*
    Compatibility aliases.

    Existing UI can use either:
        EmpireCareer.jobs
        EmpireCareer.getJobs()
    */

    window.EmpireCareerJobs =
        Career.jobs;


    console.log(
        "Empire Career Progression System initialized."
    );

})();
