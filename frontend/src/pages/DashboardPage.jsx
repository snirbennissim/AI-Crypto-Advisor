import { useState, useEffect } from "react";
import axiosInstance from "../lib/axios.js";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    axiosInstance
      .get("/dashboard/personalizedDashboard")
      .then((result) => {
        if (isMounted) {
          setData(result.data);
        }
      })
      .catch((error) => {
        console.error(
          "dashboard API failed:",
          error?.response?.status || error?.message
        );
      })
      .finally(() => setLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="app-shell">Loading...</div>;
  }

  if (!data) {
    return <div className="app-shell">No data found</div>;
  }

  const marketNews = Array.isArray(data.marketNews) ? data.marketNews : [];
  const coinPrices = Array.isArray(data.coinPrices) ? data.coinPrices : [];
  const aiInsight = data.aiInsight || null;
  const meme = data.meme || null;

  const vote = (section, itemId, vote) => {
    axiosInstance.post("/vote", { section, itemId, vote: vote });
  };

  return (
    <div className="app-shell">
      <div className="header">
        <div className="brand">
          <span>AI Crypto Advisor</span>
        </div>
      </div>

      <div className="grid">
        {/* NEWS */}
        <section className="card span-8">
          <h2 className="h2">Market News</h2>
          {marketNews.length === 0 ? (
            <div className="muted">No matching market news found</div>
          ) : (
            <ul className="list">
              {marketNews.map((news) => (
                <li key={news.id} className="item">
                  <a href={news.url} target="_blank" rel="noreferrer">
                    {news.title}
                  </a>
                  <div className="muted">
                    {news.source ? ` • ${news.source}` : ""}
                    {news.publishedAt
                      ? ` • ${new Date(news.publishedAt).toLocaleString()}`
                      : ""}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      className="btn good"
                      onClick={() => vote("MarketNews", news.id, 1)}
                      type="button"
                    >
                      👍
                    </button>
                    <button
                      className="btn bad"
                      onClick={() => vote("MarketNews", news.id, -1)}
                      type="button"
                    >
                      👎
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* PRICES */}
        <section className="card span-4">
          <h2 className="h2">Coins Prices</h2>
          {coinPrices.length === 0 ? (
            <div className="muted">No matching coin prices found</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {coinPrices.map((price) => (
                <div key={price.id} className="price-row">
                  <div className="price-id">{price.id}</div>
                  <div className="price-num">
                    {price.usd == null
                      ? "-"
                      : `$${Number(price.usd ?? 0).toFixed(2)}`}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="btn good"
                      onClick={() => vote("CoinPrices", price.id, 1)}
                      type="button"
                    >
                      👍
                    </button>
                    <button
                      className="btn bad"
                      onClick={() => vote("CoinPrices", price.id, -1)}
                      type="button"
                    >
                      👎
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* INSIGHT */}
        <section className="card span-6">
          <h2 className="h2">AI Insight of the day</h2>
          {aiInsight?.text ? (
            <>
              <p style={{ marginTop: 0 }}>{aiInsight.text}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn good"
                  onClick={() => vote("AiInsight", aiInsight.id, 1)}
                >
                  👍
                </button>
                <button
                  className="btn bad"
                  onClick={() => vote("AiInsight", aiInsight.id, -1)}
                >
                  👎
                </button>
              </div>
            </>
          ) : (
            <div className="muted">No matching AI insight found</div>
          )}
        </section>

        {/* MEME */}
        <section className="card span-6">
          <h2 className="h2">Fun Meme</h2>
          {meme?.url ? (
            <figure style={{ margin: 0 }}>
              <img
                src={meme.url}
                alt={meme.caption || "meme"}
                style={{ width: "100%", borderRadius: "10px" }}
              />
              {meme.caption && (
                <figcaption className="muted" style={{ marginTop: 8 }}>
                  {meme.caption}
                </figcaption>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  className="btn good"
                  onClick={() => vote("Meme", meme.id, 1)}
                  type="button"
                >
                  👍
                </button>
                <button
                  className="btn bad"
                  onClick={() => vote("Meme", meme.id, -1)}
                  type="button"
                >
                  👎
                </button>
              </div>
            </figure>
          ) : (
            <div className="muted">No available meme found</div>
          )}
        </section>
      </div>
    </div>
  );
}
