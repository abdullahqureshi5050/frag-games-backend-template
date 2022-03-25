const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    designation: { type: String, required: true },
    role: {
      type: String,
      enum: ["EMPLOYEE", "ADMIN", "BOARD_MANAGER"],
      default: "EMPLOYEE",
      required: true,
    },
  },
  //options
  { timestamps: true }
);

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
