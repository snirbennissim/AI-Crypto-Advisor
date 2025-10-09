import axios from "axios";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 120 });

const CONTENT_TYPES_KEYWORDS = ["Market News", "Charts", "Social", "Fun Memes"];

const INVESTOR_TYPES_PREFERENCES_KEYWORDS = [
  "HODLer",
  "Day Trader",
  "NFT Collector",
];

function includesAny(str = "", arr = []) {
  const lowerCaseStr = String(str || "").toLowerCase();
  return arr.some((word) => lowerCaseStr.includes(String(word).toLowerCase()));
}

function countMatches(str = "", arr = []) {
  const lowerCaseStr = String(str || "").toLowerCase();
  return arr.reduce((acc, word) =>
    lowerCaseStr.includes(String(word).toLowerCase()) ? acc++ : acc
  );
}

function changeFromSymbolToName(assets = []) {
  const assetsInUpperCase = assets.map((asset) => String(asset).toUpperCase());
  return assetsInUpperCase.concat(
    assetsInUpperCase.map((coinSymbol) =>
      coinSymbol === "BTC"
        ? "Bitcoin"
        : coinSymbol === "ETH"
          ? "Ethereum"
          : coinSymbol === "SOL"
            ? "Solana"
            : coinSymbol.toLowerCase()
    )
  );
}

export async function getPersonalizedMarketNews({
  assets = ["BTC", "ETH"],
  investorType = "",
  contentTypes = [],
} = {}) {
  const key = `news:v3:${assets.join(",")}:${investorType}:${contentTypes.join(
    ","
  )}`;
  const cachedNews = cache.get(key);

  if (cachedNews) {
    return cachedNews;
  }

  const cryptoPanicToken = process.env.CRYPTOPANIC_TOKEN || "";
  const currencies = assets
    .map((asset) => String(asset).toUpperCase())
    .slice(0, 6);

  const normalized = (result) => ({
    id:
      result.id?.toString() ||
      result.url ||
      `${result.title}-${result.published_at}`,
    title: result.title,
    url: result.url,
    source: result.source?.title || result.domain || "Unknown",
    published_at:
      result.published_at || result.created_at || new Date().toISOString(),
  });

  let results = [];

  if (cryptoPanicToken) {
    try {
      const cryptoPanicUrl = `https://cryptopanic.com/api/v1/posts/?auth_token=${cryptoPanicToken}&public=true&currencies=${currencies.join(
        ","
      )}`;
      const { data } = await axios.get(cryptoPanicUrl, {
        timeout: 10000,
      });
      results = Array.isArray(data?.results)
        ? data.results.map(normalized)
        : [];
    } catch (error) {
      results = [];
    }
  }

  if (!results.length) {
    const now = new Date().toISOString();
    results = [
      {
        id: "1",
        title: "Market news: Bitcoin steady this week",
        url: "#",
        source: "Static",
        published_at: now,
      },
      {
        id: "2",
        title: "Charts: ETH forms bullish pattern on daily",
        url: "#",
        source: "Static",
        published_at: now,
      },
      {
        id: "3",
        title: "Social: Solana memes trend across Twitter",
        url: "#",
        source: "Static",
        published_at: now,
      },
      {
        id: "4",
        title: "Fun: HODLer story since 2017 resurfaces",
        url: "#",
        source: "Static",
        published_at: now,
      },
      {
        id: "5",
        title: "NFT Collector spotlight: top mints this week",
        url: "#",
        source: "Static",
        published_at: now,
      },
      {
        id: "6",
        title: "Day Trader watch: intraday moves on BTC",
        url: "#",
        source: "Static",
        published_at: now,
      },
    ];
  }

  const selectedContentTypes = CONTENT_TYPES_KEYWORDS.filter((keyWord) =>
    contentTypes.includes(keyWord)
  );

  const assetsNames = changeFromSymbolToName(assets);

  const selectedInvestorTypes =
    investorType && INVESTOR_TYPES_PREFERENCES_KEYWORDS.includes(investorType)
      ? [investorType]
      : [];

  const matchAnyPref = (title) => {
    return (
      (selectedContentTypes.length &&
        includesAny(title, selectedContentTypes)) ||
      (selectedInvestorTypes.length &&
        includesAny(title, selectedInvestorTypes)) ||
      includesAny(title, assetsNames)
    );
  };

  let filtered = results.filter((result) => matchAnyPref(result.title));

  if (!filtered.length) {
    filtered = results;
  }

  const contentHits = filtered
    .map((contType) => {
      const hits =
        countMatches(contType.title, selectedContentTypes) +
        countMatches(contType.title, selectedInvestorTypes) +
        countMatches(contType.title, assetsNames);
      return { ...contType, _hits: hits };
    })
    .sort(
      (first, second) =>
        second._hits - first._hits ||
        new Date(second.published_at) - new Date(first.published_at)
    )
    .map(({ _hits, ...rest }) => rest);

  const finalMarketNews = contentHits.slice(0, 8);

  cache.set(key, finalMarketNews);
  return finalMarketNews.slice(0, 8);
}
