const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Task = require("../models/task");
// const User = require("../models/user");
const TaskApproval = require("../models/taskApproval");
const User = require("../models/user");

//---------------------------------getAllPendingApprovals----------------------------------
const getAllPendingApprovals = async (req, res, next) => {
  let pendingTasks;
  try {
    pendingTasks = await TaskApproval.find();
  } catch (err) {
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }
  }
  res.json({ allPendingTasks: pendingTasks });
};

//---------------------------------getAllPendingApprovalsEND----------------------------------

const approveTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const { status, email, taskId } = req.body;

  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    return res.status(404).json({ error: `user not found ${err}` });
  }

  if (!user) {
    return res.status(404).json({ error: `user not found on provided email` });
  }

  console.log(user);
  if (user.role !== "ADMIN" && user.role !== "BOARD_MANAGER") {
    return res.status(422).json({
      error: `Access Denied. You are not authorized to make final decision on any task submission`,
    });
  }

  try {
    task = await TaskApproval.findOneAndUpdate({ taskId }, { status });
    if (!task) throw "Task id not found!";
  } catch (err) {
    return res.status(500).json({ errors: `Task update failed ${err}` });
  }
  res.status(200).json({ success: true });
};

module.exports = {
  getAllPendingApprovals,
  approveTask,
};
