const express = require("express");
const router = express.Router();
const userController = require("../Controllers/user");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/getAllUsers", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
