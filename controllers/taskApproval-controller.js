const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Task = require("../models/task");
// const User = require("../models/user");
const TaskApproval = require("../models/taskApproval");

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
  let pendingTasks;
  try {
    pendingTasks = await TaskApproval.find();
  } catch (err) {
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }
  }
  res.json({ approveTask: pendingTasks });
};

module.exports = {
  getAllPendingApprovals,
  approveTask,
};
