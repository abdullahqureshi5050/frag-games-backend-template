const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../util/http-error");
const Task = require("../models/task");
const User = require("../models/user");
const TaskApproval = require("../models/taskApproval");

const getTasks = async (req, res, next) => {
  let tasks;
  try {
    tasks = await Task.find();
  } catch (err) {
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }
  }

  res.json({ allTasks: tasks });
};

const populateTaskwithUsers = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const { assignee } = req.body;
  if (!assignee)
    return res.status(404).json({
      assignee: `invalid assignee id or no assigned task found on provided assignee id`,
    });
  try {
    await Task.findOne({
      assignee: assignee,
    })
      .populate({
        path: "assignee",
        populate: { path: "TaskApproval" },
      })
      .then((response) => {
        //console.log("response  ", response);
        return res.json(response);
      });
  } catch (error) {
    console.log(error);
  }
};
//----------------------------------------requestApproval------------------------------------------------------
//DONE_PENDING_APPROVEL
const requestApproval = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const { status, id, email, employeeNotes, evaluatorNotes, taskId } = req.body;

  try {
    let update = {};
    if (email) update.email = email;
    if (status) update.status = status;

    try {
      task = await Task.findOneAndUpdate({ _id: id }, update);
      if (!task) throw "Task id not found!";
    } catch (err) {
      return res.status(500).json({ errors: `Task update failed ${err}` });
    }
  } catch (err) {
    return res.status(503).json({ errors: `Update to database failed` });
  }

  try {
    let approvalTaskPayload = {};
    if (employeeNotes) approvalTaskPayload.employeeNotes = employeeNotes;
    if (evaluatorNotes) approvalTaskPayload.evaluatorNotes = evaluatorNotes;
    if (email) approvalTaskPayload.email = email;
    if (status) approvalTaskPayload.status = status;
    if (taskId) approvalTaskPayload.taskId = taskId;
    console.log(approvalTaskPayload);

    const createApprovalTask = new TaskApproval(approvalTaskPayload);

    await createApprovalTask.save();
  } catch (err) {
    const error = new Error(
      `Sent for approval failed, Somthing went wrong.${err}`,
      500
    );
    return next(error);
  }

  res.status(200).json({ success: true });
};

//---------------------------------requestApproval END----------------------------------

const addTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const { title, description, status, email, deadline, jwtEmail } = req.body;

  let currentUser;
  try {
    currentUser = await User.findOne({ email: jwtEmail });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!currentUser) {
    const error = new HttpError(
      "jwtEmail not valid, please prove your identity.",
      422
    );
    return next(error);
  }

  if (currentUser.role !== "ADMIN" && currentUser.role !== "BOARD_MANAGER") {
    console.log(currentUser.role);
    const error = new HttpError("Not authorized to add new tasks.", 422);
    return next(error);
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      `No user Found on provided email. Please verify email and make sure user exists on particular email before assigning task(s)`,
      500
    );
    return next(error);
  }

  const assignee = existingUser._id;

  const createdTask = new Task({
    assignee,
    title,
    description,
    status,
    deadline,
  });

  console.log(createdTask);
  try {
    console.log(createdTask);
    await createdTask.save();
  } catch (err) {
    const error = new Error(
      `Save to dB failed, Somthing went wrong.${err}`,
      500
    );
    return next(error);
  }

  res.status(201).json({ sucess: true, taskID: createdTask.id });
};

//-----------------------updateTask---------------------------------------------

const updateTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const { id, title, description, status, email, deadline, jwtEmail } =
    req.body;

  try {
    let update = {};
    if (title) update.title = title;
    if (email) update.email = email;
    if (description) update.description = description;
    if (status) update.status = status;
    if (deadline) update.deadline = deadline;

    try {
      task = await Task.findOneAndUpdate({ _id: id }, update);
      if (!task) throw "Task id not found!";
    } catch (err) {
      return res.status(500).json({ errors: `Task update failed ${err}` });
    }

    //users.save();
    // res.json({ success: true });
  } catch (err) {
    return res.status(503).json({ errors: `Update to database failed` });
  }

  res.status(200).json({ success: true });
};

exports.getTasks = getTasks;
exports.addTask = addTask;
exports.updateTask = updateTask;
exports.requestApproval = requestApproval;
exports.populateTaskwithUsers = populateTaskwithUsers;
