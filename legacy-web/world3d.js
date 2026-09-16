(function () {
  "use strict";

  /*
   * =========================================================
   * EMPIRE RUSH — WORLD 3D CONTROLLER
   * =========================================================
   *
   * Responsibilities:
   * - Employee selection
   * - Employee actions
   * - Employee movement
   * - Living HQ routines
   * - Living city visual layer
   * - Roads
   * - Park
   * - Trees
   * - Buildings
   * - Traffic
   * - Pedestrians
   *
   * IMPORTANT:
   * The actual Three.js renderer/scene is created by
   * world3d.html.
   *
   * This file only connects to window.EmpireWorld.
   * =========================================================
   */


  /* =========================================================
     STATE
  ========================================================= */

  let selectedEmployee = null;

  let employeeActionPanel = null;

  let simulationStarted = false;

  let routineTimer = null;

  let worldReady = false;

  let cityStarted = false;

  let cityGroup = null;

  let trafficTimer = null;

  let pedestrianTimer = null;

  const cars = [];

  const pedestrians = [];


  /* =========================================================
     EMPLOYEE DATABASE
  ========================================================= */

  const employeeRecords = {

    Aarav: {
      salary: 42000,
      performance: 86,
      experience: 4,
      morale: 82,
      status: "Working",
      role: "Operations Manager",
      department: "Operations"
    },

    Riya: {
      salary: 38000,
      performance: 91,
      experience: 3,
      morale: 88,
      status: "Working",
      role: "Finance Analyst",
      department: "Finance"
    },

    Kabir: {
      salary: 35000,
      performance: 79,
      experience: 2,
      morale: 76,
      status: "Working",
      role: "Marketing Executive",
      department: "Marketing"
    },

    Anaya: {
      salary: 45000,
      performance: 89,
      experience: 5,
      morale: 84,
      status: "Working",
      role: "Product Manager",
      department: "Product"
    },

    Vivaan: {
      salary: 40000,
      performance: 87,
      experience: 4,
      morale: 81,
      status: "Working",
      role: "HR Manager",
      department: "Human Resources"
    },

    Meera: {
      salary: 34000,
      performance: 83,
      experience: 2,
      morale: 86,
      status: "Working",
      role: "Sales Executive",
      department: "Sales"
    },

    Arjun: {
      salary: 52000,
      performance: 94,
      experience: 6,
      morale: 90,
      status: "Working",
      role: "R&D Engineer",
      department: "R&D"
    },

    Ishita: {
      salary: 37000,
      performance: 88,
      experience: 3,
      morale: 85,
      status: "Working",
      role: "Accountant",
      department: "Finance"
    }

  };


  /* =========================================================
     WORLD HELPERS
  ========================================================= */

  function getWorld() {

    if (
      window.EmpireWorld &&
      window.EmpireWorld.scene &&
      window.EmpireWorld.THREE
    ) {
      return window.EmpireWorld;
    }

    return null;
  }


  function findWorkerByName(name) {

    const world = getWorld();

    if (!world) {
      return null;
    }

    const workers =
      Array.isArray(world.workers)
        ? world.workers
        : [];

    for (
      let i = 0;
      i < workers.length;
      i++
    ) {

      const worker =
        workers[i];

      if (
        worker &&
        worker.userData &&
        worker.userData.name === name
      ) {

        return worker;

      }

    }

    return null;
  }


  function recordFor(name) {

    if (!employeeRecords[name]) {

      employeeRecords[name] = {

        salary: 30000,

        performance: 75,

        experience: 1,

        morale: 75,

        status: "Working",

        role: "Employee",

        department: "General"

      };

    }

    return employeeRecords[name];

  }


  /* =========================================================
     EMPLOYEE PANEL
  ========================================================= */

  function ensurePanel() {

    if (
      document.getElementById(
        "employeeActionPanel"
      )
    ) {

      employeeActionPanel =
        document.getElementById(
          "employeeActionPanel"
        );

      return;

    }


    employeeActionPanel =
      document.createElement("div");


    employeeActionPanel.id =
      "employeeActionPanel";


    employeeActionPanel.style.position =
      "fixed";


    employeeActionPanel.style.right =
      "14px";


    employeeActionPanel.style.bottom =
      "58px";


    employeeActionPanel.style.width =
      "245px";


    employeeActionPanel.style.maxWidth =
      "calc(100vw - 28px)";


    employeeActionPanel.style.padding =
      "14px";


    employeeActionPanel.style.borderRadius =
      "17px";


    employeeActionPanel.style.background =
      "rgba(16,20,25,.96)";


    employeeActionPanel.style.color =
      "#fff";


    employeeActionPanel.style.zIndex =
      "100";


    employeeActionPanel.style.display =
      "none";


    employeeActionPanel.style.boxShadow =
      "0 8px 30px rgba(0,0,0,.35)";


    employeeActionPanel.innerHTML = `

      <div style="
        font-weight:800;
        font-size:16px;
        margin-bottom:8px;
      ">
        Employee Management
      </div>

      <div
        id="employeeActionName"
        style="
          color:#baf02c;
          font-weight:700;
          margin-bottom:10px;
        "
      ></div>

      <button
        data-action="raise"
        style="
          width:100%;
          margin:4px 0;
          padding:10px;
        "
      >
        Give Raise
      </button>

      <button
        data-action="train"
        style="
          width:100%;
          margin:4px 0;
          padding:10px;
        "
      >
        Training
      </button>

      <button
        data-action="promote"
        style="
          width:100%;
          margin:4px 0;
          padding:10px;
        "
      >
        Promote
      </button>

      <button
        data-action="task"
        style="
          width:100%;
          margin:4px 0;
          padding:10px;
        "
      >
        Assign Task
      </button>

      <button
        data-action="close"
        style="
          width:100%;
          margin-top:8px;
          padding:9px;
          background:#30363e;
          color:#fff;
          border:0;
          border-radius:8px;
        "
      >
        Close
      </button>

    `;


    document.body.appendChild(
      employeeActionPanel
    );


    employeeActionPanel.addEventListener(
      "click",
      function (event) {

        const target =
          event.target;

        const action =
          target &&
          target.dataset
            ? target.dataset.action
            : null;


        if (!action) {
          return;
        }


        if (
          action === "close"
        ) {

          employeeActionPanel.style.display =
            "none";

          return;

        }


        performEmployeeAction(
          action
        );

      }
    );

  }


  /* =========================================================
     SHOW EMPLOYEE
  ========================================================= */

  function showEmployee(employee) {

    if (!employee) {
      return;
    }


    selectedEmployee =
      employee;


    const record =
      recordFor(
        employee.name
      );


    const name =
      employee.name ||
      "Employee";


    const role =
      employee.role ||
      record.role ||
      "Employee";


    const dept =
      employee.dept ||
      employee.department ||
      record.department ||
      "General";


    const status =
      employee.status ||
      record.status ||
      "Working";


    const nameElement =
      document.getElementById(
        "ename"
      );


    const roleElement =
      document.getElementById(
        "erole"
      );


    const deptElement =
      document.getElementById(
        "edept"
      );


    const statusElement =
      document.getElementById(
        "estatus"
      );


    if (nameElement) {

      nameElement.textContent =
        name;

    }


    if (roleElement) {

      roleElement.textContent =
        "Role: " + role;

    }


    if (deptElement) {

      deptElement.textContent =
        "Department: " + dept;

    }


    if (statusElement) {

      statusElement.textContent =
        "Status: " + status;

    }


    const panel =
      document.getElementById(
        "employeePanel"
      );


    if (panel) {

      panel.style.display =
        "block";

    }


    ensurePanel();


    const actionName =
      document.getElementById(
        "employeeActionName"
      );


    if (actionName) {

      actionName.textContent =
        name +
        " • " +
        role;

    }


    employeeActionPanel.style.display =
      "block";


    console.log(
      "👤 EMPLOYEE SELECTED:",
      employee
    );

  }


  /* =========================================================
     EMPLOYEE ACTIONS
  ========================================================= */

  function performEmployeeAction(
    action
  ) {

    if (!selectedEmployee) {
      return;
    }


    const record =
      recordFor(
        selectedEmployee.name
      );


    switch (action) {

      case "raise":

        record.salary += 3000;

        record.morale =
          Math.min(
            100,
            record.morale + 6
          );

        record.status =
          "Motivated";

        selectedEmployee.status =
          "Motivated";

        break;


      case "train":

        record.performance =
          Math.min(
            100,
            record.performance + 4
          );

        record.morale =
          Math.min(
            100,
            record.morale + 2
          );

        record.status =
          "Training";

        selectedEmployee.status =
          "Training";

        break;


      case "promote":

        record.experience += 1;

        record.performance =
          Math.min(
            100,
            record.performance + 3
          );

        record.salary += 7000;

        record.status =
          "Promoted";

        selectedEmployee.status =
          "Promoted";

        break;


      case "task":

        record.performance =
          Math.min(
            100,
            record.performance + 1
          );

        record.status =
          "Working";

        selectedEmployee.status =
          "Working";

        assignTask(
          selectedEmployee.name
        );

        break;

    }


    refreshEmployeePanel();


    window.dispatchEvent(
      new CustomEvent(
        "EmpireEmployeeUpdated",
        {
          detail: {
            name:
              selectedEmployee.name,

            data:
              record
          }
        }
      )
    );

  }


  /* =========================================================
     REFRESH EMPLOYEE PANEL
  ========================================================= */

  function refreshEmployeePanel() {

    if (!selectedEmployee) {
      return;
    }


    const record =
      recordFor(
        selectedEmployee.name
      );


    const statusElement =
      document.getElementById(
        "estatus"
      );


    if (statusElement) {

      statusElement.textContent =
        "Status: " +
        record.status;

    }

  }


  /* =========================================================
     DEPARTMENT POSITIONS
  ========================================================= */

  const departmentPositions = {

    Operations: [
      [-5, 0.5],
      [-5, 0.9]
    ],

    Finance: [
      [-10, -4],
      [-5, -4]
    ],

    Marketing: [
      [9, -4],
      [9, 0.5]
    ],

    Product: [
      [4, -4],
      [4, 0.5]
    ],

    "Human Resources": [
      [-5, 0.5],
      [-5, 0.9]
    ],

    Sales: [
      [9, -4],
      [9, 0.5]
    ],

    "R&D": [
      [9, 0.5],
      [4, 0.5]
    ],

    General: [
      [0, -3],
      [0, 0]
    ]

  };


  function departmentTarget(
    department
  ) {

    const positions =
      departmentPositions[
        department
      ] ||
      departmentPositions.General;


    return positions[
      Math.floor(
        Math.random() *
        positions.length
      )
    ];

  }


  /* =========================================================
     MOVE WORKER
  ========================================================= */

  function moveWorker(
    worker,
    x,
    z,
    status
  ) {

    if (!worker) {
      return;
    }


    if (!worker.userData) {
      worker.userData = {};
    }


    worker.userData.targetX =
      x;


    worker.userData.targetZ =
      z;


    worker.userData.status =
      status ||
      "Walking";


    if (
      window.EmpireWorld &&
      typeof window.EmpireWorld.moveWorkerTo ===
        "function"
    ) {

      window.EmpireWorld.moveWorkerTo(
        worker,
        x,
        z,
        status
      );

    }

  }


  /* =========================================================
     ASSIGN TASK
  ========================================================= */

  function assignTask(
    name
  ) {

    const worker =
      findWorkerByName(name);


    if (!worker) {
      return;
    }


    const employee =
      worker.userData;


    const target =
      departmentTarget(
        employee.dept ||
        employee.department ||
        "General"
      );


    moveWorker(
      worker,
      target[0],
      target[1],
      "Working"
    );

  }


  /* =========================================================
     MEETING
  ========================================================= */

  const meetingPositions = [

    [3.2, 8.7],

    [5.5, 8.7],

    [8.0, 8.7],

    [3.2, 4.3],

    [5.5, 4.3],

    [8.0, 4.3]

  ];


  function startMeeting() {

    const world =
      getWorld();


    if (!world) {
      return;
    }


    const workers =
      Array.isArray(
        world.workers
      )
        ? world.workers
        : [];


    if (!workers.length) {
      return;
    }


    const meetingCount =
      Math.min(
        4,
        workers.length
      );


    const selected = [];


    for (
      let i = 0;
      i < workers.length &&
      selected.length < meetingCount;
      i++
    ) {

      const worker =
        workers[i];


      if (
        !worker ||
        !worker.userData
      ) {
        continue;
      }


      selected.push(
        worker
      );

    }


    selected.forEach(
      function (
        worker,
        index
      ) {

        const target =
          meetingPositions[
            index
          ];


        moveWorker(
          worker,
          target[0],
          target[1],
          "Meeting"
        );

      }
    );


    console.log(
      "🤝 HQ MEETING STARTED"
    );


    setTimeout(
      function () {

        selected.forEach(
          function (worker) {

            if (
              !worker ||
              !worker.userData
            ) {
              return;
            }


            const target =
              departmentTarget(
                worker.userData.dept ||
                worker.userData.department ||
                "General"
              );


            moveWorker(
              worker,
              target[0],
              target[1],
              "Working"
            );

          }
        );


        console.log(
          "🤝 HQ MEETING ENDED"
        );

      },
      9000
    );

  }


  /* =========================================================
     BREAK
  ========================================================= */

  function startBreak() {

    const world =
      getWorld();


    if (!world) {
      return;
    }


    const workers =
      Array.isArray(
        world.workers
      )
        ? world.workers
        : [];


    workers.forEach(
      function (
        worker,
        index
      ) {

        if (
          !worker ||
          !worker.userData
        ) {
          return;
        }


        if (
          index % 3 !== 0
        ) {
          return;
        }


        moveWorker(
          worker,
          -1 +
            Math.random() * 5,
          -2 +
            Math.random() * 3,
          "Break"
        );

      }
    );

  }


  /* =========================================================
     NORMAL WORK
  ========================================================= */

  function runWorkRoutine() {

    const world =
      getWorld();


    if (!world) {
      return;
    }


    const workers =
      Array.isArray(
        world.workers
      )
        ? world.workers
        : [];


    workers.forEach(
      function (worker) {

        if (
          !worker ||
          !worker.userData
        ) {
          return;
        }


        const employee =
          worker.userData;


        if (
          employee.status ===
          "Meeting"
        ) {
          return;
        }


        if (
          employee.status ===
          "Break"
        ) {
          return;
        }


        const target =
          departmentTarget(
            employee.dept ||
            employee.department ||
            "General"
          );


        moveWorker(
          worker,
          target[0],
          target[1],
          "Working"
        );

      }
    );

  }


  /* =========================================================
     LIVING HQ CLOCK
  ========================================================= */

  function startLivingHQ() {

    if (simulationStarted) {
      return;
    }


    simulationStarted = true;


    routineTimer =
      setInterval(
        function () {

          const roll =
            Math.random();


          if (
            roll < 0.15
          ) {

            startMeeting();

          }
          else if (
            roll < 0.28
          ) {

            startBreak();

          }
          else {

            runWorkRoutine();

          }

        },
        12000
      );


    console.log(
      "🏢 EMPIRE RUSH LIVING HQ ONLINE"
    );

  }


  /* =========================================================
     CITY MATERIAL HELPERS
  ========================================================= */

  function createMaterial(
    THREE,
    color,
    roughness
  ) {

    return new THREE.MeshStandardMaterial({

      color:
        color,

      roughness:
        roughness === undefined
          ? 0.85
          : roughness

    });

  }


  /* =========================================================
     CITY GROUND
  ========================================================= */

  function createCityGround(
    THREE
  ) {

    const geometry =
      new THREE.PlaneGeometry(
        180,
        180
      );


    const material =
      createMaterial(
        THREE,
        0x71806d,
        1
      );


    const ground =
      new THREE.Mesh(
        geometry,
        material
      );


    ground.rotation.x =
      -Math.PI / 2;


    ground.position.y =
      -0.15;


    ground.name =
      "EmpireCityGround";


    cityGroup.add(
      ground
    );

  }


  /* =========================================================
     ROAD
  ========================================================= */

  function createRoad(
    THREE,
    x,
    z,
    width,
    depth,
    horizontal
  ) {

    const roadWidth =
      horizontal
        ? width
        : depth;


    const roadDepth =
      horizontal
        ? depth
        : width;


    const geometry =
      new THREE.BoxGeometry(
        roadWidth,
        0.12,
        roadDepth
      );


    const material =
      createMaterial(
        THREE,
        0x30343a,
        0.95
      );


    const road =
      new THREE.Mesh(
        geometry,
        material
      );


    road.position.set(
      x,
      0.01,
      z
    );


    road.name =
      "EmpireCityRoad";


    cityGroup.add(
      road
    );


    /* Road centre markings */

    const lineMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xf2f2f2
      });


    const lineGeometry =
      new THREE.BoxGeometry(
        horizontal
          ? 4
          : 0.22,

        0.035,

        horizontal
          ? 0.22
          : 4
      );


    for (
      let i = -70;
      i <= 70;
      i += 10
    ) {

      const line =
        new THREE.Mesh(
          lineGeometry,
          lineMaterial
        );


      if (horizontal) {

        line.position.set(
          i,
          0.09,
          z
        );

      }
      else {

        line.position.set(
          x,
          0.09,
          i
        );

      }


      cityGroup.add(
        line
      );

    }

  }


  function createRoadNetwork(
    THREE
  ) {

    createRoad(
      THREE,
      0,
      -32,
      170,
      9,
      true
    );


    createRoad(
      THREE,
      0,
      32,
      170,
      9,
      true
    );


    createRoad(
      THREE,
      -52,
      0,
      9,
      150,
      false
    );


    createRoad(
      THREE,
      52,
      0,
      9,
      150,
      false
    );


    createRoad(
      THREE,
      0,
      0,
      120,
      7,
      true
    );

  }


  /* =========================================================
     SIDEWALK
  ========================================================= */

  function createSidewalks(
    THREE
  ) {

    const material =
      createMaterial(
        THREE,
        0xb9b4aa,
        0.95
      );


    const sidewalkData = [

      [0, -38, 170, 2],

      [0, 38, 170, 2],

      [-58, 0, 2, 150],

      [58, 0, 2, 150]

    ];


    sidewalkData.forEach(
      function (data) {

        const geometry =
          new THREE.BoxGeometry(
            data[2],
            0.10,
            data[3]
          );


        const mesh =
          new THREE.Mesh(
            geometry,
            material
          );


        mesh.position.set(
          data[0],
          0.09,
          data[1]
        );


        mesh.name =
          "EmpireCitySidewalk";


        cityGroup.add(
          mesh
        );

      }
    );

  }


  /* =========================================================
     PARK
  ========================================================= */

  function createPark(
    THREE
  ) {

    const parkGeometry =
      new THREE.BoxGeometry(
        30,
        0.28,
        24
      );


    const parkMaterial =
      createMaterial(
        THREE,
        0x527a4d,
        1
      );


    const park =
      new THREE.Mesh(
        parkGeometry,
        parkMaterial
      );


    park.position.set(
      -25,
      0.15,
      17
    );


    park.name =
      "EmpireCentralPark";


    cityGroup.add(
      park
    );


    const pathMaterial =
      createMaterial(
        THREE,
        0xb7aa91,
        0.95
      );


    const path1 =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          27,
          0.08,
          2
        ),
        pathMaterial
      );


    path1.position.set(
      -25,
      0.32,
      17
    );


    cityGroup.add(
      path1
    );


    const path2 =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          2,
          0.08,
          20
        ),
        pathMaterial
      );


    path2.position.set(
      -25,
      0.33,
      17
    );


    cityGroup.add(
      path2
    );


    for (
      let i = -1;
      i <= 1;
      i++
    ) {

      createBench(
        THREE,
        -35,
        17 +
          i * 7
      );

    }

  }


  function createBench(
    THREE,
    x,
    z
  ) {

    const material =
      createMaterial(
        THREE,
        0x704c32,
        0.9
      );


    const seat =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          4,
          0.35,
          1
        ),
        material
      );


    seat.position.set(
      x,
      0.8,
      z
    );


    cityGroup.add(
      seat
    );


    [-1.4, 1.4].forEach(
      function (dx) {

        const leg =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              0.25,
              0.8,
              0.25
            ),
            material
          );


        leg.position.set(
          x + dx,
          0.4,
          z
        );


        cityGroup.add(
          leg
        );

      }
    );

  }


  /* =========================================================
     CITY BUILDINGS
  ========================================================= */

  function createCityBuildings(
    THREE
  ) {

    const positions = [

      [-72, -55, 16, 14, 22],

      [-45, -55, 20, 16, 28],

      [-15, -55, 14, 13, 20],

      [25, -55, 20, 16, 30],

      [58, -55, 15, 14, 22],

      [-72, 55, 18, 15, 25],

      [-42, 55, 15, 13, 20],

      [-10, 55, 21, 17, 32],

      [28, 55, 16, 14, 24],

      [60, 55, 20, 16, 29],

      [-72, 0, 18, 15, 26],

      [72, 0, 21, 17, 34]

    ];


    positions.forEach(
      function (data) {

        const x =
          data[0];

        const z =
          data[1];

        const w =
          data[2];

        const d =
          data[3];

        const h =
          data[4];


        const geometry =
          new THREE.BoxGeometry(
            w,
            h,
            d
          );


        const material =
          createMaterial(
            THREE,
            0x9ca7ae,
            0.85
          );


        const building =
          new THREE.Mesh(
            geometry,
            material
          );


        building.position.set(
          x,
          h / 2,
          z
        );


        building.name =
          "EmpireCityBuilding";


        cityGroup.add(
          building
        );


        createBuildingWindows(
          THREE,
          x,
          z,
          w,
          d,
          h
        );

      }
    );

  }


  function createBuildingWindows(
    THREE,
    x,
    z,
    w,
    d,
    h
  ) {

    const material =
      new THREE.MeshBasicMaterial({
        color: 0x6f9fa8
      });


    for (
      let y = 3;
      y < h - 1;
      y += 4
    ) {

      for (
        let xx =
          -w / 2 + 2;

        xx <
          w / 2;

        xx += 4
      ) {

        const windowMesh =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              1.5,
              1.5,
              0.08
            ),
            material
          );


        windowMesh.position.set(
          x + xx,
          y,
          z -
            d / 2 -
            0.05
        );


        cityGroup.add(
          windowMesh
        );

      }

    }

  }


  /* =========================================================
     TREES
  ========================================================= */

  function createTree(
    THREE,
    x,
    z,
    scale
  ) {

    const tree =
      new THREE.Group();


    tree.position.set(
      x,
      0,
      z
    );


    tree.scale.setScalar(
      scale || 1
    );


    const trunk =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.35,
          0.45,
          2.2,
          8
        ),
        createMaterial(
          THREE,
          0x68482f,
          0.95
        )
      );


    trunk.position.y =
      1.1;


    tree.add(
      trunk
    );


    const crown =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          1.8,
          10,
          8
        ),
        createMaterial(
          THREE,
          0x477348,
          1
        )
      );


    crown.position.y =
      3.1;


    tree.add(
      crown
    );


    tree.name =
      "EmpireTree";


    cityGroup.add(
      tree
    );

  }


  function createTrees(
    THREE
  ) {

    const locations = [

      [-38, 8, 1],

      [-38, 25, 1.1],

      [-29, 8, 0.9],

      [-20, 25, 1],

      [-12, 10, 0.85],

      [-37, 18, 0.9],

      [-17, 18, 0.95],

      [20, 43, 1],

      [35, 43, 1.1],

      [55, 20, 0.9],

      [55, -20, 1],

      [-55, 20, 0.9],

      [-55, -20, 1],

      [18, -43, 1],

      [38, -43, 0.9]

    ];


    locations.forEach(
      function (data) {

        createTree(
          THREE,
          data[0],
          data[1],
          data[2]
        );

      }
    );

  }


  /* =========================================================
     STREET LIGHTS
  ========================================================= */

  function createStreetLight(
    THREE,
    x,
    z
  ) {

    const pole =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.12,
          0.16,
          5
        ),
        createMaterial(
          THREE,
          0x22262b,
          0.8
        )
      );


    pole.position.set(
      x,
      2.5,
      z
    );


    cityGroup.add(
      pole
    );


    const lamp =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.35,
          8,
          8
        ),
        new THREE.MeshBasicMaterial({
          color: 0xffe8ad
        })
      );


    lamp.position.set(
      x,
      5.2,
      z
    );


    cityGroup.add(
      lamp
    );

  }


  function createStreetLights(
    THREE
  ) {

    const positions = [

      [-12, -32],

      [12, -32],

      [-12, 32],

      [12, 32],

      [-52, -12],

      [-52, 12],

      [52, -12],

      [52, 12],

      [-25, -32],

      [25, 32]

    ];


    positions.forEach(
      function (position) {

        createStreetLight(
          THREE,
          position[0],
          position[1]
        );

      }
    );

  }


  /* =========================================================
     TRAFFIC
  ========================================================= */

  function createTraffic(
    THREE
  ) {

    cars.length = 0;


    for (
      let i = 0;
      i < 10;
      i++
    ) {

      const car =
        new THREE.Group();


      const body =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            2.5,
            0.7,
            1.35
          ),
          createMaterial(
            THREE,
            i % 2 === 0
              ? 0x394b5c
              : 0x8c4a3d,
            0.7
          )
        );


      body.position.y =
        0.65;


      car.add(
        body
      );


      const roof =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            1.35,
            0.45,
            1.15
          ),
          createMaterial(
            THREE,
            0x66727c,
            0.7
          )
        );


      roof.position.y =
        1.1;


      car.add(
        roof
      );


      car.position.set(
        -80 +
          i * 16,

        0,

        -32
      );


      car.userData.speed =
        0.06 +
        Math.random() *
          0.045;


      car.name =
        "EmpireTrafficCar";


      cityGroup.add(
        car
      );


      cars.push(
        car
      );

    }

  }


  function updateTraffic() {

    cars.forEach(
      function (car) {

        if (!car) {
          return;
        }


        car.position.x +=
          car.userData.speed ||
          0.08;


        if (
          car.position.x >
          85
        ) {

          car.position.x =
            -85;

        }

      }
    );

  }


  /* =========================================================
     PEDESTRIANS
  ========================================================= */

  function createPedestrian(
    THREE,
    x,
    z,
    speed
  ) {

    const person =
      new THREE.Group();


    const body =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.28,
          0.34,
          1.25,
          8
        ),
        createMaterial(
          THREE,
          0x737b86,
          0.9
        )
      );


    body.position.y =
      0.9;


    person.add(
      body
    );


    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.34,
          8,
          8
        ),
        createMaterial(
          THREE,
          0xc7b09a,
          0.9
        )
      );


    head.position.y =
      1.75;


    person.add(
      head
    );


    person.position.set(
      x,
      0,
      z
    );


    person.userData.speed =
      speed ||
      0.018;


    person.name =
      "EmpirePedestrian";


    cityGroup.add(
      person
    );


    pedestrians.push(
      person
    );

  }


  function createPedestrians(
    THREE
  ) {

    pedestrians.length = 0;


    for (
      let i = 0;
      i < 18;
      i++
    ) {

      createPedestrian(
        THREE,

        -45 +
          Math.random() * 35,

        6 +
          Math.random() * 24,

        0.012 +
          Math.random() *
            0.025
      );

    }

  }


  function updatePedestrians() {

    pedestrians.forEach(
      function (person) {

        if (!person) {
          return;
        }


        person.position.x +=
          person.userData.speed ||
          0.018;


        if (
          person.position.x >
          -5
        ) {

          person.position.x =
            -48;

        }

      }
    );

  }


  /* =========================================================
     CITY START
  ========================================================= */

  function startLivingCity() {

    if (cityStarted) {
      return;
    }


    const world =
      getWorld();


    if (!world) {

      setTimeout(
        startLivingCity,
        700
      );

      return;

    }


    cityStarted = true;


    const THREE =
      world.THREE;


    cityGroup =
      new THREE.Group();


    cityGroup.name =
      "EmpireRushLivingCity";


    world.scene.add(
      cityGroup
    );


    createCityGround(
      THREE
    );


    createRoadNetwork(
      THREE
    );


    createSidewalks(
      THREE
    );


    createPark(
      THREE
    );


    createCityBuildings(
      THREE
    );


    createTrees(
      THREE
    );


    createStreetLights(
      THREE
    );


    createTraffic(
      THREE
    );


    createPedestrians(
      THREE
    );


    trafficTimer =
      setInterval(
        updateTraffic,
        100
      );


    pedestrianTimer =
      setInterval(
        updatePedestrians,
        100
      );


    window.EmpireLivingCity = {

      group:
        cityGroup,

      refresh:
        function () {

          console.log(
            "🏙️ Empire city refreshed"
          );

        },

      getCars:
        function () {

          return cars;

        },

      getPedestrians:
        function () {

          return pedestrians;

        }

    };


    console.log(
      "🏙️ EMPIRE RUSH LIVING CITY ONLINE"
    );

  }


  /* =========================================================
     EVENTS
  ========================================================= */

  window.addEventListener(
    "EmpireEmployeeSelected",
    function (event) {

      if (
        event &&
        event.detail
      ) {

        showEmployee(
          event.detail
        );

      }

    }
  );


  window.addEventListener(
    "EmpireEmployeeHired",
    function (event) {

      if (
        !event ||
        !event.detail
      ) {
        return;
      }


      const employee =
        event.detail;


      employeeRecords[
        employee.name
      ] = {

        salary:
          employee.salary ||
          30000,

        performance:
          employee.performance ||
          75,

        experience:
          employee.experience ||
          1,

        morale:
          employee.morale ||
          75,

        status:
          "New Hire",

        role:
          employee.role ||
          "Employee",

        department:
          employee.department ||
          "General"

      };


      console.log(
        "👤 EMPLOYEE DATABASE UPDATED:",
        employee.name
      );

    }
  );


  /* =========================================================
     WORLD READY
  ========================================================= */

  function onWorldReady() {

    if (worldReady) {
      return;
    }


    worldReady = true;


    console.log(
      "🌎 WORLD3D.JS CONNECTED"
    );


    ensurePanel();


    /*
     * Start both systems after
     * Three.js world has finished
     * creating employees.
     */

    setTimeout(
      function () {

        startLivingHQ();

        runWorkRoutine();

        startLivingCity();

      },
      1200
    );

  }


  window.addEventListener(
    "EmpireWorldReady",
    onWorldReady
  );


  /* =========================================================
     FALLBACK
  ========================================================= */

  function waitForWorld() {

    if (
      window.EmpireWorld
    ) {

      onWorldReady();

      return;

    }


    setTimeout(
      waitForWorld,
      500
    );

  }


  if (
    window.EmpireWorld
  ) {

    onWorldReady();

  }
  else {

    waitForWorld();

  }


  /* =========================================================
     PUBLIC API
  ========================================================= */

  window.EmpireWorkforceWorld = {

    employees:
      employeeRecords,


    getEmployee:
      function (name) {

        return recordFor(
          name
        );

      },


    selectEmployee:
      function (name) {

        const worker =
          findWorkerByName(
            name
          );


        if (worker) {

          showEmployee(
            worker.userData
          );

        }

      },


    meeting:
      startMeeting,


    break:
      startBreak,


    work:
      runWorkRoutine,


    assignTask:
      assignTask

  };


  /* =========================================================
     CLEANUP
  ========================================================= */

  window.addEventListener(
    "beforeunload",
    function () {

      if (routineTimer) {

        clearInterval(
          routineTimer
        );

        routineTimer = null;

      }


      if (trafficTimer) {

        clearInterval(
          trafficTimer
        );

        trafficTimer = null;

      }


      if (pedestrianTimer) {

        clearInterval(
          pedestrianTimer
        );

        pedestrianTimer = null;

      }

    }
  );

})();
