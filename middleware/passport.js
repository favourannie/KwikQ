const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const organizationModel = require('../models/organizationModel');

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:1234/api/v1/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let org = await organizationModel.findOne({ email: profile.emails[0].value });

      if (!org) {
        org = new organizationModel({
          email: profile._json.email,
          fullName: profile._json.name,
          isVerified: profile._json.email_verified,
          password: ' ',
          profilePicture: { imageUrl: profile._json.picture },
          age: 18,
          phoneNumber: '245252',
          isGoogle: true,
        });
        await org.save();
      }

      return done(null, org);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((org, done) => done(null, org.id));
passport.deserializeUser(async (id, done) => {
  try {
    const org = await organizationModel.findById(id);
    done(null, org);
  } catch (err) {
    done(err, null);
  }
});

const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });
const googleCallback = passport.authenticate('google', { failureRedirect: '/login' });

module.exports = { googleAuth, googleCallback };
