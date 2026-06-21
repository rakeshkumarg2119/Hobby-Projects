import { useEffect, useState } from "react";

export default function GlobalMarkets() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const SUMMARY_ENDPOINT = "/api/rates/summary";
    const REFRESH_MS = 15 * 60 * 1000;
    const CACHE_KEY = "fs_global_markets_cache_v1";

    const readCache = () => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;
        if (typeof parsed.timestamp !== "number") return null;
        if (!parsed.data || typeof parsed.data !== "object") return null;
        return parsed;
      } catch {
        return null;
      }
    };

    const writeCache = (payload) => {
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            timestamp: Date.now(),
            data: payload
          })
        );
      } catch {
        // Ignore cache write failures (quota/private mode).
      }
    };

    const normalizeSummary = (raw) => {
      if (!raw || typeof raw !== "object") return null;

      const source = raw.data && typeof raw.data === "object" ? raw.data : raw;

      const toNum = (value) => {
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
      };

      const normalized = {
        usdInr: toNum(source.usdInr ?? source.usd_inr ?? source.USDINR ?? source.usdInrRate),
        eurInr: toNum(source.eurInr ?? source.eur_inr ?? source.EURINR ?? source.eurInrRate),
        gbpInr: toNum(source.gbpInr ?? source.gbp_inr ?? source.GBPINR ?? source.gbpInrRate),
        goldInrPer10g: toNum(
          source.goldInrPer10g ??
            source.gold_inr_per_10g ??
            source.goldPriceInrPer10g ??
            source.gold
        ),
        silverInrPer10g: toNum(
          source.silverInrPer10g ??
            source.silver_inr_per_10g ??
            source.silverPriceInrPer10g ??
            source.silver
        )
      };

      const hasAnyValue = Object.values(normalized).some((value) => value !== null);
      return hasAnyValue ? normalized : null;
    };

    const load = async ({ showLoader = false } = {}) => {
      if (showLoader) setIsLoading(true);
      setError("");
      try {
        const res = await fetch(SUMMARY_ENDPOINT);
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(payload?.error || payload?.data?.error || `${SUMMARY_ENDPOINT} failed (${res.status})`);
        }

        const dataFromApi = normalizeSummary(payload);
        if (!dataFromApi) {
          throw new Error(`Unexpected response shape from ${SUMMARY_ENDPOINT}`);
        }

        if (active) {
          setData(dataFromApi);
          writeCache(dataFromApi);
        }
      } catch (e) {
        if (active) setError(e.message || "Unable to load market data");
      } finally {
        if (active && showLoader) setIsLoading(false);
      }
    };

    let intervalId;
    let timeoutId;

    const startPolling = (delayMs) => {
      timeoutId = setTimeout(async () => {
        await load({ showLoader: false });
        intervalId = setInterval(() => {
          load({ showLoader: false });
        }, REFRESH_MS);
      }, delayMs);
    };

    const cached = readCache();
    if (cached) {
      const ageMs = Date.now() - cached.timestamp;
      const isFresh = ageMs < REFRESH_MS;

      if (isFresh) {
        setData(cached.data);
        setIsLoading(false);
        startPolling(REFRESH_MS - ageMs);
      } else {
        load({ showLoader: true });
        intervalId = setInterval(() => {
          load({ showLoader: false });
        }, REFRESH_MS);
      }
    } else {
      load({ showLoader: true });
      intervalId = setInterval(() => {
        load({ showLoader: false });
      }, REFRESH_MS);
    }

    return () => {
      active = false;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);


  const fmt = (n, max = 4) => {
    const v = Number(n);
    if (Number.isNaN(v)) return "-";
    return v.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: max
    });
  };

  return (
    <div
      style={{
        background: "#131a27",
        color: "#eaf0ff",
        border: "1px solid #27324a",
        borderRadius: 14,
        padding: 16,
        fontFamily: "'JetBrains Mono', monospace"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f4c653" }}>Global Markets</div>
        <div style={{ fontSize: 11, color: "#9bb1da" }}>Auto refresh: 15m</div>
      </div>

      {isLoading && <div style={{ fontSize: 13, color: "#9bb1da" }}>Loading live rates...</div>}
      {!isLoading && error && <div style={{ fontSize: 12, color: "#ff9a9a" }}>{error}</div>}

      {!isLoading && !error && data && (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", background: "#1a2336", padding: "8px 10px", borderRadius: 8 }}>
            <span>USD/INR</span>
            <strong>{fmt(data.usdInr, 6)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", background: "#1a2336", padding: "8px 10px", borderRadius: 8 }}>
            <span>EUR/INR</span>
            <strong>{fmt(data.eurInr, 6)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", background: "#1a2336", padding: "8px 10px", borderRadius: 8 }}>
            <span>GBP/INR</span>
            <strong>{fmt(data.gbpInr, 6)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", background: "#1a2336", padding: "8px 10px", borderRadius: 8 }}>
            <span>Gold (INR/10g)</span>
            <strong>{fmt(data.goldInrPer10g, 4)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", background: "#1a2336", padding: "8px 10px", borderRadius: 8 }}>
            <span>Silver (INR/10g)</span>
            <strong>{fmt(data.silverInrPer10g, 4)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
