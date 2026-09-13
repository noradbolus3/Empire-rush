(function () {
  "use strict";

  const Game = window.EmpireGameState;

  if (!Game) {
    console.warn("Career Progression System waiting for EmpireGameState.");
    return;
  }

  const Career = {

    /* ============================================================
       JOB DATABASE
       ============================================================ */

    jobs: {

      OfficeAssistant: {
        title: "Office Assistant",
        department: "Administration",
        salary: 18000,
        level: "Entry",
        requiredExperience: 0,
        requiredSkill: 10,
        stress: 20
      },

      SalesExecutive: {
        title: "Sales Executive",
        department: "Sales",
        salary: 25000,
        level: "Entry",
        requiredExperience: 0,
        requiredSkill: 15,
        stress: 30
      },

      JuniorAccountant: {
        title: "Junior Accountant",
        department: "Finance",
        salary: 32000,
        level: "Junior",
        requiredExperience: 10,
        requiredSkill: 20,
        stress: 25
      },

      JuniorDeveloper: {
        title: "Junior Software Developer",
        department: "Technology",
        salary: 45000,
        level: "Junior",
        requiredExperience: 10,
        requiredSkill: 25,
        stress: 35
      },

      SeniorExecutive: {
        title: "Senior Executive",
        department: "Management",
        salary: 65000,
        level: "Senior",
        requiredExperience: 60,
        requiredSkill: 40,
        stress: 40
      },

      SeniorDeveloper: {
        title: "Senior Software Developer",
        department: "Technology",
        salary: 85000,
        level: "Senior",
        requiredExperience: 70,
        requiredSkill: 55,
        stress: 45
      },

      FinanceManager: {
        title: "Finance Manager",
        department: "Finance",
        salary: 95000,
        level: "Manager",
        requiredExperience: 100,
        requiredSkill: 60,
        stress: 50
      },

      SalesManager: {
        title: "Sales Manager",
        department: "Sales",
        salary: 90000,
        level: "Manager",
        requiredExperience: 100,
        requiredSkill: 60,
        stress: 50
      },

      OperationsManager: {
        title: "Operations Manager",
        department: "Operations",
        salary: 90000,
        level: "Manager",
        requiredExperience: 110,
        requiredSkill: 60,
        stress: 55
      },

      GeneralManager: {
        title: "General Manager",
        department: "Management",
        salary: 130000,
        level: "Executive",
        requiredExperience: 160,
        requiredSkill: 70,
        stress: 65
      },

      Director: {
        title: "Director",
        department: "Management",
        salary: 200000,
        level: "Executive",
        requiredExperience: 230,
        requiredSkill: 80,
        stress: 70
      },

      COO: {
        title: "Chief Operating Officer",
        department: "Management",
        salary: 300000,
        level: "C-Level",
        requiredExperience: 300,
        requiredSkill: 85,
        stress: 80
      },

      CFO: {
        title: "Chief Financial Officer",
        department: "Finance",
        salary: 320000,
        level: "C-Level",
        requiredExperience: 320,
        requiredSkill: 88,
        stress: 80
      },

      CTO: {
        title: "Chief Technology Officer",
        department: "Technology",
        salary: 350000,
        level: "C-Level",
        requiredExperience: 320,
        requiredSkill: 90,
        stress: 82
      }
    },

    /* ============================================================
       CAREER LEVELS
       ============================================================ */

    levels: {
      Entry: 1,
      Junior: 2,
      Mid: 3,
      Senior: 4,
      Manager: 5,
      Executive: 6,
      "C-Level": 7
    },

    /* ============================================================
       STATE
       ============================================================ */

    getPlayer() {
      return Game.getState()?.player;
    },

    save() {
      if (typeof Game.save === "function") {
        Game.save();
      }
    },

    ensurePlayer() {

      const player = this.getPlayer();

      if (!player) return null;

      if (!player.career) {
        player.career = {};
      }

      if (!Array.isArray(player.career.history)) {
        player.career.history = [];
      }

      if (!Array.isArray(player.career.skills)) {
        player.career.skills = [];
      }

      if (
        typeof player.career.performance !== "number"
      ) {
        player.career.performance = 60;
      }

      if (
        typeof player.career.stress !== "number"
      ) {
        player.career.stress = 10;
      }

      if (
        typeof player.career.reputation !== "number"
      ) {
        player.career.reputation = 0;
      }

      if (
        typeof player.career.interviews !== "number"
      ) {
        player.career.interviews = 0;
      }

      if (
        typeof player.career.jobsCompleted !== "number"
      ) {
        player.career.jobsCompleted = 0;
      }

      return player;
    },

    /* ============================================================
       SKILLS
       ============================================================ */

    getAverageSkill() {

      const player = this.ensurePlayer();

      if (!player) return 0;

      const skills =
        player.skills || {};

      const values =
        Object.values(skills)
          .map(Number)
          .filter(value =>
            Number.isFinite(value)
          );

      if (!values.length) {
        return 10;
      }

      return Math.round(
        values.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / values.length
      );
    },

    improveSkills() {

      const player =
        this.ensurePlayer();

      if (!player) return;

      const skills =
        player.skills || {};

      Object.keys(skills)
        .forEach(skill => {

          const current =
            Number(
              skills[skill] || 0
            );

          if (
            Math.random() < 0.25
          ) {

            skills[skill] =
              Math.min(
                100,
                current + 1
              );
          }

        });
    },

    /* ============================================================
       JOB REQUIREMENTS
       ============================================================ */

    canApply(jobId) {

      const player =
        this.ensurePlayer();

      const job =
        this.jobs[jobId];

      if (!player || !job) {
        return {
          eligible: false,
          reason: "Invalid job."
        };
      }

      const experience =
        Number(
          player.experience || 0
        );

      const skill =
        this.getAverageSkill();

      const reasons = [];

      if (
        experience <
        job.requiredExperience
      ) {
        reasons.push(
          `Requires ${job.requiredExperience} experience.`
        );
      }

      if (
        skill <
        job.requiredSkill
      ) {
        reasons.push(
          `Requires average skill ${job.requiredSkill}.`
        );
      }

      return {
        eligible:
          reasons.length === 0,
        reasons,
        job
      };
    },

    /* ============================================================
       INTERVIEW
       ============================================================ */

    interview(jobId) {

      const player =
        this.ensurePlayer();

      const job =
        this.jobs[jobId];

      if (!player || !job) {
        return {
          success: false,
          reason: "Invalid job."
        };
      }

      const eligibility =
        this.canApply(jobId);

      if (!eligibility.eligible) {
        return {
          success: false,
          reason:
            eligibility.reasons.join(" ")
        };
      }

      player.career.interviews++;

      const skill =
        this.getAverageSkill();

      const experience =
        Number(
          player.experience || 0
        );

      const performance =
        Number(
          player.career.performance || 60
        );

      let chance =
        0.45 +
        skill / 250 +
        experience / 500 +
        performance / 500;

      chance =
        Math.min(
          0.95,
          Math.max(
            0.20,
            chance
          )
        );

      const accepted =
        Math.random() < chance;

      if (!accepted) {

        player.career.reputation =
          Math.max(
            0,
            player.career.reputation - 1
          );

        this.save();

        return {
          success: false,
          accepted: false,
          chance:
            Math.round(
              chance * 100
            ),
          reason:
            "Interview unsuccessful."
        };
      }

      return {
        success: true,
        accepted: true,
        chance:
          Math.round(
            chance * 100
          ),
        job
      };
    },

    /* ============================================================
       ACCEPT JOB
       ============================================================ */

    acceptJob(jobId) {

      const player =
        this.ensurePlayer();

      const job =
        this.jobs[jobId];

      if (!player || !job) {
        return {
          success: false,
          reason: "Invalid job."
        };
      }

      const result =
        this.interview(jobId);

      if (!result.accepted) {
        return result;
      }

      if (
        typeof Game.setJob ===
        "function"
      ) {

        Game.setJob(
          job.title,
          job.salary,
          job.level
        );

      } else {

        player.currentJob =
          job.title;

        player.salary =
          job.salary;

      }

      player.career.currentJobId =
        jobId;

      player.career.currentDepartment =
        job.department;

      player.career.currentLevel =
        job.level;

      player.career.performance =
        65;

      player.career.stress =
        job.stress;

      player.career.history.push({

        jobId,

        title:
          job.title,

        salary:
          job.salary,

        department:
          job.department,

        level:
          job.level,

        startDay:
          Game.getState()
            ?.world
            ?.day || 1

      });

      player.career.reputation =
        Math.min(
          100,
          player.career.reputation + 3
        );

      this.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireCareerJobAccepted",
          {
            detail: {
              player,
              job
            }
          }
        )
      );

      return {
        success: true,
        accepted: true,
        job
      };
    },

    /* ============================================================
       WORK DAY
       ============================================================ */

    workDay() {

      const player =
        this.ensurePlayer();

      if (!player) {
        return {
          success: false
        };
      }

      if (
        !player.career.currentJobId
      ) {
        return {
          success: false,
          reason:
            "Player does not have a job."
        };
      }

      const job =
        this.jobs[
          player.career.currentJobId
        ];

      if (!job) {
        return {
          success: false,
          reason:
            "Current job not found."
        };
      }

      const performance =
        Number(
          player.career.performance || 60
        );

      const stress =
        Number(
          player.career.stress || 0
        );

      let performanceChange = 0;

      if (
        performance >= 70
      ) {
        performanceChange += 1;
      }

      if (
        stress > 70
      ) {
        performanceChange -= 2;
      }

      if (
        Math.random() < 0.20
      ) {
        performanceChange += 1;
      }

      player.career.performance =
        Math.max(
          0,
          Math.min(
            100,
            performance +
            performanceChange
          )
        );

      player.career.stress =
        Math.max(
          0,
          Math.min(
            100,
            stress +
            Math.round(
              job.stress / 10
            )
          )
        );

      player.experience =
        Number(
          player.experience || 0
        ) + 1;

      this.improveSkills();

      if (
        Math.random() < 0.15
      ) {
        player.career.reputation =
          Math.min(
            100,
            player.career.reputation + 1
          );
      }

      this.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireCareerWorkDay",
          {
            detail: {
              player,
              job
            }
          }
        )
      );

      return {
        success: true,
        performance:
          player.career.performance,
        stress:
          player.career.stress,
        experience:
          player.experience
      };
    },

    /* ============================================================
       REST / RECOVERY
       ============================================================ */

    recover() {

      const player =
        this.ensurePlayer();

      if (!player) return;

      player.career.stress =
        Math.max(
          0,
          Number(
            player.career.stress || 0
          ) - 15
        );

      player.career.performance =
        Math.min(
          100,
          Number(
            player.career.performance || 0
          ) + 2
        );

      this.save();
    },

    /* ============================================================
       PROMOTION
       ============================================================ */

    getPromotionOptions() {

      const player =
        this.ensurePlayer();

      if (!player) return [];

      const currentId =
        player.career.currentJobId;

      const current =
        this.jobs[currentId];

      if (!current) return [];

      const currentLevel =
        this.levels[
          current.level
        ] || 1;

      const experience =
        Number(
          player.experience || 0
        );

      const skill =
        this.getAverageSkill();

      return Object.entries(
        this.jobs
      )
      .filter(
        ([id, job]) => {

          const level =
            this.levels[
              job.level
            ] || 1;

          return (
            level >
            currentLevel &&
            job.department ===
            current.department &&
            experience >=
            job.requiredExperience &&
            skill >=
            job.requiredSkill
          );

        }
      )
      .map(
        ([id, job]) => ({
          id,
          ...job
        })
      );
    },

    promote(jobId) {

      const player =
        this.ensurePlayer();

      const job =
        this.jobs[jobId];

      if (!player || !job) {
        return {
          success: false,
          reason:
            "Invalid promotion."
        };
      }

      const options =
        this.getPromotionOptions();

      const allowed =
        options.some(
          option =>
            option.id === jobId
        );

      if (!allowed) {
        return {
          success: false,
          reason:
            "Promotion requirements not met."
        };
      }

      const previousJob =
        player.currentJob;

      player.currentJob =
        job.title;

      player.salary =
        job.salary;

      player.currentJobLevel =
        job.level;

      player.career.currentJobId =
        jobId;

      player.career.currentLevel =
        job.level;

      player.career.currentDepartment =
        job.department;

      player.career.performance =
        Math.min(
          100,
          Number(
            player.career.performance || 0
          ) + 5
        );

      player.career.reputation =
        Math.min(
          100,
          Number(
            player.career.reputation || 0
          ) + 5
        );

      player.career.history.push({

        jobId,

        title:
          job.title,

        salary:
          job.salary,

        department:
          job.department,

        level:
          job.level,

        promotion: true,

        from:
          previousJob,

        startDay:
          Game.getState()
            ?.world
            ?.day || 1

      });

      this.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireCareerPromoted",
          {
            detail: {
              player,
              job,
              previousJob
            }
          }
        )
      );

      return {
        success: true,
        job,
        previousJob
      };
    },

    /* ============================================================
       RESIGN
       ============================================================ */

    resign() {

      const player =
        this.ensurePlayer();

      if (!player) {
        return {
          success: false
        };
      }

      const previousJob =
        player.currentJob;

      player.currentJob =
        "Unemployed";

      player.salary =
        0;

      player.currentJobLevel =
        "Entry";

      player.career.currentJobId =
        null;

      player.career.currentDepartment =
        null;

      player.career.currentLevel =
        "Entry";

      player.career.stress =
        Math.max(
          0,
          player.career.stress - 10
        );

      player.career.history.push({

        type:
          "Resignation",

        previousJob,

        day:
          Game.getState()
            ?.world
            ?.day || 1

      });

      this.save();

      window.dispatchEvent(
        new CustomEvent(
          "EmpireCareerResigned",
          {
            detail: {
              player,
              previousJob
            }
          }
        )
      );

      return {
        success: true,
        previousJob
      };
    },

    /* ============================================================
       CAREER SUMMARY
       ============================================================ */

    getSummary() {

      const player =
        this.ensurePlayer();

      if (!player) return null;

      const job =
        player.career.currentJobId
          ? this.jobs[
              player.career.currentJobId
            ]
          : null;

      return {

        currentJob:
          player.currentJob,

        salary:
          Number(
            player.salary || 0
          ),

        department:
          player.career.currentDepartment,

        level:
          player.career.currentLevel,

        experience:
          Number(
            player.experience || 0
          ),

        averageSkill:
          this.getAverageSkill(),

        performance:
          Math.round(
            player.career.performance
          ),

        stress:
          Math.round(
            player.career.stress
          ),

        reputation:
          Math.round(
            player.career.reputation
          ),

        jobDefinition:
          job,

        promotionOptions:
          this.getPromotionOptions(),

        history:
          player.career.history
      };
    }
  };

  /* ============================================================
     EVENTS
     ============================================================ */

  window.addEventListener(
    "EmpireDayAdvanced",
    () => {

      const player =
        Career.ensurePlayer();

      if (!player) return;

      /*
       * Stress slowly recovers on
       * non-working time.
       */

      if (
        !player.career.currentJobId
      ) {
        Career.recover();
      }

    }
  );

  window.addEventListener(
    "EmpireCareerJobAccepted",
    event => {

      const player =
        event.detail?.player;

      if (player) {
        Career.ensurePlayer();
        Career.save();
      }

    }
  );

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireCareer =
    Career;

  Career.ensurePlayer();

  console.log(
    "Empire Rush: Career Progression System loaded."
  );

})();
