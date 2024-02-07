const request = require("supertest");
const db=require("../models/index");
const app=require("../app");
var cheerio = require("cheerio");

let server,agent;

function extractCsrfToken(res) {
    var $ = cheerio.load(res.text);
    return $("[name=_csrf]").val();
  }

const login = async (agent, username, password) => {
    let res = await agent.get("/signin");
    let csrfToken = extractCsrfToken(res);
    res = await agent.post("/session").send({
      email: username,
      password: password,
      _csrf: csrfToken,
    });
  };

describe("LMS test suite",()=>{
    beforeAll(async () =>{
        await db.sequelize.sync({force:true});
        server=app.listen(4000,()=>{})
        agent = request.agent(server);
    })
    afterAll(async()=>{
      await db.sequelize.close()
      server.close()  
    })

    test("signup", async () => {
        let res = await agent.get("/signup");
        const csrfToken = extractCsrfToken(res);
        const pes = await agent.post("/users").send({
          firstName: "1",
          lastName: "1",
          role:"educator",
          email: "1@gmail.com",
          password: "1",
          _csrf: csrfToken,
        });
        expect(pes.statusCode).toBe(302);
      });
    
      test("sign out", async () => {
        let res = await agent.get("/home");
        expect(res.statusCode).toBe(200);
        res = await agent.get("/signout");
        expect(res.statusCode).toBe(302);
        res = await agent.get("/home");
        expect(res.statusCode).toBe(302);
      });

      test("responds with json at /course", async () => {
        const agent = request.agent(server);
        await login(agent, "1@gmail.com", "1");
        const res = await agent.get("/");
        const csrfToken = extractCsrfToken(res);
        const response = await agent.get("/home").send({
          _csrf: csrfToken,
        });
        console.log(response,"ppppppppppppppppppppppp")
        expect(response.statusCode).toBe(200);
      });

      test("responds with json at /home", async () => {
        const agent = request.agent(server);
        await login(agent, "1@gmail.com", "1");
        const res = await agent.get("/signin");
        const csrfToken = extractCsrfToken(res);
        const response = await agent.get("/home").send({
          _csrf: csrfToken,
          coursename:"python"
        });
        
        expect(response.statusCode).toBe(200);
      });

      test("responds with json at /home", async () => {
        const agent = request.agent(server);
        await login(agent, "1@gmail.com", "1");
        const res = await agent.get("/createcourse");
        const csrfToken = extractCsrfToken(res);
        const response = await agent.get("/home").send({
          _csrf: csrfToken,
          coursename:"python"
        });
        expect(response.statusCode).toBe(200);
      });

      test("responds with json at /myreport", async () => {
        const agent = request.agent(server);
        await login(agent, "1@gmail.com", "1");
        const res = await agent.get("/home");
        const csrfToken = extractCsrfToken(res);
        const response = await agent.get("/myReport").send({
          _csrf: csrfToken,
        });
        expect(response.statusCode).toBe(200);
      });

})