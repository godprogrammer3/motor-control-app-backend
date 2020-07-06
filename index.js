const express = require("express");
const mariadb = require("mariadb");
var dotenv = require("dotenv");
var cors = require("cors");
var bodyParser = require("body-parser");
dotenv.config();
var pool = mariadb.createPool({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "MotorControl",
  connectionLimit: 50,
});
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get("/getAllJobList", async (req, res) => {
  let conn = await pool.getConnection();
  let result = await conn.query("SELECT * FROM JobList;");
  conn.release();
  res.send(result);
});
app.listen("3000", () => {
  console.log("Server started on port 3000");
});

app.delete("/deleteJob/:jobId", async (req, res) => {
  let conn = await pool.getConnection();
  console.log(req.params.jobId);
  let result = await conn.query(
    `DELETE FROM JobList WHERE jobId = "${req.params.jobId}";`
  );
  conn.release();
  res.status(200).send("delete success");
});

app.post("/createJob", async (req, res) => {
  let conn = await pool.getConnection();
  console.log(req.body);
  const sql = `INSERT INTO JobList (jobId, length, status, onTop, overhead, createdTime,workTime)
  VALUES ('${req.body.jobId}', ${
    req.body.length
  }, 0, 20, 0, '${new Date().toISOString().slice(0, 19).replace("T", " ")}','${
    req.body.workTime
  }')`;
  let result = await conn.query(sql);
  conn.release();
  res.status(200).send("create success");
});

app.put("/editJob", async (req, res) => {
  let conn = await pool.getConnection();
  console.log(req.body);
  const sql = `UPDATE JobList 
  SET 
      jobId = "${req.body.jobId}",
      length = "${req.body.length}",
      workTime = "${req.body.workTime}"
  WHERE
      jobId = "${req.body.oldJobId}";`;
  let result = await conn.query(sql);
  conn.release();
  res.status(200).send("edit success");
});
