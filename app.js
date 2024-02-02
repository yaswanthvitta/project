const express = require('express');
const app = express();
app.set("view engine", "ejs");
const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
const { AllCourses, Pages, User } = require("./models");
var csrf = require("tiny-csrf");
var cookieParser = require("cookie-parser");
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.use(express.urlencoded({ extended: false }));





const passport = require("passport");
const connectEnsure = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const { doesNotMatch } = require("assert");
const { error } = require("console");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// const flash = require("connect-flash");

app.use(
  session({
    secret: "my-super-secret-key-7075625299",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// app.use(flash());
// app.use(function (request, response, next) {
//   response.locals.messages = request.flash();
//   next();
// });

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  ),
);

passport.serializeUser((user, done) => {
  console.log("Serializeing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.use(passport.initialize());
app.use(passport.session());



app.get('/', function (request, response) {
    response.render("index", {
        csrfToken: request.csrfToken(),
      });
  })


app.get('/home', function (request, response) {
    response.render("home")
  })

app.get("/createcourse",  (request,response)=>{
    response.render("course");
})

app.post("/course",async (request,response)=>{
    const cname=request.body.coursename;
    const chapters = await AllCourses.getchapters(cname);
    
    try{
    response.render("createchapter",{coursename:cname,chapters:chapters}) 
    }
    catch(error){
        console.log(error)
    }
})



app.post("/chapter",  (request,response)=>{
    const cname=request.body.coursename;
    response.render("chapter",{coursename:cname});
})

app.post("/chapters", async (request,response)=>{
    const cname=request.body.coursename;
    const chname=request.body.chaptername;
    const des = request.body.description;
    const pagelist = await Pages.getpages(cname,chname);
    try{
        const course = await AllCourses.create({
            coursename:cname,
            author:"pp",
            chapter:chname,
            chapterdescription:des
        })
        console.log(course)
    }
    catch(error){
        console.log(error)
    }
    
    console.log(pagelist)
    response.render("createpage",{coursename:cname,chaptername:chname,pagelist:pagelist})
})

app.post("/chapters1", async (request,response)=>{
    const cname=request.body.coursename;
    const chname=request.body.chaptername;
    
    const pagelist =await Pages.getpages(cname,chname);
    response.render("createpage",{coursename:cname,chaptername:chname,pagelist:pagelist})
})

app.post("/page", async (request,response)=>{
    const cname=request.body.coursename;
    const chname=request.body.chaptername;
    const chapters = await AllCourses.getchapters(cname);
    response.render("page",{coursename:cname,chapters,chaptername:chname});
})

app.post("/show", async(request,response)=>{
    
    try{
        const page = await Pages.create({
            pagename: request.body.pagetitle,
            page: request.body.content,
            coursename: request.body.coursename,
            chaptername: request.body.chapters
        })
        console.log(page)
    }
    catch(error){
        console.log(error)
    }

    response.render("newpage",{pagename:request.body.pagetitle,page: request.body.content,coursename: request.body.coursename,chaptername: request.body.chapters})
})

app.get("/signup",async(request,response)=>{
    response.render("signup",{title:"Signup",csrfToken: request.csrfToken()})
})

app.get("/signin",async(request,response)=>{
    response.render("signin",{title:"Signin",csrfToken: request.csrfToken()})
})

app.post("/users",async(request,response)=>{
    const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
     try{
        const user = await User.create({
            firstName:request.body.firstName,
            lastName:request.body.lastName,
            role:request.body.role,
            email:request.body.email,
            password:hashedPwd
        })
        console.log(user)
        request.login(user, (err) => {
            if (err) {
              console.log(err);
            }
            response.redirect("/home");
          });
     }
     catch(error){
        console.log(error)
     }
})

app.post(
    "/session",
    passport.authenticate("local", {
      failureRedirect: "/signin",
    }),
    (request, response) => {
      console.log(request.user);
      response.redirect("/home");
    },
  );

  app.get("/signout", (request, response, next) => {
    request.logout((error) => {
      if (error) {
        return next(error);
      }
      response.redirect("/");
    });
  });

module.exports=app;