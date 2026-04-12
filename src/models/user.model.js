const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Enter a valid email",
      ],
      unique: [true, "email already exists"],
    },

    name: {
      type: String,
      required: [true, "name is required for creating an account"],
    },

    password: {
      type: String,
      required: [true, "password is required for creating an account"],
      minLength: [6, "password must be at least 6 characters long"],
      select: false,
    },
    systemUser: {
      type: Boolean,
      default: false,
      immutable: true, //can only be chaned if has db access, else cant be changed
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return;
  }
  //password changed so hash the password
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;

  return;
});

//method to compare password
userSchema.methods.comparePassword = async function (password) {
  console.log(password, this.password);
  return await bcrypt.compare(password, this.password);
};

//now create the user model

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
