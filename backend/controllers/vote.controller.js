import Vote from "../models/vote.model.js";

export const createOrUpdateVote = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { section, itemId, vote } = req.body;

    if (!["MarketNews", "CoinPrices", "AiInsight", "Meme"].includes(section)) {
      return res.status(400).json({ message: "Invalid section" });
    }

    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({ message: "Invalid vote value" });
    }

    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    const userVoteData = await Vote.findOneAndUpdate(
      { userId, section, itemId },
      { $set: { vote: Number(vote) } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ vote: userVoteData });
  } catch (error) {
    console.error("Error creating/updating vote:", error);
    if (error.code === 11000) {
      return res.json({ ok: true });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
