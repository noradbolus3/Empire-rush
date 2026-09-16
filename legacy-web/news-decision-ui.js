(function () {
  "use strict";

  const Game = window.EmpireGameState;
  const News = window.EmpireNewsSystem;

  if (!Game || !News) {
    console.warn("News & Decision UI waiting for core systems.");
    return;
  }

  const UI = {
    overlay: null,
    selectedNews: null,

    init() {
      this.createButton();
      this.createOverlay();

      window.addEventListener("EmpireDayAdvanced", () => {
        if (this.overlay?.style.display !== "none") {
          this.refresh();
        }
      });

      window.addEventListener("EmpireMarketEvent", () => {
        this.refresh();
      });
    },

    createButton() {
      if (document.getElementById("empireNewsButton")) return;

      const button = document.createElement("button");

      button.id = "empireNewsButton";
      button.innerHTML = "📰 NEWS";

      Object.assign(button.style, {
        position: "fixed",
        right: "18px",
        top: "235px",
        zIndex: "9998",
        padding: "12px 18px",
        border: "1px solid rgba(255,255,255,.15)",
        borderRadius: "12px",
        background: "rgba(15,20,30,.94)",
        color: "white",
        fontWeight: "800",
        cursor: "pointer",
        boxShadow: "0 8px 30px rgba(0,0,0,.35)"
      });

      button.onclick = () => this.open();

      document.body.appendChild(button);
    },

    createOverlay() {
      this.overlay = document.createElement("div");

      Object.assign(this.overlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "10001",
        display: "none",
        overflowY: "auto",
        background: "rgba(4,7,12,.97)",
        color: "white",
        fontFamily: "Inter, Arial, sans-serif"
      });

      document.body.appendChild(this.overlay);
    },

    open() {
      this.overlay.style.display = "block";
      this.refresh();
    },

    close() {
      this.overlay.style.display = "none";
    },

    refresh() {
      if (!this.overlay) return;

      const current = this.getCurrentNews();
      const history = this.getHistory();
      const pending = this.getPending();

      this.overlay.innerHTML = `
        <div style="
          max-width:1150px;
          margin:0 auto;
          padding:25px;
        ">

          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:15px;
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
                News & Decisions
              </h1>

              <div style="opacity:.6;">
                Stay informed. Make decisions. Manage risk.
              </div>
            </div>

            <button
              onclick="window.EmpireNewsDecisionUI.close()"
              style="
                padding:10px 16px;
                border-radius:10px;
                border:1px solid #333;
                background:#151b25;
                color:white;
                cursor:pointer;
              "
            >
              Close
            </button>
          </div>

          ${this.renderMarketSnapshot()}

          <section style="margin-top:25px;">
            <h2>Breaking News</h2>

            ${
              current.length
                ? current.map(n => this.newsCard(n)).join("")
                : `
                  <div style="
                    padding:30px;
                    border-radius:15px;
                    background:#101620;
                    opacity:.65;
                  ">
                    No major news at the moment.
                  </div>
                `
            }
          </section>

          ${
            pending.length
              ? `
                <section style="margin-top:30px;">
                  <h2>Pending Decisions</h2>

                  ${pending
                    .map(d => this.decisionCard(d))
                    .join("")}
                </section>
              `
              : ""
          }

          <section style="margin-top:30px;">
            <h2>News History</h2>

            ${
              history.length
                ? history
                    .slice(0, 20)
                    .map(n => this.historyCard(n))
                    .join("")
                : `
                  <div style="
                    padding:25px;
                    background:#101620;
                    border-radius:15px;
                    opacity:.6;
                  ">
                    No previous events recorded.
                  </div>
                `
            }
          </section>

        </div>
      `;
    },

    renderMarketSnapshot() {
      const market = window.EmpireMarketEvents;

      let data = null;

      try {
        data = market?.getSummary?.();
      } catch (e) {}

      if (!data) {
        return `
          <div style="
            margin-top:25px;
            padding:18px;
            border-radius:15px;
            background:#101620;
          ">
            <strong>Market Status</strong>
            <div style="margin-top:8px;opacity:.6;">
              Market data unavailable.
            </div>
          </div>
        `;
      }

      return `
        <div style="
          margin-top:25px;
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
          gap:10px;
        ">

          ${this.stat("Demand", this.percent(data.demandIndex))}
          ${this.stat("Inflation", this.percent(data.inflationIndex))}
          ${this.stat("Supply", this.percent(data.supplyIndex))}
          ${this.stat("Labor Cost", this.percent(data.laborCostIndex))}
          ${this.stat("Interest Rates", this.percent(data.interestRateIndex))}
          ${this.stat("Consumer Confidence", this.percent(data.consumerConfidence))}

        </div>
      `;
    },

    stat(title, value) {
      return `
        <div style="
          padding:16px;
          border-radius:13px;
          background:#101620;
          border:1px solid rgba(255,255,255,.07);
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

    newsCard(news) {
      const title =
        news.title ||
        news.headline ||
        news.name ||
        "Market Update";

      const description =
        news.description ||
        news.summary ||
        news.text ||
        "A new development has affected the business environment.";

      const severity =
        news.severity ||
        news.impact ||
        "Medium";

      return `
        <div style="
          margin-top:12px;
          padding:18px;
          border-radius:16px;
          background:#111a26;
          border:1px solid rgba(255,255,255,.08);
        ">

          <div style="
            display:flex;
            justify-content:space-between;
            gap:12px;
          ">
            <h3 style="margin:0;">
              ${this.escape(title)}
            </h3>

            <span style="
              padding:5px 8px;
              border-radius:7px;
              background:#202938;
              font-size:11px;
            ">
              ${this.escape(String(severity))}
            </span>
          </div>

          <p style="
            margin:12px 0 0;
            opacity:.72;
            line-height:1.5;
          ">
            ${this.escape(description)}
          </p>

          <button
            onclick="
              window.EmpireNewsDecisionUI.inspectNews(
                '${this.attr(news.id || title)}'
              )
            "
            style="
              margin-top:13px;
              padding:9px 13px;
              border-radius:8px;
              border:1px solid #333;
              background:#182334;
              color:white;
              cursor:pointer;
            "
          >
            View Details
          </button>

        </div>
      `;
    },

    decisionCard(decision) {
      const title =
        decision.title ||
        decision.name ||
        "Business Decision";

      const description =
        decision.description ||
        decision.text ||
        "Choose how your company should respond.";

      const options =
        decision.options ||
        decision.choices ||
        [];

      return `
        <div style="
          margin-top:12px;
          padding:20px;
          border-radius:16px;
          background:#15202d;
          border:1px solid rgba(61,141,245,.25);
        ">

          <h3 style="margin-top:0;">
            ${this.escape(title)}
          </h3>

          <p style="
            opacity:.7;
            line-height:1.5;
          ">
            ${this.escape(description)}
          </p>

          <div style="
            display:flex;
            flex-wrap:wrap;
            gap:9px;
            margin-top:15px;
          ">
            ${
              options.length
                ? options
                    .map(
                      (option, index) => `
                        <button
                          onclick="
                            window.EmpireNewsDecisionUI.makeDecision(
                              '${this.attr(decision.id)}',
                              ${index}
                            )
                          "
                          style="
                            padding:11px 14px;
                            border-radius:9px;
                            border:1px solid rgba(255,255,255,.12);
                            background:#1a2738;
                            color:white;
                            cursor:pointer;
                            font-weight:700;
                          "
                        >
                          ${this.escape(
                            option.label ||
                            option.title ||
                            option.name ||
                            `Option ${index + 1}`
                          )}
                        </button>
                      `
                    )
                    .join("")
                : `
                  <button
                    onclick="
                      window.EmpireNewsDecisionUI.resolveDecision(
                        '${this.attr(decision.id)}'
                      )
                    "
                    style="
                      padding:11px 15px;
                      border:0;
                      border-radius:9px;
                      background:#287de8;
                      color:white;
                      cursor:pointer;
                    "
                  >
                    Respond
                  </button>
                `
            }
          </div>

        </div>
      `;
    },

    historyCard(news) {
      const title =
        news.title ||
        news.headline ||
        news.name ||
        "Past Event";

      return `
        <div style="
          margin-top:8px;
          padding:13px 16px;
          border-radius:11px;
          background:#101620;
          border:1px solid rgba(255,255,255,.06);
        ">
          <strong>
            ${this.escape(title)}
          </strong>

          <div style="
            margin-top:4px;
            font-size:12px;
            opacity:.5;
          ">
            ${this.escape(
              news.date ||
              news.day ||
              "Previous event"
            )}
          </div>
        </div>
      `;
    },

    inspectNews(id) {
      const news =
        this.findById(
          this.getCurrentNews(),
          id
        ) ||
        this.findById(
          this.getHistory(),
          id
        );

      if (!news) {
        this.toast("News item not found.");
        return;
      }

      const title =
        news.title ||
        news.headline ||
        news.name ||
        "Market Update";

      const description =
        news.description ||
        news.summary ||
        news.text ||
        "No additional information available.";

      alert(
        title +
        "\n\n" +
        description
      );
    },

    makeDecision(
      decisionId,
      optionIndex
    ) {
      const decision =
        this.findById(
          this.getPending(),
          decisionId
        );

      if (!decision) {
        this.toast("Decision is no longer available.");
        return;
      }

      const option =
        (
          decision.options ||
          decision.choices ||
          []
        )[optionIndex];

      let result = null;

      /*
       * Different versions of the core can expose
       * different decision function names.
       */

      if (
        typeof News.makeDecision ===
        "function"
      ) {
        result =
          News.makeDecision(
            decisionId,
            optionIndex
          );
      } else if (
        typeof News.resolveDecision ===
        "function"
      ) {
        result =
          News.resolveDecision(
            decisionId,
            optionIndex
          );
      } else if (
        typeof News.applyDecision ===
        "function"
      ) {
        result =
          News.applyDecision(
            decisionId,
            optionIndex
          );
      }

      if (
        result === null &&
        option
      ) {
        this.toast(
          "Decision selected: " +
          (
            option.label ||
            option.title ||
            option.name ||
            "Option"
          )
        );
      } else {
        this.notifyResult(result);
      }

      Game.save();
      this.refresh();
    },

    resolveDecision(decisionId) {

      this.makeDecision(
        decisionId,
        0
      );
    },

    notifyResult(result) {

      if (!result) return;

      if (
        result.success === false
      ) {
        this.toast(
          result.reason ||
          "Decision could not be completed."
        );
        return;
      }

      this.toast(
        result.message ||
        "Decision completed."
      );
    },

    getCurrentNews() {

      const candidates = [
        "getCurrentNews",
        "getCurrent",
        "getActiveNews",
        "getNews"
      ];

      for (
        const method of candidates
      ) {
        if (
          typeof News[method] ===
          "function"
        ) {
          try {
            const result =
              News[method]();

            if (
              Array.isArray(result)
            ) {
              return result;
            }
          } catch (e) {}
        }
      }

      return Array.isArray(
        News.current
      )
        ? News.current
        : [];
    },

    getHistory() {

      if (
        typeof News.getHistory ===
        "function"
      ) {
        try {
          const result =
            News.getHistory();

          if (
            Array.isArray(result)
          ) {
            return result;
          }
        } catch (e) {}
      }

      return Array.isArray(
        News.history
      )
        ? News.history
        : [];
    },

    getPending() {

      if (
        typeof News.getPendingDecisions ===
        "function"
      ) {
        try {
          const result =
            News.getPendingDecisions();

          if (
            Array.isArray(result)
          ) {
            return result;
          }
        } catch (e) {}
      }

      if (
        typeof News.getPending ===
        "function"
      ) {
        try {
          const result =
            News.getPending();

          if (
            Array.isArray(result)
          ) {
            return result;
          }
        } catch (e) {}
      }

      return Array.isArray(
        News.pendingDecisions
      )
        ? News.pendingDecisions
        : [];
    },

    findById(list, id) {
      return (
        list || []
      ).find(
        item =>
          String(
            item.id ||
            item.newsId ||
            item.decisionId ||
            item.title ||
            item.name
          ) ===
          String(id)
      );
    },

    percent(value) {

      const n =
        Number(value);

      if (!Number.isFinite(n)) {
        return "—";
      }

      /*
       * Most market indexes are around 1.0.
       * Display them as percentages.
       */

      return Math.round(
        n * 100
      ) + "%";
    },

    money(value) {
      return "₹" +
        Number(
          value || 0
        ).toLocaleString("en-IN");
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

    toast(message) {

      const toast =
        document.createElement("div");

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
        () => toast.remove(),
        2200
      );
    }
  };

  window.EmpireNewsDecisionUI = UI;

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      () => UI.init()
    );
  } else {
    UI.init();
  }

  console.log(
    "Empire Rush: News & Decision UI loaded."
  );

})();
