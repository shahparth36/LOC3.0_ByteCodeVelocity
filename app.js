require('dotenv/config');
const express = require('express');
const app = express();
const passport = require('passport');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

 
const server = require("http").Server(app)
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
	debug: true,
})

const Student = require('./models/Student');
const Teacher = require('./models/Teacher'); 

const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');

mongoose.connect('mongodb://localhost/LOC1', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

app.use('/peerjs', peerServer);
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

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	next();
});

app.use(authRoutes);
app.use(teacherRoutes);
app.use(studentRoutes);

app.get("/", (req,res)=>{
    res.redirect("/login");
})

app.get('/:room', (req, res) => {
    res.render('meet', { roomId: req.params.room })
});

io.on("connection",(socket)=>{
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId)
      socket.to(roomId).emit('user-connected', userId)
      
      socket.on("message",(message)=>{
        io.in(roomId).emit("createMessage",{userId,message})
      })
      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId)
      })
    })
})

server.listen(process.env.PORT, () => {
    console.log(`Server is listening on PORT ${process.env.PORT}`);
});