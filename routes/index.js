const express = require("express"),
    router  = express.Router(),
    yelp = require('yelp-fusion'),
    client = yelp.client(process.env.YELP_API_KEY),
    placeModel = require("../models/place.js"),
    middlewares = require("../helpers/middlewares.js");

//root route
router.get("/", function(req, res){
    var searchedLocation = "";
    if (req.session.needLocation) {
        searchedLocation = req.session.searchedLocation;
        req.session.needLocation = false;
    }
    res.render("index", {searchedLocation : searchedLocation})
});

router.get("/location/:loc", function(req, res){
    client.search({
        term:'bars',
        location: req.params.loc
    }).then(response => {
        var object = [];
        var yelpIDs = response.jsonBody.businesses.map(data => data.id);
        placeModel.find({ 'yelpID': yelpIDs })
        .then(function (result) {
            var availableIDs = result.map(data => data.yelpID);
            for (var property in response.jsonBody.businesses) {
                let count = 0;
                let responseObject = response.jsonBody.businesses[property];
                if (availableIDs.indexOf(responseObject.id) > -1) {
                    count = result[availableIDs.indexOf(responseObject.id)].users_going.length;
                }
                var temp = {
                    id: responseObject.id,
                    name: responseObject.name,
                    address: responseObject.location.address1 + ", " + responseObject.location.zip_code + " " + responseObject.location.city,
                    url: responseObject.url,
                    image_url: responseObject.image_url ? responseObject.image_url : "/no-image.png",
                    count
                };
                object.push(temp);
            }
            res.json(object)    
        });
    })
    .catch(e => { res.json(e); });
});

router.get("/place/:yelpID",
    middlewares.isLogged,
    function(req, res, next){
        const yelpID = req.params.yelpID;
        const user = req.user._id.toString();
        console.log(user)
        placeModel.findOne({ 'yelpID': yelpID })
        .then(function (result) {
            if (result) {
                if (result.users_going.includes(user)){
                    var temp = result.users_going.filter(data => data != user)
                    placeModel.findOneAndUpdate({ 'yelpID': yelpID }, { 'users_going' : temp }, {new: true} )
                    .then((placeUpdated) => {
                        var length = placeUpdated.users_going.length;
                        res.json({length})
                    })
                    .catch(function (error) { return next(error)});
                } else {
                    placeModel.findOneAndUpdate({ 'yelpID': yelpID }, { $push: { users_going: user } }, {new: true} )
                    .then((placeUpdated) => {
                        var length = placeUpdated.users_going.length;
                        res.json({length})
                    })
                    .catch(function (error) { return next(error)});
                }
            } else {
                placeModel.create({ yelpID: yelpID, users_going: [user]  })
                .then((placeCreated) => {
                    res.json({length: 1})
                });
            }
        })
        // If empty, Create in db place and include user ID. If found, 2 possibilities: 1/ If user id in array, remove him 2/ If user id not in array, add him
        .catch(function (error) { return next(error)});
    }
);

module.exports = router;