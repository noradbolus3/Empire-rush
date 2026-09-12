/* =========================================================
   EMPIRE RUSH — 3D WORLD MODULE
   Employee + Department Interaction System
   ========================================================= */

(function () {
  "use strict";

  function startEmpireWorld() {

    if (!window.EmpireWorld) {
      console.warn("EmpireWorld bridge not ready.");
      return;
    }

    const {
      scene,
      camera,
      renderer,
      controls,
      HQ
    } = window.EmpireWorld;

    if (!scene || !camera || !renderer) {
      console.warn("Empire Rush 3D core not found.");
      return;
    }

    /* =====================================================
       DATA
       ===================================================== */

    const employees = [
      {
        id: "EMP001",
        name: "Aarav Sharma",
        role: "Operations Manager",
        department: "Operations",
        salary: 42000,
        performance: 87,
        status: "Working"
      },
      {
        id: "EMP002",
        name: "Riya Verma",
        role: "Finance Analyst",
        department: "Finance",
        salary: 38000,
        performance: 91,
        status: "Working"
      },
      {
        id: "EMP003",
        name: "Kabir Singh",
        role: "Sales Executive",
        department: "Sales",
        salary: 32000,
        performance: 82,
        status: "Working"
      },
      {
        id: "EMP004",
        name: "Ananya Gupta",
        role: "HR Manager",
        department: "Human Resources",
        salary: 40000,
        performance: 89,
        status: "Meeting"
      },
      {
        id: "EMP005",
        name: "Vivaan Mehta",
        role: "Product Manager",
        department: "Product",
        salary: 52000,
        performance: 94,
        status: "Working"
      },
      {
        id: "EMP006",
        name: "Ishita Rao",
        role: "Marketing Specialist",
        department: "Marketing",
        salary: 36000,
        performance: 86,
        status: "Working"
      },
      {
        id: "EMP007",
        name: "Aditya Jain",
        role: "Software Engineer",
        department: "Technology",
        salary: 60000,
        performance: 93,
        status: "Working"
      },
      {
        id: "EMP008",
        name: "Meera Kapoor",
        role: "Legal Executive",
        department: "Legal",
        salary: 48000,
        performance: 88,
        status: "Working"
      },
      {
        id: "EMP009",
        name: "Arjun Malhotra",
        role: "Supply Manager",
        department: "Supply Chain",
        salary: 41000,
        performance: 84,
        status: "Working"
      },
      {
        id: "EMP010",
        name: "Sara Khan",
        role: "Executive Assistant",
        department: "Management",
        salary: 35000,
        performance: 90,
        status: "Working"
      }
    ];

    /* =====================================================
       EMPLOYEE GROUP
       ===================================================== */

    const employeeLayer = new THREE.Group();
    employeeLayer.name = "EmpireEmployees";
    scene.add(employeeLayer);

    const employeeMeshes = [];

    /* =====================================================
       MATERIALS
       ===================================================== */

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xc98f68,
      roughness: 0.8
    });

    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: 0x315b88,
      roughness: 0.75
    });

    const trouserMaterial = new THREE.MeshStandardMaterial({
      color: 0x27303a,
      roughness: 0.8
    });

    const shoeMaterial = new THREE.MeshStandardMaterial({
      color: 0x17191c,
      roughness: 0.9
    });

    /* =====================================================
       CREATE EMPLOYEE
       ===================================================== */

    function createEmployee(employee, index) {

      const person = new THREE.Group();

      person.userData.employee = employee;
      person.userData.type = "employee";

      /* body */

      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.28, 0.65, 4, 8),
        shirtMaterial
      );

      body.position.y = 0.85;
      person.add(body);

      /* head */

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 12, 10),
        skinMaterial
      );

      head.position.y = 1.48;
      person.add(head);

      /* legs */

      const legGeometry =
        new THREE.BoxGeometry(0.13, 0.48, 0.15);

      const leftLeg =
        new THREE.Mesh(legGeometry, trouserMaterial);

      const rightLeg =
        new THREE.Mesh(legGeometry, trouserMaterial);

      leftLeg.position.set(-0.10, 0.38, 0);
      rightLeg.position.set(0.10, 0.38, 0);

      person.add(leftLeg);
      person.add(rightLeg);

      /* shoes */

      const shoeGeometry =
        new THREE.BoxGeometry(0.17, 0.10, 0.28);

      const leftShoe =
        new THREE.Mesh(shoeGeometry, shoeMaterial);

      const rightShoe =
        new THREE.Mesh(shoeGeometry, shoeMaterial);

      leftShoe.position.set(-0.10, 0.10, 0.05);
      rightShoe.position.set(0.10, 0.10, 0.05);

      person.add(leftShoe);
      person.add(rightShoe);

      /* arms */

      const armGeometry =
        new THREE.CapsuleGeometry(0.075, 0.35, 3, 6);

      const leftArm =
        new THREE.Mesh(armGeometry, shirtMaterial);

      const rightArm =
        new THREE.Mesh(armGeometry, shirtMaterial);

      leftArm.rotation.z = -0.15;
      rightArm.rotation.z = 0.15;

      leftArm.position.set(-0.34, 0.93, 0);
      rightArm.position.set(0.34, 0.93, 0);

      person.add(leftArm);
      person.add(rightArm);

      /* position */

      const positions = [
        [-9, 0, -4],
        [-5, 0, -4],
        [-1, 0, -4],
        [3, 0, -4],
        [7, 0, -4],

        [-9, 0, 1],
        [-5, 0, 1],
        [-1, 0, 1],
        [3, 0, 1],
        [7, 0, 1]
      ];

      const p = positions[index % positions.length];

      person.position.set(p[0], p[1], p[2]);

      person.scale.setScalar(0.9);

      employeeLayer.add(person);

      employeeMeshes.push(person);

      return person;
    }

    employees.forEach(createEmployee);

    /* =====================================================
       INTERACTION
       ===================================================== */

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    let selectedEmployee = null;

    function getEmployeeFromObject(object) {

      let current = object;

      while (current) {

        if (
          current.userData &&
          current.userData.employee
        ) {
          return current;
        }

        current = current.parent;
      }

      return null;
    }

    function selectEmployee(employeeObject) {

      if (!employeeObject) return;

      selectedEmployee = employeeObject;

      const employee =
        employeeObject.userData.employee;

      showEmployeePanel(employee);
    }

    function onPointerDown(event) {

      const rect =
        renderer.domElement.getBoundingClientRect();

      pointer.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

      pointer.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      const hits =
        raycaster.intersectObjects(
          employeeLayer.children,
          true
        );

      if (!hits.length) return;

      const employeeObject =
        getEmployeeFromObject(hits[0].object);

      if (employeeObject) {
        selectEmployee(employeeObject);
      }
    }

    renderer.domElement.addEventListener(
      "pointerdown",
      onPointerDown
    );

    /* =====================================================
       EMPLOYEE UI
       ===================================================== */

    const panel = document.createElement("div");

    panel.id = "employee-panel";

    panel.style.cssText = `
      position:fixed;
      right:18px;
      top:90px;
      width:290px;
      max-width:calc(100vw - 36px);
      background:rgba(17,20,27,.96);
      color:white;
      border:1px solid rgba(255,255,255,.12);
      border-radius:18px;
      padding:18px;
      font-family:Arial,sans-serif;
      box-shadow:0 18px 50px rgba(0,0,0,.35);
      z-index:9999;
      display:none;
      backdrop-filter:blur(12px);
    `;

    document.body.appendChild(panel);

    function showEmployeePanel(employee) {

      panel.style.display = "block";

      panel.innerHTML = `
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:14px;
        ">
          <strong style="font-size:18px;">
            ${employee.name}
          </strong>

          <button
            id="employee-close"
            style="
              background:none;
              border:0;
              color:#aaa;
              font-size:22px;
              cursor:pointer;
            "
          >×</button>
        </div>

        <div style="
          font-size:13px;
          color:#aeb6c4;
          margin-bottom:14px;
        ">
          ${employee.role}
        </div>

        <div style="
          display:grid;
          gap:9px;
          font-size:14px;
        ">

          <div>
            <span style="color:#8d96a6;">
              Department
            </span><br>
            <strong>${employee.department}</strong>
          </div>

          <div>
            <span style="color:#8d96a6;">
              Salary
            </span><br>
            <strong>₹${employee.salary.toLocaleString("en-IN")}/month</strong>
          </div>

          <div>
            <span style="color:#8d96a6;">
              Performance
            </span><br>
            <strong>${employee.performance}%</strong>
          </div>

          <div>
            <span style="color:#8d96a6;">
              Current Status
            </span><br>
            <strong>${employee.status}</strong>
          </div>

        </div>

        <button
          id="employee-details"
          style="
            width:100%;
            margin-top:16px;
            padding:11px;
            border:0;
            border-radius:10px;
            background:#ffffff;
            color:#111;
            font-weight:700;
            cursor:pointer;
          "
        >
          Open Employee Details
        </button>
      `;

      document
        .getElementById("employee-close")
        .onclick = () => {
          panel.style.display = "none";
        };

      document
        .getElementById("employee-details")
        .onclick = () => {

          alert(
            employee.name +
            "\\n\\n" +
            employee.role +
            "\\n" +
            employee.department +
            "\\n\\n" +
            "Performance: " +
            employee.performance +
            "%"
          );

        };
    }

    /* =====================================================
       DEPARTMENT LABELS
       ===================================================== */

    const departmentPositions = [
      {
        name: "OPERATIONS",
        x: -11,
        z: -8
      },
      {
        name: "FINANCE",
        x: -4,
        z: -8
      },
      {
        name: "SALES",
        x: 3,
        z: -8
      },
      {
        name: "PRODUCT",
        x: 10,
        z: -8
      }
    ];

    function createDepartmentLabel(data) {

      const canvas =
        document.createElement("canvas");

      canvas.width = 512;
      canvas.height = 128;

      const ctx = canvas.getContext("2d");

      ctx.fillStyle =
        "rgba(12,16,22,.82)";

      ctx.roundRect(
        10,
        20,
        492,
        88,
        20
      );

      ctx.fill();

      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        "bold 32px Arial";

      ctx.textAlign =
        "center";

      ctx.fillText(
        data.name,
        256,
        75
      );

      const texture =
        new THREE.CanvasTexture(canvas);

      const material =
        new THREE.SpriteMaterial({
          map: texture,
          transparent: true
        });

      const sprite =
        new THREE.Sprite(material);

      sprite.scale.set(3.8, 0.95, 1);

      sprite.position.set(
        data.x,
        3.4,
        data.z
      );

      scene.add(sprite);
    }

    departmentPositions.forEach(
      createDepartmentLabel
    );

    /* =====================================================
       ANIMATION
       ===================================================== */

    let time = 0;

    function updateEmployees(delta) {

      time += delta;

      employeeMeshes.forEach(
        (person, index) => {

          const offset =
            index * 0.45;

          person.position.y =
            Math.sin(time * 1.5 + offset) * 0.015;

          person.rotation.y =
            Math.sin(time * 0.4 + offset) * 0.04;

        }
      );
    }

    /* =====================================================
       EXPOSE MODULE
       ===================================================== */

    window.EmpireEmployees = {

      employees,

      selectEmployee,

      update(delta) {
        updateEmployees(delta);
      }

    };

    console.log(
      "Empire Rush 3D Employee System loaded."
    );
  }

  /* =======================================================
     WAIT FOR THREE.JS WORLD
     ======================================================= */

  if (window.EmpireWorld) {

    startEmpireWorld();

  } else {

    window.addEventListener(
      "EmpireWorldReady",
      startEmpireWorld,
      { once: true }
    );

  }

})();
