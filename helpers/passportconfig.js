var passport = require('passport'), 
    TwitterStrategy = require('passport-twitter').Strategy,
    User = require("../models/user.js");

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  }); 
});


passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK
  },
  function(token, tokenSecret, profile, done) {
    User.findOne({twitterID: profile.id}).then((currentUser) => {
            if(currentUser){
                // already have this user
                done(null, currentUser);
            } else {
                // if not, create user in our db
                new User({
                    twitterID: profile.id,
                    twitter_displayName: profile.displayName,
                    twitter_username: profile.username
                }).save()
                .then(newUser => done(null, newUser))
                .catch(err => done(err));
            }
    });
  }
));