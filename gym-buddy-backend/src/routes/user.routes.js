
// GET /api/user/all — for partner matching
router.get("/all", auth, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.userId },
      name: { $ne: "" },
      gymLocation: { $ne: "" },
    }).select("name age gender fitnessGoal dietPreference gymLocation workoutTime points streak badges");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
