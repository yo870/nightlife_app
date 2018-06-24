const express = require("express"),
    router  = express.Router(),
    passport = require('passport');

// auth logout
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// auth with Twitter
router.get('/twitter',
    function(req, res, next) {
        req.session.searchedLocation = req.query.searchedLocation;
        req.session.needLocation = true;
        next()
    },
    passport.authenticate('twitter')
);

// callback route for twitter
router.get('/twitter/callback', function(req, res, next) {
    passport.authenticate('twitter', function(err, user, info) {
        if (err) { return next(err); }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          req.flash("success","Login successful");
          return res.redirect('/');
        });
    })(req, res, next);
});

module.exports = router;