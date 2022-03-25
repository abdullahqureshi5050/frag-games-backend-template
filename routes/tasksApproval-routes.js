const express = require("express");

const tasksApprovalController = require("../controllers/taskApproval-controller");

const middlewares = require("../middleware/middlewares");

const router = express.Router();

router.get("/", tasksApprovalController.getAllPendingApprovals);

router.post("/approve-task", tasksApprovalController.approveTask);

module.exports = router;
