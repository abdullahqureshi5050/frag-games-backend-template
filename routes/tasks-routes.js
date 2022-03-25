const express = require("express");

const tasksController = require("../controllers/tasks-controllers");
const fileUpload = require("../middleware/file-upload");

const middlewares = require("../middleware/middlewares");

const router = express.Router();

router.get("/", tasksController.getTasks);
router.post(
  "/request-approval",
  middlewares.requestApproval(),
  tasksController.requestApproval
);
router.post("/add-task", middlewares.addTask(), tasksController.addTask);
router.post(
  "/update-task",
  tasksController.updateTask,
  tasksController.updateTask
);

module.exports = router;
