const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Please enter your fullname!"],
  },

  email: {
    type: String,
    required: [true, "Please enter your email!"],
    unique: true,
    validate: [validator.isEmail, "please enter valid email-address"],
  },
  passwordHash: {
    type: String,
    required: [true, "Please enter your password"],
    // select: false,
  },
  // avatar: {
  // .  //since we are adding cloudinary for our pictures and product images we will be storing the URL so type string
  // .  //get the two values from cloudinary //the _id and url
  //   public_id: {
  //     type: String,
  //     required: true,
  //   },
  //   url: {
  //     type: String,
  //     required: true,
  //   },
  // },

  role: {
    type: String,
    default: "admin",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

module.exports = mongoose.model("User", UserSchema);
