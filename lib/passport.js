const mongoose = require('mongoose');
const passport = require('passport');

const Account = mongoose.model('Account');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    usernameField: 'email',
    session: false
}, async (username, password, done) => {
    console.log(`${username} - ${password}`);

    try {
        const account = await Account.findOne({ email: username });
        if (!account) { return done(null, false); }
        if (!account.validPassword(password)) { return done(null, false); }
        return done(null, account);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});