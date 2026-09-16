(function () {
  "use strict";

  const Game = window.EmpireGameState;
  const Products = window.EmpireProductSystem;
  const Market = window.EmpireProductMarket;

  if (!Game || !Products || !Market) {
    console.warn("Product Management UI waiting for product systems.");
    return;
  }

  const UI = {

    selectedCompany: null,
    selectedProduct: null,
    overlay: null,

    init() {
      this.createButton();
      this.createOverlay();

      window.addEventListener("EmpireBusinessStarted", () => {
        this.refresh();
      });

      window.addEventListener("EmpireBusinessLaunched", () => {
        this.refresh();
      });

      window.addEventListener("EmpireProductCreated", () => {
        this.refresh();
      });

      window.addEventListener("EmpireProductLaunched", () => {
        this.refresh();
      });

      window.addEventListener("EmpireProductUpgraded", () => {
        this.refresh();
      });

      window.addEventListener("EmpireProductMarketSale", () => {
        this.refresh();
      });

      window.addEventListener("EmpireDayAdvanced", () => {
        if (this.overlay?.style.display !== "none") {
          this.refresh();
        }
      });
    },

    /* =========================================================
       BUTTON
       ========================================================= */

    createButton() {

      if (document.getElementById("empireProductsButton")) {
        return;
      }

      const button = document.createElement("button");

      button.id = "empireProductsButton";
      button.innerHTML = "📦 PRODUCTS";

      Object.assign(button.style, {
        position: "fixed",
        right: "18px",
        top: "185px",
        zIndex: "9998",
        padding: "12px 18px",
        border: "1px solid rgba(255,255,255,.2)",
        borderRadius: "12px",
        background: "rgba(15,20,30,.92)",
        color: "white",
        fontWeight: "800",
        cursor: "pointer",
        boxShadow: "0 8px 30px rgba(0,0,0,.35)"
      });

      button.onclick = () => {
        this.open();
      };

      document.body.appendChild(button);
    },

    /* =========================================================
       OVERLAY
       ========================================================= */

    createOverlay() {

      this.overlay = document.createElement("div");

      Object.assign(this.overlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "10000",
        display: "none",
        overflowY: "auto",
        background: "rgba(4,7,12,.96)",
        color: "white",
        fontFamily:
          "Inter, Arial, sans-serif"
      });

      document.body.appendChild(
        this.overlay
      );
    },

    /* =========================================================
       OPEN
       ========================================================= */

    open() {

      this.overlay.style.display =
        "block";

      this.refresh();
    },

    close() {

      this.overlay.style.display =
        "none";
    },

    /* =========================================================
       STATE
       ========================================================= */

    getState() {

      return Game.getState();
    },

    getCompanies() {

      const state =
        this.getState();

      return (
        state?.companies || []
      ).filter(
        company =>
          company.status === "Operating" ||
          company.status === "Setup Required"
      );
    },

    /* =========================================================
       REFRESH
       ========================================================= */

    refresh() {

      if (!this.overlay) return;

      const companies =
        this.getCompanies();

      if (!companies.length) {

        this.overlay.innerHTML = `
          <div style="
            max-width:900px;
            margin:80px auto;
            padding:30px;
            text-align:center;
          ">
            <h1>Product Management</h1>

            <p style="opacity:.7;">
              Start a business before creating products.
            </p>

            <button
              onclick="window.EmpireProductManagement.close()"
              style="
                padding:12px 20px;
                border:0;
                border-radius:10px;
                cursor:pointer;
              "
            >
              Close
            </button>
          </div>
        `;

        return;
      }

      if (
        !this.selectedCompany ||
        !companies.includes(
          this.selectedCompany
        )
      ) {

        this.selectedCompany =
          companies[0];
      }

      Products.ensureCompany(
        this.selectedCompany
      );

      this.render();
    },

    /* =========================================================
       MAIN RENDER
       ========================================================= */

    render() {

      const company =
        this.selectedCompany;

      const products =
        company.products || [];

      this.overlay.innerHTML = `

        <div style="
          max-width:1200px;
          margin:0 auto;
          padding:25px;
        ">

          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:15px;
            flex-wrap:wrap;
          ">

            <div>
              <div style="
                font-size:13px;
                opacity:.6;
                letter-spacing:1px;
              ">
                EMPIRE RUSH
              </div>

              <h1 style="
                margin:5px 0;
                font-size:32px;
              ">
                Product Management
              </h1>

              <div style="opacity:.65;">
                Build products from idea to market.
              </div>
            </div>

            <button
              onclick="window.EmpireProductManagement.close()"
              style="
                padding:10px 16px;
                border:1px solid rgba(255,255,255,.15);
                border-radius:10px;
                background:#151a24;
                color:white;
                cursor:pointer;
              "
            >
              Close
            </button>

          </div>

          <div style="
            margin-top:25px;
            padding:18px;
            border-radius:16px;
            background:#101620;
            border:1px solid rgba(255,255,255,.08);
          ">

            <div style="
              display:flex;
              gap:10px;
              align-items:center;
              flex-wrap:wrap;
            ">

              <strong>Company</strong>

              <select
                id="empireProductCompanySelect"
                style="
                  padding:10px;
                  border-radius:9px;
                  background:#0b1018;
                  color:white;
                  border:1px solid #333;
                "
              >

                ${
                  this.getCompanies()
                    .map(
                      c => `
                        <option
                          value="${c.id}"
                          ${
                            c === company
                              ? "selected"
                              : ""
                          }
                        >
                          ${this.escape(
                            c.name ||
                            c.type ||
                            "Company"
                          )}
                        </option>
                      `
                    )
                    .join("")
                }

              </select>

              <button
                onclick="window.EmpireProductManagement.createProductDialog()"
                style="
                  padding:10px 16px;
                  border:0;
                  border-radius:10px;
                  background:#1d7df2;
                  color:white;
                  font-weight:800;
                  cursor:pointer;
                "
              >
                + Create Product
              </button>

            </div>

          </div>

          <div style="
            display:grid;
            grid-template-columns:
              repeat(auto-fit,minmax(180px,1fr));
            gap:12px;
            margin-top:15px;
          ">

            ${this.statCard(
              "Products",
              products.length
            )}

            ${this.statCard(
              "Launched",
              products.filter(
                p =>
                  p.stage === "Launched"
              ).length
            )}

            ${this.statCard(
              "In Development",
              products.filter(
                p =>
                  p.stage !== "Launched"
              ).length
            )}

            ${this.statCard(
              "Product Revenue",
              this.money(
                company
                  .productPortfolio
                  ?.totalProductRevenue ||
                0
              )
            )}

          </div>

          <div style="
            margin-top:25px;
            display:grid;
            grid-template-columns:
              repeat(auto-fit,minmax(300px,1fr));
            gap:16px;
          ">

            ${
              products.length
                ? products
                    .map(
                      product =>
                        this.productCard(
                          product
                        )
                    )
                    .join("")
                : `
                  <div style="
                    padding:40px;
                    border-radius:16px;
                    background:#101620;
                    opacity:.7;
                    text-align:center;
                  ">
                    No products yet.
                    Create your first product.
                  </div>
                `
            }

          </div>

          ${
            this.selectedProduct
              ? this.productDetail(
                  this.selectedProduct
                )
              : ""
          }

        </div>
      `;

      const select =
        document.getElementById(
          "empireProductCompanySelect"
        );

      if (select) {

        select.onchange = () => {

          const companies =
            this.getCompanies();

          this.selectedCompany =
            companies.find(
              c =>
                String(c.id) ===
                String(select.value)
            ) || companies[0];

          this.selectedProduct =
            null;

          this.refresh();
        };
      }
    },

    /* =========================================================
       STAT CARD
       ========================================================= */

    statCard(
      title,
      value
    ) {

      return `
        <div style="
          padding:18px;
          border-radius:14px;
          background:#101620;
          border:1px solid rgba(255,255,255,.08);
        ">

          <div style="
            font-size:12px;
            opacity:.55;
            text-transform:uppercase;
          ">
            ${title}
          </div>

          <div style="
            margin-top:8px;
            font-size:24px;
            font-weight:900;
          ">
            ${value}
          </div>

        </div>
      `;
    },

    /* =========================================================
       PRODUCT CARD
       ========================================================= */

    productCard(product) {

      const selected =
        this.selectedProduct === product;

      const inventory =
        Market.getInventory(
          product
        );

      const progress =
        this.getStageProgress(
          product
        );

      return `
        <div
          style="
            padding:18px;
            border-radius:16px;
            background:${
              selected
                ? "#182334"
                : "#101620"
            };
            border:1px solid ${
              selected
                ? "#347fe8"
                : "rgba(255,255,255,.08)"
            };
            cursor:pointer;
          "
          onclick="
            window.EmpireProductManagement.selectProduct(
              '${this.escapeAttr(product.id)}'
            )
          "
        >

          <div style="
            display:flex;
            justify-content:space-between;
            gap:10px;
          ">

            <div>
              <div style="
                font-size:11px;
                opacity:.5;
                text-transform:uppercase;
              ">
                ${this.escape(
                  product.category
                )}
              </div>

              <h2 style="
                margin:5px 0;
              ">
                ${this.escape(
                  product.name
                )}
              </h2>
            </div>

            <div style="
              padding:6px 9px;
              border-radius:8px;
              background:#202938;
              font-size:11px;
            ">
              ${this.escape(
                product.stage
              )}
            </div>

          </div>

          <div style="
            margin-top:15px;
          ">

            ${this.progressBar(
              progress
            )}

            <div style="
              display:flex;
              justify-content:space-between;
              margin-top:6px;
              font-size:11px;
              opacity:.6;
            ">

              <span>Development</span>

              <span>
                ${Math.round(progress)}%
              </span>

            </div>

          </div>

          <div style="
            display:grid;
            grid-template-columns:
              1fr 1fr;
            gap:8px;
            margin-top:15px;
            font-size:13px;
          ">

            <div>
              Quality:
              <strong>
                ${Math.round(
                  product.quality
                )}
              </strong>
            </div>

            <div>
              Innovation:
              <strong>
                ${Math.round(
                  product.innovation
                )}
              </strong>
            </div>

            <div>
              Inventory:
              <strong>
                ${inventory}
              </strong>
            </div>

            <div>
              Rating:
              <strong>
                ${
                  product.rating
                    ? product.rating +
                      "/5"
                    : "—"
                }
              </strong>
            </div>

          </div>

        </div>
      `;
    },

    /* =========================================================
       DETAIL PANEL
       ========================================================= */

    productDetail(product) {

      const company =
        this.selectedCompany;

      const marketSummary =
        Market.getSummary(
          company,
          product
        );

      const inventory =
        Market.getInventory(
          product
        );

      return `

        <div 
        data-product-detail
        style="
          margin-top:25px;
          padding:22px;
          border-radius:18px;
          background:#0d141e;
          border:1px solid rgba(255,255,255,.10);
        ">

          <div style="
            display:flex;
            justify-content:space-between;
            gap:15px;
            flex-wrap:wrap;
          ">

            <div>

              <div style="
                font-size:12px;
                opacity:.5;
              ">
                PRODUCT
              </div>

              <h2 style="
                margin:4px 0;
              ">
                ${this.escape(
                  product.name
                )}
              </h2>

              <div style="
                opacity:.6;
              ">
                Version ${product.version}
                ·
                ${this.escape(
                  product.stage
                )}
              </div>

            </div>

            <button
              onclick="
                window.EmpireProductManagement.selectedProduct=null;
                window.EmpireProductManagement.refresh();
              "
              style="
                padding:8px 12px;
                background:#171d27;
                color:white;
                border:1px solid #333;
                border-radius:8px;
                cursor:pointer;
              "
            >
              Deselect
            </button>

          </div>

          <div style="
            display:grid;
            grid-template-columns:
              repeat(auto-fit,minmax(150px,1fr));
            gap:10px;
            margin-top:20px;
          ">

            ${this.statCard(
              "Quality",
              Math.round(
                product.quality
              )
            )}

            ${this.statCard(
              "Reliability",
              Math.round(
                product.reliability
              )
            )}

            ${this.statCard(
              "Innovation",
              Math.round(
                product.innovation
              )
            )}

            ${this.statCard(
              "Features",
              product.features
            )}

            ${this.statCard(
              "Demand",
              marketSummary?.demand ||
              0
            )}

            ${this.statCard(
              "Awareness",
              marketSummary?.awareness ||
              0
            )}

            ${this.statCard(
              "Inventory",
              inventory
            )}

            ${this.statCard(
              "Rating",
              product.rating
                ? product.rating + "/5"
                : "—"
            )}

          </div>

          <div style="
            margin-top:22px;
          ">

            <h3>Development Pipeline</h3>

            ${this.pipeline(
              product
            )}

          </div>

          <div style="
            margin-top:22px;
            display:flex;
            flex-wrap:wrap;
            gap:9px;
          ">

            ${this.actionButton(
              "Design",
              "developDesign"
            )}

            ${this.actionButton(
              "Build Prototype",
              "buildPrototype"
            )}

            ${this.actionButton(
              "Add Feature",
              "addFeature"
            )}

            ${this.actionButton(
              "Run Testing",
              "testProduct"
            )}

            ${this.actionButton(
              "Rework",
              "reworkProduct"
            )}

            ${this.actionButton(
              "Produce Units",
              "produceUnits"
            )}

            ${this.actionButton(
              "Launch Product",
              "launchProduct"
            )}

            ${this.actionButton(
              "Sell Units",
              "sellUnits"
            )}

            ${this.actionButton(
              "Set Price",
              "setPrice"
            )}

            ${this.actionButton(
              "Upgrade Product",
              "upgradeProduct"
            )}

          </div>

          <div style="
            margin-top:25px;
            padding:18px;
            border-radius:14px;
            background:#111a26;
          ">

            <h3 style="
              margin-top:0;
            ">
              Financial Performance
            </h3>

            <div style="
              display:grid;
              grid-template-columns:
                repeat(auto-fit,minmax(170px,1fr));
              gap:12px;
            ">

              <div>
                Selling Price<br>
                <strong>
                  ${this.money(
                    product.sellingPrice
                  )}
                </strong>
              </div>

              <div>
                Production Cost<br>
                <strong>
                  ${this.money(
                    product.productionCost
                  )}
                </strong>
              </div>

              <div>
                Units Produced<br>
                <strong>
                  ${product.unitsProduced}
                </strong>
              </div>

              <div>
                Units Sold<br>
                <strong>
                  ${product.unitsSold}
                </strong>
              </div>

              <div>
                Revenue<br>
                <strong>
                  ${this.money(
                    product.revenue
                  )}
                </strong>
              </div>

              <div>
                Development Cost<br>
                <strong>
                  ${this.money(
                    product.developmentCost
                  )}
                </strong>
              </div>

            </div>

          </div>

        </div>
      `;
    },

    /* =========================================================
       PIPELINE
       ========================================================= */

    pipeline(product) {

      const stages = [
        "Idea",
        "Design",
        "Prototype",
        "Production Ready",
        "Testing",
        "Ready for Launch",
        "Launched"
      ];

      return `
        <div style="
          display:flex;
          gap:6px;
          overflow-x:auto;
          padding-bottom:8px;
        ">

          ${
            stages
              .map(
                stage => {

                  const active =
                    product.stage ===
                    stage;

                  const completed =
                    stages.indexOf(stage) <
                    stages.indexOf(
                      product.stage
                    );

                  return `
                    <div style="
                      min-width:125px;
                      padding:12px;
                      border-radius:10px;
                      background:${
                        active ||
                        completed
                          ? "#1b365b"
                          : "#151b24"
                      };
                      border:1px solid ${
                        active
                          ? "#3d8df5"
                          : "rgba(255,255,255,.07)"
                      };
                      text-align:center;
                      font-size:12px;
                    ">
                      ${
                        completed
                          ? "✓ "
                          : ""
                      }
                      ${stage}
                    </div>
                  `;
                }
              )
              .join("")
          }

        </div>
      `;
    },

    /* =========================================================
       STAGE PROGRESS
       ========================================================= */

    getStageProgress(product) {

      if (
        product.stage === "Idea"
      ) {
        return 5;
      }

      if (
        product.stage === "Design"
      ) {
        return product.designProgress;
      }

      if (
        product.stage === "Prototype"
      ) {
        return 25 +
          product.prototypeProgress *
          0.25;
      }

      if (
        product.stage ===
        "Production Ready"
      ) {
        return 60;
      }

      if (
        product.stage ===
        "Testing"
      ) {
        return 60 +
          product.testingProgress *
          0.30;
      }

      if (
        product.stage ===
        "Ready for Launch"
      ) {
        return 95;
      }

      if (
        product.stage === "Launched"
      ) {
        return 100;
      }

      return 0;
    },

    /* =========================================================
       PROGRESS BAR
       ========================================================= */

    progressBar(value) {

      return `
        <div style="
          height:7px;
          border-radius:20px;
          background:#202734;
          overflow:hidden;
        ">

          <div style="
            width:${Math.max(
              0,
              Math.min(
                100,
                value
              )
            )}%;
            height:100%;
            background:#3d8df5;
          "></div>

        </div>
      `;
    },

    /* =========================================================
       ACTION BUTTON
       ========================================================= */

    actionButton(
      label,
      action
    ) {

      return `
        <button
          onclick="
            window.EmpireProductManagement.${action}();
          "
          style="
            padding:10px 13px;
            border:1px solid rgba(255,255,255,.12);
            border-radius:9px;
            background:#17202d;
            color:white;
            cursor:pointer;
            font-weight:700;
          "
        >
          ${label}
        </button>
      `;
    },

    /* =========================================================
       SELECT PRODUCT
       ========================================================= */

    selectProduct(productId) {

      const product =
        Products.getProduct(
          this.selectedCompany,
          productId
        );

      if (!product) return;

      this.selectedProduct =
        product;

      this.refresh();

      setTimeout(
        () => {

          const detail =
            this.overlay.querySelector(
              "[data-product-detail]"
            );

          if (detail) {
            detail.scrollIntoView({
              behavior: "smooth"
            });
          }

        },
        50
      );
    },

    /* =========================================================
       CREATE PRODUCT DIALOG
       ========================================================= */

    createProductDialog() {

      const name =
        prompt(
          "Enter product name:"
        );

      if (!name?.trim()) {
        return;
      }

      const category =
        prompt(
          "Enter category:\n\n" +
          "software\n" +
          "digital\n" +
          "electronics\n" +
          "automotive\n" +
          "clothing\n" +
          "food\n" +
          "appliance\n" +
          "machinery\n" +
          "consumerGoods"
        );

      const normalized =
        String(
          category ||
          "consumerGoods"
        )
          .trim();

      const valid =
        Products.categories[
          normalized
        ]
          ? normalized
          : "consumerGoods";

      const product =
        Products.createProduct(
          this.selectedCompany,
          name.trim(),
          valid
        );

      this.selectedProduct =
        product;

      this.refresh();
    },

    /* =========================================================
       ACTIONS
       ========================================================= */

    developDesign() {

      this.execute(
        Products.developDesign
      );
    },

    buildPrototype() {

      this.execute(
        Products.buildPrototype
      );
    },

    addFeature() {

      this.execute(
        Products.addFeature
      );
    },

    testProduct() {

      this.execute(
        Products.testProduct
      );
    },

    reworkProduct() {

      this.execute(
        Products.reworkProduct
      );
    },

    produceUnits() {

      if (!this.selectedProduct) {
        return;
      }

      const input =
        prompt(
          "How many units should be produced?"
        );

      const units =
        Number(input);

      if (
        !Number.isFinite(units) ||
        units <= 0
      ) {
        return;
      }

      const result =
        Products.produceUnits(
          this.selectedCompany,
          this.selectedProduct.id,
          units
        );

      this.notifyResult(
        result
      );
    },

    launchProduct() {

      this.execute(
        Products.launchProduct
      );
    },

    sellUnits() {

      if (!this.selectedProduct) {
        return;
      }

      const input =
        prompt(
          "How many units should be sold?"
        );

      const units =
        Number(input);

      if (
        !Number.isFinite(units) ||
        units <= 0
      ) {
        return;
      }

      const result =
        Products.sellUnits(
          this.selectedCompany,
          this.selectedProduct.id,
          units
        );

      this.notifyResult(
        result
      );
    },

    setPrice() {

      if (!this.selectedProduct) {
        return;
      }

      const input =
        prompt(
          "Enter new selling price:"
        );

      const price =
        Number(input);

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        return;
      }

      const result =
        Market.setPrice(
          this.selectedCompany,
          this.selectedProduct.id,
          price
        );

      this.notifyResult(
        result
      );
    },

    upgradeProduct() {

      this.execute(
        Products.upgradeProduct
      );
    },

    /* =========================================================
       GENERIC ACTION EXECUTOR
       ========================================================= */

    execute(action) {

      if (!this.selectedProduct) {

        this.notifyResult({
          success: false,
          reason:
            "Select a product first."
        });

        return;
      }

      const result =
        action.call(
          Products,
          this.selectedCompany,
          this.selectedProduct.id
        );

      this.notifyResult(
        result
      );
    },

    /* =========================================================
       RESULT NOTIFICATION
       ========================================================= */

    notifyResult(result) {

      if (!result) return;

      if (result.success) {

        const message =
          result.reason ||
          "Action completed successfully.";

        this.toast(
          message
        );

      } else {

        this.toast(
          result.reason ||
          "Action could not be completed."
        );

      }

      this.refresh();
    },

    /* =========================================================
       TOAST
       ========================================================= */

    toast(message) {

      const toast =
        document.createElement(
          "div"
        );

      toast.textContent =
        message;

      Object.assign(
        toast.style,
        {
          position: "fixed",
          left: "50%",
          bottom: "30px",
          transform:
            "translateX(-50%)",
          zIndex: "11000",
          padding:
            "13px 18px",
          borderRadius:
            "10px",
          background:
            "#161d28",
          color:
            "white",
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
        () => {
          toast.remove();
        },
        2200
      );
    },

    /* =========================================================
       HELPERS
       ========================================================= */

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

    escapeAttr(value) {

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

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.EmpireProductManagement =
    UI;

  /* ============================================================
     START
     ============================================================ */

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
    "Empire Rush: Product Management UI loaded."
  );

})();
