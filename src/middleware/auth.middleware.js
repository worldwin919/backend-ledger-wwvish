const userModel = require("../models/user.model");
const tokenBlackListModel = require("../models/blackList.model");
const jwt = require("jsonwebtoken");

//middle ware to check if the user is authenticated or not using token in the cookie

async function authMiddleware(req, res, next) {
  //get the current token either from the cookie or from the header
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access , invalid token",
    });
  }

  //check if token is blacklisted or not
  const isBlackListenToken = await tokenBlackListModel.findOne({
    token: token,
  });

  if (isBlackListenToken) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }

  //else now verify the token
  try {
    //decode the data from the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized access , user not found",
      });
    }
    req.user = user; //attach the user to the request object for future use in the controllers
    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized access , error validating the token",
    });
  }
}

module.exports = {
  authMiddleware,
};
