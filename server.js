const express = require("express");
const ConnectDb = require("./config/db");
const dotenv = require("dotenv");
const path = require("path");
const app = express();
const port = 3000;

dotenv.config();
ConnectDb();

// Middleware to handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.use((req, res, next) => {
  req.setTimeout(300000); // 300,000 ms = 5 minutes
  next();
});

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import and use routes
app.use("/", require("./routes/indexRoutes")); // Ensure the routes are correctly set up

// Start the server
app.listen(port, (err) => {
  if (err) console.log(err);
  console.log(`Server Running On The Port = ${port}`);
});
