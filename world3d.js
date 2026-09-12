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

  const record =
    employeeRecords[selectedEmployee.name];

  if (!record) return;

  let modal = document.getElementById("employeeDetailsModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "employeeDetailsModal";

    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:9999;
      display:flex;
      align-items:center;
      justify-content:center;
      background:rgba(0,0,0,.65);
      font-family:Arial,sans-serif;
    `;

    modal.innerHTML = `
      <div style="
        width:min(92vw,430px);
        max-height:88vh;
        overflow:auto;
        background:#151922;
        color:white;
        border-radius:20px;
        padding:22px;
        box-shadow:0 20px 60px rgba(0,0,0,.5);
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
        ">
          <div>
            <div style="
              font-size:12px;
              opacity:.6;
              text-transform:uppercase;
              letter-spacing:1px;
            ">
              Employee Management
            </div>

            <h2 id="detailName"
              style="margin:5px 0 0;">
            </h2>
          </div>

          <button id="detailClose"
            style="
              width:34px;
              height:34px;
              border:0;
              border-radius:50%;
              background:#2b303b;
              color:white;
              font-size:20px;
            ">
            ×
          </button>
        </div>

        <div id="detailRole"
          style="margin-top:8px;opacity:.7;">
        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
          margin-top:20px;
        ">

          <div class="statBox">
            <small>Salary</small>
            <strong id="detailSalary"></strong>
          </div>

          <div class="statBox">
            <small>Performance</small>
            <strong id="detailPerformance"></strong>
          </div>

          <div class="statBox">
            <small>Experience</small>
            <strong id="detailExperience"></strong>
          </div>

          <div class="statBox">
            <small>Morale</small>
            <strong id="detailMorale"></strong>
          </div>

        </div>

        <div style="
          margin-top:22px;
          font-size:13px;
          opacity:.65;
        ">
          Management Actions
        </div>

        <div style="
          display:grid;
          gap:9px;
          margin-top:10px;
        ">

          <button id="raiseBtn" class="actionBtn">
            💰 Give 10% Raise
          </button>

          <button id="trainBtn" class="actionBtn">
            🎓 Send for Training — ₹5,000
          </button>

          <button id="promoteBtn" class="actionBtn">
            ⭐ Promote Employee
          </button>

          <button id="taskBtn" class="actionBtn">
            📋 Assign Important Task
          </button>

        </div>

        <div id="detailMessage"
          style="
            margin-top:14px;
            min-height:20px;
            text-align:center;
            font-size:13px;
            opacity:.8;
          ">
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    const style = document.createElement("style");

    style.textContent = `
      .statBox {
        background:#202531;
        border-radius:12px;
        padding:13px;
      }

      .statBox small {
        display:block;
        font-size:11px;
        opacity:.55;
        margin-bottom:5px;
      }

      .statBox strong {
        font-size:16px;
      }

      .actionBtn {
        width:100%;
        padding:13px;
        border:0;
        border-radius:11px;
        background:#252b38;
        color:white;
        text-align:left;
        font-size:14px;
        font-weight:600;
      }

      .actionBtn:active {
        transform:scale(.98);
      }
    `;

    document.head.appendChild(style);

    document
      .getElementById("detailClose")
      .onclick = () => {
        modal.style.display = "none";
      };

    document
      .getElementById("raiseBtn")
      .onclick = () => {

        record.salary =
          Math.round(record.salary * 1.10);

        record.morale =
          Math.min(100, record.morale + 8);

        showDetailValues();

        showMessage(
          "Raise approved. Morale increased."
        );
      };

    document
      .getElementById("trainBtn")
      .onclick = () => {

        record.performance =
          Math.min(100, record.performance + 5);

        record.experience += 0.2;

        record.morale =
          Math.min(100, record.morale + 3);

        showDetailValues();

        showMessage(
          "Training completed. Performance improved."
        );
      };

    document
      .getElementById("promoteBtn")
      .onclick = () => {

        record.salary =
          Math.round(record.salary * 1.20);

        record.performance =
          Math.min(100, record.performance + 4);

        record.morale =
          Math.min(100, record.morale + 5);

        selectedEmployee.role =
          "Senior " + selectedEmployee.role;

        showDetailValues();

        showMessage(
          "Promotion approved."
        );
      };

    document
      .getElementById("taskBtn")
      .onclick = () => {

        record.performance =
          Math.min(100, record.performance + 2);

        record.morale =
          Math.max(0, record.morale - 1);

        showDetailValues();

        showMessage(
          "Important task assigned."
        );
      };
  }

  modal.style.display = "flex";

  function showDetailValues() {

    document.getElementById("detailName")
      .textContent = selectedEmployee.name;

    document.getElementById("detailRole")
      .textContent =
        selectedEmployee.role +
        " • " +
        selectedEmployee.dept;

    document.getElementById("detailSalary")
      .textContent =
        "₹" +
        record.salary.toLocaleString("en-IN") +
        "/mo";

    document.getElementById("detailPerformance")
      .textContent =
        record.performance + "%";

    document.getElementById("detailExperience")
      .textContent =
        record.experience.toFixed(1) + " yrs";

    document.getElementById("detailMorale")
      .textContent =
        record.morale + "%";
  }

  function showMessage(message) {
    document.getElementById("detailMessage")
      .textContent = message;

    setTimeout(() => {
      const el =
        document.getElementById("detailMessage");

      if (el) el.textContent = "";
    }, 2200);
  }

  showDetailValues();
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
