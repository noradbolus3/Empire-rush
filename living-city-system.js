(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH — LIVING CITY SYSTEM
   * ============================================================
   *
   * Population
   * Pedestrians
   * Traffic
   * Commercial vehicles
   * Daily routines
   * Business-area activity
   * Day / night behavior
   * Weather effects
   *
   * ============================================================
   */

  const THREE =
    window.THREE ||
    globalThis.THREE;

  const Game =
    window.EmpireGameState;

  if (!THREE) {
    console.warn(
      "Living City: THREE not available."
    );
    return;
  }

  const City = {

    scene: null,
    group: null,

    pedestrians: [],
    vehicles: [],
    buildings: [],

    population: 12500,

    traffic: {
      density: 0.55,
      speed: 1,
      congestion: 0.10
    },

    activity: {
      residential: 0.5,
      commercial: 0.5,
      industrial: 0.4,
      office: 0.5
    },

    time: {
      hour: 8,
      day: 1
    },

    weather: "Clear",

    initialized: false,

    /* ==========================================================
       INIT
       ========================================================== */

    init() {

      this.connectWorld();

      if (!this.scene) {

        console.warn(
          "Living City: scene not found. Retrying..."
        );

        setTimeout(
          () => this.init(),
          1000
        );

        return;
      }

      if (this.initialized) {
        return;
      }

      this.group =
        new THREE.Group();

      this.group.name =
        "EmpireLivingCity";

      this.scene.add(
        this.group
      );

      this.createRoadNetwork();

      this.createCityBuildings();

      this.spawnInitialPopulation();

      this.spawnInitialTraffic();

      this.listen();

      this.initialized = true;

      console.log(
        "Empire Rush: Living City System loaded."
      );
    },

    /* ==========================================================
       WORLD CONNECTION
       ========================================================== */

    connectWorld() {

      const world =
        window.EmpireWorld;

      if (world) {

        this.scene =
          world.scene ||
          world.worldScene ||
          null;

      }

      if (!this.scene) {

        this.scene =
          window.empireScene ||
          window.gameScene ||
          null;

      }
    },

    /* ==========================================================
       MATERIALS
       ========================================================== */

    material(color) {

      return new THREE.MeshStandardMaterial({
        color
      });

    },

    /* ==========================================================
       OBJECT
       ========================================================== */

    add(object) {

      if (!object) return;

      this.group.add(
        object
      );

      return object;
    },

    /* ==========================================================
       ROAD NETWORK
       ========================================================== */

    createRoadNetwork() {

      const roadMaterial =
        this.material(
          0x303238
        );

      const road1 =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            90,
            0.08,
            7
          ),
          roadMaterial
        );

      road1.position.set(
        0,
        0.04,
        18
      );

      this.add(
        road1
      );

      const road2 =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            7,
            0.08,
            90
          ),
          roadMaterial
        );

      road2.position.set(
        18,
        0.05,
        0
      );

      this.add(
        road2
      );

      /*
       * Smaller side roads.
       */

      [-35, -10, 35].forEach(
        z => {

          const road =
            new THREE.Mesh(
              new THREE.BoxGeometry(
                70,
                0.06,
                4
              ),
              roadMaterial
            );

          road.position.set(
            0,
            0.05,
            z
          );

          this.add(
            road
          );

        }
      );

      [-35, -10, 35].forEach(
        x => {

          const road =
            new THREE.Mesh(
              new THREE.BoxGeometry(
                4,
                0.06,
                70
              ),
              roadMaterial
            );

          road.position.set(
            x,
            0.05,
            0
          );

          this.add(
            road
          );

        }
      );
    },

    /* ==========================================================
       CITY BUILDINGS
       ========================================================== */

    createCityBuildings() {

      const zones = [

        {
          type: "residential",
          color: 0x8d8172,
          count: 18,
          minHeight: 3,
          maxHeight: 7
        },

        {
          type: "commercial",
          color: 0x65788a,
          count: 12,
          minHeight: 5,
          maxHeight: 11
        },

        {
          type: "office",
          color: 0x586878,
          count: 8,
          minHeight: 8,
          maxHeight: 16
        },

        {
          type: "industrial",
          color: 0x6d6a62,
          count: 8,
          minHeight: 4,
          maxHeight: 9
        }

      ];

      zones.forEach(
        zone => {

          for (
            let i = 0;
            i < zone.count;
            i++
          ) {

            const x =
              Math.round(
                Math.random() * 80 - 40
              );

            const z =
              Math.round(
                Math.random() * 80 - 40
              );

            /*
             * Keep central road area relatively clear.
             */

            if (
              Math.abs(x) < 8 &&
              Math.abs(z) < 8
            ) {
              continue;
            }

            const height =
              zone.minHeight +
              Math.random() *
              (
                zone.maxHeight -
                zone.minHeight
              );

            const width =
              3 +
              Math.random() * 4;

            const depth =
              3 +
              Math.random() * 4;

            const building =
              new THREE.Mesh(
                new THREE.BoxGeometry(
                  width,
                  height,
                  depth
                ),
                this.material(
                  zone.color
                )
              );

            building.position.set(
              x,
              height / 2,
              z
            );

            building.userData.zone =
              zone.type;

            this.add(
              building
            );

            this.buildings.push(
              building
            );
          }

        }
      );
    },

    /* ==========================================================
       PERSON CREATION
       ========================================================== */

    createPerson() {

      const person =
        new THREE.Group();

      const body =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.45,
            0.9,
            0.3
          ),
          this.material(
            0x4b6378 +
            Math.floor(
              Math.random() * 5
            )
          )
        );

      body.position.y =
        0.7;

      person.add(
        body
      );

      const head =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.18,
            10,
            10
          ),
          this.material(
            0xc9946e
          )
        );

      head.position.y =
        1.35;

      person.add(
        head
      );

      person.userData.speed =
        0.015 +
        Math.random() * 0.025;

      person.userData.state =
        "walking";

      person.userData.target =
        new THREE.Vector3();

      person.userData.home =
        new THREE.Vector3();

      person.userData.work =
        new THREE.Vector3();

      person.userData.destination =
        "home";

      person.userData.role =
        Math.random();

      this.add(
        person
      );

      return person;
    },

    /* ==========================================================
       POPULATION
       ========================================================== */

    spawnInitialPopulation() {

      const count =
        35;

      for (
        let i = 0;
        i < count;
        i++
      ) {

        const person =
          this.createPerson();

        const home =
          this.randomCityPoint(
            "residential"
          );

        const work =
          this.randomCityPoint(
            Math.random() < 0.6
              ? "commercial"
              : "office"
          );

        person.position.copy(
          home
        );

        person.userData.home =
          home.clone();

        person.userData.work =
          work.clone();

        person.userData.target =
          home.clone();

        this.pedestrians.push(
          person
        );
      }
    },

    /* ==========================================================
       CITY POINT
       ========================================================== */

    randomCityPoint(
      preferredZone
    ) {

      const candidates =
        this.buildings.filter(
          building =>
            building.userData.zone ===
            preferredZone
        );

      if (
        candidates.length
      ) {

        const building =
          candidates[
            Math.floor(
              Math.random() *
              candidates.length
            )
          ];

        return new THREE.Vector3(
          building.position.x +
            Math.random() * 3 - 1.5,
          0,
          building.position.z +
            Math.random() * 3 - 1.5
        );

      }

      return new THREE.Vector3(
        Math.random() * 70 - 35,
        0,
        Math.random() * 70 - 35
      );
    },

    /* ==========================================================
       VEHICLE
       ========================================================== */

    createVehicle(
      type
    ) {

      const vehicle =
        new THREE.Group();

      const color =
        type === "delivery"
          ? 0xd6d6d6
          : 0x454c55;

      const body =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            2,
            0.65,
            1
          ),
          this.material(
            color
          )
        );

      body.position.y =
        0.55;

      vehicle.add(
        body
      );

      const cabin =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.9,
            0.6,
            0.9
          ),
          this.material(
            0x69747d
          )
        );

      cabin.position.set(
        0.45,
        0.95,
        0
      );

      vehicle.add(
        cabin
      );

      vehicle.userData.type =
        type;

      vehicle.userData.speed =
        0.04 +
        Math.random() * 0.035;

      vehicle.userData.direction =
        Math.random() > 0.5
          ? 1
          : -1;

      vehicle.userData.axis =
        Math.random() > 0.5
          ? "x"
          : "z";

      this.add(
        vehicle
      );

      return vehicle;
    },

    /* ==========================================================
       TRAFFIC
       ========================================================== */

    spawnInitialTraffic() {

      const normalCars =
        Math.round(
          10 *
          this.traffic.density
        );

      for (
        let i = 0;
        i < normalCars;
        i++
      ) {

        const vehicle =
          this.createVehicle(
            "car"
          );

        if (
          vehicle.userData.axis ===
          "x"
        ) {

          vehicle.position.set(
            Math.random() * 70 - 35,
            0,
            18
          );

        } else {

          vehicle.position.set(
            18,
            0,
            Math.random() * 70 - 35
          );

        }

        this.vehicles.push(
          vehicle
        );
      }

      /*
       * Commercial vehicles.
       */

      for (
        let i = 0;
        i < 3;
        i++
      ) {

        const van =
          this.createVehicle(
            "delivery"
          );

        van.position.set(
          Math.random() * 50 - 25,
          0,
          18
        );

        this.vehicles.push(
          van
        );
      }
    },

    /* ==========================================================
       UPDATE PEOPLE
       ========================================================== */

    updatePeople(
      delta
    ) {

      const hour =
        this.time.hour;

      this.pedestrians.forEach(
        person => {

          /*
           * Morning:
           * Home -> Work
           */

          if (
            hour >= 7 &&
            hour < 10
          ) {

            person.userData.destination =
              "work";

            person.userData.target =
              person.userData.work;

          }

          /*
           * Working hours:
           */

          else if (
            hour >= 10 &&
            hour < 17
          ) {

            person.userData.destination =
              "work";

            /*
             * Small movement around
             * workplace.
             */

            if (
              Math.random() < 0.002
            ) {

              person.userData.target =
                person.userData.work.clone();

              person.userData.target.x +=
                Math.random() * 6 - 3;

              person.userData.target.z +=
                Math.random() * 6 - 3;
            }

          }

          /*
           * Evening:
           * Work -> Commercial
           */

          else if (
            hour >= 17 &&
            hour < 21
          ) {

            person.userData.destination =
              "shopping";

            if (
              person.userData.destinationPoint
              === undefined
            ) {

              person.userData.destinationPoint =
                this.randomCityPoint(
                  "commercial"
                );

            }

            person.userData.target =
              person.userData.destinationPoint;

          }

          /*
           * Night:
           * Return home.
           */

          else {

            person.userData.destination =
              "home";

            person.userData.target =
              person.userData.home;

          }

          this.movePerson(
            person,
            delta
          );

        }
      );
    },

    /* ==========================================================
       PERSON MOVEMENT
       ========================================================== */

    movePerson(
      person,
      delta
    ) {

      const target =
        person.userData.target;

      if (!target) return;

      const dx =
        target.x -
        person.position.x;

      const dz =
        target.z -
        person.position.z;

      const distance =
        Math.sqrt(
          dx * dx +
          dz * dz
        );

      if (
        distance < 0.25
      ) {

        /*
         * Choose another destination
         * after reaching the current one.
         */

        if (
          person.userData.destination ===
          "shopping"
        ) {

          person.userData.destinationPoint =
            this.randomCityPoint(
              "commercial"
            );

        }

        return;
      }

      const speed =
        person.userData.speed *
        this.traffic.speed;

      person.position.x +=
        (
          dx / distance
        ) *
        speed *
        delta *
        60;

      person.position.z +=
        (
          dz / distance
        ) *
        speed *
        delta *
        60;

      person.rotation.y =
        Math.atan2(
          dx,
          dz
        );
    },

    /* ==========================================================
       TRAFFIC UPDATE
       ========================================================== */

    updateTraffic(
      delta
    ) {

      this.vehicles.forEach(
        vehicle => {

          const speed =
            vehicle.userData.speed *
            this.traffic.speed;

          if (
            vehicle.userData.axis ===
            "x"
          ) {

            vehicle.position.x +=
              speed *
              vehicle.userData.direction *
              delta *
              60;

            if (
              vehicle.position.x >
              42
            ) {
              vehicle.position.x =
                -42;
            }

            if (
              vehicle.position.x <
              -42
            ) {
              vehicle.position.x =
                42;
            }

          } else {

            vehicle.position.z +=
              speed *
              vehicle.userData.direction *
              delta *
              60;

            if (
              vehicle.position.z >
              42
            ) {
              vehicle.position.z =
                -42;
            }

            if (
              vehicle.position.z <
              -42
            ) {
              vehicle.position.z =
                42;
            }

          }

        }
      );
    },

    /* ==========================================================
       TIME
       ========================================================== */

    updateTime() {

      if (!Game) {
        return;
      }

      const state =
        Game.getState();

      if (!state?.world) {
        return;
      }

      this.time.day =
        Number(
          state.world.day || 1
        );

      /*
       * Use simulation time if
       * available, otherwise derive
       * a moving city clock.
       */

      if (
        typeof state.world.timeOfDay ===
        "number"
      ) {

        this.time.hour =
          state.world.timeOfDay;

      } else {

        this.time.hour =
          (
            this.time.hour +
            0.02
          ) % 24;

      }

      this.updateActivityLevels();
    },

    /* ==========================================================
       ACTIVITY LEVELS
       ========================================================== */

    updateActivityLevels() {

      const hour =
        this.time.hour;

      if (
        hour >= 7 &&
        hour < 10
      ) {

        this.activity.residential =
          0.25;

        this.activity.office =
          0.80;

        this.activity.commercial =
          0.50;

        this.activity.industrial =
          0.70;

      } else if (
        hour >= 10 &&
        hour < 17
      ) {

        this.activity.residential =
          0.40;

        this.activity.office =
          0.95;

        this.activity.commercial =
          0.75;

        this.activity.industrial =
          0.90;

      } else if (
        hour >= 17 &&
        hour < 21
      ) {

        this.activity.residential =
          0.70;

        this.activity.office =
          0.40;

        this.activity.commercial =
          0.95;

        this.activity.industrial =
          0.50;

      } else {

        this.activity.residential =
          0.95;

        this.activity.office =
          0.15;

        this.activity.commercial =
          0.35;

        this.activity.industrial =
          0.20;
      }
    },

    /* ==========================================================
       WEATHER
       ========================================================== */

    setWeather(
      weather
    ) {

      this.weather =
        weather || "Clear";

      switch (
        this.weather
      ) {

        case "Rain":
          this.traffic.speed =
            0.70;
          break;

        case "Storm":
          this.traffic.speed =
            0.45;
          break;

        case "Heatwave":
          this.traffic.speed =
            0.85;
          break;

        default:
          this.traffic.speed =
            1;
      }

      window.dispatchEvent(
        new CustomEvent(
          "EmpireCityWeatherChanged",
          {
            detail: {
              weather:
                this.weather
            }
          }
        )
      );
    },

    /* ==========================================================
       MARKET ACTIVITY
       ========================================================== */

    getCommercialActivity() {

      return Number(
        this.activity.commercial
          .toFixed(2)
      );
    },

    getIndustrialActivity() {

      return Number(
        this.activity.industrial
          .toFixed(2)
      );
    },

    getOfficeActivity() {

      return Number(
        this.activity.office
          .toFixed(2)
      );
    },

    /* ==========================================================
       DAY ADVANCE
       ========================================================== */

    onDayAdvanced() {

      this.time.day++;

      /*
       * Population growth is slow.
       */

      if (
        Math.random() < 0.15
      ) {

        this.population +=
          Math.floor(
            Math.random() * 15
          );

      }

      /*
       * Traffic changes with
       * economic activity.
       */

      const economy =
        window.EmpireMarketEvents
          ?.getSummary?.();

      if (economy) {

        const demand =
          Number(
            economy.demandIndex || 1
          );

        this.traffic.density =
          Math.max(
            0.25,
            Math.min(
              1,
              demand * 0.55
            )
          );
      }
    },

    /* ==========================================================
       EVENTS
       ========================================================== */

    listen() {

      window.addEventListener(
        "EmpireDayAdvanced",
        () => {

          this.updateTime();

          this.onDayAdvanced();

        }
      );

      window.addEventListener(
        "EmpireWeatherChanged",
        event => {

          this.setWeather(
            event.detail?.weather
          );

        }
      );
    },

    /* ==========================================================
       UPDATE
       ========================================================== */

    update(
      delta
    ) {

      if (!this.initialized) {
        return;
      }

      this.updateTime();

      this.updatePeople(
        delta
      );

      this.updateTraffic(
        delta
      );
    },

    /* ==========================================================
       SUMMARY
       ========================================================== */

    getSummary() {

      return {

        population:
          this.population,

        hour:
          Number(
            this.time.hour.toFixed(1)
          ),

        day:
          this.time.day,

        weather:
          this.weather,

        pedestrians:
          this.pedestrians.length,

        vehicles:
          this.vehicles.length,

        trafficDensity:
          Number(
            this.traffic.density
              .toFixed(2)
          ),

        commercialActivity:
          this.getCommercialActivity(),

        officeActivity:
          this.getOfficeActivity(),

        industrialActivity:
          this.getIndustrialActivity()

      };
    }
  };

  /* ============================================================
     ANIMATION
     ============================================================ */

  let previous =
    performance.now();

  function loop() {

    const now =
      performance.now();

    const delta =
      Math.min(
        0.1,
        (
          now -
          previous
        ) / 1000
      );

    previous =
      now;

    City.update(
      delta
    );

    requestAnimationFrame(
      loop
    );
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireLivingCity =
    City;

  /* ============================================================
     BOOT
     ============================================================ */

  function boot() {

    if (
      !window.EmpireWorld
    ) {

      setTimeout(
        boot,
        500
      );

      return;
    }

    City.init();

    loop();
  }

  boot();

})();
