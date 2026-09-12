(function () {
  "use strict";

  const employeeRecords = {
    Aarav: {
      salary: 42000,
      performance: 86,
      experience: 4,
      morale: 82,
      status: "Working"
    },

    Riya: {
      salary: 38000,
      performance: 91,
      experience: 3,
      morale: 88,
      status: "Working"
    },

    Kabir: {
      salary: 35000,
      performance: 78,
      experience: 2,
      morale: 76,
      status: "Working"
    },

    Anaya: {
      salary: 45000,
      performance: 89,
      experience: 5,
      morale: 84,
      status: "Working"
    },

    Vivaan: {
      salary: 40000,
      performance: 83,
      experience: 4,
      morale: 80,
      status: "Working"
    },

    Meera: {
      salary: 32000,
      performance: 87,
      experience: 2,
      morale: 90,
      status: "Working"
    },

    Arjun: {
      salary: 48000,
      performance: 94,
      experience: 6,
      morale: 86,
      status: "Working"
    },

    Ishita: {
      salary: 30000,
      performance: 85,
      experience: 2,
      morale: 88,
      status: "Working"
    }
  };

  let selectedEmployee = null;

  function setupPanel() {
    const panel = document.getElementById("employeePanel");

    if (!panel) return;

    let extra = document.getElementById("employeeExtra");

    if (!extra) {
      extra = document.createElement("div");
      extra.id = "employeeExtra";

      extra.innerHTML = `
        <div style="
          margin-top:12px;
          padding-top:10px;
          border-top:1px solid rgba(255,255,255,.12);
          line-height:1.7;
        ">
          <div id="esalary"></div>
          <div id="eperformance"></div>
          <div id="eexperience"></div>
          <div id="emorale"></div>
        </div>

        <button id="employeeDetailsBtn" style="
          width:100%;
          margin-top:14px;
          padding:10px;
          border:0;
          border-radius:10px;
          background:#ffffff;
          color:#111;
          font-weight:700;
          cursor:pointer;
        ">
          Open Employee Details
        </button>
      `;

      panel.appendChild(extra);

      document
        .getElementById("employeeDetailsBtn")
        .addEventListener("click", openDetails);
    }
  }

  function showEmployee(employee) {
    if (!employee || !employee.name) return;

    selectedEmployee = employee;

    const record =
      employeeRecords[employee.name] || {
        salary: 25000,
        performance: 70,
        experience: 1,
        morale: 75,
        status: "Working"
      };

    setupPanel();

    const panel = document.getElementById("employeePanel");

    if (!panel) return;

    document.getElementById("ename").textContent =
      employee.name;

    document.getElementById("erole").textContent =
      "Role: " + employee.role;

    document.getElementById("edept").textContent =
      "Department: " + employee.dept;

    document.getElementById("estatus").textContent =
      "Status: " + record.status;

    document.getElementById("esalary").textContent =
      "💰 Salary: ₹" +
      record.salary.toLocaleString("en-IN") +
      " / month";

    document.getElementById("eperformance").textContent =
      "📈 Performance: " +
      record.performance +
      "%";

    document.getElementById("eexperience").textContent =
      "⭐ Experience: " +
      record.experience +
      " years";

    document.getElementById("emorale").textContent =
      "😊 Morale: " +
      record.morale +
      "%";

    panel.style.display = "block";
  }

  function openDetails() {
    if (!selectedEmployee) return;

    alert(
      selectedEmployee.name +
      "\n\n" +
      "Role: " + selectedEmployee.role +
      "\nDepartment: " + selectedEmployee.dept +
      "\n\nEmployee management system will be expanded here."
    );
  }

  function start() {
    setupPanel();

    window.addEventListener(
      "EmpireEmployeeSelected",
      function (event) {
        showEmployee(event.detail);
      }
    );

    /*
      If the main 3D world is already loaded,
      connect immediately.
    */
    if (window.EmpireWorld) {
      window.EmpireWorld.employeeUI = showEmployee;
    }
  }

  start();

})();
