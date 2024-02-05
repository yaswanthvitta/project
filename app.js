const express = require('express');
const app = express();
app.set("view engine", "ejs");
const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
const { AllCourses, Pages, Members,Enroll,Mark } = require("./models");
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
      Members.findOne({ where: { email: username } })
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
  Members.findByPk(id)
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


app.get('/home', connectEnsure.ensureLoggedIn() ,async(request, response)=> {
    const courses =await AllCourses.getcourses();
    const number =await Enroll.getnumber();
    console.log(request.user.role)
    console.log(number)
    const map={}
    for(let i=0;i<number.length;i++){
      map[number[i].dataValues.coursename+number[i].dataValues.author]=number[i].dataValues.studentcount
    }
    console.log(map)
    const enrolled=await Enroll.getenrolled(request.user.id);
    response.render("home",{courses:courses,number:map,enrolled:enrolled,user:request.user.firstName,role:request.user.role,csrfToken: request.csrfToken()})
  })

app.get("/createcourse",connectEnsure.ensureLoggedIn() ,  (request,response)=>{
    response.render("course",{csrfToken: request.csrfToken()});
})

app.post("/course", connectEnsure.ensureLoggedIn() ,async (request,response)=>{
    const cname=request.body.coursename;
    const chapters = await AllCourses.getchapters(cname,request.user.firstName);
    
    try{
    response.render("createchapter",{coursename:cname,chapters:chapters,csrfToken: request.csrfToken()}) 
    }
    catch(error){
        console.log(error)
    }
})



app.post("/chapter",connectEnsure.ensureLoggedIn() ,  (request,response)=>{
    const cname=request.body.coursename;
    response.render("chapter",{coursename:cname,csrfToken: request.csrfToken()});
})

app.post("/chapters",connectEnsure.ensureLoggedIn() , async (request,response)=>{
    const cname=request.body.coursename;
    const chname=request.body.chaptername;
    const des = request.body.description;
    const pagelist = await Pages.getpages(cname,chname);
    try{
        const course = await AllCourses.create({
            coursename:cname,
            author:request.user.firstName,
            chapter:chname,
            chapterdescription:des
        })
        console.log(course)
    }
    catch(error){
        console.log(error)
    }
    
    console.log(pagelist)
    response.render("createpage",{coursename:cname,chaptername:chname,pagelist:pagelist,csrfToken: request.csrfToken()})
})

app.post("/chapters1",connectEnsure.ensureLoggedIn() , async (request,response)=>{
    const cname=request.body.coursename;
    const chname=request.body.chaptername;
    const pagelist =await Pages.getpages(cname,chname);
    console.log(pagelist)
    response.render("createpage",{coursename:cname,chaptername:chname,pagelist:pagelist,csrfToken: request.csrfToken()})
})

app.post("/page",connectEnsure.ensureLoggedIn() , async (request,response)=>{
    const cname=request.body.coursename;
    const chname=request.body.chaptername;
    const chapters = await AllCourses.getchapters(cname,request.user.firstName);
    response.render("page",{coursename:cname,chapters,chaptername:chname,csrfToken: request.csrfToken()});
})

app.post("/show",connectEnsure.ensureLoggedIn() , async(request,response)=>{
    
    try{
        const page = await Pages.create({
            pagename: request.body.pagetitle,
            content: request.body.content,
            coursename: request.body.coursename,
            chaptername: request.body.chapters
        })
        console.log(page)
    }
    catch(error){
        console.log(error)
    }

    response.render("newpage",{pagename:request.body.pagetitle,page: request.body.content,coursename: request.body.coursename,chaptername: request.body.chapters,csrfToken: request.csrfToken()})
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
        const user = await Members.create({
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

  app.post("/enroll",connectEnsure.ensureLoggedIn() , async(request,response)=>{
    const enrollstatus = await Enroll.getenrollstatus(request.user.id,request.body.coursename,request.body.author)
    console.log(enrollstatus.length)
    if(enrollstatus.length !=0){
      return response.status(422).json(error);
    }
    else{
    
    try{
      const enroll = await Enroll.create({
          userid:request.user.id,
          coursename:request.body.coursename,
          enroll:"enrolled",
          author:request.body.author
      })
      console.log(enroll)
      return response.json(1);
    }
    catch(error){
        console.log(error)
        response.redirect("/home",{csrfToken: request.csrfToken()})
    }
  }
  })

  app.post("/viewdetails",connectEnsure.ensureLoggedIn() , async(request,response)=>{
    const chapters = await AllCourses.getchapters(request.body.coursename,request.body.author);
    const enrollstatus = await Enroll.getenrollstatus(request.user.id,request.body.coursename,request.body.author)
    const number =await Enroll.getnumber();
    const map={}
    for(let i=0;i<number.length;i++){
      map[number[i].dataValues.coursename+request.body.author]=number[i].dataValues.studentcount
    }
    response.render("viewdetails",{chapters:chapters,coursename:request.body.coursename,number:number,author:request.body.author,enrollstatus:enrollstatus,csrfToken: request.csrfToken()})

  })

  app.post("/enrolling",connectEnsure.ensureLoggedIn() , async(request,response)=>{
    const chapters = await AllCourses.getchapters(request.body.coursename,request.body.author);
    const enroll = await Enroll.create({
      userid:request.user.id,
      coursename:request.body.coursename,
      enroll:"enrolled",
      author:request.body.author
  })
  console.log(enroll)
    const enrollstatus = await Enroll.getenrollstatus(request.user.id,request.body.coursename,request.body.author)
    const number =await Enroll.getnumber();
    const map={}
    for(let i=0;i<number.length;i++){
      map[number[i].dataValues.coursename]=number[i].dataValues.studentcount
    }
    response.render("viewdetails",{chapters:chapters,coursename:request.body.coursename,author:request.body.author,enrollstatus:enrollstatus,number:number,csrfToken: request.csrfToken()})

  })

  app.post("/pageslist",connectEnsure.ensureLoggedIn() ,async(request,response)=>{
    const pagelist =await Pages.getpages(request.body.coursename,request.body.chapter);
    const des = await AllCourses.getdes(request.body.coursename,request.body.chapter);
    response.render("readpage",{coursename:request.body.coursename,author:request.body.author,chapter:request.body.chapter,pagelist:pagelist,des:des.chapterdescription,csrfToken: request.csrfToken()})

  })

  app.post("/pageview",connectEnsure.ensureLoggedIn() ,async(request,response)=>{
    const page = await Pages.getpage(request.body.page,request.body.coursename,request.body.chapter)
    const status = await Mark.getstatus(request.user.id,request.body.coursename,request.body.chapter,request.body.author,request.body.page)
    const pagelist =await Pages.getpages(request.body.coursename,request.body.chapter);
    for(let i=0;i<pagelist.length;i++){
      if(pagelist[i].pagename==request.body.page){
        if(i<pagelist.length-1){
        console.log(pagelist[i+1].pagename)
        response.render("pageview",{coursename:request.body.coursename,author:request.body.author,status:status,chapter:request.body.chapter,page:page,nextpage:pagelist[i+1].pagename,csrfToken: request.csrfToken()})
        break;
      }
      else{
        response.render("lastpage",{coursename:request.body.coursename,author:request.body.author,status:status,chapter:request.body.chapter,page:page,csrfToken: request.csrfToken()})
      }
    }
    }
    console.log(page)
    
  })

  app.get("/changepasswordpage",connectEnsure.ensureLoggedIn() ,async(request,response)=>{
    response.render("changepassword",{csrfToken: request.csrfToken()})
  })

  app.post("/changepassword",connectEnsure.ensureLoggedIn() ,async(request,response)=>{
    const check = await bcrypt.compare(request.body.currentpassword,request.user.password);
    if(check){
      if(request.body.newpassword==request.body.comfirmpassword){
       const hashed=await bcrypt.hash(request.body.newpassword,saltRounds);
       await Members.update({password:hashed},{where:{id:request.user.id}})
    const courses =await AllCourses.getcourses();
    const number =await Enroll.getnumber();
    console.log(request.user.role)
    const map={}
    for(let i=0;i<number.length;i++){
      map[number[i].dataValues.coursename+number[i].dataValues.author]=number[i].dataValues.studentcount
    }
    console.log(map)
    const enrolled=await Enroll.getenrolled(request.user.id);
    response.render("home",{courses:courses,number:map,enrolled:enrolled,user:request.user.firstName,role:request.user.role,csrfToken: request.csrfToken()})
      }
    }
  })

app.post("/mark",connectEnsure.ensureLoggedIn() ,async(request,response)=>{
  try{
    const markas = await Mark.create({
      userid:request.user.id,
      coursename:request.body.coursename,
      chapter:request.body.chapter,
      author:request.body.author,
      pagename:request.body.page
    })

    const page = await Pages.getpage(request.body.page,request.body.coursename,request.body.chapter)
    const status = await Mark.getstatus(request.user.id,request.body.coursename,request.body.chapter,request.body.author,request.body.page)
    console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP")
    console.log(status.length)
    
    const pagelist =await Pages.getpages(request.body.coursename,request.body.chapter);
    console.log(pagelist)
    for(let i=0;i<pagelist.length;i++){
      if(pagelist[i].pagename==request.body.page){
        if(i<pagelist.length-1){
        console.log(pagelist[i+1].pagename)
        console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP")
        response.render("pageview",{coursename:request.body.coursename,author:request.body.author,status:status,chapter:request.body.chapter,page:page,nextpage:pagelist[i+1].pagename,csrfToken: request.csrfToken()})
        break;
      }
      else{
        response.render("lastpage",{coursename:request.body.coursename,author:request.body.author,status:status,chapter:request.body.chapter,page:page,csrfToken: request.csrfToken()})
      }
    }
    }
    console.log(page)
    
  }
  catch(error){
    console.log(error)
  }
})

module.exports=app;