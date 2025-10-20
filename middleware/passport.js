const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const userModel = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/v1/auth/google/callback'
},
    async (accessToken, refreshToken, profile, cb) => {
        console.log("Profile: ", profile)
        try {
            let user = await userModel.findOne({ email: profile.emails[0].value });
            if (!user) {
                user = new userModel({
                    email: profile._json.email,
                    name: profile._json.name,
                    isVerified: profile._json.email_verified,
                    password: ' ',
                    phoneNumber: '245252',
                    isGoogle: true
                });

                await user.save();

            }
            return cb(null, user);
        } catch (error) {
            return cb(error, null)
        }
    }
));


passport.serializeUser((user, cb) => {
    console.log('User Serialized:', user);
    cb(null, user.id)
})

passport.deserializeUser(async (id, cb) => {
    try {
        const user = await userModel.findById(id);
        if (user === null) {
            return cb(new Error('User not found'), null)
        }
        cb(null, user)
    } catch (error) {
        cb(error, null)
    }
});

// module.exports = passport;

const profile = passport.authenticate('google', { scope: ['profile', 'email', ] })

// module.exports = profile

const loginProfile =  passport.authenticate('google', { failureRedirect: '/login' });
module.exports= {loginProfile, profile, passport}