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
  database: "motor_control",
  connectionLimit: 50,
});
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get("/getAllJobList", async (req, res) => {
  let conn = await pool.getConnection();
  let result = await conn.query("SELECT * FROM job_list;");
  conn.release();
  res.send(result);
});
app.delete("/deleteJob/:jobId", async (req, res) => {
  let conn = await pool.getConnection();
  console.log(req.params.jobId);
  let result = await conn.query(
    `DELETE FROM joblist WHERE jobId = "${req.params.jobId}";`
  );
  conn.release();
  res.status(200).send("delete success");
});

app.post("/createJob", async (req, res) => {
  let conn = await pool.getConnection();
  console.log(req.body);
  const sql = `INSERT INTO joblist (jobId, length, status, onTop, overhead, createdTime,workTime)
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
  const sql = `UPDATE joblist 
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

app.get("/getJobListByDate", async (req, res) => {
  console.log(req.url);
  let type = req.query.type;
  let count = req.query.value.split("-").length - 1;
  if (count === 0) {
    req.query.value += "-01-01";
  } else if (count === 1) {
    req.query.value += "-01";
  }
  let value = req.query.value;
  let sql;
  let conn = await pool.getConnection();
  if (type === "year") {
    sql = `SELECT * FROM joblist WHERE YEAR(workTime) =  YEAR("${value}");`;
    let result = await conn.query(sql);
    conn.release();
    res.send(result);
  } else if (type === "month") {
    sql = `SELECT * FROM joblist WHERE MONTH(workTime) =  MONTH("${value}") AND YEAR(workTime) = YEAR("${value}");`;
    let result = await conn.query(sql);
    conn.release();
    res.send(result);
  } else if (type === "date") {
    sql = `SELECT * FROM joblist WHERE DATE(workTime) =  DATE("${value}");`;
    let result = await conn.query(sql);
    conn.release();
    res.send(result);
  } else {
    res.status(400).send("Bad request.");
  }
});

app.get("/getSetting", async (req, res) => {
  let conn = await pool.getConnection();
  let result = await conn.query("SELECT * FROM setting;");
  conn.release();
  res.send(result[0]);
});

app.put("/editSetting", async (req, res) => {
  let conn = await pool.getConnection();
  console.log(req.body);
  const sql = `UPDATE setting 
  SET 
      defaultOnTop = "${req.body.defaultOnTop}",
      defaultSlowModeVelocity = "${req.body.defaultSlowModeVelocity}"
  WHERE  1`;
  let result = await conn.query(sql);
  conn.release();
  res.status(200).send("edit success");
});

app.listen("3000", () => {
  console.log("Server started on port 3000");
});
