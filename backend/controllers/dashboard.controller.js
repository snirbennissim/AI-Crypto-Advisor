import User from "../models/user.model.js";
import { getCoinPrices } from "../services/coinPrices.service.js";
import { getPersonalizedMarketNews } from "../services/marketNews.service.js";
import { getRandomMeme } from "../services/meme.service.js";
import { getAiInsight } from "../services/aiInsight.service.js";

export const getPersonalizedDashboard = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userPrefs = user.preferences || {};
    const {
      assets = ["BTC", "ETH"],
      investorType = "",
      contentTypes = ["Market News", "Charts", "Fun Memes"],
    } = userPrefs;

    const coinsPricesPref = true;
    const aiInsightPref = true;
    const memePref = true;

    const [marketNews, coinPrices, aiInsight, meme] = await Promise.all([
      getPersonalizedMarketNews({ assets, investorType, contentTypes }),
      coinsPricesPref ? getCoinPrices(assets) : null,
      aiInsightPref
        ? getAiInsight({ userId, assets, investorType, contentTypes })
        : null,
      memePref ? getRandomMeme() : null,
    ]);

    return res.status(200).json({ marketNews, coinPrices, aiInsight, meme });
  } catch (error) {
    console.error("Error in getPersonalizedDashboard middleware:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
