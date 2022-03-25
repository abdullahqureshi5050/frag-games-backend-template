const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["APPROVED", "REJECTED", "DONE_PENDING_APPROVEL", "DO", "DOING"],
      default: "DO",
      required: true,
    },
    note: { type: String },
  },
  //options
  { timestamps: true }
);

taskSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Task", taskSchema);
