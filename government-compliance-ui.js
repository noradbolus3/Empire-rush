(function () {
  "use strict";

  const Game = window.EmpireGameState;
  const Compliance = window.EmpireCompliance;

  if (!Game || !Compliance) {
    console.warn(
      "Government Compliance UI waiting for systems."
    );
    return;
  }

  const UI = {

    panel: null,

    /* ============================================================
       HELPERS
       ============================================================ */

    money(value) {
      return "₹" +
        Math.round(
          Number(value || 0)
        ).toLocaleString("en-IN");
    },

    companies() {
      return Game.getState()?.companies || [];
    },

    operatingCompanies() {
      return this.companies().filter(
        company =>
          company.status === "Operating" ||
          company.operating === true
      );
    },

    selectedCompany() {

      const select =
        document.getElementById(
          "empireGovCompany"
        );

      if (!select) return null;

      return this.companies().find(
        company =>
          String(company.id) ===
          String(select.value)
      );
    },

    /* ============================================================
       CREATE BUTTON
       ============================================================ */

    createButton() {

      if (
        document.getElementById(
          "empireGovButton"
        )
      ) return;

      const button =
        document.createElement("button");

      button.id =
        "empireGovButton";

      button.textContent =
        "GOVERNMENT";

      button.style.cssText = `
        position:fixed;
        right:18px;
        bottom:150px;
        z-index:9999;
        padding:12px 16px;
        border:none;
        border-radius:14px;
        background:#1d3557;
        color:white;
        font-weight:800;
        font-size:12px;
        box-shadow:0 8px 25px rgba(0,0,0,.35);
      `;

      button.onclick =
        () => this.toggle();

      document.body.appendChild(
        button
      );
    },

    /* ============================================================
       PANEL
       ============================================================ */

    createPanel() {

      if (
        document.getElementById(
          "empireGovPanel"
        )
      ) return;

      this.panel =
        document.createElement("div");

      this.panel.id =
        "empireGovPanel";

      this.panel.style.cssText = `
        position:fixed;
        inset:0;
        z-index:10000;
        display:none;
        background:rgba(4,8,15,.88);
        backdrop-filter:blur(10px);
        overflow:auto;
        padding:18px;
        box-sizing:border-box;
        color:white;
        font-family:Arial,sans-serif;
      `;

      document.body.appendChild(
        this.panel
      );

      this.render();
    },

    /* ============================================================
       RENDER
       ============================================================ */

    render() {

      if (!this.panel) return;

      const companies =
        this.companies();

      if (!companies.length) {

        this.panel.innerHTML = `
          <div style="
            max-width:700px;
            margin:40px auto;
            background:#111827;
            border-radius:20px;
            padding:24px;
          ">
            <h2>Government & Compliance</h2>
            <p>No company available.</p>
            <button
              onclick="EmpireGovernmentUI.close()"
              style="${this.buttonStyle()}"
            >
              CLOSE
            </button>
          </div>
        `;

        return;
      }

      const selected =
        this.selectedCompany() ||
        companies[0];

      const requirements =
        this.getRequirements(
          selected
        );

      const summary =
        this.getSummary(
          selected
        );

      this.panel.innerHTML = `

        <div style="
          max-width:850px;
          margin:20px auto 60px;
        ">

          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:12px;
            margin-bottom:18px;
          ">

            <div>
              <div style="
                font-size:11px;
                opacity:.65;
                letter-spacing:1px;
              ">
                EMPIRE RUSH
              </div>

              <h1 style="
                margin:4px 0;
                font-size:26px;
              ">
                Government & Compliance
              </h1>
            </div>

            <button
              onclick="EmpireGovernmentUI.close()"
              style="${this.buttonStyle()}"
            >
              CLOSE
            </button>

          </div>

          <!-- COMPANY -->

          <div style="${this.cardStyle()}">

            <label style="
              font-size:12px;
              opacity:.7;
            ">
              COMPANY
            </label>

            <select
              id="empireGovCompany"
              onchange="EmpireGovernmentUI.render()"
              style="${this.selectStyle()}"
            >

              ${companies.map(
                company => `
                  <option
                    value="${company.id}"
                    ${
                      String(
                        company.id
                      ) ===
                      String(
                        selected.id
                      )
                        ? "selected"
                        : ""
                    }
                  >
                    ${this.escape(
                      company.name
                    )}
                  </option>
                `
              ).join("")}

            </select>

          </div>

          <!-- STATUS -->

          <div style="
            display:grid;
            grid-template-columns:
              repeat(auto-fit,minmax(150px,1fr));
            gap:10px;
            margin-bottom:12px;
          ">

            ${this.statCard(
              "Compliance",
              summary.score + "/100"
            )}

            ${this.statCard(
              "Rating",
              summary.rating
            )}

            ${this.statCard(
              "Tax Due",
              this.money(
                summary.taxDue
              )
            )}

            ${this.statCard(
              "Violations",
              summary.violations
            )}

          </div>

          <!-- COMPANY STATUS -->

          <div style="${this.cardStyle()}">

            <h3 style="margin-top:0">
              Business Status
            </h3>

            <div style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              gap:12px;
            ">

              <div>
                <b>
                  ${
                    selected.status ||
                    "Unknown"
                  }
                </b>

                <div style="
                  opacity:.65;
                  font-size:12px;
                  margin-top:5px;
                ">
                  Compliance determines
                  regulatory operating risk.
                </div>
              </div>

              <button
                onclick="
                  EmpireGovernmentUI.runInspection()
                "
                style="${this.buttonStyle()}"
              >
                REQUEST INSPECTION
              </button>

            </div>

          </div>

          <!-- REQUIREMENTS -->

          <div style="${this.cardStyle()}">

            <h3 style="margin-top:0">
              Regulatory Requirements
            </h3>

            ${requirements.map(
              req =>
                this.requirementHTML(
                  req,
                  selected
                )
            ).join("")}

          </div>

          <!-- TAX -->

          <div style="${this.cardStyle()}">

            <h3 style="margin-top:0">
              Tax Management
            </h3>

            <div style="
              display:grid;
              grid-template-columns:
                repeat(auto-fit,minmax(150px,1fr));
              gap:10px;
            ">

              ${this.smallInfo(
                "Tax Rate",
                summary.taxRate +
                "%"
              )}

              ${this.smallInfo(
                "Taxable Profit",
                this.money(
                  summary.taxableProfit
                )
              )}

              ${this.smallInfo(
                "Estimated Tax",
                this.money(
                  summary.taxDue
                )
              )}

            </div>

            <button
              onclick="
                EmpireGovernmentUI.fileTax()
              "
              style="${this.buttonStyle()} margin-top:14px;"
            >
              FILE TAX
            </button>

          </div>

          <!-- WARNINGS -->

          <div style="${this.cardStyle()}">

            <h3 style="margin-top:0">
              Government Alerts
            </h3>

            ${this.alertHTML(
              summary
            )}

          </div>

        </div>
      `;
    },

    /* ============================================================
       REQUIREMENTS
       ============================================================ */

    getRequirements(
      company
    ) {

      const data =
        company.compliance ||
        {};

      const requirements =
        data.requirements ||
        {};

      return Object.entries(
        requirements
      ).map(
        ([key,value]) => {

          const requirement =
            typeof value === "object"
              ? value
              : {
                  completed:
                    Boolean(value)
                };

          return {

            key,

            name:
              this.prettyName(
                key
              ),

            completed:
              Boolean(
                requirement.completed ||
                requirement.status ===
                "Completed"
              ),

            cost:
              Number(
                requirement.cost ||
                0
              ),

            required:
              requirement.required !==
              false

          };

        }
      );
    },

    requirementHTML(
      requirement,
      company
    ) {

      const status =
        requirement.completed
          ? "COMPLETED"
          : "REQUIRED";

      const action =
        requirement.completed
          ? ""
          : `
            <button
              onclick="
                EmpireGovernmentUI.completeRequirement(
                  '${this.escapeJS(
                    requirement.key
                  )}'
                )
              "
              style="${this.buttonStyle()}"
            >
              COMPLETE
            </button>
          `;

      return `
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          padding:14px 0;
          border-bottom:1px solid rgba(255,255,255,.08);
        ">

          <div>

            <div style="font-weight:800">
              ${this.escape(
                requirement.name
              )}
            </div>

            <div style="
              font-size:11px;
              opacity:.6;
              margin-top:4px;
            ">
              ${
                requirement.completed
                  ? "Requirement satisfied"
                  : "Cost: " +
                    this.money(
                      requirement.cost
                    )
              }
            </div>

          </div>

          <div style="
            display:flex;
            align-items:center;
            gap:8px;
          ">

            <span style="
              font-size:10px;
              font-weight:800;
              opacity:.75;
            ">
              ${status}
            </span>

            ${action}

          </div>

        </div>
      `;
    },

    /* ============================================================
       SUMMARY
       ============================================================ */

    getSummary(
      company
    ) {

      const data =
        company.compliance ||
        {};

      let score =
        Number(
          data.score ??
          data.complianceScore ??
          100
        );

      score =
        Math.max(
          0,
          Math.min(
            100,
            Math.round(score)
          )
        );

      const taxRate =
        Number(
          data.taxRate ||
          0.25
        );

      const finance =
        company.finance ||
        {};

      const revenue =
        Number(
          finance.totalRevenue ||
          0
        );

      const expenses =
        Number(
          finance.totalExpenses ||
          0
        );

      const profit =
        Math.max(
          0,
          revenue - expenses
        );

      let taxDue =
        Number(
          data.taxDue ||
          0
        );

      if (
        taxDue <= 0 &&
        profit > 0
      ) {

        taxDue =
          profit *
          (
            taxRate > 1
              ? taxRate / 100
              : taxRate
          );

      }

      const violations =
        Number(
          data.violations ||
          data.totalViolations ||
          0
        );

      let rating =
        "Excellent";

      if (score < 90)
        rating = "Good";

      if (score < 75)
        rating = "Needs Attention";

      if (score < 50)
        rating = "High Risk";

      if (score < 25)
        rating = "Critical";

      return {

        score,

        rating,

        taxRate:
          taxRate <= 1
            ? Math.round(
                taxRate * 100
              )
            : Math.round(
                taxRate
              ),

        taxableProfit:
          Math.round(
            profit
          ),

        taxDue:
          Math.round(
            taxDue
          ),

        violations

      };
    },

    /* ============================================================
       ACTIONS
       ============================================================ */

    completeRequirement(
      requirement
    ) {

      const company =
        this.selectedCompany();

      if (!company) return;

      if (
        typeof Compliance.completeRequirement !==
        "function"
      ) {

        this.toast(
          "Compliance action unavailable."
        );

        return;
      }

      const result =
        Compliance.completeRequirement(
          company,
          requirement
        );

      if (
        result?.success === false
      ) {

        this.toast(
          result.reason ||
          "Unable to complete requirement."
        );

        return;
      }

      Game.save?.();

      this.render();

      this.toast(
        "Requirement completed."
      );
    },

    fileTax() {

      const company =
        this.selectedCompany();

      if (!company) return;

      let result = null;

      if (
        typeof Compliance.fileTax ===
        "function"
      ) {

        result =
          Compliance.fileTax(
            company
          );

      } else if (
        typeof Compliance.payTax ===
        "function"
      ) {

        result =
          Compliance.payTax(
            company
          );

      }

      if (
        result &&
        result.success === false
      ) {

        this.toast(
          result.reason ||
          "Tax filing failed."
        );

        return;
      }

      Game.save?.();

      this.render();

      this.toast(
        "Tax filing processed."
      );
    },

    runInspection() {

      const company =
        this.selectedCompany();

      if (!company) return;

      let result = null;

      if (
        typeof Compliance.inspect ===
        "function"
      ) {

        result =
          Compliance.inspect(
            company
          );

      } else if (
        typeof Compliance.runInspection ===
        "function"
      ) {

        result =
          Compliance.runInspection(
            company
          );

      }

      if (
        result &&
        result.success === false
      ) {

        this.toast(
          result.reason ||
          "Inspection failed."
        );

        return;
      }

      Game.save?.();

      this.render();

      this.toast(
        "Government inspection completed."
      );
    },

    /* ============================================================
       ALERTS
       ============================================================ */

    alertHTML(
      summary
    ) {

      if (
        summary.score < 25
      ) {

        return `
          <div style="
            padding:12px;
            border-radius:12px;
            background:rgba(160,40,40,.25);
          ">
            <b>CRITICAL:</b>
            Business suspension risk is high.
          </div>
        `;

      }

      if (
        summary.score < 50
      ) {

        return `
          <div style="
            padding:12px;
            border-radius:12px;
            background:rgba(180,130,40,.22);
          ">
            <b>WARNING:</b>
            Compliance requires immediate attention.
          </div>
        `;

      }

      if (
        summary.taxDue > 0
      ) {

        return `
          <div style="
            padding:12px;
            border-radius:12px;
            background:rgba(180,130,40,.18);
          ">
            Estimated tax liability:
            <b>
              ${this.money(
                summary.taxDue
              )}
            </b>
          </div>
        `;

      }

      return `
        <div style="
          padding:12px;
          border-radius:12px;
          background:rgba(40,150,90,.18);
        ">
          No major compliance alerts.
        </div>
      `;
    },

    /* ============================================================
       UI HELPERS
       ============================================================ */

    statCard(
      title,
      value
    ) {

      return `
        <div style="
          background:#111827;
          border-radius:16px;
          padding:15px;
        ">

          <div style="
            font-size:10px;
            opacity:.55;
            text-transform:uppercase;
          ">
            ${title}
          </div>

          <div style="
            font-size:21px;
            font-weight:900;
            margin-top:5px;
          ">
            ${value}
          </div>

        </div>
      `;
    },

    smallInfo(
      title,
      value
    ) {

      return `
        <div style="
          background:rgba(255,255,255,.05);
          border-radius:12px;
          padding:12px;
        ">

          <div style="
            font-size:10px;
            opacity:.55;
          ">
            ${title}
          </div>

          <b>
            ${value}
          </b>

        </div>
      `;
    },

    cardStyle() {

      return `
        background:#111827;
        border-radius:18px;
        padding:18px;
        margin-bottom:12px;
        box-shadow:0 10px 30px rgba(0,0,0,.18);
      `;
    },

    buttonStyle() {

      return `
        background:#2563eb;
        color:white;
        border:none;
        border-radius:10px;
        padding:10px 13px;
        font-size:11px;
        font-weight:800;
      `;
    },

    selectStyle() {

      return `
        width:100%;
        margin-top:8px;
        padding:12px;
        border-radius:10px;
        border:1px solid rgba(255,255,255,.12);
        background:#1f2937;
        color:white;
      `;
    },

    prettyName(
      value
    ) {

      return String(value)
        .replace(
          /([A-Z])/g,
          " $1"
        )
        .replace(
          /^./,
          char =>
            char.toUpperCase()
        );
    },

    escape(
      value
    ) {

      return String(
        value ?? ""
      )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
    },

    escapeJS(
      value
    ) {

      return String(
        value ?? ""
      )
      .replace(
        /\\/g,
        "\\\\"
      )
      .replace(
        /'/g,
        "\\'"
      );
    },

    toast(
      message
    ) {

      const toast =
        document.createElement(
          "div"
        );

      toast.textContent =
        message;

      toast.style.cssText = `
        position:fixed;
        left:50%;
        bottom:30px;
        transform:translateX(-50%);
        z-index:11000;
        background:#111827;
        color:white;
        padding:12px 18px;
        border-radius:12px;
        box-shadow:0 10px 30px rgba(0,0,0,.35);
        font-weight:700;
        font-size:12px;
      `;

      document.body.appendChild(
        toast
      );

      setTimeout(
        () => toast.remove(),
        2200
      );
    },

    /* ============================================================
       OPEN / CLOSE
       ============================================================ */

    open() {

      this.createButton();
      this.createPanel();

      this.panel.style.display =
        "block";

      this.render();
    },

    close() {

      if (this.panel) {
        this.panel.style.display =
          "none";
      }
    },

    toggle() {

      if (
        this.panel &&
        this.panel.style.display ===
        "block"
      ) {

        this.close();

      } else {

        this.open();

      }
    }
  };

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireGovernmentUI =
    UI;

  /* ============================================================
     BOOT
     ============================================================ */

  function boot() {

    UI.createButton();
    UI.createPanel();

  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      boot
    );

  } else {

    boot();

  }

  window.addEventListener(
    "EmpireBusinessStarted",
    () => {

      if (UI.panel) {
        UI.render();
      }

    }
  );

  window.addEventListener(
    "EmpireBusinessLaunched",
    () => {

      if (UI.panel) {
        UI.render();
      }

    }
  );

  window.addEventListener(
    "EmpireDayAdvanced",
    () => {

      if (UI.panel) {
        UI.render();
      }

    }
  );

  console.log(
    "Empire Rush: Government & Compliance UI loaded."
  );

})();
