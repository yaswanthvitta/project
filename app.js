const express = require('express');
const app = express();
app.set("view engine", "ejs");
const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
const { AllCourses, Pages } = require("./models");

app.get('/', function (request, response) {
    response.render("index")
  })

app.get("/createcourse",  (request,response)=>{
    response.render("course");
})

app.post("/course",async (request,response)=>{
    const cname=request.body.coursename;
    try{
    response.render("createchapter",{coursename:cname}) 
    }
    catch(error){
        console.log(error)
    }
})

app.get("/createchapter",  (request,response)=>{
    const cname=request.body.coursename;
    response.render("chapter",{coursename:cname});
})

app.post("/chapter",  (request,response)=>{
    const cname=request.body.coursename;
    response.render("chapter",{coursename:cname});
})

app.post("/chapters", async (request,response)=>{
    const cname=request.body.coursename;
    const chname=request.body.chaptername;
    const des = request.body.description;

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

    response.render("createpage",{coursename:cname,chaptername:chname})
})

app.post("/page", async (request,response)=>{
    const cname=request.body.coursename;
    const chapters = await AllCourses.getchapters(cname);
    response.render("page",{coursename:cname,chapters});
})

app.post("/show", async(request,response)=>{
    try{
        const page = await Pages.create({
            pagename: request.body.pagetitle,
            page: request.body.content,
            coursename: request.body.coursename,
            chapter: request.body.chapters
        })
        console.log(page)
    }
    catch(error){
        console.log(error)
    }

    response.render("newpage",{pagenamename:request.body.pagetitle,page: request.body.content,coursename: request.body.coursename})
})



module.exports=app;