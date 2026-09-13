(function () {
  "use strict";

  const Game = window.EmpireGameState;
  const Groups = window.EmpireCompanyGroup;

  if (!Game || !Groups) {
    console.warn("Corporate UI waiting for core systems.");
    return;
  }

  const UI = {
    overlay: null,
    selectedCompanyId: null,

    init() {
      this.createButton();
      this.createOverlay();

      window.addEventListener(
        "EmpireHoldingCompanyCreated",
        () => this.refresh()
      );

      window.addEventListener(
        "EmpireSubsidiaryAdded",
        () => this.refresh()
      );

      window.addEventListener(
        "EmpireSubsidiaryRemoved",
        () => this.refresh()
      );

      window.addEventListener(
        "EmpireInterCompanyInvestment",
        () => this.refresh()
      );
    },

    createButton() {
      if (
        document.getElementById(
          "empireCorporateButton"
        )
      ) {
        return;
      }

      const button =
        document.createElement("button");

      button.id =
        "empireCorporateButton";

      button.innerHTML =
        "🏢 CORPORATE";

      Object.assign(
        button.style,
        {
          position: "fixed",
          right: "18px",
          top: "285px",
          zIndex: "9998",
          padding: "12px 18px",
          border:
            "1px solid rgba(255,255,255,.15)",
          borderRadius: "12px",
          background:
            "rgba(15,20,30,.94)",
          color: "white",
          fontWeight: "800",
          cursor: "pointer",
          boxShadow:
            "0 8px 30px rgba(0,0,0,.35)"
        }
      );

      button.onclick =
        () => this.open();

      document.body.appendChild(
        button
      );
    },

    createOverlay() {
      this.overlay =
        document.createElement("div");

      Object.assign(
        this.overlay.style,
        {
          position: "fixed",
          inset: "0",
          zIndex: "10002",
          display: "none",
          overflowY: "auto",
          background:
            "rgba(4,7,12,.97)",
          color: "white",
          fontFamily:
            "Inter, Arial, sans-serif"
        }
      );

      document.body.appendChild(
        this.overlay
      );
    },

    open() {
      this.overlay.style.display =
        "block";

      this.refresh();
    },

    close() {
      this.overlay.style.display =
        "none";
    },

    getCompanies() {
      return (
        Game.getState()?.companies ||
        []
      );
    },

    getOperatingCompanies() {
      return this.getCompanies()
        .filter(
          company =>
            company.status ===
              "Operating" ||
            company.status ===
              "Setup Required"
        );
    },

    refresh() {
      if (!this.overlay) return;

      const companies =
        this.getOperatingCompanies();

      if (!companies.length) {
        this.renderEmpty();
        return;
      }

      if (
        !this.selectedCompanyId ||
        !companies.some(
          company =>
            String(company.id) ===
            String(
              this.selectedCompanyId
            )
        )
      ) {
        this.selectedCompanyId =
          companies[0].id;
      }

      this.render();
    },

    renderEmpty() {
      this.overlay.innerHTML = `
        <div style="
          max-width:800px;
          margin:100px auto;
          padding:30px;
          text-align:center;
        ">

          <h1>Corporate Management</h1>

          <p style="opacity:.6;">
            Start a business before building
            a corporate group.
          </p>

          <button
            onclick="
              window.EmpireCompanyGroupUI.close()
            "
            style="
              padding:11px 18px;
              border:0;
              border-radius:9px;
              cursor:pointer;
            "
          >
            Close
          </button>

        </div>
      `;
    },

    render() {
      const company =
        Groups.getCompany(
          this.selectedCompanyId
        );

      if (!company) return;

      Groups.ensureCompany(
        company
      );

      const summary =
        Groups.getCorporateSummary(
          company.id
        );

      const financials =
        Groups.getGroupFinancials(
          company.id
        );

      const controlled =
        Groups.getControlledCompanies(
          company.id
        );

      this.overlay.innerHTML = `

        <div style="
          max-width:1200px;
          margin:0 auto;
          padding:25px;
        ">

          ${this.header()}

          ${this.companySelector()}

          ${this.financialCards(
            financials
          )}

          <div style="
            display:grid;
            grid-template-columns:
              minmax(300px,1fr)
              minmax(300px,1fr);
            gap:18px;
            margin-top:22px;
          ">

            ${this.structurePanel(
              company
            )}

            ${this.controlPanel(
              company,
              controlled
            )}

          </div>

          ${this.groupCompaniesPanel(
            company.id
          )}

        </div>
      `;
    },

    header() {
      return `
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:15px;
          flex-wrap:wrap;
        ">

          <div>

            <div style="
              font-size:12px;
              opacity:.5;
              letter-spacing:2px;
            ">
              EMPIRE RUSH
            </div>

            <h1 style="
              margin:5px 0;
              font-size:32px;
            ">
              Corporate Management
            </h1>

            <div style="opacity:.6;">
              Build and control your business empire.
            </div>

          </div>

          <button
            onclick="
              window.EmpireCompanyGroupUI.close()
            "
            style="
              padding:10px 16px;
              border:1px solid #333;
              border-radius:10px;
              background:#151b25;
              color:white;
              cursor:pointer;
            "
          >
            Close
          </button>

        </div>
      `;
    },

    companySelector() {
      const companies =
        this.getOperatingCompanies();

      return `
        <div style="
          margin-top:22px;
          padding:17px;
          border-radius:15px;
          background:#101620;
          border:
            1px solid rgba(255,255,255,.08);
        ">

          <div style="
            display:flex;
            align-items:center;
            gap:10px;
            flex-wrap:wrap;
          ">

            <strong>
              Selected Company
            </strong>

            <select
              id="empireCorporateCompanySelect"
              style="
                min-width:220px;
                padding:10px;
                border-radius:9px;
                background:#0b1018;
                color:white;
                border:1px solid #333;
              "
            >

              ${
                companies.map(
                  company => `
                    <option
                      value="${this.attr(
                        company.id
                      )}"
                      ${
                        String(
                          company.id
                        ) ===
                        String(
                          this.selectedCompanyId
                        )
                          ? "selected"
                          : ""
                      }
                    >
                      ${this.escape(
                        company.name ||
                        "Company"
                      )}
                    </option>
                  `
                ).join("")
              }

            </select>

            <button
              onclick="
                window.EmpireCompanyGroupUI.createHolding()
              "
              style="
                padding:10px 15px;
                border:0;
                border-radius:9px;
                background:#287de8;
                color:white;
                font-weight:800;
                cursor:pointer;
              "
            >
              + Create Holding Company
            </button>

          </div>

        </div>
      `;
    },

    financialCards(financials) {
      return `
        <div style="
          display:grid;
          grid-template-columns:
            repeat(auto-fit,minmax(170px,1fr));
          gap:10px;
          margin-top:15px;
        ">

          ${this.stat(
            "Group Companies",
            financials.companies
          )}

          ${this.stat(
            "Group Revenue",
            this.money(
              financials.revenue
            )
          )}

          ${this.stat(
            "Group Profit",
            this.money(
              financials.profit
            )
          )}

          ${this.stat(
            "Group Cash",
            this.money(
              financials.cash
            )
          )}

          ${this.stat(
            "Group Debt",
            this.money(
              financials.debt
            )
          )}

          ${this.stat(
            "Group Valuation",
            this.money(
              financials.valuation
            )
          )}

        </div>
      `;
    },

    stat(title, value) {
      return `
        <div style="
          padding:16px;
          border-radius:13px;
          background:#101620;
          border:
            1px solid rgba(255,255,255,.07);
        ">

          <div style="
            font-size:11px;
            opacity:.5;
            text-transform:uppercase;
          ">
            ${title}
          </div>

          <div style="
            margin-top:7px;
            font-size:20px;
            font-weight:900;
          ">
            ${value}
          </div>

        </div>
      `;
    },

    structurePanel(company) {
      const tree =
        Groups.getGroupTree(
          company.id
        );

      return `
        <div style="
          padding:20px;
          border-radius:16px;
          background:#101620;
          border:
            1px solid rgba(255,255,255,.08);
        ">

          <h2 style="
            margin-top:0;
          ">
            Corporate Structure
          </h2>

          ${this.treeNode(tree)}

        </div>
      `;
    },

    treeNode(node, depth = 0) {
      if (!node) return "";

      const children =
        node.children || [];

      return `
        <div style="
          margin-left:${depth * 20}px;
          margin-top:10px;
        ">

          <div style="
            padding:12px;
            border-radius:10px;
            background:#17202d;
            border:
              1px solid rgba(255,255,255,.07);
          ">

            <div style="
              font-weight:800;
            ">
              ${this.escape(
                node.name ||
                "Company"
              )}
            </div>

            <div style="
              margin-top:4px;
              font-size:12px;
              opacity:.55;
            ">
              ${this.escape(
                node.role ||
                "Operating Company"
              )}
              ·
              ${node.ownership || 100}% ownership
            </div>

          </div>

          ${
            children.length
              ? children
                  .map(
                    child =>
                      this.treeNode(
                        child,
                        depth + 1
                      )
                  )
                  .join("")
              : ""
          }

        </div>
      `;
    },

    controlPanel(
      company,
      controlled
    ) {
      return `
        <div style="
          padding:20px;
          border-radius:16px;
          background:#101620;
          border:
            1px solid rgba(255,255,255,.08);
        ">

          <h2 style="
            margin-top:0;
          ">
            Corporate Control
          </h2>

          <div style="
            line-height:1.8;
            opacity:.75;
          ">

            <div>
              Role:
              <strong>
                ${this.escape(
                  company.corporate?.role ||
                  "Operating Company"
                )}
              </strong>
            </div>

            <div>
              Parent:
              <strong>
                ${
                  company.corporate
                    ?.parentCompanyId
                    ? this.escape(
                        Groups.getCompany(
                          company.corporate
                            .parentCompanyId
                        )?.name ||
                        "Unknown"
                      )
                    : "None"
                }
              </strong>
            </div>

            <div>
              Ownership:
              <strong>
                ${
                  company.corporate
                    ?.ownershipPercentage ??
                  100
                }%
              </strong>
            </div>

            <div>
              Voting Control:
              <strong>
                ${
                  company.corporate
                    ?.votingPercentage ??
                  100
                }%
              </strong>
            </div>

            <div>
              Controlled Companies:
              <strong>
                ${controlled.length}
              </strong>
            </div>

          </div>

          <div style="
            margin-top:20px;
            display:flex;
            flex-wrap:wrap;
            gap:8px;
          ">

            <button
              onclick="
                window.EmpireCompanyGroupUI.addSubsidiary()
              "
              style="
                padding:10px 13px;
                border-radius:9px;
                border:0;
                background:#287de8;
                color:white;
                cursor:pointer;
                font-weight:700;
              "
            >
              Add Subsidiary
            </button>

            <button
              onclick="
                window.EmpireCompanyGroupUI.invest()
              "
              style="
                padding:10px 13px;
                border-radius:9px;
                border:1px solid #333;
                background:#17202d;
                color:white;
                cursor:pointer;
              "
            >
              Invest in Subsidiary
            </button>

            <button
              onclick="
                window.EmpireCompanyGroupUI.withdraw()
              "
              style="
                padding:10px 13px;
                border-radius:9px;
                border:1px solid #333;
                background:#17202d;
                color:white;
                cursor:pointer;
              "
            >
              Transfer Dividend
            </button>

          </div>

        </div>
      `;
    },

    groupCompaniesPanel(companyId) {
      const companies =
        Groups.getGroupCompanies(
          companyId
        );

      return `
        <div style="
          margin-top:22px;
          padding:20px;
          border-radius:16px;
          background:#101620;
          border:
            1px solid rgba(255,255,255,.08);
        ">

          <h2 style="
            margin-top:0;
          ">
            Group Companies
          </h2>

          ${
            companies.length
              ? companies
                  .map(
                    company =>
                      this.companyRow(
                        company
                      )
                  )
                  .join("")
              : `
                <div style="opacity:.6;">
                  No group companies.
                </div>
              `
          }

        </div>
      `;
    },

    companyRow(company) {
      const finance =
        company.finance || {};

      return `
        <div style="
          display:grid;
          grid-template-columns:
            2fr 1fr 1fr 1fr;
          gap:10px;
          align-items:center;
          padding:13px 0;
          border-bottom:
            1px solid rgba(255,255,255,.06);
        ">

          <div>
            <strong>
              ${this.escape(
                company.name ||
                "Company"
              )}
            </strong>

            <div style="
              font-size:11px;
              opacity:.5;
            ">
              ${this.escape(
                company.corporate?.role ||
                "Operating Company"
              )}
            </div>
          </div>

          <div>
            Cash<br>
            <strong>
              ${this.money(
                finance.cash || 0
              )}
            </strong>
          </div>

          <div>
            Revenue<br>
            <strong>
              ${this.money(
                finance.totalRevenue || 0
              )}
            </strong>
          </div>

          <div>
            Valuation<br>
            <strong>
              ${this.money(
                finance.valuation || 0
              )}
            </strong>
          </div>

        </div>
      `;
    },

    /* =======================================================
       HOLDING COMPANY
       ======================================================= */

    createHolding() {
      const name =
        prompt(
          "Enter holding company name:"
        );

      if (!name?.trim()) return;

      const result =
        Groups.createHoldingCompany(
          name.trim(),
          this.selectedCompanyId
        );

      this.notify(
        result
      );

      if (result.success) {
        this.selectedCompanyId =
          result.company.id;
      }

      this.refresh();
    },

    /* =======================================================
       ADD SUBSIDIARY
       ======================================================= */

    addSubsidiary() {
      const parent =
        Groups.getCompany(
          this.selectedCompanyId
        );

      if (!parent) return;

      const available =
        this.getCompanies()
          .filter(
            company =>
              company.id !==
                parent.id &&
              !company.corporate
                ?.parentCompanyId
          );

      if (!available.length) {

        this.notify({
          success: false,
          reason:
            "No independent company is available."
        });

        return;
      }

      const names =
        available
          .map(
            (company, index) =>
              `${index + 1}. ${company.name}`
          )
          .join("\n");

      const choice =
        Number(
          prompt(
            "Select subsidiary:\n\n" +
            names
          )
        );

      const target =
        available[
          choice - 1
        ];

      if (!target) return;

      const ownership =
        Number(
          prompt(
            "Enter ownership percentage:",
            "100"
          )
        );

      if (
        !Number.isFinite(
          ownership
        )
      ) return;

      const result =
        Groups.addSubsidiary(
          parent.id,
          target.id,
          ownership
        );

      this.notify(
        result
      );

      this.refresh();
    },

    /* =======================================================
       INVESTMENT
       ======================================================= */

    invest() {
      const parent =
        Groups.getCompany(
          this.selectedCompanyId
        );

      if (!parent) return;

      const subsidiaries =
        Groups.getControlledCompanies(
          parent.id
        );

      if (!subsidiaries.length) {

        this.notify({
          success: false,
          reason:
            "This company has no subsidiaries."
        });

        return;
      }

      const choice =
        Number(
          prompt(
            "Select subsidiary:\n\n" +
            subsidiaries
              .map(
                (item, index) =>
                  `${index + 1}. ${item.company.name}`
              )
              .join("\n")
          )
        );

      const target =
        subsidiaries[
          choice - 1
        ]?.company;

      if (!target) return;

      const amount =
        Number(
          prompt(
            "Enter investment amount:"
          )
        );

      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) return;

      const result =
        Groups.investInSubsidiary(
          parent.id,
          target.id,
          amount
        );

      this.notify(
        result
      );

      this.refresh();
    },

    /* =======================================================
       DIVIDEND
       ======================================================= */

    withdraw() {
      const parent =
        Groups.getCompany(
          this.selectedCompanyId
        );

      if (!parent) return;

      const subsidiaries =
        Groups.getControlledCompanies(
          parent.id
        );

      if (!subsidiaries.length) {

        this.notify({
          success: false,
          reason:
            "This company has no subsidiaries."
        });

        return;
      }

      const choice =
        Number(
          prompt(
            "Select subsidiary:\n\n" +
            subsidiaries
              .map(
                (item, index) =>
                  `${index + 1}. ${item.company.name}`
              )
              .join("\n")
          )
        );

      const target =
        subsidiaries[
          choice - 1
        ]?.company;

      if (!target) return;

      const amount =
        Number(
          prompt(
            "Enter transfer amount:"
          )
        );

      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) return;

      const result =
        Groups.withdrawFromSubsidiary(
          parent.id,
          target.id,
          amount
        );

      this.notify(
        result
      );

      this.refresh();
    },

    /* =======================================================
       NOTIFICATION
       ======================================================= */

    notify(result) {

      if (!result) return;

      this.toast(
        result.success
          ? (
              result.message ||
              "Corporate action completed."
            )
          : (
              result.reason ||
              "Corporate action failed."
            )
      );
    },

    toast(message) {
      const toast =
        document.createElement("div");

      toast.textContent =
        message;

      Object.assign(
        toast.style,
        {
          position:"fixed",
          left:"50%",
          bottom:"30px",
          transform:
            "translateX(-50%)",
          zIndex:"11000",
          padding:"13px 18px",
          borderRadius:"10px",
          background:"#161d28",
          color:"white",
          border:
            "1px solid rgba(255,255,255,.15)",
          boxShadow:
            "0 10px 30px rgba(0,0,0,.4)"
        }
      );

      document.body.appendChild(
        toast
      );

      setTimeout(
        () => toast.remove(),
        2200
      );
    },

    money(value) {
      return "₹" +
        Number(
          value || 0
        ).toLocaleString(
          "en-IN"
        );
    },

    escape(value) {
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

    attr(value) {
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
    }
  };

  window.EmpireCompanyGroupUI =
    UI;

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      () => UI.init()
    );
  } else {
    UI.init();
  }

  console.log(
    "Empire Rush: Corporate / Group UI loaded."
  );

})();
