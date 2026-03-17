function showDriverMenu() {
  const isAvailable =
    typeof Bangle.setDriverMode === "function" &&
    typeof Bangle.isDriverMode === "function";

  const currentState = isAvailable && Bangle.isDriverMode() ? "ON" : "OFF";

  const menu = {
    "": { title: "Driver Mode" },

    "Estado actual": {
      value: currentState
    },

    "Modo ON": function () {
      if (!isAvailable) {
        E.showAlert("Firmware no compatible").then(showDriverMenu);
        return;
      }
      Bangle.setDriverMode(true);
      E.showAlert("Driver ON").then(showDriverMenu);
    },

    "Modo OFF": function () {
      if (!isAvailable) {
        E.showAlert("Firmware no compatible").then(showDriverMenu);
        return;
      }
      Bangle.setDriverMode(false);
      E.showAlert("Driver OFF").then(showDriverMenu);
      return;
    },

    "< Back": function () {
      load();
    }
  };

  E.showMenu(menu);
}

showDriverMenu();
