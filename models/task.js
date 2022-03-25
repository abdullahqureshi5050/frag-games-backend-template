const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    assignee: { type: Schema.Types.ObjectId },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["APPROVED", "REJECTED", "DONE_PENDING_APPROVEL", "DO", "DOING"],
      default: "DO",
      required: true,
    },
  },
  //options
  { timestamps: true }
);

taskSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Task", taskSchema);