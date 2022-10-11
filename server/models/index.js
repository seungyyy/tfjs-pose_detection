const mongoose = require('mongoose');
const UserSchema = require('./scheams/user');

exports.User = mongoose.model("User", UserSchema)