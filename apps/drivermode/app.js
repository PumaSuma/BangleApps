function isBtConnected() {
  try {
    const s = NRF.getSecurityStatus();
    return !!(s && s.connected);
  } catch (e) {
    return false;
  }
}

function isDriverAvailable() {
  return typeof Bangle.setDriverMode === "function" &&
         typeof Bangle.isDriverMode === "function";
}

function isStreamAvailable() {
  return typeof Bangle.setDriverBLEStream === "function" &&
         typeof Bangle.isDriverBLEStreamOn === "function";
}

function showDriverMenu() {
  const driverAvailable = isDriverAvailable();
  const streamAvailable = isStreamAvailable();

  const driverState = driverAvailable && Bangle.isDriverMode() ? "ON" : "OFF";
  const streamState = streamAvailable && Bangle.isDriverBLEStreamOn() ? "ON" : "OFF";
  const btState = isBtConnected() ? "SI" : "NO";

  E.showMenu({
    "": { title: "Driver Mode" },

    "Driver actual": { value: driverState },
    "BLE conectado": { value: btState },
    "BLE stream": { value: streamState },

    "Driver ON": function () {
      if (!driverAvailable) {
        E.showAlert("Firmware no compatible").then(showDriverMenu);
        return;
      }
      Bangle.setDriverMode(true);
      E.showAlert("Driver ON").then(showDriverMenu);
    },

    "Driver OFF": function () {
      if (!driverAvailable) {
        E.showAlert("Firmware no compatible").then(showDriverMenu);
        return;
      }
      Bangle.setDriverMode(false);
      E.showAlert("Driver OFF").then(showDriverMenu);
    },

    "Stream ON": function () {
      if (!streamAvailable) {
        E.showAlert("Firmware no compatible").then(showDriverMenu);
        return;
      }
      Bangle.setDriverBLEStream(true);
      E.showAlert("Stream ON").then(showDriverMenu);
    },

    "Stream OFF": function () {
      if (!streamAvailable) {
        E.showAlert("Firmware no compatible").then(showDriverMenu);
        return;
      }
      Bangle.setDriverBLEStream(false);
      E.showAlert("Stream OFF").then(showDriverMenu);
    },

    "Refrescar": function () {
      showDriverMenu();
    },

    "< Back": function () {
      load();
    }
  });
}

showDriverMenu();
