/* =========================================================
   EMPIRE RUSH — WORKFORCE & HIRING SYSTEM
   Mobile-first Hiring Module
   ========================================================= */

(function () {
  "use strict";

  const ROLE_LIBRARY = {
    "Mobile Repair Shop": [
      ["Repair Technician", "Operations", 24000, 36000],
      ["Senior Technician", "Operations", 32000, 48000],
      ["Front Desk Executive", "Sales", 18000, 28000],
      ["Shop Manager", "Management", 35000, 55000]
    ],

    "Salon & Grooming Studio": [
      ["Stylist", "Operations", 22000, 35000],
      ["Senior Stylist", "Operations", 32000, 50000],
      ["Receptionist", "Sales", 18000, 28000],
      ["Salon Manager", "Management", 35000, 55000]
    ],

    "Food Cart": [
      ["Food Prep Worker", "Operations", 14000, 22000],
      ["Counter Staff", "Sales", 13000, 21000],
      ["Delivery Rider", "Operations", 14000, 24000]
    ],

    "Home Cleaning Service": [
      ["Field Cleaner", "Operations", 15000, 24000],
      ["Team Leader", "Operations", 22000, 34000],
      ["Customer Executive", "Sales", 18000, 28000],
      ["Operations Manager", "Management", 35000, 55000]
    ],

    "Freelance Agency": [
      ["Junior Specialist", "Operations", 22000, 35000],
      ["Senior Specialist", "Operations", 35000, 55000],
      ["Account Executive", "Sales", 25000, 40000],
      ["Project Manager", "Management", 40000, 65000]
    ],

    "Car Wash": [
      ["Wash Technician", "Operations", 14000, 22000],
      ["Detailing Specialist", "Operations", 20000, 32000],
      ["Front Desk Executive", "Sales", 18000, 28000],
      ["Site Manager", "Management", 32000, 50000]
    ],

    "Café": [
      ["Kitchen Helper", "Operations", 15000, 23000],
      ["Barista", "Operations", 18000, 30000],
      ["Cashier", "Sales", 17000, 26000],
      ["Café Manager", "Management", 32000, 50000]
    ],

    "Retail Store": [
      ["Sales Associate", "Sales", 16000, 26000],
      ["Cashier", "Finance", 16000, 25000],
      ["Inventory Assistant", "Operations", 18000, 28000],
      ["Store Manager", "Management", 35000, 55000]
    ],

    "Restaurant": [
      ["Kitchen Helper", "Operations", 16000, 24000],
      ["Chef", "Operations", 28000, 50000],
      ["Waiter", "Sales", 15000, 24000],
      ["Restaurant Manager", "Management", 40000, 65000]
    ],

    "Logistics Company": [
      ["Delivery Executive", "Operations", 18000, 28000],
      ["Warehouse Associate", "Operations", 17000, 27000],
      ["Dispatch Coordinator", "Operations", 22000, 35000],
      ["Logistics Manager", "Management", 40000, 65000]
    ],

    "Small Manufacturing Factory": [
      ["Machine Operator", "Operations", 22000, 35000],
      ["Quality Inspector", "Operations", 25000, 40000],
      ["Production Supervisor", "Operations", 35000, 55000],
      ["Plant Manager", "Management", 50000, 80000]
    ],

    "Software Company": [
      ["Junior Developer", "Product", 30000, 50000],
      ["Software Developer", "Product", 45000, 75000],
      ["QA Engineer", "Product", 35000, 60000],
      ["Product Manager", "Management", 60000, 100000]
    ]
  };

  const GENERIC_ROLES = [
    ["Operations Executive", "Operations", 20000, 32000],
    ["Sales Executive", "Sales", 20000, 32000],
    ["Finance Executive", "Finance", 22000, 35000],
    ["Office Manager", "Management", 35000, 55000]
  ];

  const FIRST_NAMES = [
    "Aarav","Vivaan","Aditya","Arjun","Kabir","Rohan","Kunal","Rahul",
    "Ananya","Riya","Meera","Ishita","Diya","Aisha","Kavya","Nisha"
  ];

  const LAST_NAMES = [
    "Sharma","Verma","Singh","Gupta","Khan","Patel","Mehta","Jain",
    "Mishra","Yadav","Kapoor","Malhotra"
  ];

  let selectedRole = null;
  let candidates = [];
  let selectedCandidate = null;

  function getState() {
    return window.EmpireSimulation &&
           window.EmpireSimulation.state;
  }

  function money(value) {
    value = Number(value) || 0;

    if (Math.abs(value) >= 10000000)
      return "₹" + (value / 10000000).toFixed(2) + "Cr";

    if (Math.abs(value) >= 100000)
      return "₹" + (value / 100000).toFixed(2) + "L";

    if (Math.abs(value) >= 1000)
      return "₹" + (value / 1000).toFixed(1) + "K";

    return "₹" + Math.round(value).toLocaleString("en-IN");
  }

  function businessName() {
    const state = getState();

    return state &&
           state.business &&
           state.business.name
      ? state.business.name
      : "Business";
  }

  function roles() {
    return ROLE_LIBRARY[businessName()] || GENERIC_ROLES;
  }

  function randomName() {
    return FIRST_NAMES[
      Math.floor(Math.random() * FIRST_NAMES.length)
    ] + " " +
    LAST_NAMES[
      Math.floor(Math.random() * LAST_NAMES.length)
    ];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function generateCandidates(role) {

    const result = [];

    for (let i = 0; i < 4; i++) {

      const experience =
        Math.floor(Math.random() * 7);

      const skill =
        clamp(
          55 +
          experience * 5 +
          Math.floor(Math.random() * 18 - 9),
          45,
          96
        );

      const reliability =
        clamp(
          55 +
          Math.floor(Math.random() * 40),
          50,
          97
        );

      const potential =
        clamp(
          55 +
          Math.floor(Math.random() * 42),
          50,
          98
        );

      const expectedSalary =
        Math.round(
          (
            role.min +
            Math.random() *
            (role.max - role.min)
          ) / 500
        ) * 500;

      result.push({
        id:
          "candidate_" +
          Date.now() +
          "_" +
          i +
          "_" +
          Math.random()
            .toString(16)
            .slice(2),

        name: randomName(),

        role: role.title,

        department: role.department,

        experience,

        skill,

        reliability,

        potential,

        expectedSalary,

        interview: false
      });
    }

    return result;
  }

  function installStyles() {

    if (document.getElementById("er-workforce-style"))
      return;

    const style =
      document.createElement("style");

    style.id = "er-workforce-style";

    style.textContent = `

      #er-workforce-button {

        position:fixed;

        right:16px;

        bottom:166px;

        z-index:10020;

        border:0;

        border-radius:16px;

        padding:13px 16px;

        background:#20252d;

        color:#fff;

        font-weight:800;

        font-size:13px;

        box-shadow:
          0 8px 24px
          rgba(0,0,0,.25);

        touch-action:manipulation;
      }

      #er-workforce-overlay {

        position:fixed;

        inset:0;

        z-index:10030;

        display:none;

        background:
          rgba(7,10,15,.75);

        backdrop-filter:blur(8px);

        -webkit-backdrop-filter:blur(8px);

        overflow:auto;

        padding:12px;

        box-sizing:border-box;
      }

      #er-workforce-panel {

        width:min(760px,100%);

        margin:0 auto;

        min-height:100%;

        box-sizing:border-box;

        border-radius:22px;

        background:#121820;

        color:#fff;

        padding:16px;

        font-family:Arial,sans-serif;

        box-shadow:
          0 20px 60px
          rgba(0,0,0,.4);
      }

      .erw-head {

        display:flex;

        justify-content:space-between;

        align-items:center;

        gap:10px;

        margin-bottom:14px;
      }

      .erw-title {

        font-size:23px;

        font-weight:900;
      }

      .erw-sub {

        font-size:12px;

        color:#9ba7b5;

        margin-top:3px;
      }

      .erw-close {

        width:42px;

        height:42px;

        border:0;

        border-radius:14px;

        background:#29313c;

        color:#fff;

        font-size:20px;

        touch-action:manipulation;
      }

      .erw-card {

        background:#1a222d;

        border:
          1px solid #303b49;

        border-radius:17px;

        padding:14px;

        margin:10px 0;
      }

      .erw-section-title {

        font-weight:900;

        font-size:15px;

        margin-bottom:10px;
      }

      .erw-grid {

        display:grid;

        grid-template-columns:
          repeat(2,minmax(0,1fr));

        gap:9px;
      }

      .erw-role {

        border:
          1px solid #354252;

        background:#202a35;

        color:#fff;

        border-radius:15px;

        padding:12px;

        text-align:left;

        min-height:84px;

        touch-action:manipulation;
      }

      .erw-role.selected {

        border-color:#b9e34c;

        box-shadow:
          0 0 0 2px
          rgba(185,227,76,.18);
      }

      .erw-role b {

        display:block;

        font-size:13px;
      }

      .erw-role span {

        display:block;

        color:#aab5c1;

        font-size:11px;

        margin-top:5px;
      }

      .erw-candidate {

        border:
          1px solid #354252;

        background:#202a35;

        border-radius:15px;

        padding:12px;

        margin:8px 0;

        touch-action:manipulation;
      }

      .erw-candidate.selected {

        border-color:#8ed0ff;
      }

      .erw-candidate-top {

        display:flex;

        justify-content:space-between;

        gap:10px;
      }

      .erw-name {

        font-weight:900;
      }

      .erw-salary {

        font-weight:900;
      }

      .erw-muted {

        font-size:11px;

        color:#9eabb8;

        margin-top:4px;
      }

      .erw-stats {

        display:grid;

        grid-template-columns:
          repeat(3,1fr);

        gap:6px;

        margin-top:10px;
      }

      .erw-stat {

        background:#151c24;

        border-radius:10px;

        padding:7px;

        text-align:center;

        font-size:10px;

        color:#9eabb8;
      }

      .erw-stat b {

        display:block;

        color:#fff;

        font-size:13px;

        margin-bottom:2px;
      }

      .erw-action {

        width:100%;

        border:0;

        border-radius:14px;

        padding:14px;

        margin-top:9px;

        font-weight:900;

        font-size:14px;

        touch-action:manipulation;
      }

      .erw-primary {

        background:#b9e34c;

        color:#111;
      }

      .erw-secondary {

        background:#303a47;

        color:#fff;
      }

      .erw-offer {

        display:grid;

        grid-template-columns:
          1fr 1fr;

        gap:8px;

        margin-top:10px;
      }

      .erw-offer input {

        width:100%;

        box-sizing:border-box;

        padding:13px;

        border-radius:12px;

        border:
          1px solid #465362;

        background:#10161d;

        color:#fff;

        font-size:16px;
      }

      @media(max-width:430px) {

        #er-workforce-button {

          right:12px;

          bottom:112px;

          padding:12px 13px;
        }

        #er-workforce-overlay {

          padding:0;
        }

        #er-workforce-panel {

          border-radius:0;

          padding:14px;
        }

        .erw-grid {

          grid-template-columns:1fr;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createUI() {

    installStyles();

    if (!document.getElementById("er-workforce-button")) {

      const button =
        document.createElement("button");

      button.id =
        "er-workforce-button";

      button.textContent =
        "👔 WORKFORCE";

      button.onclick =
        open;

      document.body.appendChild(button);
    }

    if (document.getElementById("er-workforce-overlay"))
      return;

    const overlay =
      document.createElement("div");

    overlay.id =
      "er-workforce-overlay";

    overlay.innerHTML = `

      <div id="er-workforce-panel">

        <div class="erw-head">

          <div>

            <div class="erw-title">
              👔 Workforce
            </div>

            <div class="erw-sub">
              Build your team and grow your business.
            </div>

          </div>

          <button
            class="erw-close"
            id="erw-close">
            ×
          </button>

        </div>

        <div id="erw-content"></div>

      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener(
      "click",
      function (event) {

        if (event.target === overlay)
          close();
      }
    );

    document.getElementById(
      "erw-close"
    ).onclick = close;
  }

  function open() {

    if (!getState()) {

      alert(
        "Simulation load nahi hua. Page refresh karke dobara try karo."
      );

      return;
    }

    createUI();

    selectedRole = null;

    selectedCandidate = null;

    candidates = [];

    document.getElementById(
      "er-workforce-overlay"
    ).style.display = "block";

    render();
  }

  function close() {

    const overlay =
      document.getElementById(
        "er-workforce-overlay"
      );

    if (overlay)
      overlay.style.display = "none";
  }

  function render() {

    const content =
      document.getElementById(
        "erw-content"
      );

    if (!content)
      return;

    const state =
      getState();

    const employees =
      Array.isArray(state.employees)
        ? state.employees
        : [];

    const payroll =
      employees.reduce(
        function(total, employee) {

          return total +
            (Number(employee.salary) || 0);

        },
        0
      );

    let html = `

      <div class="erw-card">

        <div class="erw-section-title">
          Current Workforce
        </div>

        <div style="
          font-size:24px;
          font-weight:900;
        ">
          ${employees.length}
          employees
        </div>

        <div class="erw-muted">

          ${businessName()}

          · Monthly payroll:
          ${money(payroll)}

        </div>

      </div>

      <div class="erw-card">

        <div class="erw-section-title">
          1. Choose a vacancy
        </div>

        <div class="erw-grid">
    `;

    roles().forEach(
      function(role, index) {

        html += `

          <button
            class="erw-role
            ${
              selectedRole &&
              selectedRole.title === role[0]
                ? "selected"
                : ""
            }"
            data-role="${index}">

            <b>
              ${role[0]}
            </b>

            <span>
              ${role[1]}
            </span>

            <span>
              ${money(role[2])}
              –
              ${money(role[3])}
              /month
            </span>

          </button>
        `;
      }
    );

    html += `
        </div>
      </div>
    `;

    if (selectedRole) {

      html += `

        <div class="erw-card">

          <div class="erw-section-title">
            2. Candidates
          </div>

          <div class="erw-muted">
            Select a candidate and conduct an interview.
          </div>
      `;

      candidates.forEach(
        function(candidate,index) {

          const selected =
            selectedCandidate &&
            selectedCandidate.id === candidate.id;

          html += `

            <div
              class="
                erw-candidate
                ${selected ? "selected" : ""}
              "
              data-candidate="${index}">

              <div class="erw-candidate-top">

                <div>

                  <div class="erw-name">
                    ${candidate.name}
                  </div>

                  <div class="erw-muted">
                    ${candidate.role}
                    ·
                    ${candidate.experience}
                    yrs experience
                  </div>

                </div>

                <div class="erw-salary">
                  ${money(candidate.expectedSalary)}
                </div>

              </div>

              <div class="erw-stats">

                <div class="erw-stat">
                  <b>${candidate.skill}</b>
                  Skill
                </div>

                <div class="erw-stat">
                  <b>${candidate.reliability}</b>
                  Reliability
                </div>

                <div class="erw-stat">
                  <b>${candidate.potential}</b>
                  Potential
                </div>

              </div>

              ${
                selected
                ? `

                  <button
                    class="erw-action erw-secondary"
                    data-interview="${index}">

                    ${
                      candidate.interview
                        ? "✓ Interview Complete"
                        : "🎤 Start Interview"
                    }

                  </button>

                `
                : ""
              }

            </div>
          `;
        }
      );

      html += `
        </div>
      `;
    }

    if (
      selectedCandidate &&
      selectedCandidate.interview
    ) {

      html += `

        <div class="erw-card">

          <div class="erw-section-title">
            3. Salary Negotiation
          </div>

          <div class="erw-muted">

            Candidate expectation:
            ${money(
              selectedCandidate.expectedSalary
            )}
            / month

          </div>

          <div class="erw-offer">

            <input
              id="erw-offer-input"
              type="number"
              inputmode="numeric"
              value="${selectedCandidate.expectedSalary}"
            >

            <button
              class="erw-action erw-primary"
              id="erw-hire">

              HIRE

            </button>

          </div>

        </div>
      `;
    }

    content.innerHTML = html;

    content
      .querySelectorAll("[data-role]")
      .forEach(
        function(button) {

          button.onclick =
            function() {

              const role =
                roles()[
                  Number(button.dataset.role)
                ];

              selectedRole = {

                title: role[0],

                department: role[1],

                min: role[2],

                max: role[3]

              };

              candidates =
                generateCandidates(
                  selectedRole
                );

              selectedCandidate = null;

              render();
            };
        }
      );

    content
      .querySelectorAll("[data-candidate]")
      .forEach(
        function(card) {

          card.onclick =
            function() {

              selectedCandidate =
                candidates[
                  Number(card.dataset.candidate)
                ];

              render();
            };
        }
      );

    content
      .querySelectorAll("[data-interview]")
      .forEach(
        function(button) {

          button.onclick =
            function(event) {

              event.stopPropagation();

              const candidate =
                candidates[
                  Number(
                    button.dataset.interview
                  )
                ];

              candidate.interview = true;

              selectedCandidate =
                candidate;

              render();
            };
        }
      );

    const hire =
      document.getElementById(
        "erw-hire"
      );

    if (hire)
      hire.onclick = hireCandidate;
  }

  function hireCandidate() {

    const state =
      getState();

    if (!state || !selectedCandidate)
      return;

    const input =
      document.getElementById(
        "erw-offer-input"
      );

    const offer =
      Number(input && input.value);

    if (!offer) {

      alert(
        "Salary offer enter karo."
      );

      return;
    }

    if (
      offer <
      selectedRole.min * 0.75
    ) {

      alert(
        "Salary offer bahut low hai. Candidate accept nahi karega."
      );

      return;
    }

    const ratio =
      offer /
      selectedCandidate.expectedSalary;

    let acceptance = 0.45;

    if (
      ratio >= 0.95 &&
      ratio <= 1.08
    ) {
      acceptance = 0.92;
    }

    else if (
      ratio >= 0.88 &&
      ratio < 0.95
    ) {
      acceptance = 0.72;
    }

    else if (
      ratio > 1.08 &&
      ratio <= 1.2
    ) {
      acceptance = 0.99;
    }

    else if (ratio > 1.2) {
      acceptance = 1;
    }

    if (
      Math.random() >
      acceptance
    ) {

      alert(
        selectedCandidate.name +
        " ne offer reject kar diya.\n\n" +
        "Expected salary: " +
        money(
          selectedCandidate.expectedSalary
        )
      );

      return;
    }

    if (!Array.isArray(state.employees))
      state.employees = [];

    const employee = {

      id:
        "emp_" +
        Date.now(),

      name:
        selectedCandidate.name,

      salary:
        Math.round(offer),

      performance:
        Math.round(
          selectedCandidate.skill
        ),

      experience:
        selectedCandidate.experience,

      morale: 78,

      department:
        selectedCandidate.department,

      role:
        selectedCandidate.role,

      potential:
        selectedCandidate.potential,

      reliability:
        selectedCandidate.reliability,

      status:
        "Active",

      hiredDay:
        Number(state.day) || 1
    };

    state.employees.push(employee);

    if (!Array.isArray(state.notifications))
      state.notifications = [];

    state.notifications.unshift({

      day:
        Number(state.day) || 1,

      type:
        "Hiring",

      message:
        employee.name +
        " hired as " +
        employee.role
    });

    if (Array.isArray(state.ledger)) {

      state.ledger.unshift({

        day:
          Number(state.day) || 1,

        type:
          "HR",

        description:
          "Hired " +
          employee.name +
          " — " +
          employee.role,

        amount:
          0
      });
    }

    if (
      window.EmpireSimulation &&
      typeof window.EmpireSimulation.save ===
        "function"
    ) {

      window.EmpireSimulation.save();
    }

    window.dispatchEvent(
      new CustomEvent(
        "EmpireEmployeeHired",
        {
          detail: employee
        }
      )
    );

    alert(
      "✅ Hired!\n\n" +
      employee.name +
      "\n" +
      employee.role +
      "\n" +
      money(employee.salary) +
      " / month"
    );

    selectedRole = null;

    selectedCandidate = null;

    candidates = [];

    render();
  }

  function start() {

    createUI();
  }

  window.EmpireWorkforce = {

    open: open,

    close: close,

    generateCandidates:
      generateCandidates

  };

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  } else {

    start();
  }

})();
