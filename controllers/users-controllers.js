const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");

const HttpError = require("../util/http-error");
const User = require("../models/user");
const user = require("../models/user");

const jwtMiddleware = require("../middleware/jwt");

const updateDOB = async (req, res, next) => {
  const { email, dateOfBirth } = req.body;

  try {
    users = await User.findOne({ email });
    if (!users) throw "user not found!";
  } catch (err) {
    const error = new HttpError("user not found", 404);
    return next(error);
  }

  try {
    users.dateOfBirth = dateOfBirth;
    console.log(users);
    users.save();
    res.json({ success: true });
  } catch (err) {
    const error = new Error("Update address API failed", err, 400);
    return next(error);
  }
};

//append address
const addAddress = async (req, res, next) => {
  const { email, address } = req.body;

  try {
    users = await User.findOne({ email });
    if (!users) throw "Email is required or user not found!";
  } catch (err) {
    const error = new HttpError("user not found", 404);
    return next(error);
  }

  try {
    const userAddress = await User.findOne({ address });
    if (userAddress) throw "address already exist against current user";
  } catch (err) {
    const error = new Error("address found in db", 200);
    return next(error);
  }

  try {
    users.address.push(address);
    //console.log(users);
    users.save();
    res.json({ success: true });
  } catch (err) {
    const error = new Error("Update address API failed", err, 400);
    return next(error);
  }
};

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find();
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ users: users });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const { name, email, password, designation, role, jwtEmail } = req.body;
  let currentUser;
  try {
    currentUser = await User.findOne({ email: jwtEmail });
  } catch (err) {
    return res.status(422).json({ errors: err });
  }

  if (!currentUser) {
    return res.status(422).json({ errors: `jwtEmail not valid` });
  }

  if (currentUser.role !== "ADMIN" && currentUser.role !== "BOARD_MANAGER") {
    console.log(currentUser.role);
    const error = new HttpError("Not authorized to add user.", 422);
    return next(error);
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    return res.status(422).json({ errors: `User exists already.` });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    designation,
    role,
  });

  try {
    console.log(createdUser);
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({ userId: createdUser.id, email: createdUser.email });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return res
      .status(422)
      .json({ errors: `user not found on provided email address` });
    // const error = new HttpError(
    //   "Logging in failed, please try again later.",
    //   500
    // );
    // return next(error);
  }

  if (!existingUser) {
    return res
      .status(403)
      .json({ errors: "Invalid credentials, could not log you in." });
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return res
      .status(403)
      .json({ errors: "Invalid credentials, could not log you in." });
  }

  if (!isValidPassword) {
    return res
      .status(403)
      .json({ errors: "Invalid credentials, could not log you in." });
  }

  const token = jwtMiddleware.signAndGetToken();
  console.log(token);
  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    role: existingUser.role,
  });
};

const updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const { name, email, designation, role } = req.body;

  try {
    let update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (designation) update.designation = designation;
    if (role) update.role = role;

    console.log(update);

    try {
      user = await User.findOneAndUpdate({ email }, update);
      if (!user) throw "user not found!";
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

const updatePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }
  const { oldPassword, newPassword, email } = req.body;
  let user;
  try {
    user = await User.find({ email });
  } catch (err) {
    return res.status(404).json({ error: `user not found ${err}` });
  }

  try {
    if (oldPassword !== newPassword) {
      bcrypt.compare(oldPassword, user[0].password, function (err, response) {
        if (err) {
          // handle error
          console.log(err);
          return res.status(403).json({ error: `password not match ${err}` });
        }
        if (response) {
          // Send JWT
          // return;
        } else {
          // response is OutgoingMessage object that server response http request
          return res.json({
            success: false,
            message: "passwords do not match",
          });
        }
      });
    } else {
      return res.status(403).json({
        error: "new password cannot be same as old password",
      });
    }
  } catch (error) {
    return res.status(503).json({
      error: `somthing went wrong or password not match in database ${error}`,
    });
  }

  //encrypt new password
  let hashedPassword;
  try {
    //hashing rounds
    const saltRounds = 10;

    hashedPassword = bcrypt.hash(newPassword, saltRounds).then(function (hash) {
      // Store hash in your password DB.
      return hash;
    });
  } catch (error) {
    return res.status(500).json({ errors: `Failed while updating password` });
  }

  if (!hashedPassword) {
    return res.status(500).json({ errors: `Failed while updating password!` });
  }

  try {
    const updateUser = await User.updateOne(
      { email },
      { password: (await hashedPassword).toString() }
    );
    if (!updateUser) throw "user not found!";
  } catch (err) {
    return res.status(404).json({ error: `user not found ${err}` });
  }

  return res.status(200).json({ success: true });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.updateUser = updateUser;
exports.updatePassword = updatePassword;
