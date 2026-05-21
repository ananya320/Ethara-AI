const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// Get all projects (members see only theirs, admin sees all)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const query = req.user.role === "Admin"
      ? {}
      : { members: req.user.id };
    const projects = await Project.find(query)
      .populate("members", "name email role")
      .populate("createdBy", "name");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create project (Admin only)
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    if (!name) return res.status(400).json({ message: "Project name required" });

    const project = await Project.create({
      name, description,
      members: members || [],
      createdBy: req.user.id
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete project (Admin only)
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users (for member assignment)
router.get("/users/all", authMiddleware, async (req, res) => {
  try {
    const User = require("../models/User");
    const users = await User.find({}, "name email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;