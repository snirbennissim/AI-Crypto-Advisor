import axios from "axios";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 * 60 * 6 });

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function localInsight({
  assets = [],
  investorType = "",
  coinPrices = [],
  marketNews = [],
}) {
  const A = assets.length ? assets.join(", ") : "BTC, ETH";
  const invType = investorType || "HOLDER";
  const headline = marketNews?.[0]?.title
    ? ` • Headline: “${marketNews[0].title}”`
    : "";

  const tipsByType = {
    "Day Trader": [
      "watch intraday liquidity sweeps",
      "tighten stops near key levels",
      "fade extreme moves on low volume",
    ],
    HODLer: [
      "zoom out; avoid overreacting to volatility",
      "DCA on dips, stay focused on long term",
      "rebalance quarterly based on conviction",
    ],
    "NFT Collector": [
      "focus on active projects with growing holders",
      "track mint trends and gas patterns",
      "favor collections with real creator engagement",
    ],
  };

  const tip = pick(tipsByType[invType] || tipsByType["HODLer"]);
  const lines = [
    `For ${invType}s focusing on ${A} -
    Tactical note: ${tip}.${headline}`,
  ];

  return {
    id: `local-${Date.now()}`,
    text: lines.join(" "),
    source: "local",
  };
}

async function query(data) {
  const response = await fetch(
    "https://router.huggingface.co/v1/chat/completions",
    {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`HF ${response.status} ${response.statusText} - ${body}`);
  }

  const result = await response.json();
  return result;
}

export async function huggingfaceInsight(prompt) {
  try {
    const payload = {
      model: "meta-llama/Meta-Llama-3-8B-Instruct:novita",
      messages: [
        {
          role: "system",
          content:
            "You are a crypto analyst. Output 1–2 sentences, concise, neutral-to-slightly-optimistic, and clearly 'not financial advice'.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 120,
    };

    const result = await query(payload);

    const text =
      result?.choices?.[0]?.message?.content?.trim() ??
      result?.choices?.[0]?.text?.trim() ??
      null;

    if (text) {
      return {
        id: `hf-${Date.now()}`,
        text,
        source: `huggingface: ${payload.model}`,
      };
    }
  } catch (error) {
    const status = error?.response?.status;
    console.warn(
      `[insight] HF failed for "meta-llama/Meta-Llama-3-8B-Instruct:novita":`,
      status || error.message
    );
    if (status === 503) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  return null;
}

export async function getAiInsight({
  userId,
  assets = ["BTC", "ETH"],
  investorType = "",
  coinPrices = [],
  marketNews = [],
}) {
  const day = new Date().toISOString().slice(0, 10);
  const key = `insight:${userId}:${day}:${(assets || []).join(
    ","
  )}::${investorType}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const topNews = marketNews?.[0]?.title
    ? `Top headline: "${marketNews[0].title}". `
    : "";

  const prompt =
    `Generate a short crypto insight (1–2 sentences) for a ${
      investorType || "HODLer"
    } ` +
    `interested in ${
      assets?.length ? assets.join(", ") : "BTC, ETH"
    }. ${topNews}`;

  try {
    const insightViaHF = await huggingfaceInsight(prompt);
    if (insightViaHF) {
      cache.set(key, insightViaHF);
      return insightViaHF;
    }
  } catch (error) {
    console.warn("[insight] HF failed:", error.message);
  }

  const local = localInsight({
    assets,
    investorType,
    coinPrices: coinPrices,
    marketNews: marketNews,
  });
  cache.set(key, local);
  return local;
}
