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

  const driverOn = driverAvailable && Bangle.isDriverMode();
  const streamOn = streamAvailable && Bangle.isDriverBLEStreamOn();

  const driverState = driverOn ? "ON" : "OFF";
  const streamState = (driverOn && streamOn) ? "ON" : "OFF";
  //Trigesimocuarto Edit Puma
  const btState =
  (typeof Bangle.isDriverBLEConnected === "function")
    ? (Bangle.isDriverBLEConnected() ? "SI" : "NO")
    : (isBtConnected() ? "SI" : "NO");

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
   if (!driverAvailable || !Bangle.isDriverMode()) {
    E.showAlert("Activa Driver primero").then(showDriverMenu);
      return;
   }
   const ok = Bangle.setDriverBLEStream(true);
   E.showAlert(ok ? "Stream ON" : "No se pudo activar").then(showDriverMenu);
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
