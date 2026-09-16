(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH — BUSINESS 3D OPERATIONS
   * ============================================================
   *
   * Business type -> Visible world activity
   *
   * Food
   * Retail
   * Software
   * Manufacturing
   * Services
   * Logistics
   *
   * This is a presentation/activity layer.
   * Core economics remain inside the simulation systems.
   * ============================================================
   */

  const THREE =
    window.THREE ||
    globalThis.THREE;

  if (!THREE) {
    console.warn(
      "Business 3D Operations: THREE not available."
    );
    return;
  }

  const Business3D = {

    scene: null,
    camera: null,
    renderer: null,

    activeCompany: null,

    objects: [],

    customers: [],
    workers: [],
    vehicles: [],

    timers: {
      activity: 0,
      customer: 0,
      vehicle: 0
    },

    /* ==========================================================
       INITIALIZATION
       ========================================================== */

    init() {

      this.connectWorld();

      if (!this.scene) {
        console.warn(
          "Business 3D Operations: world scene not found."
        );
        return;
      }

      this.createActivityLayer();

      this.listen();

      console.log(
        "Empire Rush: Business 3D Operations loaded."
      );
    },

    connectWorld() {

      const world =
        window.EmpireWorld;

      if (world) {

        this.scene =
          world.scene ||
          world.worldScene ||
          null;

        this.camera =
          world.camera ||
          null;

        this.renderer =
          world.renderer ||
          null;
      }

      /*
       * Fallback names used by older world versions.
       */

      if (!this.scene) {
        this.scene =
          window.empireScene ||
          window.gameScene ||
          null;
      }

      if (!this.camera) {
        this.camera =
          window.empireCamera ||
          window.gameCamera ||
          null;
      }

      if (!this.renderer) {
        this.renderer =
          window.empireRenderer ||
          window.gameRenderer ||
          null;
      }
    },

    createActivityLayer() {

      /*
       * Nothing expensive is created here.
       * Objects are spawned only when a company
       * becomes active.
       */

      this.activityGroup =
        new THREE.Group();

      this.activityGroup.name =
        "EmpireBusinessActivity";

      this.scene.add(
        this.activityGroup
      );
    },

    /* ==========================================================
       EVENTS
       ========================================================== */

    listen() {

      window.addEventListener(
        "EmpireBusinessStarted",
        event => {

          const company =
            event.detail?.company;

          if (company) {
            this.setCompany(
              company
            );
          }
        }
      );

      window.addEventListener(
        "EmpireBusinessLaunched",
        event => {

          const company =
            event.detail?.company;

          if (company) {
            this.setCompany(
              company
            );
          }
        }
      );

      window.addEventListener(
        "EmpireDayAdvanced",
        () => {

          if (
            this.activeCompany
          ) {
            this.refreshActivity();
          }
        }
      );
    },

    /* ==========================================================
       COMPANY
       ========================================================== */

    setCompany(company) {

      this.activeCompany =
        company;

      this.clearActivity();

      if (!company) {
        return;
      }

      this.spawnBusinessActivity(
        company
      );
    },

    getBusinessType(company) {

      const text =
        String(
          company?.businessType ||
          company?.type ||
          company?.category ||
          company?.name ||
          ""
        ).toLowerCase();

      if (
        text.includes("restaurant") ||
        text.includes("food") ||
        text.includes("cafe") ||
        text.includes("bakery")
      ) {
        return "food";
      }

      if (
        text.includes("retail") ||
        text.includes("store") ||
        text.includes("shop")
      ) {
        return "retail";
      }

      if (
        text.includes("software") ||
        text.includes("technology") ||
        text.includes("tech") ||
        text.includes("startup")
      ) {
        return "software";
      }

      if (
        text.includes("manufactur") ||
        text.includes("factory") ||
        text.includes("industrial")
      ) {
        return "manufacturing";
      }

      if (
        text.includes("service") ||
        text.includes("freelance") ||
        text.includes("consult")
      ) {
        return "services";
      }

      if (
        text.includes("logistic") ||
        text.includes("delivery") ||
        text.includes("transport")
      ) {
        return "logistics";
      }

      return "office";
    },

    /* ==========================================================
       ACTIVITY
       ========================================================== */

    spawnBusinessActivity(
      company
    ) {

      const type =
        this.getBusinessType(
          company
        );

      switch (type) {

        case "food":
          this.spawnFoodBusiness(
            company
          );
          break;

        case "retail":
          this.spawnRetailBusiness(
            company
          );
          break;

        case "software":
          this.spawnSoftwareBusiness(
            company
          );
          break;

        case "manufacturing":
          this.spawnManufacturingBusiness(
            company
          );
          break;

        case "services":
          this.spawnServicesBusiness(
            company
          );
          break;

        case "logistics":
          this.spawnLogisticsBusiness(
            company
          );
          break;

        default:
          this.spawnOfficeBusiness(
            company
          );
      }
    },

    /* ==========================================================
       FOOD
       ========================================================== */

    spawnFoodBusiness(
      company
    ) {

      this.createBuildingSign(
        "FOOD • " +
        company.name,
        0,
        4,
        0
      );

      for (
        let i = 0;
        i < 4;
        i++
      ) {

        this.spawnWorker(
          -4 + i * 2.5,
          0,
          -2,
          "Kitchen"
        );
      }

      for (
        let i = 0;
        i < 3;
        i++
      ) {

        this.spawnTable(
          -3 + i * 3,
          0,
          3
        );
      }

      this.spawnCustomer(
        6,
        0,
        7,
        "Dining"
      );
    },

    /* ==========================================================
       RETAIL
       ========================================================== */

    spawnRetailBusiness(
      company
    ) {

      this.createBuildingSign(
        "RETAIL • " +
        company.name,
        0,
        4,
        0
      );

      for (
        let i = 0;
        i < 5;
        i++
      ) {

        this.spawnShelf(
          -5 + i * 2.5,
          0,
          2
        );
      }

      for (
        let i = 0;
        i < 3;
        i++
      ) {

        this.spawnWorker(
          -4 + i * 4,
          0,
          -3,
          "Sales"
        );
      }

      for (
        let i = 0;
        i < 3;
        i++
      ) {

        this.spawnCustomer(
          4 + i,
          0,
          6 + i,
          "Shopping"
        );
      }
    },

    /* ==========================================================
       SOFTWARE
       ========================================================== */

    spawnSoftwareBusiness(
      company
    ) {

      this.createBuildingSign(
        "TECH • " +
        company.name,
        0,
        5,
        0
      );

      for (
        let i = 0;
        i < 8;
        i++
      ) {

        this.spawnDeveloper(
          -6 + (i % 4) * 4,
          0,
          -2 + Math.floor(i / 4) * 4
        );
      }

      this.spawnMeetingTable(
        0,
        0,
        6
      );

      this.spawnWorker(
        0,
        0,
        6,
        "Product Manager"
      );
    },

    /* ==========================================================
       MANUFACTURING
       ========================================================== */

    spawnManufacturingBusiness(
      company
    ) {

      this.createBuildingSign(
        "MANUFACTURING • " +
        company.name,
        0,
        5,
        0
      );

      for (
        let i = 0;
        i < 6;
        i++
      ) {

        this.spawnMachine(
          -7 + i * 2.8,
          0,
          0
        );
      }

      for (
        let i = 0;
        i < 5;
        i++
      ) {

        this.spawnWorker(
          -6 + i * 3,
          0,
          4,
          "Production"
        );
      }

      this.spawnDeliveryVehicle(
        10,
        0,
        8
      );
    },

    /* ==========================================================
       SERVICES
       ========================================================== */

    spawnServicesBusiness(
      company
    ) {

      this.createBuildingSign(
        "SERVICES • " +
        company.name,
        0,
        5,
        0
      );

      this.spawnMeetingTable(
        0,
        0,
        3
      );

      for (
        let i = 0;
        i < 4;
        i++
      ) {

        this.spawnWorker(
          -5 + i * 3,
          0,
          -2,
          "Consultant"
        );
      }

      this.spawnCustomer(
        7,
        0,
        5,
        "Client"
      );
    },

    /* ==========================================================
       LOGISTICS
       ========================================================== */

    spawnLogisticsBusiness(
      company
    ) {

      this.createBuildingSign(
        "LOGISTICS • " +
        company.name,
        0,
        5,
        0
      );

      for (
        let i = 0;
        i < 4;
        i++
      ) {

        this.spawnWorker(
          -5 + i * 3,
          0,
          -2,
          "Logistics"
        );
      }

      for (
        let i = 0;
        i < 3;
        i++
      ) {

        this.spawnDeliveryVehicle(
          -4 + i * 5,
          0,
          6
        );
      }
    },

    /* ==========================================================
       GENERIC OFFICE
       ========================================================== */

    spawnOfficeBusiness(
      company
    ) {

      this.createBuildingSign(
        "COMPANY • " +
        company.name,
        0,
        5,
        0
      );

      for (
        let i = 0;
        i < 6;
        i++
      ) {

        this.spawnWorker(
          -6 + (i % 3) * 5,
          0,
          -2 + Math.floor(i / 3) * 4,
          "Office"
        );
      }

      this.spawnMeetingTable(
        0,
        0,
        6
      );
    },

    /* ==========================================================
       3D OBJECT HELPERS
       ========================================================== */

    addObject(
      object
    ) {

      if (!object) return;

      this.activityGroup.add(
        object
      );

      this.objects.push(
        object
      );

      return object;
    },

    createMaterial(
      color
    ) {

      return new THREE.MeshStandardMaterial({
        color
      });
    },

    createBox(
      width,
      height,
      depth,
      color
    ) {

      const mesh =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            width,
            height,
            depth
          ),
          this.createMaterial(
            color
          )
        );

      return mesh;
    },

    /* ==========================================================
       SIGN
       ========================================================== */

    createBuildingSign(
      text,
      x,
      y,
      z
    ) {

      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width = 512;
      canvas.height = 128;

      const ctx =
        canvas.getContext("2d");

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.fillStyle =
        "rgba(10,10,10,0.88)";

      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        "bold 34px Arial";

      ctx.textAlign =
        "center";

      ctx.textBaseline =
        "middle";

      ctx.fillText(
        String(text).slice(0, 28),
        256,
        64
      );

      const texture =
        new THREE.CanvasTexture(
          canvas
        );

      const material =
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true
        });

      const sign =
        new THREE.Mesh(
          new THREE.PlaneGeometry(
            8,
            2
          ),
          material
        );

      sign.position.set(
        x,
        y,
        z
      );

      this.addObject(
        sign
      );

      return sign;
    },

    /* ==========================================================
       WORKER
       ========================================================== */

    spawnWorker(
      x,
      y,
      z,
      role
    ) {

      const group =
        new THREE.Group();

      group.position.set(
        x,
        y,
        z
      );

      const body =
        this.createBox(
          0.7,
          1.2,
          0.45,
          0x4f6d8a
        );

      body.position.y =
        1.0;

      group.add(body);

      const head =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.28,
            12,
            12
          ),
          this.createMaterial(
            0xd6a47a
          )
        );

      head.position.y =
        1.85;

      group.add(head);

      group.userData.role =
        role;

      group.userData.home =
        new THREE.Vector3(
          x,
          y,
          z
        );

      group.userData.target =
        group.userData.home.clone();

      group.userData.speed =
        0.015 +
        Math.random() * 0.015;

      this.addObject(
        group
      );

      this.workers.push(
        group
      );

      return group;
    },

    /* ==========================================================
       DEVELOPER
       ========================================================== */

    spawnDeveloper(
      x,
      y,
      z
    ) {

      const worker =
        this.spawnWorker(
          x,
          y,
          z,
          "Developer"
        );

      const monitor =
        this.createBox(
          1.1,
          0.7,
          0.08,
          0x111111
        );

      monitor.position.set(
        0,
        1.15,
        -0.35
      );

      worker.add(
        monitor
      );

      return worker;
    },

    /* ==========================================================
       CUSTOMER
       ========================================================== */

    spawnCustomer(
      x,
      y,
      z,
      state
    ) {

      const group =
        new THREE.Group();

      group.position.set(
        x,
        y,
        z
      );

      const body =
        this.createBox(
          0.6,
          1.05,
          0.4,
          0x6d5a8d
        );

      body.position.y =
        0.9;

      group.add(body);

      const head =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.25,
            12,
            12
          ),
          this.createMaterial(
            0xd1a078
          )
        );

      head.position.y =
        1.65;

      group.add(head);

      group.userData.state =
        state;

      group.userData.target =
        new THREE.Vector3(
          x + (
            Math.random() * 6 - 3
          ),
          y,
          z + (
            Math.random() * 6 - 3
          )
        );

      group.userData.speed =
        0.018 +
        Math.random() * 0.018;

      this.addObject(
        group
      );

      this.customers.push(
        group
      );

      return group;
    },

    /* ==========================================================
       TABLE
       ========================================================== */

    spawnTable(
      x,
      y,
      z
    ) {

      const table =
        this.createBox(
          2,
          0.25,
          1.2,
          0x754f32
        );

      table.position.set(
        x,
        y + 1,
        z
      );

      this.addObject(
        table
      );

      for (
        let i = 0;
        i < 2;
        i++
      ) {

        const chair =
          this.createBox(
            0.5,
            0.7,
            0.5,
            0x333333
          );

        chair.position.set(
          x - 1.4 + i * 2.8,
          y + 0.4,
          z
        );

        this.addObject(
          chair
        );
      }
    },

    /* ==========================================================
       SHELF
       ========================================================== */

    spawnShelf(
      x,
      y,
      z
    ) {

      const shelf =
        this.createBox(
          1.5,
          2.5,
          0.5,
          0x555555
        );

      shelf.position.set(
        x,
        y + 1.25,
        z
      );

      this.addObject(
        shelf
      );

      for (
        let i = 0;
        i < 3;
        i++
      ) {

        const product =
          this.createBox(
            0.35,
            0.35,
            0.35,
            0xd8a44a
          );

        product.position.set(
          x - 0.5 +
            Math.random(),
          y + 0.5 +
            i * 0.65,
          z - 0.3
        );

        this.addObject(
          product
        );
      }
    },

    /* ==========================================================
       MACHINE
       ========================================================== */

    spawnMachine(
      x,
      y,
      z
    ) {

      const machine =
        this.createBox(
          2,
          1.8,
          2,
          0x555b61
        );

      machine.position.set(
        x,
        y + 0.9,
        z
      );

      machine.userData.machine =
        true;

      this.addObject(
        machine
      );

      return machine;
    },

    /* ==========================================================
       MEETING TABLE
       ========================================================== */

    spawnMeetingTable(
      x,
      y,
      z
    ) {

      const table =
        this.createBox(
          5,
          0.25,
          2.5,
          0x5c4635
        );

      table.position.set(
        x,
        y + 1,
        z
      );

      this.addObject(
        table
      );

      for (
        let i = 0;
        i < 6;
        i++
      ) {

        const angle =
          (
            Math.PI * 2 *
            i
          ) / 6;

        const chair =
          this.createBox(
            0.5,
            0.7,
            0.5,
            0x333333
          );

        chair.position.set(
          x +
            Math.cos(angle) * 3,
          y + 0.4,
          z +
            Math.sin(angle) * 2
        );

        this.addObject(
          chair
        );
      }
    },

    /* ==========================================================
       DELIVERY VEHICLE
       ========================================================== */

    spawnDeliveryVehicle(
      x,
      y,
      z
    ) {

      const vehicle =
        new THREE.Group();

      vehicle.position.set(
        x,
        y,
        z
      );

      const body =
        this.createBox(
          2.8,
          0.9,
          1.5,
          0xe8e8e8
        );

      body.position.y =
        0.75;

      vehicle.add(body);

      const cabin =
        this.createBox(
          1.1,
          1,
          1.4,
          0xbfc7ce
        );

      cabin.position.set(
        0.8,
        1.25,
        0
      );

      vehicle.add(cabin);

      vehicle.userData.target =
        new THREE.Vector3(
          x > 0 ? -12 : 12,
          y,
          z
        );

      vehicle.userData.speed =
        0.035;

      this.addObject(
        vehicle
      );

      this.vehicles.push(
        vehicle
      );

      return vehicle;
    },

    /* ==========================================================
       UPDATE
       ========================================================== */

    update(
      delta
    ) {

      if (!this.activityGroup) {
        return;
      }

      this.updateWorkers(
        delta
      );

      this.updateCustomers(
        delta
      );

      this.updateVehicles(
        delta
      );

      this.timers.activity +=
        delta;

      if (
        this.timers.activity >
        8
      ) {

        this.timers.activity =
          0;

        this.randomizeWorkerTargets();

      }
    },

    /* ==========================================================
       WORKER MOVEMENT
       ========================================================== */

    updateWorkers(
      delta
    ) {

      this.workers.forEach(
        worker => {

          const target =
            worker.userData.target;

          if (!target) return;

          const dx =
            target.x -
            worker.position.x;

          const dz =
            target.z -
            worker.position.z;

          const distance =
            Math.sqrt(
              dx * dx +
              dz * dz
            );

          if (
            distance < 0.15
          ) {
            return;
          }

          const speed =
            worker.userData.speed ||
            0.02;

          worker.position.x +=
            (
              dx / distance
            ) *
            speed *
            delta *
            60;

          worker.position.z +=
            (
              dz / distance
            ) *
            speed *
            delta *
            60;

          worker.rotation.y =
            Math.atan2(
              dx,
              dz
            );
        }
      );
    },

    /* ==========================================================
       CUSTOMER MOVEMENT
       ========================================================== */

    updateCustomers(
      delta
    ) {

      this.customers.forEach(
        customer => {

          const target =
            customer.userData.target;

          if (!target) return;

          const dx =
            target.x -
            customer.position.x;

          const dz =
            target.z -
            customer.position.z;

          const distance =
            Math.sqrt(
              dx * dx +
              dz * dz
            );

          if (
            distance < 0.2
          ) {

            customer.userData.target =
              new THREE.Vector3(
                customer.position.x +
                  Math.random() * 8 - 4,
                0,
                customer.position.z +
                  Math.random() * 8 - 4
              );

            return;
          }

          const speed =
            customer.userData.speed ||
            0.02;

          customer.position.x +=
            (
              dx / distance
            ) *
            speed *
            delta *
            60;

          customer.position.z +=
            (
              dz / distance
            ) *
            speed *
            delta *
            60;

          customer.rotation.y =
            Math.atan2(
              dx,
              dz
            );
        }
      );
    },

    /* ==========================================================
       VEHICLE MOVEMENT
       ========================================================== */

    updateVehicles(
      delta
    ) {

      this.vehicles.forEach(
        vehicle => {

          const target =
            vehicle.userData.target;

          if (!target) return;

          const dx =
            target.x -
            vehicle.position.x;

          const distance =
            Math.abs(dx);

          if (
            distance < 0.5
          ) {

            vehicle.position.x =
              -vehicle.position.x;

            vehicle.userData.target.x =
              -vehicle.userData.target.x;

            return;
          }

          const direction =
            dx > 0
              ? 1
              : -1;

          vehicle.position.x +=
            direction *
            (
              vehicle.userData.speed ||
              0.03
            ) *
            delta *
            60;
        }
      );
    },

    /* ==========================================================
       RANDOM WORK TARGETS
       ========================================================== */

    randomizeWorkerTargets() {

      this.workers.forEach(
        worker => {

          const home =
            worker.userData.home;

          if (!home) return;

          worker.userData.target =
            new THREE.Vector3(
              home.x +
                Math.random() * 5 - 2.5,
              home.y,
              home.z +
                Math.random() * 5 - 2.5
            );
        }
      );
    },

    /* ==========================================================
       REFRESH
       ========================================================== */

    refreshActivity() {

      if (
        !this.activeCompany
      ) {
        return;
      }

      /*
       * Keep existing world objects
       * and only adjust activity.
       */

      this.randomizeWorkerTargets();

      this.customers.forEach(
        customer => {

          customer.userData.target =
            new THREE.Vector3(
              customer.position.x +
                Math.random() * 6 - 3,
              0,
              customer.position.z +
                Math.random() * 6 - 3
            );

        }
      );
    },

    /* ==========================================================
       CLEAR
       ========================================================== */

    clearActivity() {

      this.customers = [];
      this.workers = [];
      this.vehicles = [];

      this.objects.forEach(
        object => {

          if (
            object.parent
          ) {
            object.parent.remove(
              object
            );
          }

          object.traverse?.(
            child => {

              if (
                child.geometry
              ) {
                child.geometry.dispose();
              }

              if (
                child.material
              ) {

                if (
                  Array.isArray(
                    child.material
                  )
                ) {

                  child.material
                    .forEach(
                      material =>
                        material.dispose()
                    );

                } else {

                  child.material.dispose();

                }
              }

            }
          );

        }
      );

      this.objects = [];
    },

    /* ==========================================================
       PUBLIC SUMMARY
       ========================================================== */

    getSummary() {

      return {

        company:
          this.activeCompany?.name ||
          null,

        businessType:
          this.activeCompany
            ? this.getBusinessType(
                this.activeCompany
              )
            : null,

        customers:
          this.customers.length,

        workers:
          this.workers.length,

        vehicles:
          this.vehicles.length

      };
    }
  };

  /* ============================================================
     ANIMATION HOOK
     ============================================================ */

  function animationLoop() {

    const now =
      performance.now();

    const previous =
      Business3D._lastTime ||
      now;

    const delta =
      Math.min(
        0.1,
        (
          now -
          previous
        ) / 1000
      );

    Business3D._lastTime =
      now;

    Business3D.update(
      delta
    );

    requestAnimationFrame(
      animationLoop
    );
  }

  /* ============================================================
     INIT
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

    Business3D.init();

    animationLoop();
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireBusiness3D =
    Business3D;

  boot();

})();
