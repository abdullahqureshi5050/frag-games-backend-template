const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../util/http-error");
const Task = require("../models/task");
const User = require("../models/user");

const getTasks = async (req, res, next) => {
  let tasks;
  try {
    tasks = await Task.find();
  } catch (err) {
    const error = new HttpError(
      "Fetching data failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ allTasks: tasks });
};

//DONE_PENDING_APPROVEL
const requestApproval = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const { status, id, email } = req.body;

  let currentUser;
  try {
    currentUser = await User.findOne({ email });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `user not found or somthing went wrong on server side` });
  }

  if (!currentUser) {
    return res.status(422).json({ error: `user not found` });
  }

  try {
    const updateTask = await Task.updateOne(
      { _id: id },
      { status: status }
    ).then((response) => {
      return res.json({ res: response });
    });
    if (!updateTask) throw "Task id not found!";
  } catch (err) {
    return res
      .status(404)
      .json({ error: `Task id not found or somthing else went wrong ${err}` });
  }
  await updateTask.save();
  return res.json({ success: true });
};

const addTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        "Invalid inputs passed, please check your data.",
        errors,
        422
      )
    );
  }

  const { title, description, status, email, jwtEmail } = req.body;

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

const updateTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const { id, title, description, status, email, jwtEmail } = req.body;

  try {
    let update = {};
    if (title) update.title = title;
    if (email) update.email = email;
    if (description) update.description = description;
    if (status) update.status = status;

    try {
      task = await Task.findOneAndUpdate({ id }, update);
      if (!task) throw "user not found!";
    } catch (err) {
      return res.status(404).json({ errors: `user not found` });
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
