const express = require("express")
const router = express.Router()
const Task = require("../models/Task")
const { authMiddleware, adminOnly } = require("../middleware/auth")

// Stats - MUST be first
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const query = req.user.role === "Member" ? { assignedTo: req.user.id } : {}
    const now = new Date()

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      Task.countDocuments(query),
      Task.countDocuments({ ...query, status: "todo" }),
      Task.countDocuments({ ...query, status: "in-progress" }),
      Task.countDocuments({ ...query, status: "done" }),
      Task.countDocuments({ ...query, status: { $ne: "done" }, dueDate: { $lt: now } })
    ])

    res.json({ total, todo, inProgress, done, overdue })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all tasks
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.query
    const query = projectId ? { project: projectId } : {}
    if (req.user.role === "Member") query.assignedTo = req.user.id

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("project", "name")
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create task
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate, priority } = req.body

    if (!title || !project)
      return res.status(400).json({ message: "Title and project required" })

    const task = new Task({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      priority,
      createdBy: req.user.id
    })

    await task.save()

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("project", "name")

    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update status
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate("assignedTo", "name email")
    .populate("project", "name")
    res.json(task)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete task
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id)
    res.json({ message: "Task deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
