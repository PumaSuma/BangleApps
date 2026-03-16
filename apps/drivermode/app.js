E.showMenu({
  "": { "title": "Driver Mode" },

  "Modo ON": function() {
    Bangle.setDriverMode(true);
    E.showAlert("Driver ON").then(() => load());
  },

  "Modo OFF": function() {
    Bangle.setDriverMode(false);
    E.showAlert("Driver OFF").then(() => load());
  },

  "Estado": function() {
    E.showAlert(Bangle.isDriverMode() ? "ON" : "OFF").then(() => load());
  },

  "< Back": function() {
    load();
  }
});
