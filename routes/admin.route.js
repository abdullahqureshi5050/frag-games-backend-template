const express = require("express");
const router = express.Router();
const adminCtrl = require('../controllers/admin.ctrl');
const authenticated = require('../middleware/auth');
const middlewares = require('../middleware/admin.mid');

//admin login
router.get('/login', adminCtrl.loginGet);
router.post('/login', middlewares.loginMiddleware(), middlewares.validate, adminCtrl.loginGet);

//admin dashboard
router.get("/", authenticated, adminCtrl.adminDashboardGet);

router.post('/updatePassword', adminCtrl.updatePassword);

//add product form
//router.get("/addproduct", authenticated, adminCtrl.addProductGet);

//add product form action 
//router.post("/addproduct", authenticated, adminCtrl.addProductPost);

module.exports = router;
