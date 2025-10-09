import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    section: {
      type: String,
      required: true,
      enum: ["MarketNews", "CoinPrices", "AiInsight", "Meme"],
    },
    itemId: {
      type: String,
      required: true,
    },
    vote: {
      type: Number,
      required: true,
      enum: [1, -1],
    },
  },
  { timestamps: true }
);

voteSchema.index({ userId: 1, section: 1, itemId: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);
