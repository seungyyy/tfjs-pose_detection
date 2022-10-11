const mongoose = require("mongoose")
const { Schema } = mongoose;

const user = new Schema(
  {
    email: String,
    password: String,
    salt: String,
    name: String,
    statuis: false,
  }
);

const User = mongoose.model("User", user);
module.exports = { User}