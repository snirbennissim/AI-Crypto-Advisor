import axios from "axios";
import NodeCache from "node-cache";

const pricesCache = new NodeCache({ stdTTL: 90 });
const api = axios.create({
  baseURL: "https://api.coinpaprika.com/v1",
  timeout: 10000,
});
const mappingCache = new NodeCache({ stdTTL: 60 * 60 * 24 });

const SYMBOL_MAP = {
  BTC: "btc-bitcoin",
  ETH: "eth-ethereum",
  SOL: "sol-solana",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function resolvePaprikaIdForSymbol(symbol) {
  const symbolInUpperCase = String(symbol).toUpperCase();
  const cached = mappingCache.get(`map:${symbolInUpperCase}`);

  if (cached) {
    return cached;
  }

  if (SYMBOL_MAP[symbolInUpperCase]) {
    mappingCache.set(`map:${symbolInUpperCase}`, SYMBOL_MAP[symbolInUpperCase]);
    return SYMBOL_MAP[symbolInUpperCase];
  }
  try {
    const { data } = await api.get("/search", {
      params: {
        query: symbolInUpperCase,
        modifier: "symbol_search",
        limit: 1,
      },
    });
    const list = Array.isArray(data?.currencies) ? data.currencies : [];
    const exact = list
      .filter((coin) => String(coin.symbol).toUpperCase() === symbolInUpperCase)
      .sort((first, second) => {
        (second.isActive === true) - (first.isActive === true);
      });
    const pick = exact[0] || list[0];

    if (pick?.id) {
      mappingCache.set(`map:${symbolInUpperCase}`, pick.id);
      return pick.id;
    }
  } catch (error) {}
  return null;
}

async function fetchOneTicker(paprikaId) {
  const { data } = await api.get(`/tickers/${paprikaId}`, {
    params: { quotes: "USD" },
  });
  const usd = data?.quotes?.USD?.price ?? null;
  return { usd };
}

async function fetchManyWithLimit(ids, limit = 3) {
  const out = [];
  let i = 0;
  while (i < ids.length) {
    const chunk = ids.slice(i, i + limit);
    const result = await Promise.all(
      chunk.map(async (pid) => {
        try {
          return await fetchOneTicker(pid);
        } catch (error) {
          if (error?.response?.status === 429) {
            await sleep(1000);
            return await fetchOneTicker(pid);
          }

          return { usd: null };
        }
      })
    );
    out.push(...result);
    i += limit;
  }

  return out;
}

export async function getCoinPrices(assets = ["BTC", "ETH"]) {
  const symbols = (assets || []).map((symbol) => String(symbol).toUpperCase());
  const cachedKey = `prices:${symbols.join(",")}`;

  const cached = pricesCache.get(cachedKey);
  if (cached) {
    return cached;
  }

  const paprikaIds = await Promise.all(symbols.map(resolvePaprikaIdForSymbol));
  const pairs = symbols.map((symbol, index) => [symbol, paprikaIds[index]]);

  const known = pairs.filter(([, paprikaId]) => !!paprikaId);
  const unknown = pairs.filter(([, paprikaId]) => !paprikaId);

  const tickers = await fetchManyWithLimit(
    known.map(([, paprikaId]) => paprikaId),
    3
  );

  const result = known.map(([symbol], index) => ({
    id: symbol,
    usd: tickers[index]?.usd ?? null,
  }));

  for (const [symbol] of unknown) {
    result.push({ id: symbol, usd: null });
  }

  pricesCache.set(cachedKey, result);
  return result;
}
