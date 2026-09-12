/* =========================================================
   EMPIRE RUSH — BUSINESS CREATION ENGINE v1
   Universal Business Setup System

   Flow:
   Opportunity
   → Business Selection
   → Location
   → Registration
   → License
   → Assets
   → Staffing
   → Working Capital
   → Launch

   Works on top of EmpireSimulation.
   Does NOT replace the simulation core.
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     WAIT FOR SIMULATION CORE
     ======================================================= */

  function waitForSimulation(callback) {

    if (
      window.EmpireSimulation &&
      window.EmpireSimulation.state
    ) {
      callback();
      return;
    }

    setTimeout(function () {
      waitForSimulation(callback);
    }, 100);
  }


  setTimeout(function () {
  waitForSimulation(init);
}, 0);


  /* =======================================================
     BUSINESS DATABASE
     ======================================================= */

  const BUSINESSES = [

    {
      id: "home_cleaning",
      name: "Home Cleaning Service",
      industry: "Home Services",
      icon: "🧹",
      description:
        "Low-capital service business operated from home or a small office.",
      minCapital: 15000,
      setup: 12000,
      registration: 1500,
      license: 500,
      deposit: 3000,
      equipment: 5000,
      workingCapital: 5000,
      employees: 1,
      salary: 12000,
      monthlyRent: 3000,
      risk: 12,
      demand: 82,
      margin: 0.42,
      capacity: 60
    },

    {
      id: "food_cart",
      name: "Food Cart",
      industry: "Food & Beverage",
      icon: "🍔",
      description:
        "Small mobile food operation with relatively low entry cost.",
      minCapital: 25000,
      setup: 18000,
      registration: 2000,
      license: 2500,
      deposit: 5000,
      equipment: 10000,
      workingCapital: 8000,
      employees: 1,
      salary: 14000,
      monthlyRent: 5000,
      risk: 18,
      demand: 88,
      margin: 0.34,
      capacity: 90
    },

    {
      id: "freelance_agency",
      name: "Freelance Agency",
      industry: "Professional Services",
      icon: "💻",
      description:
        "Start a service agency using skills, freelancers and client contracts.",
      minCapital: 40000,
      setup: 10000,
      registration: 2500,
      license: 1000,
      deposit: 8000,
      equipment: 18000,
      workingCapital: 15000,
      employees: 2,
      salary: 18000,
      monthlyRent: 7000,
      risk: 20,
      demand: 78,
      margin: 0.48,
      capacity: 70
    },

    {
      id: "mobile_repair",
      name: "Mobile Repair Shop",
      industry: "Electronics Services",
      icon: "📱",
      description:
        "Repair smartphones and electronics from a compact retail location.",
      minCapital: 80000,
      setup: 25000,
      registration: 3500,
      license: 1500,
      deposit: 15000,
      equipment: 35000,
      workingCapital: 20000,
      employees: 2,
      salary: 20000,
      monthlyRent: 12000,
      risk: 22,
      demand: 84,
      margin: 0.38,
      capacity: 110
    },

    {
      id: "salon",
      name: "Salon & Grooming Studio",
      industry: "Personal Services",
      icon: "✂️",
      description:
        "Customer-facing grooming business with recurring local demand.",
      minCapital: 150000,
      setup: 40000,
      registration: 5000,
      license: 3000,
      deposit: 30000,
      equipment: 75000,
      workingCapital: 35000,
      employees: 3,
      salary: 22000,
      monthlyRent: 18000,
      risk: 25,
      demand: 86,
      margin: 0.41,
      capacity: 130
    },

    {
      id: "car_wash",
      name: "Car Wash",
      industry: "Automotive Services",
      icon: "🚗",
      description:
        "Vehicle cleaning and detailing operation with equipment-heavy setup.",
      minCapital: 250000,
      setup: 70000,
      registration: 7000,
      license: 5000,
      deposit: 50000,
      equipment: 140000,
      workingCapital: 60000,
      employees: 4,
      salary: 18000,
      monthlyRent: 25000,
      risk: 28,
      demand: 80,
      margin: 0.36,
      capacity: 180
    },

    {
      id: "cafe",
      name: "Café",
      industry: "Food & Beverage",
      icon: "☕",
      description:
        "Small café with seating, kitchen equipment and local customer traffic.",
      minCapital: 450000,
      setup: 90000,
      registration: 10000,
      license: 8000,
      deposit: 90000,
      equipment: 220000,
      workingCapital: 120000,
      employees: 6,
      salary: 19000,
      monthlyRent: 35000,
      risk: 31,
      demand: 83,
      margin: 0.28,
      capacity: 220
    },

    {
      id: "retail_store",
      name: "Retail Store",
      industry: "Retail",
      icon: "🏪",
      description:
        "Physical retail business with inventory and storefront operations.",
      minCapital: 900000,
      setup: 100000,
      registration: 12000,
      license: 5000,
      deposit: 150000,
      equipment: 180000,
      workingCapital: 350000,
      employees: 6,
      salary: 20000,
      monthlyRent: 45000,
      risk: 34,
      demand: 76,
      margin: 0.23,
      capacity: 300
    },

    {
      id: "restaurant",
      name: "Restaurant",
      industry: "Food & Beverage",
      icon: "🍽️",
      description:
        "Full-service restaurant with kitchen, staff and larger premises.",
      minCapital: 1500000,
      setup: 180000,
      registration: 18000,
      license: 15000,
      deposit: 250000,
      equipment: 550000,
      workingCapital: 450000,
      employees: 12,
      salary: 22000,
      monthlyRent: 65000,
      risk: 38,
      demand: 82,
      margin: 0.24,
      capacity: 450
    },

    {
      id: "logistics",
      name: "Logistics Company",
      industry: "Logistics",
      icon: "🚚",
      description:
        "Delivery and logistics operation using vehicles, drivers and contracts.",
      minCapital: 3000000,
      setup: 250000,
      registration: 25000,
      license: 20000,
      deposit: 350000,
      equipment: 1100000,
      workingCapital: 1000000,
      employees: 18,
      salary: 24000,
      monthlyRent: 80000,
      risk: 43,
      demand: 79,
      margin: 0.19,
      capacity: 650
    },

    {
      id: "small_factory",
      name: "Small Manufacturing Factory",
      industry: "Manufacturing",
      icon: "🏭",
      description:
        "Manufacturing unit requiring machinery, workers and supply-chain management.",
      minCapital: 7000000,
      setup: 500000,
      registration: 50000,
      license: 60000,
      deposit: 700000,
      equipment: 3500000,
      workingCapital: 3000000,
      employees: 35,
      salary: 26000,
      monthlyRent: 150000,
      risk: 52,
      demand: 72,
      margin: 0.21,
      capacity: 1000
    },

    {
      id: "software_company",
      name: "Software Company",
      industry: "Technology",
      icon: "🖥️",
      description:
        "Technology company building software products and subscription services.",
      minCapital: 10000000,
      setup: 300000,
      registration: 50000,
      license: 10000,
      deposit: 500000,
      equipment: 1200000,
      workingCapital: 7000000,
      employees: 20,
      salary: 65000,
      monthlyRent: 180000,
      risk: 58,
      demand: 74,
      margin: 0.55,
      capacity: 800
    }

  ];


  /* =======================================================
     LOCATION DATABASE
     ======================================================= */

  const LOCATIONS = [

    {
      id: "home",
      name: "Home / Residential",
      icon: "🏠",
      rentMultiplier: 0.55,
      demandMultiplier: 0.72,
      depositMultiplier: 0.35,
      description:
        "Cheapest option. Limited customer visibility."
    },

    {
      id: "market",
      name: "Local Market",
      icon: "🛍️",
      rentMultiplier: 1,
      demandMultiplier: 1,
      depositMultiplier: 1,
      description:
        "Balanced location with normal rent and demand."
    },

    {
      id: "main_road",
      name: "Main Road",
      icon: "🛣️",
      rentMultiplier: 1.35,
      demandMultiplier: 1.18,
      depositMultiplier: 1.3,
      description:
        "Higher visibility and customer traffic."
    },

    {
      id: "commercial",
      name: "Commercial District",
      icon: "🏙️",
      rentMultiplier: 1.7,
      demandMultiplier: 1.32,
      depositMultiplier: 1.7,
      description:
        "Premium location with strong demand but expensive rent."
    },

    {
      id: "industrial",
      name: "Industrial Zone",
      icon: "🏭",
      rentMultiplier: 0.85,
      demandMultiplier: 0.92,
      depositMultiplier: 0.9,
      description:
        "Suitable for workshops, warehouses and factories."
    }

  ];


  /* =======================================================
     REGISTRATION TYPES
     ======================================================= */

  const REGISTRATIONS = [

    {
      id: "sole",
      name: "Sole Proprietorship",
      costMultiplier: 1,
      risk: 1.15,
      tax: 1.05,
      description:
        "Simple structure for small businesses."
    },

    {
      id: "partnership",
      name: "Partnership",
      costMultiplier: 1.2,
      risk: 1.05,
      tax: 1,
      description:
        "Shared ownership with one or more partners."
    },

    {
      id: "private_limited",
      name: "Private Limited",
      costMultiplier: 1.55,
      risk: 0.9,
      tax: 0.98,
      description:
        "More formal structure suitable for growth."
    }

  ];


  /* =======================================================
     STATE
     ======================================================= */

  let sim = null;
  let state = null;

  let selectedBusiness = null;
  let selectedLocation = null;
  let selectedRegistration = null;

  let modal = null;


  /* =======================================================
     MONEY
     ======================================================= */

  function money(value) {

    value = Number(value) || 0;

    if (value >= 10000000) {
      return "₹" +
        (value / 10000000).toFixed(2) +
        "Cr";
    }

    if (value >= 100000) {
      return "₹" +
        (value / 100000).toFixed(2) +
        "L";
    }

    if (value >= 1000) {
      return "₹" +
        (value / 1000).toFixed(1) +
        "K";
    }

    return "₹" +
      Math.round(value).toLocaleString("en-IN");
  }


  function clamp(value, min, max) {
    return Math.max(
      min,
      Math.min(max, value)
    );
  }


  /* =======================================================
     INIT
     ======================================================= */

  function init() {

    sim = window.EmpireSimulation;
    state = sim.state;

    installStyles();

    createLauncher();

    window.EmpireBusinessEngine = {

      open: openBusinessEngine,

      businesses: BUSINESSES,

      locations: LOCATIONS,

      registrations: REGISTRATIONS,

      launch: launchBusiness

    };

    console.log(
      "Empire Rush Business Creation Engine loaded."
    );
  }


  /* =======================================================
     STYLES
     ======================================================= */

  function installStyles() {

    if (
      document.getElementById(
        "empire-business-engine-style"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "empire-business-engine-style";

    style.textContent = `

      #business-engine-launcher{

        position:fixed;

        right:16px;
        bottom:18px;

        z-index:12000;

        border:0;

        border-radius:15px;

        padding:13px 16px;

        background:#8bc34a;

        color:#111;

        font-family:Arial,sans-serif;

        font-size:12px;

        font-weight:900;

        box-shadow:
          0 10px 30px
          rgba(0,0,0,.35);

      }


      #business-engine{

        position:fixed;

        inset:0;

        z-index:110000;

        display:none;

        background:
          rgba(5,8,12,.82);

        backdrop-filter:
          blur(14px);

        color:white;

        font-family:Arial,sans-serif;

        overflow:auto;

      }


      .be-shell{

        width:min(96vw,980px);

        margin:20px auto 60px;

      }


      .be-header{

        display:flex;

        align-items:center;

        justify-content:space-between;

        gap:12px;

        margin-bottom:16px;

      }


      .be-title{

        font-size:25px;

        font-weight:900;

      }


      .be-subtitle{

        color:#9aa4b2;

        font-size:12px;

        margin-top:4px;

      }


      .be-close{

        width:44px;
        height:44px;

        border:0;

        border-radius:50%;

        background:#242b35;

        color:white;

        font-size:22px;

      }


      .be-wallet{

        display:grid;

        grid-template-columns:
          repeat(3,minmax(0,1fr));

        gap:10px;

        margin-bottom:14px;

      }


      .be-wallet-card{

        background:#151b24;

        border:1px solid
          rgba(255,255,255,.07);

        border-radius:15px;

        padding:14px;

      }


      .be-wallet-card small{

        display:block;

        color:#8e99a8;

        font-size:10px;

        margin-bottom:6px;

      }


      .be-wallet-card strong{

        font-size:19px;

      }


      .be-section{

        background:#151b24;

        border:1px solid
          rgba(255,255,255,.07);

        border-radius:18px;

        padding:16px;

        margin-bottom:12px;

      }


      .be-section h2{

        margin:0 0 12px;

        font-size:17px;

      }


      .be-business-grid{

        display:grid;

        grid-template-columns:
          repeat(3,minmax(0,1fr));

        gap:10px;

      }


      .be-business{

        text-align:left;

        border:1px solid
          rgba(255,255,255,.08);

        border-radius:16px;

        padding:14px;

        background:#1b222d;

        color:white;

      }


      .be-business.selected{

        border:2px solid #8bc34a;

        background:#222d25;

      }


      .be-business.locked{

        opacity:.42;

      }


      .be-icon{

        font-size:26px;

      }


      .be-business-name{

        font-weight:900;

        margin-top:7px;

      }


      .be-business-industry{

        color:#99a3b1;

        font-size:11px;

        margin-top:3px;

      }


      .be-business-cost{

        margin-top:10px;

        font-weight:800;

      }


      .be-risk{

        color:#d9a85f;

        font-size:11px;

        margin-top:5px;

      }


      .be-description{

        color:#9da6b4;

        font-size:11px;

        line-height:1.45;

        margin-top:7px;

      }


      .be-options{

        display:grid;

        grid-template-columns:
          repeat(3,minmax(0,1fr));

        gap:10px;

      }


      .be-option{

        border:1px solid
          rgba(255,255,255,.08);

        border-radius:14px;

        padding:13px;

        background:#1b222d;

        color:white;

        text-align:left;

      }


      .be-option.selected{

        border:2px solid #8bc34a;

      }


      .be-option strong{

        display:block;

        margin-bottom:5px;

      }


      .be-muted{

        color:#929baa;

        font-size:11px;

        line-height:1.45;

      }


      .be-summary{

        display:grid;

        grid-template-columns:
          repeat(2,minmax(0,1fr));

        gap:8px;

      }


      .be-line{

        display:flex;

        justify-content:space-between;

        gap:10px;

        padding:9px 0;

        border-bottom:1px solid
          rgba(255,255,255,.06);

        font-size:12px;

      }


      .be-total{

        font-size:19px;

        font-weight:900;

        color:#8bc34a;

      }


      .be-danger{

        color:#ff8d8d;

      }


      .be-primary{

        width:100%;

        border:0;

        border-radius:13px;

        padding:15px;

        background:#8bc34a;

        color:#111;

        font-weight:900;

        font-size:14px;

      }


      .be-primary:disabled{

        opacity:.35;

      }


      .be-note{

        margin-top:10px;

        color:#8f99a7;

        font-size:11px;

        line-height:1.5;

      }


      @media(max-width:720px){

        .be-shell{

          width:94vw;

        }

        .be-business-grid{

          grid-template-columns:
            repeat(2,minmax(0,1fr));

        }

        .be-options{

          grid-template-columns:
            1fr;

        }

        .be-wallet{

          grid-template-columns:
            repeat(2,minmax(0,1fr));

        }

      }


      @media(max-width:450px){

        .be-business-grid{

          grid-template-columns:1fr;

        }

        .be-wallet{

          grid-template-columns:1fr 1fr;

        }

      }

    `;

    document.head.appendChild(style);
  }


  /* =======================================================
     LAUNCHER
     ======================================================= */

  function createLauncher() {

    if (
      document.getElementById(
        "business-engine-launcher"
      )
    ) {
      return;
    }

    const button =
      document.createElement("button");

    button.id =
      "business-engine-launcher";

    button.textContent =
      "🏢 BUSINESS";

    button.onclick =
      openBusinessEngine;

    document.body.appendChild(button);
  }


  /* =======================================================
     MODAL
     ======================================================= */

  function createModal() {

    if (
      document.getElementById(
        "empire-business-engine"
      )
    ) {
      modal =
        document.getElementById(
          "empire-business-engine"
        );

      return;
    }


    modal =
      document.createElement("div");

    modal.id =
      "empire-business-engine";


    modal.innerHTML = `

      <div class="be-shell">

        <div class="be-header">

          <div>

            <div class="be-title">
              Business Creation
            </div>

            <div class="be-subtitle">
              Build a business from the ground up
            </div>

          </div>

          <button
            class="be-close"
            id="be-close"
          >
            ×
          </button>

        </div>


        <div
          class="be-wallet"
          id="be-wallet"
        ></div>


        <div
          class="be-section"
          id="be-business-section"
        ></div>


        <div
          class="be-section"
          id="be-location-section"
        ></div>


        <div
          class="be-section"
          id="be-registration-section"
        ></div>


        <div
          class="be-section"
          id="be-summary-section"
        ></div>

      </div>

    `;


    document.body.appendChild(modal);


    document
      .getElementById("be-close")
      .onclick =
      closeBusinessEngine;


    renderEngine();

  }


  function openBusinessEngine() {

    createModal();

    state =
      window.EmpireSimulation.state;

    renderEngine();

    modal.style.display =
      "block";
  }


  function closeBusinessEngine() {

    if (modal) {

      modal.style.display =
        "none";

    }

  }


  /* =======================================================
     RENDER
     ======================================================= */

  function renderEngine() {

    if (!modal) return;

    state =
      window.EmpireSimulation.state;


    renderWallet();

    renderBusinesses();

    renderLocations();

    renderRegistrations();

    renderSummary();

  }


  /* =======================================================
     WALLET
     ======================================================= */

  function renderWallet() {

    const box =
      document.getElementById(
        "be-wallet"
      );

    box.innerHTML = `

      <div class="be-wallet-card">

        <small>
          AVAILABLE CASH
        </small>

        <strong>
          ${money(state.player.cash)}
        </strong>

      </div>


      <div class="be-wallet-card">

        <small>
          CURRENT BUSINESS
        </small>

        <strong>
          ${
            state.business &&
            state.business.name
              ? state.business.name
              : "None"
          }
        </strong>

      </div>


      <div class="be-wallet-card">

        <small>
          DAY
        </small>

        <strong>
          ${state.player.day}
        </strong>

      </div>

    `;
  }


  /* =======================================================
     BUSINESS LIST
     ======================================================= */

  function renderBusinesses() {

    const box =
      document.getElementById(
        "be-business-section"
      );


    let html = `

      <h2>
        1. Choose a Business
      </h2>

      <div class="be-business-grid">

    `;


    BUSINESSES.forEach(function (business) {

      const affordable =
        state.player.cash >=
        business.minCapital;


      const selected =
        selectedBusiness &&
        selectedBusiness.id ===
        business.id;


      html += `

        <button
          class="
            be-business
            ${selected ? "selected" : ""}
            ${!affordable ? "locked" : ""}
          "
          data-business="${business.id}"
        >

          <div class="be-icon">
            ${business.icon}
          </div>

          <div class="be-business-name">
            ${business.name}
          </div>

          <div class="be-business-industry">
            ${business.industry}
          </div>

          <div class="be-business-cost">
            Capital: ${money(business.minCapital)}
          </div>

          <div class="be-risk">
            Risk: ${business.risk}/100
          </div>

          <div class="be-description">
            ${business.description}
          </div>

        </button>

      `;

    });


    html += `</div>`;


    box.innerHTML = html;


    box
      .querySelectorAll(
        "[data-business]"
      )
      .forEach(function (button) {

        button.onclick =
          function () {

            const id =
              button.dataset.business;

            const business =
              BUSINESSES.find(
                b => b.id === id
              );

            if (!business) return;


            if (
              state.player.cash <
              business.minCapital
            ) {

              alert(
                "You need at least " +
                money(
                  business.minCapital
                ) +
                " capital for this business."
              );

              return;

            }


            selectedBusiness =
              business;

            selectedLocation = null;

            selectedRegistration = null;

            renderEngine();

          };

      });

  }


  /* =======================================================
     LOCATIONS
     ======================================================= */

  function renderLocations() {

    const box =
      document.getElementById(
        "be-location-section"
      );


    if (!selectedBusiness) {

      box.innerHTML = `

        <h2>
          2. Choose Location
        </h2>

        <div class="be-muted">
          Select a business first.
        </div>

      `;

      return;
    }


    let html = `

      <h2>
        2. Choose Location
      </h2>

      <div class="be-options">

    `;


    LOCATIONS.forEach(function (location) {

      const selected =
        selectedLocation &&
        selectedLocation.id ===
        location.id;


      html += `

        <button
          class="
            be-option
            ${selected ? "selected" : ""}
          "
          data-location="${location.id}"
        >

          <strong>
            ${location.icon}
            ${location.name}
          </strong>

          <div class="be-muted">
            Rent ×
            ${location.rentMultiplier.toFixed(2)}
          </div>

          <div class="be-muted">
            Demand ×
            ${location.demandMultiplier.toFixed(2)}
          </div>

          <div class="be-description">
            ${location.description}
          </div>

        </button>

      `;

    });


    html += `</div>`;


    box.innerHTML = html;


    box
      .querySelectorAll(
        "[data-location]"
      )
      .forEach(function (button) {

        button.onclick =
          function () {

            selectedLocation =
              LOCATIONS.find(
                l =>
                  l.id ===
                  button.dataset.location
              );

            renderEngine();

          };

      });

  }


  /* =======================================================
     REGISTRATION
     ======================================================= */

  function renderRegistrations() {

    const box =
      document.getElementById(
        "be-registration-section"
      );


    if (!selectedBusiness) {

      box.innerHTML = `

        <h2>
          3. Ownership Structure
        </h2>

        <div class="be-muted">
          Select a business first.
        </div>

      `;

      return;
    }


    let html = `

      <h2>
        3. Ownership Structure
      </h2>

      <div class="be-options">

    `;


    REGISTRATIONS.forEach(function (registration) {

      const selected =
        selectedRegistration &&
        selectedRegistration.id ===
        registration.id;


      html += `

        <button
          class="
            be-option
            ${selected ? "selected" : ""}
          "
          data-registration="${registration.id}"
        >

          <strong>
            ${registration.name}
          </strong>

          <div class="be-muted">
            Setup multiplier:
            ${registration.costMultiplier}×
          </div>

          <div class="be-muted">
            Business risk:
            ${Math.round(
              registration.risk * 100
            )}%
          </div>

          <div class="be-description">
            ${registration.description}
          </div>

        </button>

      `;

    });


    html += `</div>`;


    box.innerHTML = html;


    box
      .querySelectorAll(
        "[data-registration]"
      )
      .forEach(function (button) {

        button.onclick =
          function () {

            selectedRegistration =
              REGISTRATIONS.find(
                r =>
                  r.id ===
                  button.dataset.registration
              );

            renderEngine();

          };

      });

  }


  /* =======================================================
     COST CALCULATOR
     ======================================================= */

  function calculatePlan() {

    if (
      !selectedBusiness ||
      !selectedLocation ||
      !selectedRegistration
    ) {
      return null;
    }


    const b =
      selectedBusiness;

    const l =
      selectedLocation;

    const r =
      selectedRegistration;


    const registration =
      Math.round(
        b.registration *
        r.costMultiplier
      );


    const license =
      b.license;


    const deposit =
      Math.round(
        b.deposit *
        l.depositMultiplier
      );


    const rent =
      Math.round(
        b.monthlyRent *
        l.rentMultiplier
      );


    const equipment =
      b.equipment;


    const workingCapital =
      b.workingCapital;


    const total =
      b.setup +
      registration +
      license +
      deposit +
      equipment +
      workingCapital;


    const monthlyPayroll =
      b.employees *
      b.salary;


    const monthlyFixed =
      monthlyPayroll +
      rent;


    const baseMonthlyRevenue =
      100000 *
      b.margin *
      (b.demand / 80);


    const monthlyRevenue =
      Math.round(
        baseMonthlyRevenue *
        l.demandMultiplier
      );


    const monthlyOperatingProfit =
      Math.round(
        monthlyRevenue -
        monthlyFixed -
        (
          monthlyRevenue *
          (1 - b.margin)
        )
      );


    const adjustedRisk =
      Math.round(
        clamp(
          b.risk *
          r.risk,
          5,
          95
        )
      );


    return {

      registration,

      license,

      deposit,

      rent,

      equipment,

      workingCapital,

      total,

      monthlyPayroll,

      monthlyFixed,

      monthlyRevenue,

      monthlyOperatingProfit,

      adjustedRisk

    };

  }


  /* =======================================================
     SUMMARY
     ======================================================= */

  function renderSummary() {

    const box =
      document.getElementById(
        "be-summary-section"
      );


    if (
      !selectedBusiness ||
      !selectedLocation ||
      !selectedRegistration
    ) {

      box.innerHTML = `

        <h2>
          4. Business Plan
        </h2>

        <div class="be-muted">
          Select business, location and ownership
          structure to calculate the complete
          launch plan.
        </div>

      `;

      return;

    }


    const plan =
      calculatePlan();


    const affordable =
      state.player.cash >=
      plan.total;


    box.innerHTML = `

      <h2>
        4. Launch Plan
      </h2>


      <div class="be-summary">

        <div class="be-line">
          <span>
            Business
          </span>
          <strong>
            ${selectedBusiness.name}
          </strong>
        </div>


        <div class="be-line">
          <span>
            Location
          </span>
          <strong>
            ${selectedLocation.name}
          </strong>
        </div>


        <div class="be-line">
          <span>
            Ownership
          </span>
          <strong>
            ${selectedRegistration.name}
          </strong>
        </div>


        <div class="be-line">
          <span>
            Registration
          </span>
          <strong>
            ${money(plan.registration)}
          </strong>
        </div>


        <div class="be-line">
          <span>
            License
          </span>
          <strong>
            ${money(plan.license)}
          </strong>
        </div>


        <div class="be-line">
          <span>
            Security Deposit
          </span>
          <strong>
            ${money(plan.deposit)}
          </strong>
        </div>


        <div class="be-line">
          <span>
            Equipment
          </span>
          <strong>
            ${money(plan.equipment)}
          </strong>
        </div>


        <div class="be-line">
          <span>
            Working Capital
          </span>
          <strong>
            ${money(plan.workingCapital)}
          </strong>
        </div>


        <div class="be-line">
          <span>
            Initial Employees
          </span>
          <strong>
            ${selectedBusiness.employees}
          </strong>
        </div>


        <div class="be-line">
          <span>
            Monthly Payroll
          </span>
          <strong>
            ${money(plan.monthlyPayroll)}
          </strong>
        </div>


        <div class="be-line">
          <span>
            Monthly Rent
          </span>
          <strong>
            ${money(plan.rent)}
          </strong>
        </div>


        <div class="be-line">
          <span>
            Expected Monthly Revenue
          </span>
          <strong>
            ${money(plan.monthlyRevenue)}
          </strong>
        </div>


        <div class="be-line">
          <span>
            Expected Operating Profit
          </span>
          <strong>
            ${money(plan.monthlyOperatingProfit)}
          </strong>
        </div>


        <div class="be-line">
          <span>
            Risk
          </span>
          <strong>
            ${plan.adjustedRisk}/100
          </strong>
        </div>

      </div>


      <div
        style="
          margin-top:14px;
          padding:15px;
          background:#1d2630;
          border-radius:14px;
        "
      >

        <div class="be-muted">
          TOTAL CAPITAL REQUIRED
        </div>

        <div
          class="
            be-total
            ${
              affordable
                ? ""
                : "be-danger"
            }
          "
        >
          ${money(plan.total)}
        </div>

      </div>


      <div class="be-note">

        This is a business-plan estimate.
        Actual performance will depend on market
        conditions, employees, pricing, competition,
        operations and future upgrades.

      </div>


      <button
        class="be-primary"
        id="be-launch"
        style="margin-top:14px;"
        ${affordable ? "" : "disabled"}
      >
        🚀 LAUNCH BUSINESS
      </button>

    `;


    const launch =
      document.getElementById(
        "be-launch"
      );


    if (launch) {

      launch.onclick =
        launchBusiness;

    }

  }


  /* =======================================================
     LAUNCH BUSINESS
     ======================================================= */

  function launchBusiness() {

    if (
      !selectedBusiness ||
      !selectedLocation ||
      !selectedRegistration
    ) {

      alert(
        "Complete the business setup first."
      );

      return;

    }


    const plan =
      calculatePlan();


    if (
      state.player.cash <
      plan.total
    ) {

      alert(
        "Insufficient capital."
      );

      return;

    }


    const oldBusiness =
      state.business &&
      state.business.name
        ? state.business.name
        : "Previous business";


    /* -------------------------------------------------------
       DEDUCT CAPITAL
       ------------------------------------------------------- */
const launchedName =
  selectedBusiness.name;
    state.player.cash -=
      plan.total;


    /* -------------------------------------------------------
       COMPANY
       ------------------------------------------------------- */

    state.company.name =
      selectedBusiness.name +
      " · " +
      selectedRegistration.name;


    state.company.type =
      selectedRegistration.name;


    state.company.foundedDay =
      state.player.day;


    state.company.reputation =
      clamp(
        45 +
        selectedBusiness.demand / 10,
        0,
        100
      );


    /* -------------------------------------------------------
       BUSINESS
       ------------------------------------------------------- */

    state.business = {

      name:
        selectedBusiness.name,

      industry:
        selectedBusiness.industry,

      status:
        "Operating",

      employees:
        selectedBusiness.employees,

      capacity:
        selectedBusiness.capacity,

      utilization:
        35,

      priceIndex:
        1,

      demandIndex:
        selectedLocation.demandMultiplier,

      marketing:
        1,

      operations:
        1,

      reputation:
        Math.round(
          state.company.reputation
        ),

      businessId:
        selectedBusiness.id,

      location:
        selectedLocation.name,

      registration:
        selectedRegistration.name,

      setupCapital:
        plan.total,

      monthlyRent:
        plan.rent,

      monthlyPayroll:
        plan.monthlyPayroll,

      risk:
        plan.adjustedRisk,

      launchedDay:
        state.player.day

    };


    /* -------------------------------------------------------
       EMPLOYEE CAPACITY
       ------------------------------------------------------- */

    if (
      Array.isArray(
        state.employees
      )
    ) {

      state.employees.forEach(
        function (employee, index) {

          employee.status =
            index <
            selectedBusiness.employees
              ? "Working"
              : "Bench";

        }
      );

    }


    /* -------------------------------------------------------
       DEPARTMENTS
       ------------------------------------------------------- */

    const starterEmployees =
      state.employees
        .slice(
          0,
          Math.max(
            1,
            Math.min(
              selectedBusiness.employees,
              state.employees.length
            )
          )
        );


    state.departments = [

      {
        id: "operations",
        name: "Operations",
        head:
          starterEmployees[0]
            ? starterEmployees[0].name
            : "Owner",
        budget:
          Math.round(
            plan.total * .12
          ),
        productivity: 72,
        workload: 55
      },

      {
        id: "sales",
        name: "Sales",
        head:
          starterEmployees[1]
            ? starterEmployees[1].name
            : "Owner",
        budget:
          Math.round(
            plan.total * .08
          ),
        productivity: 68,
        workload: 48
      },

      {
        id: "finance",
        name: "Finance",
        head:
          starterEmployees[2]
            ? starterEmployees[2].name
            : "Owner",
        budget:
          Math.round(
            plan.total * .05
          ),
        productivity: 75,
        workload: 42
      }

    ];


    /* -------------------------------------------------------
       PRODUCTS / SERVICES
       ------------------------------------------------------- */

    state.products = [

      {

        id:
          selectedBusiness.id +
          "_product_001",

        name:
          selectedBusiness.name +
          " Core Service",

        category:
          selectedBusiness.industry,

        stage:
          "Launch",

        price:
          Math.max(
            100,
            Math.round(
              plan.monthlyRevenue /
              Math.max(
                1,
                selectedBusiness.capacity
              )
            )
          ),

        unitCost:
          Math.round(
            selectedBusiness.margin *
            100
          ),

        demand:
          selectedBusiness.demand,

        quality:
          65,

        unitsSold:
          0,

        development:
          100

      }

    ];


    /* -------------------------------------------------------
       R&D RESET
       ------------------------------------------------------- */

    state.projects = [];


    /* -------------------------------------------------------
       FINANCE
       ------------------------------------------------------- */

    state.finance.revenueToday = 0;

    state.finance.expensesToday = 0;

    state.finance.profitToday = 0;


    /* -------------------------------------------------------
       MARKET
       ------------------------------------------------------- */

    state.market.demand =
      clamp(
        selectedBusiness.demand /
        80,
        .65,
        1.4
      );


    state.market.competition =
      1;


    /* -------------------------------------------------------
       LEDGER
       ------------------------------------------------------- */

    if (
      !Array.isArray(
        state.ledger
      )
    ) {
      state.ledger = [];
    }


    state.ledger.unshift({

      day:
        state.player.day,

      type:
        "business_setup",

      amount:
        -plan.total,

      description:
        "Launched " +
        selectedBusiness.name +
        " at " +
        selectedLocation.name,

      timestamp:
        Date.now()

    });


    /* -------------------------------------------------------
       NOTIFICATION
       ------------------------------------------------------- */

    if (
      !Array.isArray(
        state.notifications
      )
    ) {
      state.notifications = [];
    }


    state.notifications.unshift({

      day:
        state.player.day,

      title:
        "Business Launched",

      message:
        selectedBusiness.name +
        " is now operating."

    });


    /* -------------------------------------------------------
       SAVE
       ------------------------------------------------------- */

    if (
      window.EmpireSimulation &&
      typeof
        window.EmpireSimulation.save ===
        "function"
    ) {

      window.EmpireSimulation.save();

    }


    /* -------------------------------------------------------
       CLOSE
       ------------------------------------------------------- */

    closeBusinessEngine();


    selectedBusiness = null;

    selectedLocation = null;

    selectedRegistration = null;


    /* -------------------------------------------------------
       REFRESH COMMAND CENTER
       ------------------------------------------------------- */

    if (
      window.EmpireSimulation &&
      typeof
        window.EmpireSimulation.openDashboard ===
        "function"
    ) {

      window.EmpireSimulation.openDashboard();

    }


    alert(
  "Business launched successfully!\n\n" +
  launchedName
);

  }


})();
