import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../lib/axios.js";

const CONTENT_OPTIONS = ["Market News", "Charts", "Social", "Fun Memes"];
const INVESTOR_TYPES = ["HODLer", "Day Trader", "NFT Collector"];
const DEFAULT_ASSETS = ["BTC", "ETH", "SOL"];
const ASSETS_CANDIDATES = ["BTC", "ETH", "SOL"];

export default function OnboardingPage() {
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [investorType, setInvestorType] = useState(INVESTOR_TYPES[0]);
  const [contentTypes, setContentTypes] = useState(CONTENT_OPTIONS);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    axiosInstance
      .get("/onboarding/profile")
      .then(({ data }) => {
        if (!isMounted) {
          return;
        }

        if (data?.preferences) {
          setAssets(
            data.preferences.assets?.length
              ? data.preferences.assets
              : DEFAULT_ASSETS
          );
          setInvestorType(data.preferences.investorType || INVESTOR_TYPES[0]);
          setContentTypes(data.preferences.contentTypes || CONTENT_OPTIONS);
        }
      })
      .finally(() => setLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleInArray = (arr, val) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const handleSave = async () => {
    await axiosInstance.post("/onboarding/preferences", {
      assets,
      investorType,
      contentTypes,
    });
    await axiosInstance.post("/onboarding/complete");
    navigate("/dashboard");
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <div className="app-shell">
      {/* Header/Brand */}
      <div className="header">
        <div className="brand">
          <span>AI Crypto Advisor</span>
        </div>
        <div className="badges">
          <span className="badge">Onboarding</span>
          <span className="badge">Preferences</span>
        </div>
      </div>

      {/* Card */}
      <div className="card" style={{ maxWidth: 760, margin: "16px auto" }}>
        <h2 className="h2">Onboarding</h2>
        {/* נכסים */}
        <h3 className="h3" style={{ marginTop: 8 }}>
          What crypto assets are you interested in?
        </h3>
        <div className="chips">
          {ASSETS_CANDIDATES.map((asset) => (
            <button
              key={asset}
              onClick={() => setAssets(toggleInArray(assets, asset))}
              className="btn"
              type="button"
              style={{
                borderColor: assets.includes(asset)
                  ? "var(--mongo)"
                  : "var(--border)",
                background: assets.includes(asset)
                  ? "rgba(19,170,82,.12)"
                  : "#0e191b",
              }}
            >
              {asset}
            </button>
          ))}
        </div>

        {/* סוג משקיע */}
        <h3 className="h3" style={{ marginTop: 16 }}>
          What type of investor are you?
        </h3>
        <select
          className="input"
          value={investorType}
          onChange={(e) => setInvestorType(e.target.value)}
          style={{ maxWidth: 280 }}
        >
          {INVESTOR_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* סוגי תוכן */}
        <h3 className="h3" style={{ marginTop: 16 }}>
          What kind of content would you like to see?
        </h3>
        <div className="chips">
          {CONTENT_OPTIONS.map((option) => (
            <label
              key={option}
              className="btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderColor: contentTypes.includes(option)
                  ? "var(--mongo)"
                  : "var(--border)",
                background: contentTypes.includes(option)
                  ? "rgba(19,170,82,.12)"
                  : "#0e191b",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={contentTypes.includes(option)}
                onChange={() =>
                  setContentTypes(toggleInArray(contentTypes, option))
                }
                style={{ accentColor: "var(--mongo)" }}
              />
              {option}
            </label>
          ))}
        </div>

        <div className="form-actions" style={{ marginTop: 16 }}>
          <button onClick={handleSave} style={{ marginTop: 24 }} type="button">
            Save and continue
          </button>
        </div>
      </div>
    </div>
  );
}
