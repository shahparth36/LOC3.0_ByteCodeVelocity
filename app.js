require('dotenv/config');
const express = require('express');
const app = express();
const passport = require('passport');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const Student = require('./models/Student');
const Teacher = require('./models/Teacher');

mongoose.connect('mongodb://localhost/loc', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({extended:false}));
app.use(require("express-session")({
    secret: "This is in testing",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    Student.findOne({ email: email }, (err, user) => {
        if (!err && user) {
            bcrypt.compare(password, user.password).then(function (passwordMatch) {
                if (!passwordMatch) {
                    return done(null, false);
                }
                passport.serializeUser(function (user, done) {
                    done(null, user._id);
                });
                passport.deserializeUser(function (id, done) {
                    Student.findById(id, function (err, user) {
                        return done(err, user);
                    });
                });
                return done(null, user);
            });
        }
    });

    Teacher.findOne({ email: email }, (err,user) => {
        if (!err && user) {
            bcrypt.compare(password, user.password).then(function (passwordMatch) {
                if (!passwordMatch) {
                    return done(null, false);
                }
                passport.serializeUser(function (user, done) {
                    done(null, user._id);
                });
                passport.deserializeUser(function (id, done) {
                    Teacher.findById(id, function (err, user) {
                        return done(err, user);
                    });
                });
                return done(null, user);
            });
        }
    });
}));

const authRoutes = require('./routes/auth');

app.use(authRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on PORT ${process.env.PORT}`);
});