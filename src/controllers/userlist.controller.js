const userModel = require("../models/user.model");

//function to get list of all available users

async function getUserListController(req, res, next) {
  try {
    //query all except password
    const usersList = await userModel.find().select("-password");

    //return the json response

    return res.status(200).json({
      usersList,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserListController,
};
