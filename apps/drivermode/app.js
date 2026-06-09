var DRIVER_HRM_APP_ID = "driverproject";
var DRIVER_HRM_INTERVAL = null;
var DRIVER_LAST_HRM = {
  bpm: 0,
  confidence: 0,
  ts: 0
};

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

function sendDriverHRLine() {
  try {
    var now = Date.now();
    var age = DRIVER_LAST_HRM.ts ? (now - DRIVER_LAST_HRM.ts) : 999999;

    // Formato estable para Raspberry:
    // DHR,bpm,confidence,age_ms,watch_ts_ms
    Bluetooth.println(
      "DHR," +
      Math.round(DRIVER_LAST_HRM.bpm || 0) + "," +
      Math.round(DRIVER_LAST_HRM.confidence || 0) + "," +
      Math.round(age || 0) + "," +
      Math.round(DRIVER_LAST_HRM.ts || 0)
    );
  } catch (e) {
    try {
      Bluetooth.println("DHRERR," + e);
    } catch (e2) {}
  }
}

function onDriverHRM(hrm) {
  try {
    DRIVER_LAST_HRM = {
      bpm: hrm.bpm || 0,
      confidence: hrm.confidence || 0,
      ts: Date.now()
    };
  } catch (e) {}
}

function startDriverOfficialHRM() {
  try {
    stopDriverOfficialHRM(false);

    DRIVER_LAST_HRM = {
      bpm: 0,
      confidence: 0,
      ts: 0
    };

    Bangle.on("HRM", onDriverHRM);

    try {
      Bangle.setOptions({
        hrmSportMode: true
      });
    } catch (e) {}

    Bangle.setHRMPower(1, DRIVER_HRM_APP_ID);

    DRIVER_HRM_INTERVAL = setInterval(sendDriverHRLine, 1000);

    Bluetooth.println("DHRSTART");
    return true;
  } catch (e) {
    try {
      Bluetooth.println("DHRERR," + e);
    } catch (e2) {}
    return false;
  }
}

function stopDriverOfficialHRM(sendLine) {
  try {
    if (DRIVER_HRM_INTERVAL) {
      clearInterval(DRIVER_HRM_INTERVAL);
      DRIVER_HRM_INTERVAL = null;
    }

    Bangle.removeListener("HRM", onDriverHRM);

    try {
      Bangle.setHRMPower(0, DRIVER_HRM_APP_ID);
    } catch (e) {}

    if (sendLine) {
      try {
        Bluetooth.println("DHRSTOP");
      } catch (e2) {}
    }
  } catch (e) {}
}

function showDriverMenu() {
  const driverAvailable = isDriverAvailable();
  const streamAvailable = isStreamAvailable();

  const driverOn = driverAvailable && Bangle.isDriverMode();
  const streamOn = streamAvailable && Bangle.isDriverBLEStreamOn();

  const driverState = driverOn ? "ON" : "OFF";
  const streamState = (driverOn && streamOn) ? "ON" : "OFF";

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

      stopDriverOfficialHRM(true);

      if (streamAvailable) {
        try {
          Bangle.setDriverBLEStream(false);
        } catch (e) {}
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

      if (ok) {
        startDriverOfficialHRM();
      }

      E.showAlert(ok ? "Stream ON + HR" : "No se pudo activar").then(showDriverMenu);
    },

    "Stream OFF": function () {
      if (!streamAvailable) {
        E.showAlert("Firmware no compatible").then(showDriverMenu);
        return;
      }

      stopDriverOfficialHRM(true);
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