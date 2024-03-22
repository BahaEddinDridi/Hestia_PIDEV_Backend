const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../Models/user');
const {compare} = require("bcrypt");
const bcrypt = require("bcrypt");
const GitHubStrategy = require('passport-github').Strategy;


passport.use(new LocalStrategy({
    usernameField: 'email',
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
}, async (jwtPayload, done) => {
    try {
        const user = await User.findById(jwtPayload.sub);

        if (!user) {
            return done(null, false);
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('GitHub authentication initiated');
        console.log('GitHub profile:', profile);

        let user = await User.findOne({ username: profile.username });

        if (!user) {
            console.log('User not found in the database. Creating a new user.');
            const displayName = profile.displayName || '';
            const names = displayName.split(' ');
            const firstName = names[0];
            const lastName = names.length > 1 ? names.slice(1).join(' ') : '';

            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';
            const image = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '';
            const location = profile._json.location || '';

            user = new User({
                username: profile.username,
                firstName: firstName,
                lastName: lastName,
                email: email,
                location: location,
                image: image,
                password: hashedPassword,
                role: 'jobSeeker',
            });

            await user.save();
            console.log('New user created:', user);
        } else {
            console.log('User found in the database:', user);
        }

        return done(null, user);
    } catch (error) {
        console.error('Error in GitHub authentication strategy:', error);
        return done(error);
    }
}));



passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/linkedin/callback",
    scope: ['r_liteprofile', 'r_emailaddress', 'openid'],
}, (token, tokenSecret, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport;

