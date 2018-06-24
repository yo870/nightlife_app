var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    twitter_displayName: { type: String, required: true },
    twitter_username: { type: String, required: true },
    twitterID: { type: String, required: true },
    dateCreated : { type: Date, default: Date.now },
    places: [{ type: Schema.Types.ObjectId, ref: process.env.mongo_placedb}]
});


module.exports = mongoose.model(process.env.mongo_userdb, UserSchema);