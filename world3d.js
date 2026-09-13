(function () {
  "use strict";

  /*
   * =========================================================
   * EMPIRE RUSH — WORLD 3D / LIVING HQ CONTROLLER
   * Phase 1
   *
   * Responsibilities:
   * - Employee data/UI
   * - Employee selection
   * - Employee actions
   * - Living HQ routines
   * - Desk movement
   * - Meeting movement
   * - Break movement
   * - Working / Meeting / Break states
   * - Connection with world3d.html
   * =========================================================
   */


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
     STATE
  ========================================================= */

  let selectedEmployee = null;

  let setupPanel = null;

  let employeeActionPanel = null;

  let simulationStarted = false;

  let routineTimer = null;

  let worldReady = false;


  /* =========================================================
     HELPERS
  ========================================================= */

  function getWorld() {

    if (
      window.EmpireWorld &&
      window.EmpireWorld.workers
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

    const workers = world.workers || [];

    for (let i = 0; i < workers.length; i++) {

      const worker = workers[i];

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
      document.getElementById("employeeActionPanel")
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
      "48px";

    employeeActionPanel.style.width =
      "245px";

    employeeActionPanel.style.padding =
      "14px";

    employeeActionPanel.style.borderRadius =
      "17px";

    employeeActionPanel.style.background =
      "rgba(16,20,25,.96)";

    employeeActionPanel.style.color =
      "#fff";

    employeeActionPanel.style.zIndex =
      "30";

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

      <div id="employeeActionName"
           style="
             color:#baf02c;
             font-weight:700;
             margin-bottom:10px;
           ">
      </div>

      <button data-action="raise"
        style="width:100%;margin:4px 0;padding:9px;">
        Give Raise
      </button>

      <button data-action="train"
        style="width:100%;margin:4px 0;padding:9px;">
        Training
      </button>

      <button data-action="promote"
        style="width:100%;margin:4px 0;padding:9px;">
        Promote
      </button>

      <button data-action="task"
        style="width:100%;margin:4px 0;padding:9px;">
        Assign Task
      </button>

      <button data-action="close"
        style="
          width:100%;
          margin-top:8px;
          padding:8px;
          background:#30363e;
          color:#fff;
          border:0;
          border-radius:8px;
        ">
        Close
      </button>

    `;


    document.body.appendChild(
      employeeActionPanel
    );


    employeeActionPanel
      .addEventListener(
        "click",
        function (event) {

          const action =
            event.target.dataset.action;

          if (!action) {
            return;
          }

          if (action === "close") {

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
     SELECT EMPLOYEE
  ========================================================= */

  function showEmployee(employee) {

    if (!employee) {
      return;
    }


    selectedEmployee =
      employee;


    const record =
      recordFor(employee.name);


    const name =
      employee.name;


    const role =
      employee.role ||
      record.role ||
      "Employee";


    const dept =
      employee.dept ||
      record.department ||
      "General";


    const status =
      employee.status ||
      record.status ||
      "Working";


    const nameElement =
      document.getElementById("ename");


    const roleElement =
      document.getElementById("erole");


    const deptElement =
      document.getElementById("edept");


    const statusElement =
      document.getElementById("estatus");


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
        "Status: " +
        status;

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


    document.getElementById(
      "employeeActionName"
    ).textContent =
      name +
      " • " +
      role;


    employeeActionPanel.style.display =
      "block";


    console.log(
      "EMPLOYEE SELECTED:",
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

        console.log(
          selectedEmployee.name +
          " received a raise."
        );

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
     REFRESH PANEL
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
     DEPARTMENT DESTINATIONS
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


    const data =
      worker.userData;


    data.targetX = x;

    data.targetZ = z;

    data.status =
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
        employee.dept
      );


    moveWorker(
      worker,
      target[0],
      target[1],
      "Working"
    );

  }


  /* =========================================================
     MEETING ROUTINE
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
      world.workers ||
      [];


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


      if (!worker.userData) {
        continue;
      }


      selected.push(
        worker
      );

    }


    selected.forEach(
      function(worker,index){

        const target =
          meetingPositions[
            index
          ];


        worker.userData.status =
          "Meeting";


        moveWorker(
          worker,
          target[0],
          target[1],
          "Meeting"
        );

      }
    );


    console.log(
      "HQ MEETING STARTED"
    );


    setTimeout(
      function(){

        selected.forEach(
          function(worker){

            if (
              !worker ||
              !worker.userData
            ) {
              return;
            }


            const target =
              departmentTarget(
                worker.userData.dept
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
          "HQ MEETING ENDED"
        );

      },
      9000
    );

  }


  /* =========================================================
     BREAK ROUTINE
  ========================================================= */

  function startBreak() {

    const world =
      getWorld();


    if (!world) {
      return;
    }


    const workers =
      world.workers ||
      [];


    workers.forEach(
      function(worker,index){

        if (!worker.userData) {
          return;
        }


        if (
          index % 3 !== 0
        ) {
          return;
        }


        worker.userData.status =
          "Break";


        moveWorker(
          worker,
          -1 + Math.random() * 5,
          -2 + Math.random() * 3,
          "Break"
        );

      }
    );

  }


  /* =========================================================
     NORMAL WORK ROUTINE
  ========================================================= */

  function runWorkRoutine() {

    const world =
      getWorld();


    if (!world) {
      return;
    }


    const workers =
      world.workers ||
      [];


    workers.forEach(
      function(worker){

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
            employee.dept
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


    /*
     * Employees move between
     * work areas periodically.
     */

    routineTimer =
      setInterval(
        function(){

          const roll =
            Math.random();


          if (roll < 0.15) {

            startMeeting();

          }
          else if (roll < 0.28) {

            startBreak();

          }
          else {

            runWorkRoutine();

          }

        },
        12000
      );


    console.log(
      "EMPIRE RUSH LIVING HQ ONLINE"
    );

  }


  /* =========================================================
     EMPLOYEE SELECT EVENT
  ========================================================= */

  window.addEventListener(
    "EmpireEmployeeSelected",
    function(event){

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


  /* =========================================================
     EMPLOYEE HIRED EVENT
  ========================================================= */

  window.addEventListener(
    "EmpireEmployeeHired",
    function(event){

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
        "EMPLOYEE DATABASE UPDATED:",
        employee.name
      );

    }
  );


  /* =========================================================
     WORLD READY
  ========================================================= */

  function onWorldReady() {

    worldReady = true;

    console.log(
      "WORLD3D.JS CONNECTED TO EMPIRE WORLD"
    );


    ensurePanel();


    /*
     * Give the 3D world a moment
     * to finish spawning GLB employees.
     */

    setTimeout(
      function(){

        startLivingHQ();

        runWorkRoutine();

      },
      2500
    );

  }


  window.addEventListener(
    "EmpireWorldReady",
    onWorldReady
  );


  /* =========================================================
     FALLBACK INITIALIZATION
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


  /*
   * world3d.html dispatches
   * EmpireWorldReady before this
   * normal script may execute.
   */

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
      function(name){

        return recordFor(name);

      },


    selectEmployee:
      function(name){

        const worker =
          findWorkerByName(name);

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
    function(){

      if (routineTimer) {

        clearInterval(
          routineTimer
        );

        routineTimer = null;

      }

    }
  );


/* ============================================================
   EMPIRE RUSH — LIVING CITY VISUAL LAYER
   Roads + Park + Buildings + Traffic + Pedestrians
   ============================================================ */

(function () {
  "use strict";

  let started = false;
  let cityGroup = null;
  let trafficTimer = null;
  let pedestrianTimer = null;

  function getWorld() {
    return window.EmpireWorld || null;
  }

  function startLivingCity() {
    if (started) return;

    const world = getWorld();
    if (!world || !world.scene || !world.THREE) {
      setTimeout(startLivingCity, 1000);
      return;
    }

    started = true;

    const THREE = world.THREE;
    const scene = world.scene;

    cityGroup = new THREE.Group();
    cityGroup.name = "EmpireLivingCity";
    scene.add(cityGroup);

    createGround(THREE);
    createRoadNetwork(THREE);
    createPark(THREE);
    createCityBuildings(THREE);
    createStreetLights(THREE);
    createTrees(THREE);
    createTraffic(THREE);
    createPedestrians(THREE);

    console.log("🏙️ Empire Rush Living City loaded");

    trafficTimer = setInterval(() => {
      updateTraffic(THREE);
    }, 100);

    pedestrianTimer = setInterval(() => {
      updatePedestrians(THREE);
    }, 100);

    window.EmpireLivingCity = {
      group: cityGroup,
      refresh: () => {
        console.log("🏙️ Living city refreshed");
      }
    };
  }

  /* ============================================================
     GROUND
     ============================================================ */

  function createGround(THREE) {

    const groundGeometry =
      new THREE.PlaneGeometry(180, 180);

    const groundMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x71806d,
        roughness: 1
      });

    const ground =
      new THREE.Mesh(
        groundGeometry,
        groundMaterial
      );

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.08;
    ground.name = "CityGround";

    cityGroup.add(ground);
  }

  /* ============================================================
     ROADS
     ============================================================ */

  function createRoadNetwork(THREE) {

    createRoad(
      THREE,
      0,
      -28,
      150,
      10,
      true
    );

    createRoad(
      THREE,
      0,
      28,
      150,
      10,
      true
    );

    createRoad(
      THREE,
      -45,
      0,
      10,
      150,
      false
    );

    createRoad(
      THREE,
      45,
      0,
      10,
      150,
      false
    );

    createRoad(
      THREE,
      0,
      0,
      110,
      8,
      true
    );
  }

  function createRoad(
    THREE,
    x,
    z,
    width,
    depth,
    horizontal
  ) {

    const geometry =
      new THREE.BoxGeometry(
        horizontal ? width : depth,
        0.12,
        horizontal ? depth : width
      );

    const material =
      new THREE.MeshStandardMaterial({
        color: 0x30343a,
        roughness: 0.9
      });

    const road =
      new THREE.Mesh(
        geometry,
        material
      );

    road.position.set(x, 0.01, z);
    road.name = "CityRoad";

    cityGroup.add(road);

    /* Road markings */

    const lineMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xf2f2f2
      });

    const lineGeometry =
      new THREE.BoxGeometry(
        horizontal ? 4 : 0.3,
        0.04,
        horizontal ? 0.3 : 4
      );

    for (
      let i = -60;
      i <= 60;
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
      } else {
        line.position.set(
          x,
          0.09,
          i
        );
      }

      cityGroup.add(line);
    }
  }

  /* ============================================================
     PARK
     ============================================================ */

  function createPark(THREE) {

    const parkGeometry =
      new THREE.BoxGeometry(
        32,
        0.25,
        24
      );

    const parkMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x527a4d,
        roughness: 1
      });

    const park =
      new THREE.Mesh(
        parkGeometry,
        parkMaterial
      );

    park.position.set(
      -25,
      0.14,
      15
    );

    park.name = "CentralPark";

    cityGroup.add(park);

    /* Walking paths */

    const pathMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xb7aa91
      });

    const path1 =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          28,
          0.08,
          2
        ),
        pathMaterial
      );

    path1.position.set(
      -25,
      0.3,
      15
    );

    cityGroup.add(path1);

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
      0.31,
      15
    );

    cityGroup.add(path2);

    /* Benches */

    for (
      let i = -1;
      i <= 1;
      i++
    ) {

      createBench(
        THREE,
        -35,
        15 + i * 7
      );
    }
  }

  function createBench(THREE, x, z) {

    const material =
      new THREE.MeshStandardMaterial({
        color: 0x704c32
      });

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

    cityGroup.add(seat);

    for (
      const dx of [-1.4, 1.4]
    ) {

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

      cityGroup.add(leg);
    }
  }

  /* ============================================================
     CITY BUILDINGS
     ============================================================ */

  function createCityBuildings(THREE) {

    const positions = [
      [-60, -45, 14, 12, 18],
      [-35, -45, 18, 15, 22],
      [35, -45, 16, 14, 20],
      [60, -45, 12, 12, 17],

      [-60, 45, 18, 15, 22],
      [-35, 45, 14, 12, 18],
      [35, 45, 20, 16, 25],
      [60, 45, 14, 12, 18],

      [-65, 0, 15, 13, 20],
      [65, 0, 20, 16, 25]
    ];

    positions.forEach(
      data => {

        const [
          x,
          z,
          w,
          d,
          h
        ] = data;

        const geometry =
          new THREE.BoxGeometry(
            w,
            h,
            d
          );

        const material =
          new THREE.MeshStandardMaterial({
            color:
              0x9ca7ae,
            roughness:
              0.85
          });

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
          "CityBuilding";

        cityGroup.add(building);

        createWindows(
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

  function createWindows(
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
        let xx = -w / 2 + 2;
        xx < w / 2;
        xx += 4
      ) {

        const window =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              1.5,
              1.5,
              0.08
            ),
            material
          );

        window.position.set(
          x + xx,
          y,
          z - d / 2 - 0.05
        );

        cityGroup.add(window);
      }
    }
  }

  /* ============================================================
     TREES
     ============================================================ */

  function createTrees(THREE) {

    const locations = [
      [-38, 8],
      [-38, 22],
      [-30, 8],
      [-22, 22],
      [-15, 10],
      [20, 38],
      [30, 38],
      [55, 18],
      [55, -18],
      [-55, 18],
      [-55, -18]
    ];

    locations.forEach(
      ([x, z]) => {

        const trunk =
          new THREE.Mesh(
            new THREE.CylinderGeometry(
              0.35,
              0.45,
              2.2,
              8
            ),
            new THREE.MeshStandardMaterial({
              color: 0x68482f
            })
          );

        trunk.position.set(
          x,
          1.1,
          z
        );

        cityGroup.add(trunk);

        const crown =
          new THREE.Mesh(
            new THREE.SphereGeometry(
              1.8,
              10,
              8
            ),
            new THREE.MeshStandardMaterial({
              color: 0x477348
            })
          );

        crown.position.set(
          x,
          3.1,
          z
        );

        cityGroup.add(crown);
      }
    );
  }

  /* ============================================================
     STREET LIGHTS
     ============================================================ */

  function createStreetLights(THREE) {

    const positions = [
      [-10, -28],
      [10, -28],
      [-10, 28],
      [10, 28],
      [-45, -10],
      [-45, 10],
      [45, -10],
      [45, 10]
    ];

    positions.forEach(
      ([x, z]) => {

        const pole =
          new THREE.Mesh(
            new THREE.CylinderGeometry(
              0.12,
              0.16,
              5
            ),
            new THREE.MeshStandardMaterial({
              color: 0x22262b
            })
          );

        pole.position.set(
          x,
          2.5,
          z
        );

        cityGroup.add(pole);

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

        cityGroup.add(lamp);
      }
    );
  }

  /* ============================================================
     TRAFFIC
     ============================================================ */

  const cars = [];

  function createTraffic(THREE) {

    for (
      let i = 0;
      i < 8;
      i++
    ) {

      const car =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            2.4,
            0.8,
            1.3
          ),
          new THREE.MeshStandardMaterial({
            color:
              i % 2 === 0
                ? 0x394b5c
                : 0x8c4a3d
          })
        );

      car.position.set(
        -70 + i * 18,
        0.7,
        -28
      );

      car.userData.speed =
        0.08 + Math.random() * 0.06;

      cityGroup.add(car);

      cars.push(car);
    }
  }

  function updateTraffic(THREE) {

    cars.forEach(
      car => {

        car.position.x +=
          car.userData.speed;

        if (
          car.position.x > 75
        ) {
          car.position.x = -75;
        }
      }
    );
  }

  /* ============================================================
     PEDESTRIANS
     ============================================================ */

  const pedestrians = [];

  function createPedestrians(THREE) {

    for (
      let i = 0;
      i < 15;
      i++
    ) {

      const person =
        new THREE.Group();

      const body =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.3,
            0.35,
            1.3,
            8
          ),
          new THREE.MeshStandardMaterial({
            color:
              0x737b86
          })
        );

      body.position.y =
        0.9;

      person.add(body);

      const head =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.35,
            8,
            8
          ),
          new THREE.MeshStandardMaterial({
            color:
              0xc7b09a
          })
        );

      head.position.y =
        1.8;

      person.add(head);

      person.position.set(
        -35 + Math.random() * 25,
        0,
        5 + Math.random() * 20
      );

      person.userData.speed =
        0.015 +
        Math.random() * 0.025;

      cityGroup.add(person);

      pedestrians.push(person);
    }
  }

  function updatePedestrians(THREE) {

    pedestrians.forEach(
      person => {

        person.position.x +=
          person.userData.speed;

        if (
          person.position.x > -8
        ) {
          person.position.x = -45;
        }
      }
    );
  }

  /* ============================================================
     START
     ============================================================ */

  window.addEventListener(
    "EmpireWorldReady",
    () => {
      startLivingCity();
    }
  );

  /* fallback */
  setTimeout(
    startLivingCity,
    1500
  );

})();
})();
