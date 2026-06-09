/*
  Driver Mode app

  Versión sin HR oficial de Bangle.
  Motivo: en pruebas reales el HR oficial de Bangle sobreestimó el pulso
  respecto a referencia manual y al HR filtrado propio del proyecto.

  Esta app SOLO:
  - activa/desactiva Driver Mode
  - activa/desactiva el stream BLE del firmware
  - asegura que el HRM oficial "driverproject" queda apagado
*/

var DRIVER_HRM_APP_ID = "driverproject";

function isBtConnected() {
  try {
    var s = NRF.getSecurityStatus();
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

function stopDriverOfficialHRM() {
  /*
    Limpieza defensiva:
    por si una versión anterior dejó el HRM oficial encendido.
    No usamos HR oficial de Bangle en el modelo final.
  */
  try {
    Bangle.setHRMPower(0, DRIVER_HRM_APP_ID);
  } catch (e) {}

  try {
    Bluetooth.println("DHRDISABLED");
  } catch (e2) {}
}

function showDriverMenu() {
  var driverAvailable = isDriverAvailable();
  var streamAvailable = isStreamAvailable();

  var driverOn = driverAvailable && Bangle.isDriverMode();
  var streamOn = streamAvailable && Bangle.isDriverBLEStreamOn();

  var driverState = driverOn ? "ON" : "OFF";
  var streamState = (driverOn && streamOn) ? "ON" : "OFF";

  var btState =
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

      stopDriverOfficialHRM();
      Bangle.setDriverMode(true);
      E.showAlert("Driver ON").then(showDriverMenu);
    },

    "Driver OFF": function () {
      if (!driverAvailable) {
        E.showAlert("Firmware no compatible").then(showDriverMenu);
        return;
      }

      stopDriverOfficialHRM();

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

      /*
        Importante:
        NO activamos Bangle.setHRMPower().
        El HR usado por el proyecto será el calculado por nuestro pipeline propio.
      */
      stopDriverOfficialHRM();

      var ok = Bangle.setDriverBLEStream(true);

      E.showAlert(ok ? "Stream ON" : "No se pudo activar").then(showDriverMenu);
    },

    "Stream OFF": function () {
      if (!streamAvailable) {
        E.showAlert("Firmware no compatible").then(showDriverMenu);
        return;
      }

      stopDriverOfficialHRM();

      try {
        Bangle.setDriverBLEStream(false);
      } catch (e) {}

      E.showAlert("Stream OFF").then(showDriverMenu);
    },

    "Refrescar": function () {
      showDriverMenu();
    },

    "< Back": function () {
      stopDriverOfficialHRM();
      load();
    }
  });
}

stopDriverOfficialHRM();
showDriverMenu();