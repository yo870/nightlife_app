var userModel = require("../models/user.js"),
placeModel = require("../models/place.js"),
flash = require("connect-flash");

exports.isLogged = function (req, res, next) { // Ensures the user is logged
  if (req.isAuthenticated()) {
    next();
  } else {
    var searchedLocation = "";
    req.flash("warning", "You must be logged in to perform this action");
    res.status(403).render("index", {searchedLocation : searchedLocation, error : req.flash('warning')})
  }
};

module.exports = exports;