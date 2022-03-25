const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const taskApproval = new Schema(
  {
    taskId: { type: mongoose.Types.ObjectId, required: true, ref: "Task" },
    //title: { type: String, required: true },
    status: {
      type: String,
      enum: ["APPROVED", "REJECTED", "DONE_PENDING_APPROVEL", "DO", "DOING"],
      default: "DO",
      required: true,
    },
    employeeNotes: { type: String },
    evaluatorNotes: { type: String },
  },
  //options
  { timestamps: true }
);

taskApproval.plugin(uniqueValidator);

module.exports = mongoose.model("TaskApproval", taskApproval);
