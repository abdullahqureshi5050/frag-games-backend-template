const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");
const middlewares = require("../middleware/middlewares");

const router = express.Router();

router.get("/", usersController.getUsers);
router.post("/signup", middlewares.signupMiddleware(), usersController.signup);

router.post("/login", middlewares.loginMiddleware(), usersController.login);

router.post("/update-user", usersController.updateUser);
router.post("/update-password", usersController.updatePassword);

module.exports = router;
