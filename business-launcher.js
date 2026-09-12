(function () {
  "use strict";

  function createButton() {
    if (document.getElementById("business-launcher-bridge")) {
      return;
    }

    const style = document.createElement("style");

    style.textContent = `
      #business-launcher-bridge {
        position: fixed;
        right: 16px;
        bottom: 18px;
        z-index: 999999;
        display: block;
        border: 0;
        border-radius: 16px;
        padding: 14px 18px;
        background: #8bc34a;
        color: #111;
        font-family: Arial, sans-serif;
        font-size: 13px;
        font-weight: 900;
        box-shadow: 0 10px 30px rgba(0,0,0,.4);
        cursor: pointer;
      }

      #business-launcher-bridge:active {
        transform: scale(.96);
      }
    `;

    document.head.appendChild(style);

    const button = document.createElement("button");

    button.id = "business-launcher-bridge";
    button.textContent = "🏢 BUSINESS";

    button.onclick = function () {

      if (
        window.EmpireBusinessEngine &&
        typeof window.EmpireBusinessEngine.open === "function"
      ) {
        window.EmpireBusinessEngine.open();
        return;
      }

      alert(
        "Business Engine load nahi hua. Page refresh karke dobara try karo."
      );
    };

    document.body.appendChild(button);
  }

  function start() {
    createButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

})();
