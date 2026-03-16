const mongoose = require("mongoose");

function connectToDB() {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      console.log("Error connectong to DB");
      process.exit(1);
    });
}

module.exports = connectToDB;
