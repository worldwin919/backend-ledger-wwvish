// this file for creating server and configing the server
// add all middlewares , routes and apis used
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
//in order to read body of the request we use the express.json middleware
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);

module.exports = app;
