const { check } = require("express-validator");

const { body, validationResult } = require("express-validator");

const signupMiddleware = () => {
  return [
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Valid Email is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Passward should be atleast of 6 digits"),
    check("designation").not().isEmpty().withMessage("Designation is required"),
    check("role")
      .isIn(["BOARD_MANAGER", "EMPLOYEE"])
      .withMessage("Please provide a vaild role"),
  ];
};

const loginMiddleware = () => {
  return [
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Valid Email is required"),
    check("password").notEmpty().withMessage("Passward is required"),
  ];
};

const addTask = () => {
  return [
    check("email").normalizeEmail().isEmail(),
    check("title").not().isEmpty(),
    check("description").not().isEmpty(),
    check("status").not().isEmpty(),
    //check("deadline").trim().isDate().withMessage("Please input a valid date"),
  ];
};

// Finds the validation errors in this request and wraps them in an object with handy functions
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else next();
};

const requestApproval = () => {
  return [
    check("id").notEmpty().withMessage("Please provide a vaild id"),
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Valid Email is required"),
    check("status")
      .isIn(["DONE_PENDING_APPROVEL", "DO", "DOING"])
      .withMessage("Please provide a vaild role"),
  ];
};

const updateTask = () => {
  return [
    check("email").isEmail(),
    check("title").notEmpty(),
    check("status")
      .notEmpty()
      .isIn(["DONE_PENDING_APPROVEL", "DO", "DOING"])
      .withMessage("Please provide a vaild role"),
    check("description").notEmpty(),
  ];
};
module.exports = {
  loginMiddleware,
  signupMiddleware,
  addTask,
  requestApproval,
  updateTask,
  validate,
};
