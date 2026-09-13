(function () {
  "use strict";

  /*
   * ============================================================
   * EMPIRE RUSH
   * WORLD BUSINESS LIFE SYSTEM
   *
   * Customers
   * Deliveries
   * Business activity
   * NPC movement
   * Ambient city life
   * ============================================================
   */

  function waitForWorld(callback) {

    if (
      window.EmpireWorld &&
      window.THREE
    ) {
      callback();
      return;
    }

    setTimeout(function () {
      waitForWorld(callback);
    }, 250);

  }


  waitForWorld(function () {

    const THREE =
      window.THREE;

    let scene = null;
    let camera = null;
    let renderer = null;

    let worldReady = false;

    const customers = [];
    const deliveryVehicles = [];
    const ambientPeople = [];

    let customerTimer = 0;
    let deliveryTimer = 0;
    let ambientTimer = 0;

    let lastTime =
      performance.now();


    /* ============================================================
       GET THREE WORLD
       ============================================================ */

    function connectWorld() {

      /*
       * world3d.js exposes the
       * world through EmpireWorld.
       */

      if (
        window.EmpireWorld &&
        window.EmpireWorld.scene
      ) {

        scene =
          window.EmpireWorld.scene;

        camera =
          window.EmpireWorld.camera;

        renderer =
          window.EmpireWorld.renderer;

        worldReady =
          !!scene;

        return;

      }


      /*
       * Fallback:
       * find THREE scene objects.
       */

      if (
        window.empireScene
      ) {

        scene =
          window.empireScene;

        camera =
          window.empireCamera;

        renderer =
          window.empireRenderer;

        worldReady =
          !!scene;

      }

    }


    connectWorld();


    if (!worldReady) {

      setTimeout(
        function () {

          connectWorld();

        },
        1000
      );

    }


    /* ============================================================
       UTILITIES
       ============================================================ */

    function random(min, max) {

      return (
        Math.random() *
        (max - min)
      ) + min;

    }


    function randomInt(min, max) {

      return Math.floor(
        random(min, max + 1)
      );

    }


    function distance(
      a,
      b
    ) {

      return a.distanceTo(b);

    }


    function createMaterial(
      color
    ) {

      return new THREE.MeshStandardMaterial({

        color,

        roughness:
          0.75,

        metalness:
          0.05

      });

    }


    /* ============================================================
       CHARACTER
       ============================================================ */

    function createPerson(
      options
    ) {

      const group =
        new THREE.Group();


      const skin =
        createMaterial(
          options.skin ||
          0xf1c7a5
        );


      const shirt =
        createMaterial(
          options.shirt ||
          0x3b6fd8
        );


      const pants =
        createMaterial(
          options.pants ||
          0x26313f
        );


      const body =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            0.55,
            0.9,
            0.32
          ),

          shirt

        );


      body.position.y =
        0.95;


      group.add(
        body
      );


      const head =
        new THREE.Mesh(

          new THREE.SphereGeometry(
            0.22,
            12,
            12
          ),

          skin

        );


      head.position.y =
        1.58;


      group.add(
        head
      );


      const leftLeg =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            0.16,
            0.65,
            0.16
          ),

          pants

        );


      leftLeg.position.set(
        -0.13,
        0.33,
        0
      );


      group.add(
        leftLeg
      );


      const rightLeg =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            0.16,
            0.65,
            0.16
          ),

          pants

        );


      rightLeg.position.set(
        0.13,
        0.33,
        0
      );


      group.add(
        rightLeg
      );


      group.position.set(
        options.x || 0,
        0,
        options.z || 0
      );


      group.userData = {

        type:
          options.type ||
          "npc",

        speed:
          options.speed ||
          random(
            0.7,
            1.3
          ),

        target:
          null,

        state:
          "walking"

      };


      return group;

    }


    /* ============================================================
       FIND GROUND POSITION
       ============================================================ */

    function randomGroundPosition() {

      /*
       * Keep NPCs around the
       * playable HQ/campus area.
       */

      return new THREE.Vector3(

        random(
          -18,
          18
        ),

        0,

        random(
          -14,
          14
        )

      );

    }


    /* ============================================================
       MOVE NPC
       ============================================================ */

    function moveNPC(
      npc,
      delta
    ) {

      if (
        !npc ||
        !npc.userData.target
      ) {
        return;
      }


      const target =
        npc.userData.target;


      const position =
        npc.position;


      const direction =
        new THREE.Vector3()
          .subVectors(
            target,
            position
          );


      direction.y =
        0;


      const length =
        direction.length();


      if (
        length <
        0.25
      ) {

        npc.userData.target =
          null;

        npc.userData.state =
          "idle";

        return;

      }


      direction.normalize();


      const speed =
        npc.userData.speed;


      position.add(
        direction.multiplyScalar(
          speed * delta
        )
      );


      npc.lookAt(
        target.x,
        npc.position.y,
        target.z
      );

    }


    /* ============================================================
       CUSTOMER
       ============================================================ */

    function spawnCustomer() {

      if (!worldReady) {
        return;
      }


      const customer =
        createPerson({

          type:
            "customer",

          shirt:
            [
              0x315ea8,
              0x7d3f98,
              0x2f855a,
              0xb45309,
              0x374151
            ][
              randomInt(
                0,
                4
              )
            ],

          pants:
            0x26313f,

          speed:
            random(
              0.8,
              1.2
            )

        });


      customer.position =
        new THREE.Vector3(

          random(
            -18,
            18
          ),

          0,

          16

        );


      customer.userData.target =
        new THREE.Vector3(

          random(
            -7,
            7
          ),

          0,

          random(
            -5,
            5
          )

        );


      customer.userData.state =
        "entering";


      scene.add(
        customer
      );


      customers.push(
        customer
      );

    }


    /* ============================================================
       CUSTOMER BEHAVIOUR
       ============================================================ */

    function updateCustomer(
      customer,
      delta
    ) {

      const data =
        customer.userData;


      if (
        data.state ===
        "entering"
      ) {

        moveNPC(
          customer,
          delta
        );


        if (
          !data.target
        ) {

          data.state =
            "shopping";


          data.wait =
            random(
              3,
              8
            );

        }


        return;

      }


      if (
        data.state ===
        "shopping"
      ) {

        data.wait -=
          delta;


        if (
          data.wait <=
          0
        ) {

          data.state =
            "leaving";


          data.target =
            new THREE.Vector3(

              random(
                -18,
                18
              ),

              0,

              18

            );

        }


        return;

      }


      if (
        data.state ===
        "leaving"
      ) {

        moveNPC(
          customer,
          delta
        );


        if (
          customer.position.z >
          16
        ) {

          removeCustomer(
            customer
          );

        }

      }

    }


    /* ============================================================
       REMOVE CUSTOMER
       ============================================================ */

    function removeCustomer(
      customer
    ) {

      if (!scene) {
        return;
      }


      scene.remove(
        customer
      );


      const index =
        customers.indexOf(
          customer
        );


      if (
        index >= 0
      ) {

        customers.splice(
          index,
          1
        );

      }

    }


    /* ============================================================
       DELIVERY VEHICLE
       ============================================================ */

    function createDeliveryVehicle() {

      const group =
        new THREE.Group();


      const bodyMaterial =
        createMaterial(
          0xeeeeee
        );


      const darkMaterial =
        createMaterial(
          0x202833
        );


      const body =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            1.7,
            0.7,
            0.9
          ),

          bodyMaterial

        );


      body.position.y =
        0.65;


      group.add(
        body
      );


      const roof =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            0.95,
            0.45,
            0.82
          ),

          bodyMaterial

        );


      roof.position.set(
        0.2,
        1.1,
        0
      );


      group.add(
        roof
      );


      const wheelGeometry =
        new THREE.CylinderGeometry(
          0.22,
          0.22,
          0.16,
          12
        );


      const wheelPositions = [

        [-0.55,0.25,-0.48],
        [0.55,0.25,-0.48],
        [-0.55,0.25,0.48],
        [0.55,0.25,0.48]

      ];


      wheelPositions.forEach(
        function (p) {

          const wheel =
            new THREE.Mesh(

              wheelGeometry,

              darkMaterial

            );


          wheel.rotation.z =
            Math.PI / 2;


          wheel.position.set(
            p[0],
            p[1],
            p[2]
          );


          group.add(
            wheel
          );

        }
      );


      return group;

    }


    /* ============================================================
       SPAWN DELIVERY
       ============================================================ */

    function spawnDelivery() {

      if (!worldReady) {
        return;
      }


      const vehicle =
        createDeliveryVehicle();


      vehicle.position.set(
        -22,
        0,
        random(
          -10,
          10
        )
      );


      vehicle.userData = {

        speed:
          random(
            2,
            3.5
          ),

        target:
          new THREE.Vector3(
            22,
            0,
            random(
              -10,
              10
            )
          )

      };


      scene.add(
        vehicle
      );


      deliveryVehicles.push(
        vehicle
      );

    }


    /* ============================================================
       UPDATE DELIVERY
       ============================================================ */

    function updateDelivery(
      vehicle,
      delta
    ) {

      const data =
        vehicle.userData;


      const direction =
        new THREE.Vector3()
          .subVectors(
            data.target,
            vehicle.position
          );


      direction.y =
        0;


      if (
        direction.length() <
        0.5
      ) {

        scene.remove(
          vehicle
        );


        const index =
          deliveryVehicles.indexOf(
            vehicle
          );


        if (
          index >= 0
        ) {

          deliveryVehicles.splice(
            index,
            1
          );

        }


        return;

      }


      direction.normalize();


      vehicle.position.add(
        direction.multiplyScalar(
          data.speed *
          delta
        )
      );


      vehicle.lookAt(
        data.target.x,
        vehicle.position.y,
        data.target.z
      );

    }


    /* ============================================================
       AMBIENT PEOPLE
       ============================================================ */

    function spawnAmbientPerson() {

      if (!worldReady) {
        return;
      }


      const person =
        createPerson({

          type:
            "ambient",

          shirt:
            [
              0x4b5563,
              0x2563eb,
              0x15803d,
              0x9333ea,
              0xc2410c
            ][
              randomInt(
                0,
                4
              )
            ],

          pants:
            0x1f2937,

          speed:
            random(
              0.6,
              1.0
            )

        });


      person.position =
        randomGroundPosition();


      person.userData.target =
        randomGroundPosition();


      person.userData.state =
        "walking";


      scene.add(
        person
      );


      ambientPeople.push(
        person
      );

    }


    /* ============================================================
       AMBIENT MOVEMENT
       ============================================================ */

    function updateAmbient(
      person,
      delta
    ) {

      const data =
        person.userData;


      if (
        !data.target
      ) {

        data.target =
          randomGroundPosition();

      }


      moveNPC(
        person,
        delta
      );


      if (
        !data.target
      ) {

        data.target =
          randomGroundPosition();

      }

    }


    /* ============================================================
       CLEAN AMBIENT
       ============================================================ */

    function cleanupAmbient() {

      while (
        ambientPeople.length >
        12
      ) {

        const person =
          ambientPeople.shift();


        if (scene) {

          scene.remove(
            person
          );

        }

      }

    }


    /* ============================================================
       WORLD EVENT
       ============================================================ */

    function businessActivityEvent() {

      const event =
        new CustomEvent(
          "EmpireWorldBusinessActivity",
          {

            detail: {

              customers:
                customers.length,

              deliveries:
                deliveryVehicles.length,

              ambientPeople:
                ambientPeople.length,

              timestamp:
                Date.now()

            }

          }
        );


      window.dispatchEvent(
        event
      );

    }


    /* ============================================================
       MAIN UPDATE
       ============================================================ */

    function update(
      now
    ) {

      if (!worldReady) {

        connectWorld();

        return;

      }


      const delta =
        Math.min(
          0.05,
          (now - lastTime) /
          1000
        );


      lastTime =
        now;


      customerTimer +=
        delta;

      deliveryTimer +=
        delta;

      ambientTimer +=
        delta;


      /*
       * Customers.
       */

      if (
        customerTimer >
        random(
          4,
          8
        )
      ) {

        customerTimer =
          0;

        if (
          customers.length <
          8
        ) {

          spawnCustomer();

        }

      }


      /*
       * Deliveries.
       */

      if (
        deliveryTimer >
        12
      ) {

        deliveryTimer =
          0;

        if (
          deliveryVehicles.length <
          3
        ) {

          spawnDelivery();

        }

      }


      /*
       * Ambient city life.
       */

      if (
        ambientTimer >
        3
      ) {

        ambientTimer =
          0;

        if (
          ambientPeople.length <
          12
        ) {

          spawnAmbientPerson();

        }

      }


      customers
        .slice()
        .forEach(
          function (
            customer
          ) {

            updateCustomer(
              customer,
              delta
            );

          }
        );


      deliveryVehicles
        .slice()
        .forEach(
          function (
            vehicle
          ) {

            updateDelivery(
              vehicle,
              delta
            );

          }
        );


      ambientPeople
        .forEach(
          function (
            person
          ) {

            updateAmbient(
              person,
              delta
            );

          }
        );


      cleanupAmbient();


      if (
        Math.random() <
        0.002
      ) {

        businessActivityEvent();

      }

    }


    /* ============================================================
       START LOOP
       ============================================================ */

    function startLoop() {

      lastTime =
        performance.now();


      function loop(
        now
      ) {

        update(now);

        requestAnimationFrame(
          loop
        );

      }


      requestAnimationFrame(
        loop
      );

    }


    /* ============================================================
       PUBLIC API
       ============================================================ */

    window.EmpireWorldLife = {

      spawnCustomer,

      spawnDelivery,

      spawnAmbientPerson,

      getCustomers:
        function () {
          return customers;
        },

      getDeliveries:
        function () {
          return deliveryVehicles;
        },

      getAmbientPeople:
        function () {
          return ambientPeople;
        }

    };


    startLoop();

  });

})();
