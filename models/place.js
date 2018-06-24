var mongoose = require("mongoose");

var placeSchema = new mongoose.Schema({
    yelpID: { type: String, required: true },
    users_going : [],
});

module.exports = mongoose.model(process.env.mongo_placedb, placeSchema);