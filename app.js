var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const Message = require("./models/message")

require('dotenv').config()
const connectionString = process.env.CONNECTION_STRING;
const memberPasscode = process.env.MEMBER_PASSCODE;

var indexRouter = require('./routes/index');
const boardRouter = require('./routes/board');

const mongoose = require('mongoose');
const user = require('./models/user');
mongoose.set("strictQuery", false);

main().catch((err) => console.log(err));
async function main(){
  await mongoose.connect(connectionString);
}

const app = express();
app.set("views", __dirname + '/views');
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(session({ secret: "dogs", resave: false, saveUninitialized: true}));
app.use(passport.session());
app.use(express.urlencoded({extended: false}));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      };
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" })
      }        
      return done(null, user);
    } catch(err) {
      return done(err);
    };
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
  try{
    const user = await User.findById(id);
    done(null, user);
  }catch(err){
    done(err);
  };
});

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/log-in'); 
}
app.use('/', indexRouter);
app.get('/sign-up', (req, res) => res.render("sign-up-form"));
app.post('/sign-up', async (req, res, next) =>{
  bcrypt.hash(req.body.password, 10, async(err, hashedPassword) =>{
    try{
      const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        password: hashedPassword
      });
      const result = await user.save();
      res.redirect('/log-in');
    } catch(err){
      return next(err);
    }
  })
});

app.get('/log-in' , (req, res) => res.render("log-in-form"));
app.post('/log-in', passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/"
}))

app.get('/new-message', isAuthenticated, (req, res) => res.render("new-message-form", { user: req.user }));
app.post('/new-message', isAuthenticated, async (req, res, next) => {
  const user = req.user;
  try{
    const message = new Message({
      author: user.id,
      title: req.body.title,
      message_context: req.body.text,
      created_at: Date.now(),
    })

    const result = await message.save();
    res.redirect('/');
  }catch(err){
    return next(err);
  }
});

app.get("/become-member", isAuthenticated, (req, res) => res.render("become-member-form", { user: req.user }));
app.post("/become-member", isAuthenticated, async (req, res, next) => {

  try{
    if(memberPasscode === req.body.passcode){
      const result = await User.findByIdAndUpdate(req.user.id, { $set: { membership_status: true }}).exec();
      res.redirect("/");
    }
    res.redirect("/become-member");
  }catch(err){
    return next(err);
  }
})

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
