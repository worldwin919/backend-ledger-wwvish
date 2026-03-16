const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

/**
 * - user registration controller
 * -  POST/api/auth/register
 */

async function userRegistrationController(req, res) {
  const { email, password, name } = req.body;

  const isExists = await userModel.findOne({
    email: email,
  });
  //already exisitng user
  if (isExists) {
    return res.status(422).json({
      message: "user email already exists",
      status: "fail",
    });
  }

  //else new create new user
  const user = await userModel.create({
    email,
    password,
    name,
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  //now to set token in cookie using cookie-parse middleware
  res.cookie("token", token);

  res.status(201).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}

/**
 * - user login controller
 * -  POST/api/auth/login
 */
async function userLoginController(req, res) {
  const { email, password } = req.body;
  //bug earlier, as in model password select is false , could not get passowrd
  const user = await userModel.findOne({ email }).select("+password");
  //user doesnt exist
  if (!user) {
    return res.status(401).json({
      message: "invalid email or password",
    });
  }
  //pass not valid
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    return res.status(401).json({
      message: "invalid email or password",
    });
  }
  //email and password valid generate a token now for the user
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  //cookies now
  res.cookie("token", token);
  return res.status(200).json(
    {
      user:{
        _id: user._id,
      email: user.email,
      name: user.name,
      },
      token,
    }
  );
}

module.exports = {
  userRegistrationController,
  userLoginController,
};
