(function () {
  "use strict";

  /*
   * EMPIRE RUSH — LIVING CITY SYSTEM
   * ---------------------------------
   * Dedicated city visual layer.
   *
   * Responsibilities:
   * - Roads
   * - Intersections
   * - Sidewalks
   * - Traffic
   * - Cars
   * - Buildings
   * - Shops
   * - Parks
   * - Trees
   * - Street lights
   * - Pedestrians
   *
   * Does NOT own:
   * - Game economy
   * - Employees
   * - Company accounting
   * - Career
   * - Business logic
   *
   * Requires:
   * window.EmpireWorld
   */

  let WORLD = null;
  let THREE = null;
  let scene = null;

  let cityRoot = null;
  let trafficRoot = null;
  let pedestrianRoot = null;

  let started = false;
  let animationStarted = false;

  const CITY = {
    size: 300,
    roadWidth: 13,
    sidewalkWidth: 3,
    blockSize: 48,

    roadXs: [-120, -60, 0, 60, 120],
    roadZs: [-120, -60, 0, 60, 120],

    buildingColors: [
      0x8fa7b8,
      0xb6c3ca,
      0x7893a6,
      0xd0b28b,
      0x9c8da3,
      0x6e8999,
      0xc5a77d,
      0x849d8b
    ],

    glassColors: [
      0x75a9c7,
      0x6e9eb8,
      0x9cc8d9
    ],

    carColors: [
      0xe74c3c,
      0x3498db,
      0xf1c40f,
      0x2ecc71,
      0x9b59b6,
      0xe67e22,
      0xecf0f1,
      0x34495e
    ]
  };

  const cars = [];
  const pedestrians = [];

  /* ---------------------------------------------------------
     HELPERS
  --------------------------------------------------------- */

  function getWorld() {
    return window.EmpireWorld || null;
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function removeOldCity() {
    if (!scene) return;

    const oldNames = [
      "EmpireRushLivingCity",
      "EmpireLivingCity",
      "LivingCity",
      "LivingCityRoot"
    ];

    oldNames.forEach(function (name) {
      const old = scene.getObjectByName(name);
      if (old && old.parent) {
        old.parent.remove(old);
      }
    });
  }

  function makeMaterial(color, roughness) {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: roughness == null ? 0.72 : roughness,
      metalness: 0.05
    });
  }

  function box(w, h, d, color, x, y, z, parent) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      makeMaterial(color)
    );

    mesh.position.set(x || 0, (y || 0) + h / 2, z || 0);

    if (parent) parent.add(mesh);
    return mesh;
  }

  function cylinder(radius, height, color, x, y, z, parent, segments) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radius,
        radius,
        height,
        segments || 12
      ),
      makeMaterial(color)
    );

    mesh.position.set(x || 0, (y || 0) + height / 2, z || 0);

    if (parent) parent.add(mesh);
    return mesh;
  }

  function sphere(radius, color, x, y, z, parent) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 14, 10),
      makeMaterial(color)
    );

    mesh.position.set(x || 0, (y || 0) + radius, z || 0);

    if (parent) parent.add(mesh);
    return mesh;
  }

  /* ---------------------------------------------------------
     GROUND
  --------------------------------------------------------- */

  function createGround() {
    const ground = box(
      CITY.size,
      0.35,
      CITY.size,
      0x789b67,
      0,
      -0.35,
      0,
      cityRoot
    );

    ground.name = "CityGround";
  }

  /* ---------------------------------------------------------
     ROADS
  --------------------------------------------------------- */

  function createRoadNetwork() {
    const roadMat = makeMaterial(0x252a31, 0.9);
    const sidewalkMat = makeMaterial(0xb8b8b2, 0.95);
    const curbMat = makeMaterial(0x8d8f91, 0.95);

    CITY.roadXs.forEach(function (x) {
      const road = new THREE.Mesh(
        new THREE.BoxGeometry(
          CITY.roadWidth,
          0.18,
          CITY.size
        ),
        roadMat
      );

      road.position.set(x, 0.04, 0);
      cityRoot.add(road);

      const leftSide = box(
        CITY.sidewalkWidth,
        0.18,
        CITY.size,
        0xb9b9b3,
        x - CITY.roadWidth / 2 - CITY.sidewalkWidth / 2,
        0.08,
        0,
        cityRoot
      );

      const rightSide = box(
        CITY.sidewalkWidth,
        0.18,
        CITY.size,
        0xb9b9b3,
        x + CITY.roadWidth / 2 + CITY.sidewalkWidth / 2,
        0.08,
        0,
        cityRoot
      );

      leftSide.material = sidewalkMat;
      rightSide.material = sidewalkMat;

      box(
        0.45,
        0.25,
        CITY.size,
        0x85878a,
        x - CITY.roadWidth / 2,
        0.1,
        0,
        cityRoot
      );

      box(
        0.45,
        0.25,
        CITY.size,
        0x85878a,
        x + CITY.roadWidth / 2,
        0.1,
        0,
        cityRoot
      );
    });

    CITY.roadZs.forEach(function (z) {
      const road = new THREE.Mesh(
        new THREE.BoxGeometry(
          CITY.size,
          0.18,
          CITY.roadWidth
        ),
        roadMat
      );

      road.position.set(0, 0.04, z);
      cityRoot.add(road);

      box(
        CITY.size,
        0.18,
        CITY.sidewalkWidth,
        0xb9b9b3,
        0,
        0.08,
        z - CITY.roadWidth / 2 - CITY.sidewalkWidth / 2,
        cityRoot
      );

      box(
        CITY.size,
        0.18,
        CITY.sidewalkWidth,
        0xb9b9b3,
        0,
        0.08,
        z + CITY.roadWidth / 2 + CITY.sidewalkWidth / 2,
        cityRoot
      );

      box(
        CITY.size,
        0.25,
        0.45,
        0x85878a,
        0,
        0.1,
        z - CITY.roadWidth / 2,
        cityRoot
      );

      box(
        CITY.size,
        0.25,
        0.45,
        0x85878a,
        0,
        0.1,
        z + CITY.roadWidth / 2,
        cityRoot
      );
    });

    createRoadMarkings();
    createCrossings();
  }

  function createRoadMarkings() {
    const markingMat = makeMaterial(0xe9e9e5, 0.7);

    CITY.roadXs.forEach(function (x) {
      for (let z = -145; z <= 145; z += 10) {
        const dash = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.035, 5),
          markingMat
        );

        dash.position.set(x, 0.18, z);
        cityRoot.add(dash);
      }
    });

    CITY.roadZs.forEach(function (z) {
      for (let x = -145; x <= 145; x += 10) {
        const dash = new THREE.Mesh(
          new THREE.BoxGeometry(5, 0.035, 0.35),
          markingMat
        );

        dash.position.set(x, 0.18, z);
        cityRoot.add(dash);
      }
    });
  }

  function createCrossings() {
    const white = makeMaterial(0xf4f4ef);

    CITY.roadXs.forEach(function (x) {
      CITY.roadZs.forEach(function (z) {

        for (let i = -5; i <= 5; i += 2) {
          const stripeA = new THREE.Mesh(
            new THREE.BoxGeometry(
              1.0,
              0.04,
              CITY.roadWidth
            ),
            white
          );

          stripeA.position.set(
            x + i,
            0.2,
            z
          );

          cityRoot.add(stripeA);
        }

      });
    });
  }

  /* ---------------------------------------------------------
     BUILDINGS
  --------------------------------------------------------- */

  function createBuilding(x, z, w, d, floors, type) {

    const root = new THREE.Group();
    root.position.set(x, 0, z);

    const bodyColor = pick(CITY.buildingColors);

    const height = floors * 4.2;

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, d),
      makeMaterial(bodyColor)
    );

    body.position.y = height / 2;
    root.add(body);

    createWindows(root, w, d, height);
    createRoof(root, w, d, height);

    if (type === "commercial") {
      createShopFront(root, w, d);
    }

    if (type === "corporate") {
      createCorporateEntrance(root, w, d);
    }

    if (type === "residential") {
      createBalconies(root, w, d, height);
    }

    cityRoot.add(root);

    return root;
  }

  function createWindows(parent, w, d, height) {
    const windowColor = pick(CITY.glassColors);
    const rows = Math.max(2, Math.floor(height / 4.2));

    for (let row = 0; row < rows; row++) {
      const y = 1.3 + row * 4.1;

      const colsFront = Math.max(2, Math.floor(w / 3.5));

      for (let c = 0; c < colsFront; c++) {
        const x =
          -w / 2 +
          1.4 +
          c * ((w - 2.8) / Math.max(1, colsFront - 1));

        const window = new THREE.Mesh(
          new THREE.BoxGeometry(
            1.35,
            1.65,
            0.08
          ),
          makeMaterial(windowColor, 0.35)
        );

        window.position.set(
          x,
          y,
          d / 2 + 0.06
        );

        parent.add(window);
      }

      const colsSide = Math.max(2, Math.floor(d / 3.5));

      for (let c = 0; c < colsSide; c++) {
        const z =
          -d / 2 +
          1.4 +
          c * ((d - 2.8) / Math.max(1, colsSide - 1));

        const window = new THREE.Mesh(
          new THREE.BoxGeometry(
            0.08,
            1.65,
            1.35
          ),
          makeMaterial(windowColor, 0.35)
        );

        window.position.set(
          w / 2 + 0.06,
          y,
          z
        );

        parent.add(window);
      }
    }
  }

  function createRoof(parent, w, d, height) {
    box(
      w + 0.8,
      0.35,
      d + 0.8,
      0x555b62,
      0,
      height,
      0,
      parent
    );
  }

  function createShopFront(parent, w, d) {
    const shop = box(
      Math.min(w * 0.8, 9),
      2.8,
      0.25,
      0x293b4a,
      0,
      0,
      d / 2 + 0.2,
      parent
    );

    box(
      Math.min(w * 0.72, 8),
      0.55,
      0.25,
      pick([
        0xd35400,
        0x2980b9,
        0x27ae60,
        0x8e44ad
      ]),
      0,
      2.85,
      d / 2 + 0.23,
      parent
    );
  }

  function createCorporateEntrance(parent, w, d) {
    box(
      Math.min(w * 0.38, 5),
      3.2,
      0.3,
      0x243746,
      0,
      0,
      d / 2 + 0.22,
      parent
    );

    box(
      Math.min(w * 0.45, 6),
      0.45,
      0.25,
      0xf2f2ef,
      0,
      3.5,
      d / 2 + 0.25,
      parent
    );
  }

  function createBalconies(parent, w, d, height) {
    const levels = Math.min(4, Math.floor(height / 5));

    for (let i = 0; i < levels; i++) {
      const y = 3.0 + i * 4.5;

      box(
        Math.min(w * 0.35, 4),
        0.2,
        1.2,
        0x626a70,
        -w * 0.2,
        y,
        d / 2 + 0.55,
        parent
      );
    }
  }

  function createCityBuildings() {

    const blocks = [
      [-90, -90],
      [-30, -90],
      [30, -90],
      [90, -90],

      [-90, -30],
      [-30, -30],
      [30, -30],
      [90, -30],

      [-90, 30],
      [-30, 30],
      [30, 30],
      [90, 30],

      [-90, 90],
      [-30, 90],
      [30, 90],
      [90, 90]
    ];

    blocks.forEach(function (p, index) {

      if (index === 5 || index === 10) return;

      const x = p[0] + random(-5, 5);
      const z = p[1] + random(-5, 5);

      const w = random(20, 30);
      const d = random(20, 30);

      let floors = Math.floor(random(2, 7));

      if (index === 6 || index === 9) {
        floors = Math.floor(random(7, 12));
      }

      let type = "residential";

      if (index % 4 === 0) {
        type = "commercial";
      }

      if (index === 6 || index === 9) {
        type = "corporate";
      }

      createBuilding(
        x,
        z,
        w,
        d,
        floors,
        type
      );
    });

    createLandmarkBuildings();
  }

  function createLandmarkBuildings() {

    const tower = createBuilding(
      105,
      30,
      25,
      25,
      16,
      "corporate"
    );

    tower.scale.set(1.15, 1, 1.15);

    const tower2 = createBuilding(
      -105,
      -30,
      23,
      23,
      13,
      "corporate"
    );

    tower2.scale.set(1.1, 1, 1.1);
  }

  /* ---------------------------------------------------------
     PARKS
  --------------------------------------------------------- */

  function createParks() {

    createPark(-30, 30, 42, 38);
    createPark(30, -30, 42, 38);

  }

  function createPark(x, z, w, d) {

    const park = new THREE.Group();
    park.position.set(x, 0, z);

    box(
      w,
      0.18,
      d,
      0x6fa45e,
      0,
      0,
      0,
      park
    );

    createParkPaths(park, w, d);

    for (let i = 0; i < 10; i++) {
      const tx = random(-w / 2 + 3, w / 2 - 3);
      const tz = random(-d / 2 + 3, d / 2 - 3);

      createTree(
        tx,
        tz,
        random(0.8, 1.25),
        park
      );
    }

    for (let i = 0; i < 3; i++) {
      createBench(
        random(-w / 2 + 6, w / 2 - 6),
        random(-d / 2 + 5, d / 2 - 5),
        park
      );
    }

    cityRoot.add(park);
  }

  function createParkPaths(parent, w, d) {

    box(
      2.6,
      0.08,
      d - 3,
      0xd9c89d,
      0,
      0.2,
      0,
      parent
    );

    box(
      w - 3,
      0.08,
      2.6,
      0xd9c89d,
      0,
      0.21,
      0,
      parent
    );
  }

  /* ---------------------------------------------------------
     TREES
  --------------------------------------------------------- */

  function createTree(x, z, scale, parent) {

    const tree = new THREE.Group();

    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale || 1);

    cylinder(
      0.45,
      2.2,
      0x745035,
      0,
      0,
      0,
      tree,
      10
    );

    sphere(
      2.0,
      pick([
        0x4e8f52,
        0x5c9d59,
        0x6da85f
      ]),
      0,
      2.0,
      0,
      tree
    );

    sphere(
      1.35,
      0x76ad63,
      -0.8,
      2.5,
      0.3,
      tree
    );

    parent.add(tree);
  }

  function createStreetTrees() {

    const positions = [];

    CITY.roadXs.forEach(function (x) {
      [-135, -75, -15, 45, 105, 135].forEach(function (z) {
        positions.push([
          x - 10,
          z
        ]);

        positions.push([
          x + 10,
          z
        ]);
      });
    });

    CITY.roadZs.forEach(function (z) {
      [-135, -75, -15, 45, 105, 135].forEach(function (x) {
        positions.push([
          x,
          z - 10
        ]);

        positions.push([
          x,
          z + 10
        ]);
      });
    });

    positions.forEach(function (p) {
      createTree(
        p[0],
        p[1],
        random(0.65, 0.9),
        cityRoot
      );
    });
  }

  /* ---------------------------------------------------------
     STREET LIGHTS
  --------------------------------------------------------- */

  function createStreetLight(x, z, rotationY) {

    const root = new THREE.Group();

    root.position.set(x, 0, z);
    root.rotation.y = rotationY || 0;

    cylinder(
      0.12,
      4.5,
      0x33383c,
      0,
      0,
      0,
      root,
      10
    );

    box(
      1.1,
      0.12,
      0.12,
      0x33383c,
      0.45,
      4.35,
      0,
      root
    );

    sphere(
      0.28,
      0xffe9a5,
      1.0,
      4.15,
      0,
      root
    );

    cityRoot.add(root);
  }

  function createStreetLights() {

    CITY.roadXs.forEach(function (x) {

      [-105, -45, 15, 75, 135].forEach(function (z) {

        createStreetLight(
          x - 9,
          z,
          0
        );

        createStreetLight(
          x + 9,
          z,
          Math.PI
        );

      });

    });

    CITY.roadZs.forEach(function (z) {

      [-105, -45, 15, 75, 135].forEach(function (x) {

        createStreetLight(
          x,
          z - 9,
          Math.PI / 2
        );

        createStreetLight(
          x,
          z + 9,
          -Math.PI / 2
        );

      });

    });
  }

  /* ---------------------------------------------------------
     BENCH
  --------------------------------------------------------- */

  function createBench(x, z, parent) {

    box(
      3.0,
      0.25,
      0.75,
      0x805538,
      x,
      1.0,
      z,
      parent
    );

    box(
      0.18,
      1.0,
      0.18,
      0x444444,
      x - 1.1,
      0.1,
      z,
      parent
    );

    box(
      0.18,
      1.0,
      0.18,
      0x444444,
      x + 1.1,
      0.1,
      z,
      parent
    );
  }

  /* ---------------------------------------------------------
     CARS
  --------------------------------------------------------- */

  function createCar(color, x, z, rotationY) {

    const car = new THREE.Group();

    car.position.set(x, 0.35, z);
    car.rotation.y = rotationY || 0;

    car.userData.speed = random(4, 7);
    car.userData.direction = rotationY || 0;
    car.userData.lane = random(-1, 1);

    /* Main body */

    box(
      2.8,
      0.75,
      5.2,
      color,
      0,
      0,
      0,
      car
    );

    /* Lower bumper */

    box(
      2.65,
      0.3,
      5.35,
      0x202327,
      0,
      -0.15,
      0,
      car
    );

    /* Cabin */

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(
        2.25,
        0.8,
        2.6
      ),
      makeMaterial(
        pick(CITY.glassColors),
        0.25
      )
    );

    cabin.position.set(
      0,
      0.72,
      -0.1
    );

    car.add(cabin);

    /* Roof */

    box(
      2.0,
      0.12,
      2.2,
      color,
      0,
      1.1,
      -0.1,
      car
    );

    /* Wheels */

    [
      [-1.48, 0.25, -1.65],
      [1.48, 0.25, -1.65],
      [-1.48, 0.25, 1.65],
      [1.48, 0.25, 1.65]
    ].forEach(function (p) {

      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.48,
          0.48,
          0.35,
          12
        ),
        makeMaterial(0x17191b, 0.9)
      );

      wheel.rotation.z = Math.PI / 2;

      wheel.position.set(
        p[0],
        p[1],
        p[2]
      );

      car.add(wheel);
    });

    /* Headlights */

    box(
      0.42,
      0.18,
      0.12,
      0xfff2c2,
      -0.8,
      0.48,
      -2.64,
      car
    );

    box(
      0.42,
      0.18,
      0.12,
      0xfff2c2,
      0.8,
      0.48,
      -2.64,
      car
    );

    /* Tail lights */

    box(
      0.4,
      0.18,
      0.12,
      0xa51f26,
      -0.8,
      0.48,
      2.64,
      car
    );

    box(
      0.4,
      0.18,
      0.12,
      0xa51f26,
      0.8,
      0.48,
      2.64,
      car
    );

    trafficRoot.add(car);

    cars.push(car);

    return car;
  }

  function createTraffic() {

    const lanes = [
      {
        axis: "z",
        x: -120,
        rotation: 0
      },
      {
        axis: "z",
        x: -60,
        rotation: Math.PI
      },
      {
        axis: "z",
        x: 60,
        rotation: 0
      },
      {
        axis: "z",
        x: 120,
        rotation: Math.PI
      },
      {
        axis: "x",
        z: -120,
        rotation: Math.PI / 2
      },
      {
        axis: "x",
        z: -60,
        rotation: -Math.PI / 2
      },
      {
        axis: "x",
        z: 60,
        rotation: Math.PI / 2
      },
      {
        axis: "x",
        z: 120,
        rotation: -Math.PI / 2
      }
    ];

    lanes.forEach(function (lane, laneIndex) {

      for (let i = 0; i < 3; i++) {

        let x = 0;
        let z = 0;

        if (lane.axis === "z") {
          x = lane.x;
          z = -145 + i * 95 + laneIndex * 3;
        } else {
          x = -145 + i * 95 + laneIndex * 3;
          z = lane.z;
        }

        createCar(
          pick(CITY.carColors),
          x,
          z,
          lane.rotation
        );
      }
    });
  }

  function updateTraffic(delta) {

    cars.forEach(function (car) {

      const speed = car.userData.speed * delta;

      const direction = car.userData.direction;

      car.position.x += Math.sin(direction) * speed;
      car.position.z += Math.cos(direction) * speed;

      if (car.position.x > 155) {
        car.position.x = -155;
      }

      if (car.position.x < -155) {
        car.position.x = 155;
      }

      if (car.position.z > 155) {
        car.position.z = -155;
      }

      if (car.position.z < -155) {
        car.position.z = 155;
      }

    });
  }

  /* ---------------------------------------------------------
     PEDestrians
  --------------------------------------------------------- */

  function createPedestrian(x, z, scale) {

    const person = new THREE.Group();

    person.position.set(x, 0, z);
    person.scale.setScalar(scale || 1);

    const skin = pick([
      0xc68d6b,
      0xd8a27d,
      0x9d674a
    ]);

    const clothes = pick([
      0x304c67,
      0x526b45,
      0x70465c,
      0x6e5c3d,
      0x343b45
    ]);

    cylinder(
      0.23,
      1.1,
      clothes,
      0,
      0,
      0,
      person,
      10
    );

    sphere(
      0.25,
      skin,
      0,
      1.1,
      0,
      person
    );

    person.userData.speed = random(0.7, 1.4);
    person.userData.direction = random(0, Math.PI * 2);

    pedestrianRoot.add(person);
    pedestrians.push(person);

    return person;
  }

  function createPedestrians() {

    for (let i = 0; i < 35; i++) {

      const useXRoad = Math.random() > 0.5;

      if (useXRoad) {

        const z = pick(
          CITY.roadZs.map(function (v) {
            return v + pick([-9, 9]);
          })
        );

        createPedestrian(
          random(-145, 145),
          z,
          random(0.85, 1.15)
        );

      } else {

        const x = pick(
          CITY.roadXs.map(function (v) {
            return v + pick([-9, 9]);
          })
        );

        createPedestrian(
          x,
          random(-145, 145),
          random(0.85, 1.15)
        );
      }
    }
  }

  function updatePedestrians(delta) {

    pedestrians.forEach(function (person) {

      const speed =
        person.userData.speed * delta;

      person.position.x +=
        Math.sin(person.userData.direction) * speed;

      person.position.z +=
        Math.cos(person.userData.direction) * speed;

      if (
        Math.abs(person.position.x) > 148 ||
        Math.abs(person.position.z) > 148
      ) {
        person.position.x = random(-130, 130);
        person.position.z = random(-130, 130);
      }

      if (Math.random() < 0.002) {
        person.userData.direction =
          random(0, Math.PI * 2);
      }

    });
  }

  /* ---------------------------------------------------------
     PARKING
  --------------------------------------------------------- */

  function createParkingArea(x, z, w, d) {

    box(
      w,
      0.12,
      d,
      0x45484c,
      x,
      0.08,
      z,
      cityRoot
    );

    for (
      let px = x - w / 2 + 4;
      px < x + w / 2 - 2;
      px += 5
    ) {

      box(
        0.12,
        0.03,
        d - 4,
        0xe7e7e1,
        px,
        0.2,
        z,
        cityRoot
      );
    }

    for (let i = 0; i < 4; i++) {

      createCar(
        pick(CITY.carColors),
        x - w / 2 + 5 + i * 5,
        z,
        0
      );
    }
  }

  /* ---------------------------------------------------------
     CITY DECOR
  --------------------------------------------------------- */

  function createCityDecor() {

    createParkingArea(
      100,
      -30,
      28,
      18
    );

    createParkingArea(
      -100,
      90,
      28,
      18
    );

    createTreesAroundBlocks();
  }

  function createTreesAroundBlocks() {

    const spots = [
      [-130, -130],
      [-70, -130],
      [70, -130],
      [130, -130],

      [-130, -70],
      [130, -70],

      [-130, 70],
      [130, 70],

      [-130, 130],
      [-70, 130],
      [70, 130],
      [130, 130]
    ];

    spots.forEach(function (p) {

      createTree(
        p[0],
        p[1],
        random(0.7, 1.0),
        cityRoot
      );

      createTree(
        p[0] + random(-5, 5),
        p[1] + random(-5, 5),
        random(0.55, 0.8),
        cityRoot
      );
    });
  }

  /* ---------------------------------------------------------
     CITY SIGNAGE
  --------------------------------------------------------- */

  function createSign(x, z, text) {

    const sign = new THREE.Group();

    sign.position.set(x, 0, z);

    box(
      0.16,
      3.0,
      0.16,
      0x30353a,
      0,
      0,
      0,
      sign
    );

    box(
      3.5,
      1.2,
      0.18,
      0x1f2932,
      0,
      2.4,
      0,
      sign
    );

    cityRoot.add(sign);
  }

  function createCitySigns() {

    createSign(
      -25,
      -12,
      "BUSINESS"
    );

    createSign(
      35,
      12,
      "DOWNTOWN"
    );
  }

  /* ---------------------------------------------------------
     HQ CONNECTION
  --------------------------------------------------------- */

  function improveHQSurroundings() {

    if (!WORLD || !WORLD.HQ) return;

    const hq = WORLD.HQ;

    if (!hq.userData) {
      hq.userData = {};
    }

    hq.userData.cityIntegrated = true;

    /*
     * We intentionally do not reposition the existing HQ.
     * Existing office/interior coordinates remain controlled
     * by world3d.html.
     */
  }

  /* ---------------------------------------------------------
     CITY BUILD
  --------------------------------------------------------- */

  function buildCity() {

    if (!scene || !THREE) return;

    removeOldCity();

    cityRoot = new THREE.Group();
    cityRoot.name = "EmpireRushLivingCity";

    trafficRoot = new THREE.Group();
    trafficRoot.name = "Traffic";

    pedestrianRoot = new THREE.Group();
    pedestrianRoot.name = "Pedestrians";

    cityRoot.add(trafficRoot);
    cityRoot.add(pedestrianRoot);

    scene.add(cityRoot);

    createGround();
    createRoadNetwork();
    createCityBuildings();
    createParks();
    createStreetTrees();
    createStreetLights();
    createCityDecor();
    createCitySigns();

    createTraffic();
    createPedestrians();

    improveHQSurroundings();

    started = true;

    console.log(
      "[Empire Living City] City visual layer ready."
    );
  }

  /* ---------------------------------------------------------
     ANIMATION
  --------------------------------------------------------- */

  let lastTime = performance.now();

  function animateCity() {

    if (!animationStarted) {
      animationStarted = true;
    }

    const now = performance.now();

    const delta =
      Math.min(
        (now - lastTime) / 1000,
        0.05
      );

    lastTime = now;

    if (started) {
      updateTraffic(delta);
      updatePedestrians(delta);
    }

    requestAnimationFrame(animateCity);
  }

  /* ---------------------------------------------------------
     START
  --------------------------------------------------------- */

  function start() {

    if (started) return;

    WORLD = getWorld();

    if (!WORLD || !WORLD.scene) {
      setTimeout(start, 500);
      return;
    }

    THREE = WORLD.THREE;

    if (!THREE) {
      console.warn(
        "[Empire Living City] THREE unavailable."
      );

      setTimeout(start, 500);
      return;
    }

    scene = WORLD.scene;

    buildCity();

    if (!animationStarted) {
      animateCity();
    }
  }

  window.addEventListener(
    "EmpireWorldReady",
    function () {
      setTimeout(start, 300);
    }
  );

  /*
   * Fallback if EmpireWorld already exists
   */
  setTimeout(function () {

    if (!started) {
      start();
    }

  }, 800);

  /* ---------------------------------------------------------
     PUBLIC API
  --------------------------------------------------------- */

  window.EmpireLivingCity = {

    start: start,

    rebuild: function () {

      started = false;

      if (cityRoot && cityRoot.parent) {
        cityRoot.parent.remove(cityRoot);
      }

      cityRoot = null;
      trafficRoot = null;
      pedestrianRoot = null;

      cars.length = 0;
      pedestrians.length = 0;

      start();
    },

    getRoot: function () {
      return cityRoot;
    },

    getCars: function () {
      return cars;
    },

    getPedestrians: function () {
      return pedestrians;
    },

    getStatus: function () {

      return {
        started: started,
        buildings:
          cityRoot
            ? cityRoot.children.length
            : 0,
        cars: cars.length,
        pedestrians: pedestrians.length
      };
    }

  };

})();
