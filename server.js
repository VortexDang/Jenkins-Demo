const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;

console.log("MYSQL_HOST",process.env.MYSQL_HOST)
console.log("MYSQL_USER",process.env.MYSQL_USER)
console.log("MYSQL_PASSWORD",process.env.MYSQL_PASSWORD)
console.log("MYSQL_DATABASE",process.env.MYSQL_DATABASE)

function handleDisconnect() {
  const db = mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "bentin345",
    database: process.env.MYSQL_DATABASE || "mysql",
  });

  db.connect(function (err) {
    if (err) {
      console.log("error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000); // Retry connecting after 2 seconds
    }
  });

  db.on("error", function (err) {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect(); // Reconnect if the connection was lost
    } else {
      throw err;
    }
  });

  return db;
}

const db = handleDisconnect();

app.get("/items", (req, res) => {
  db.query("SELECT * FROM items", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Endpoint to insert data
app.post("/items", express.json(), (req, res) => {
  const { name } = req.body;
  db.query("INSERT INTO items (name) VALUES (?)", [name], (err, result) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
