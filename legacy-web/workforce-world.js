/* =========================================================
   EMPIRE RUSH — WORKFORCE 3D BRIDGE
   Connects newly hired employees to the 3D office
   ========================================================= */

(function () {

  "use strict";

  let hiredVisuals = {};

  const DEPARTMENT_POSITIONS = {

    Operations: [
      [-5, 0, -2],
      [-3, 0, -2],
      [-1, 0, -2],
      [1, 0, -2],
      [3, 0, -2]
    ],

    Sales: [
      [-5, 0, 2],
      [-3, 0, 2],
      [-1, 0, 2],
      [1, 0, 2]
    ],

    Finance: [
      [3, 0, 2],
      [5, 0, 2]
    ],

    Product: [
      [-5, 0, 5],
      [-3, 0, 5],
      [-1, 0, 5],
      [1, 0, 5]
    ],

    Management: [
      [5, 0, -4],
      [3, 0, -4]
    ],

    "Human Resources": [
      [5, 0, 5]
    ],

    Marketing: [
      [-5, 0, 7],
      [-3, 0, 7]
    ]
  };


  function waitForWorld(callback) {

    if (
      window.EmpireWorld &&
      window.EmpireWorld.HQ &&
      window.THREE
    ) {

      callback();

      return;
    }

    window.addEventListener(
      "EmpireWorldReady",
      callback,
      { once: true }
    );
  }


  function createMaterial(color) {

    return new THREE.MeshStandardMaterial({
      color: color
    });

  }


  function createEmployeeModel(employee) {

    const group =
      new THREE.Group();

    group.userData.employee =
      employee;

    group.userData.isEmployee =
      true;


    /*
      Body
    */

    const bodyGeometry =
      new THREE.CylinderGeometry(
        0.28,
        0.34,
        0.8,
        10
      );

    const body =
      new THREE.Mesh(
        bodyGeometry,
        createMaterial(
          departmentColor(
            employee.department
          )
        )
      );

    body.position.y =
      0.75;

    group.add(body);


    /*
      Head
    */

    const headGeometry =
      new THREE.SphereGeometry(
        0.25,
        12,
        12
      );

    const head =
      new THREE.Mesh(
        headGeometry,
        createMaterial(
          0xf1c7a5
        )
      );

    head.position.y =
      1.35;

    group.add(head);


    /*
      Hair
    */

    const hairGeometry =
      new THREE.SphereGeometry(
        0.255,
        12,
        8,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.55
      );

    const hair =
      new THREE.Mesh(
        hairGeometry,
        createMaterial(
          0x29231f
        )
      );

    hair.position.y =
      1.43;

    group.add(hair);


    /*
      Legs
    */

    const legGeometry =
      new THREE.BoxGeometry(
        0.13,
        0.55,
        0.16
      );

    const legMaterial =
      createMaterial(
        0x27313d
      );


    const leg1 =
      new THREE.Mesh(
        legGeometry,
        legMaterial
      );

    const leg2 =
      new THREE.Mesh(
        legGeometry,
        legMaterial
      );

    leg1.position.set(
      -0.10,
      0.22,
      0
    );

    leg2.position.set(
      0.10,
      0.22,
      0
    );

    group.add(leg1);
    group.add(leg2);


    /*
      Arms
    */

    const armGeometry =
      new THREE.BoxGeometry(
        0.12,
        0.55,
        0.12
      );

    const armMaterial =
      createMaterial(
        departmentColor(
          employee.department
        )
      );


    const arm1 =
      new THREE.Mesh(
        armGeometry,
        armMaterial
      );

    const arm2 =
      new THREE.Mesh(
        armGeometry,
        armMaterial
      );


    arm1.position.set(
      -0.37,
      0.78,
      0
    );

    arm2.position.set(
      0.37,
      0.78,
      0
    );


    arm1.rotation.z =
      -0.18;

    arm2.rotation.z =
      0.18;


    group.add(arm1);
    group.add(arm2);


    /*
      Name plate
    */

    group.userData.label =
      employee.name;

    group.userData.role =
      employee.role;

    group.userData.department =
      employee.department;


    /*
      Small desk indicator
    */

    const markerGeometry =
      new THREE.BoxGeometry(
        0.42,
        0.04,
        0.42
      );

    const marker =
      new THREE.Mesh(
        markerGeometry,
        createMaterial(
          departmentColor(
            employee.department
          )
        )
      );

    marker.position.y =
      0.03;

    group.add(marker);


    return group;
  }


  function departmentColor(department) {

    switch (department) {

      case "Operations":
        return 0x4d8bd8;

      case "Sales":
        return 0x55a96a;

      case "Finance":
        return 0x8c72d9;

      case "Product":
        return 0xd49a4d;

      case "Management":
        return 0xc46a5c;

      case "Human Resources":
        return 0xb06db5;

      case "Marketing":
        return 0x4fa9a9;

      default:
        return 0x7d8792;
    }
  }


  function findPosition(employee) {

    const department =
      employee.department ||
      "Operations";

    const positions =
      DEPARTMENT_POSITIONS[
        department
      ] ||
      DEPARTMENT_POSITIONS.Operations;


    const count =
      Object.keys(
        hiredVisuals
      ).length;


    const index =
      count %
      positions.length;


    return positions[index];
  }


  function addEmployeeToWorld(employee) {

    if (
      !employee ||
      !employee.id
    ) {
      return;
    }


    if (
      hiredVisuals[
        employee.id
      ]
    ) {
      return;
    }


    waitForWorld(
      function () {

        const model =
          createEmployeeModel(
            employee
          );


        const position =
          findPosition(
            employee
          );


        model.position.set(
          position[0],
          position[1],
          position[2]
        );


        model.scale.set(
          1,
          1,
          1
        );


        window.EmpireWorld.HQ.add(
          model
        );


        hiredVisuals[
          employee.id
        ] =
          model;


        /*
          Make model selectable
        */

        model.traverse(
          function (object) {

            if (
              object.isMesh
            ) {

              object.userData.employee =
                employee;

              object.userData.isEmployee =
                true;

            }

          }
        );


        /*
          Small arrival animation
        */

        model.scale.set(
          0.2,
          0.2,
          0.2
        );


        let progress = 0;


        function animateArrival() {

          progress += 0.06;


          const scale =
            Math.min(
              progress,
              1
            );


          model.scale.set(
            scale,
            scale,
            scale
          );


          if (
            progress < 1
          ) {

            requestAnimationFrame(
              animateArrival
            );

          }

        }


        animateArrival();


        /*
          Notify game
        */

        window.dispatchEvent(
          new CustomEvent(
            "EmpireEmployeeSpawned",
            {
              detail: employee
            }
          )
        );

      }
    );

  }


  function removeEmployeeFromWorld(
    employeeId
  ) {

    const model =
      hiredVisuals[
        employeeId
      ];


    if (!model)
      return;


    if (
      model.parent
    ) {

      model.parent.remove(
        model
      );

    }


    delete hiredVisuals[
      employeeId
    ];

  }


  function findEmployeeModel(
    employeeId
  ) {

    return hiredVisuals[
      employeeId
    ] || null;

  }


  /*
    New employee hired
  */

  window.addEventListener(
    "EmpireEmployeeHired",
    function (event) {

      if (
        event.detail
      ) {

        addEmployeeToWorld(
          event.detail
        );

      }

    }
  );


  /*
    Public API
  */

  window.EmpireWorkforceWorld = {

    addEmployee:
      addEmployeeToWorld,

    removeEmployee:
      removeEmployeeFromWorld,

    getEmployeeModel:
      findEmployeeModel,

    getAllVisuals:
      function () {
        return hiredVisuals;
      }

  };


  /*
    Start
  */

  waitForWorld(
    function () {

      console.log(
        "Empire Rush Workforce 3D Bridge Ready"
      );

    }
  );


})();
