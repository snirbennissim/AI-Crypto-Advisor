import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.log("Error in getUserProfile middleware:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const saveUserPreferences = async (req, res) => {
  try {
    const { assets, investorType, contentTypes } = req.body;
    const userId = req.user._id;
    if (!Array.isArray(assets) || !Array.isArray(contentTypes)) {
      return res
        .status(400)
        .json({ message: "assets and contentTypes must be arrays" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { preferences: { assets, investorType, contentTypes } } },
      { new: true, runValidators: true, select: "-password" }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in saveUserPrefrences middleware:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const completeUserOnboarding = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { onboarded: true } },
      { new: true, select: "-password" }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ ok: true, onboarded: user.onboarded });
  } catch (error) {
    console.log("Error in completeUserOnboarding middleware:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
