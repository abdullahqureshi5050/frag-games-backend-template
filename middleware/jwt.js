const express = require("express");
const jwt = require("jsonwebtoken");

//gen token
//require('crypto').randomBytes(64).toString('hex')

const dotenv = require("dotenv");

// get config vars
dotenv.config();

// access config var
process.env.TOKEN_SECRET;
console.log(process.env.TOKEN_SECRET);

const signAndGetToken = function generateAccessToken(props) {
  const { username, email, role } = props;
  //expires in 30 sec
  return jwt.sign(email, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res.status(401).json({
      error: "You are not logged in.",
    });

  jwt.verify(token, process.env.TOKEN_SECRET.toString(), (err, user) => {
    console.log(err);

    if (err)
      return res.sendStatus(403).json({
        error: "Invalid Token Login to gentrate a valid token.",
      });

    req.user = user;

    next();
  });
};

module.exports = {
  signAndGetToken,
  authenticateToken,
};
module.exports = jwt;
