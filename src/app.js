// this file for creating server and configing the server
// add all middlewares , routes and apis used
const express = require("express");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error.middleware");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const app = express();

app.use(helmet()); //for security headers

//cors for only letting the front access to api
//for testing localhost:3000 allowed
app.use(
  cors({
    origin: ["http://localhost:3000"], //add front end link later
    credentials: true, //allow cookies to be sent
  }),
);

//rate limiter to prevent brute force and ddos attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 mins,
  max: 30, //limit each IP to 30 requests per windowMs
  message: "Too many request , please try again later",
});

app.use(limiter); //apply to all the routes

//routes
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRouter = require("./routes/transaction.routes");
const userListRouter = require("./routes/userslist.routes");
const orderRouter = require("./routes/order.routes");
//in order to read body of the request we use the express.json middleware
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/userlist", userListRouter);
app.use("/api/orders", orderRouter);

//global error handler
app.use(errorHandler);

module.exports = app;
