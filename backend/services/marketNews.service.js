import axios from "axios";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 120 });

const CONTENT_TYPES_KEYWORDS = ["Market News", "Charts", "Social", "Fun Memes"];

function includesAny(str = "", arr = []) {
  const lower = String(str || "").toLowerCase();
  return arr.some((w) => lower.includes(String(w).toLowerCase()));
}

function countMatches(str = "", arr = []) {
  const lower = String(str || "").toLowerCase();
  return arr.reduce(
    (acc, w) => (lower.includes(String(w).toLowerCase()) ? acc + 1 : acc),
    0
  );
}

const CONTENT_TYPE_BUCKETS = {
  "Market News": {
    keywords: [
      "market",
      "price",
      "rally",
      "surge",
      "plunge",
      "regulation",
      "etf",
      "sec",
      "fed",
      "upgrade",
      "downgrade",
      "partnership",
      "listing",
      "funding",
      "acquisition",
      "mainnet",
      "hard fork",
      "spot",
      "futures",
    ],
    domains: [
      "coindesk.com",
      "cointelegraph.com",
      "theblock.co",
      "decrypt.co",
      "coindesk",
      " bloomberg.com",
      "reuters.com",
    ],
  },
  Charts: {
    keywords: [
      "chart",
      "technical",
      "pattern",
      "support",
      "resistance",
      "rsi",
      "macd",
      "breakout",
      "on-chain",
      "derivatives",
      "indicator",
      "ta",
      "candles",
    ],
    domains: [
      "tradingview.com",
      "glassnode.com",
      "cryptoquant.com",
      "intotheblock.com",
      "messari.io",
    ],
  },
  Social: {
    keywords: [
      "twitter",
      "x.com",
      "reddit",
      "community",
      "influencer",
      "whale",
      "airdrop",
      "trend",
      "viral",
      "sentiment",
      "telegram",
      "discord",
    ],
    domains: ["twitter.com", "x.com", "reddit.com", "t.me", "discord.com"],
  },
  "Fun Memes": {
    keywords: [
      "meme",
      "lol",
      "funny",
      "doge",
      "shiba",
      "pepe",
      "joke",
      "humor",
    ],
    domains: ["reddit.com", "9gag.com", "imgur.com"],
  },
};

function classifyContentTypes(item = {}) {
  const title = `${item.title || ""} ${item.source || ""}`.toLowerCase();
  const domain = String(item.domain || item.source || "").toLowerCase();
  const matches = [];

  for (const [ctype, rules] of Object.entries(CONTENT_TYPE_BUCKETS)) {
    const byKeyword = rules.keywords?.some((kw) =>
      title.includes(String(kw).toLowerCase())
    );
    const byDomain = rules.domains?.some((d) =>
      domain.includes(String(d).toLowerCase())
    );
    if (byKeyword || byDomain) matches.push(ctype);
  }
  return matches;
}

const inFlight = new Map();
const lastHitAt = new Map();
const COOLDOWN_MS = 35_000;
const MAX_RETRIES = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function computeBackoff(attempt, retryAfterHeader) {
  if (retryAfterHeader) {
    const sec = Number(retryAfterHeader);
    if (!Number.isNaN(sec) && sec > 0) return sec * 1000;
  }
  const base = 500 * 2 ** (attempt - 1);
  const jitter = Math.floor(Math.random() * 150);
  return base + jitter;
}

/**
 * @param {string} url
 * @param {string} key
 * @returns {Promise<any>}
 */
async function callCryptoPanicOnce(url, key) {
  if (inFlight.has(key)) return inFlight.get(key);

  const run = (async () => {
    try {
      const now = Date.now();
      const last = lastHitAt.get(key) || 0;
      const delta = now - last;
      if (delta < COOLDOWN_MS) {
        await sleep(COOLDOWN_MS - delta);
      }

      let attempt = 0;
      while (true) {
        attempt++;
        try {
          const res = await axios.get(url, {
            timeout: 10_000,
            validateStatus: () => true,
          });
          if (res.status === 200) {
            lastHitAt.set(key, Date.now());
            return res.data;
          }
          if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
            if (attempt <= MAX_RETRIES) {
              const retryAfter = res.headers?.["retry-after"];
              await sleep(computeBackoff(attempt, retryAfter));
              continue;
            }
          }
          throw new Error(`HTTP ${res.status} from CryptoPanic`);
        } catch (networkErr) {
          if (attempt <= MAX_RETRIES) {
            await sleep(computeBackoff(attempt));
            continue;
          }
          throw networkErr;
        }
      }
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, run);
  return run;
}

/**
 * @param {{ contentTypes?: string[] }} opts
 * @returns {Promise<Array<{id,title,url,source,published_at,domain?}>>}
 */
export async function getPersonalizedMarketNews({ contentTypes = [] } = {}) {
  const selectedContentTypes = CONTENT_TYPES_KEYWORDS.filter((t) =>
    contentTypes.includes(t)
  );

  const key = `news:v4:ct:${selectedContentTypes.join(",") || "all"}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const cryptoPanicToken = process.env.CRYPTOPANIC_TOKEN || "";

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
    domain: result.domain || "",
  });

  let results = [];

  if (cryptoPanicToken) {
    try {
      const cryptoPanicUrl = `https://cryptopanic.com/api/v1/posts/?auth_token=${cryptoPanicToken}&public=true`;
      const requestKey = `cp:ct:${selectedContentTypes.join(",") || "all"}`;

      const data = await callCryptoPanicOnce(cryptoPanicUrl, requestKey);
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
        id: "s1",
        title: "Market News: Bitcoin steady this week amid ETF flows",
        url: "#",
        source: "Static",
        published_at: now,
        domain: "coindesk.com",
      },
      {
        id: "s2",
        title: "Charts: ETH forms bullish pattern on daily (RSI>50)",
        url: "#",
        source: "Static",
        published_at: now,
        domain: "tradingview.com",
      },
      {
        id: "s3",
        title: "Social: Solana memes trend across X and Reddit",
        url: "#",
        source: "Static",
        published_at: now,
        domain: "twitter.com",
      },
      {
        id: "s4",
        title: "Fun Memes: Doge joke returns—HODLers lol again",
        url: "#",
        source: "Static",
        published_at: now,
        domain: "reddit.com",
      },
      {
        id: "s5",
        title: "Market News: Major exchange listing sparks price action",
        url: "#",
        source: "Static",
        published_at: now,
        domain: "reuters.com",
      },
      {
        id: "s6",
        title: "Charts: On-chain data hints accumulation",
        url: "#",
        source: "Static",
        published_at: now,
        domain: "glassnode.com",
      },
    ].map(normalized);
  }

  const effectiveCT = selectedContentTypes.length
    ? selectedContentTypes
    : CONTENT_TYPES_KEYWORDS;

  const buckets = {};
  for (const ct of effectiveCT) buckets[ct] = [];

  results.forEach((item) => {
    const types = classifyContentTypes(item);
    types.forEach((t) => {
      if (t in buckets) buckets[t].push(item);
    });
  });

  const allKeywords = effectiveCT.flatMap(
    (ct) => CONTENT_TYPE_BUCKETS[ct]?.keywords || []
  );
  const scored = results
    .map((it) => {
      const hits = countMatches(
        it.title + " " + it.source + " " + (it.domain || ""),
        allKeywords
      );
      return { ...it, _hits: hits };
    })
    .sort(
      (a, b) =>
        b._hits - a._hits || new Date(b.published_at) - new Date(a.published_at)
    );

  const used = new Set();
  const finalList = [];

  for (const ct of effectiveCT) {
    const arr = (buckets[ct] || []).sort(
      (a, b) => new Date(b.published_at) - new Date(a.published_at)
    );
    const pick = arr.find((x) => !used.has(x.id));
    if (pick) {
      finalList.push(pick);
      used.add(pick.id);
    }
  }

  for (const it of scored) {
    if (finalList.length >= 5) break;
    if (!used.has(it.id)) {
      finalList.push(it);
      used.add(it.id);
    }
  }

  for (const it of scored) {
    if (finalList.length >= 8) break;
    if (!used.has(it.id)) {
      finalList.push(it);
      used.add(it.id);
    }
  }

  const finalMarketNews = finalList.length ? finalList : scored.slice(0, 8);
  cache.set(key, finalMarketNews);
  return finalMarketNews.slice(0, 8);
}
