import { useState, useRef, useEffect, useCallback } from "react";
import CONCEPTS from "./concepts.json";
import AssetAllocation from "./AssetAllocation";
import GlobalMarkets from "./GlobalMarkets";

// KNOWLEDGE BASE
const CATEGORY_COLORS = {
  macroeconomics: "#f59e0b",
  banking: "#3b82f6",
  loans: "#ef4444",
  investing: "#10b981",
  commodities: "#f97316"
};

const DIFFICULTY_LABELS = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };
const SOCIAL_CONCEPT_IDS = new Set(["greeting", "thanks", "goodbye"]);

// HELPERS
function findConcept(query) {
  const q = query.toLowerCase().trim();
  for (const [id, concept] of Object.entries(CONCEPTS)) {
    if (id === q || concept.name.toLowerCase() === q) return concept;
    if (concept.keywords.some(k => q.includes(k) || k.includes(q))) return concept;
  }
  return null;
}

function buildSystemPrompt(concept, mode) {
  const modeInstructions = {
    eli5: "Explain this financial concept in the simplest possible terms, as if to a complete beginner (ELI5 — Explain Like I'm 5). Use relatable Indian examples, avoid jargon.",
    deep: "Give a comprehensive, technically detailed explanation. Include formulas, mechanisms, real-world implications. Target audience: someone who wants to deeply understand the concept.",
    analogy: "Explain this concept primarily through a vivid, memorable analogy. The analogy should make the concept instantly intuitive.",
    default: "Explain this financial concept clearly and helpfully. Use the provided knowledge base data to give an accurate, engaging explanation. Add any relevant context."
  };

  return `You are Finance Sensei 🤖- an expert financial educator who explains banking and finance concepts clearly, accurately, and engagingly. You specialise in Indian finance (RBI, SEBI, rupee-denominated examples).

IMPORTANT RULES:
- Educational purposes only. Never give investment advice or recommendations to buy/sell specific assets.
- Add a brief caution only when discussing live prices, returns, trading, or risk-sensitive decisions.
- Be conversational but precise. Use Indian examples where possible.
- Format your response with clear sections using markdown-style headers.
- Keep responses focused and under 400 words unless the user asks for deep detail.

MODE: ${modeInstructions[mode] || modeInstructions.default}

KNOWLEDGE BASE DATA FOR THIS CONCEPT:
${JSON.stringify(concept, null, 2)}

Use this data as the foundation but enrich it with your knowledge. Stay accurate to the provided data.`;
}

// ——— API CALLS ——————————————————————————————————————————————————
async function callBackendLlm(provider, messages, concept, mode, apiKey, ollamaModel, ollamaUrl) {
  const systemPrompt = buildSystemPrompt(concept, mode);
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      systemPrompt,
      messages,
      apiKey,
      ollamaModel,
      ollamaUrl
    })
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload?.success) {
    throw new Error(payload?.data?.error || `Backend AI gateway failed (${res.status})`);
  }
  return payload.data?.reply || "";
}

function getLocalAnswer(concept, mode, query) {
  const modeMap = { eli5: "simple_explanation", deep: "deep_explanation", analogy: "analogy" };
  const field = modeMap[mode];
  let answer = field ? concept[field] : concept.definition + "\n\n" + concept.simple_explanation;
  if (concept.example) {
    answer += `\n\n**Example:** ${concept.example.scenario}\n${concept.example.calculation}\n\n_Lesson: ${concept.example.lesson}_`;
  }
  answer += `\n\n> "${concept.quip}"`;
  return answer;
}

function getSocialReply(concept) {
  if (!concept) return "Hello! Ask me any finance concept and I will keep it simple.";

  if (concept.id === "greeting") {
    return "Hello! I am Finance Sensei. What finance topic do you want to learn today?";
  }

  if (concept.id === "thanks") {
    return "You are welcome! Glad I could help. Ask another finance question anytime.";
  }

  if (concept.id === "goodbye") {
    return "Goodbye! Take care and come back anytime to learn more finance.";
  }

  return concept.simple_explanation || "Happy to help.";
}

function parseCurrencyQuery(text) {
  const cleaned = text.toLowerCase().replace(/,/g, " ").replace(/\s+/g, " ").trim();

  let match = cleaned.match(/(?:convert\s+)?(\d+(?:\.\d+)?)\s*([a-z]{3})\s*(?:to|in|into|=|->|\/)?\s*([a-z]{3})/i);
  if (match) {
    return {
      amount: Number(match[1]),
      from: match[2].toUpperCase(),
      to: match[3].toUpperCase()
    };
  }

  match = cleaned.match(/(?:live\s+)?(?:rate|exchange\s+rate)\s*([a-z]{3})\s*(?:to|\/|in)\s*([a-z]{3})/i)
    || cleaned.match(/\b([a-z]{3})\s*(?:to|\/|in)\s*([a-z]{3})\b/i);

  if (match) {
    return {
      amount: 1,
      from: match[1].toUpperCase(),
      to: match[2].toUpperCase()
    };
  }

  return null;
}

function isMetalsQuery(text) {
  const t = text.toLowerCase();
  const hasMetal = /\bgold\b|\bsilver\b|\bmetals?\b/.test(t);
  const hasPriceIntent = /\brate\b|\bprice\b|\blive\b|\btoday\b|\bspot\b/.test(t);
  return hasMetal && hasPriceIntent;
}

function SenseiIcon({ size = 20 }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span style={{ fontSize: size, lineHeight: 1 }}>🤖</span>;
  }
  return (
    <img
      src="/sensei-icon.png"
      alt="Sensei"
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
      onError={() => setFailed(true)}
    />
  );
}

// ——— MAIN COMPONENT ——————————————————————————————————————————————
export default function FinanceSensei() {
  const PLACEHOLDERS = [
    "Wanna learn a new finance concept?",
    "Ask about inflation, EMI, SIP, or credit score...",
    "Try: deep dive repo rate",
    "Try: 100 usd to inr"
  ];

  const [theme, setTheme] = useState("dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([{
    id: "welcome",
    role: "assistant",
    content: "**Irasshaimase! 🤖 Finance Sensei is ready.**\n\nI explain finance and banking concepts — from absolute basics to advanced theory. Ask me about anything:\n\n> *inflation, compound interest, EMI, credit score, SIP, stock market, IPO, gold, central bank, currency exchange...*\n\nOr try modes:\n- `eli5 compound interest` — super simple\n- `deep dive repo rate` — technical depth\n- `analogy for EMI` — memorable story\n- `topics` — see all concepts\n\n💡 _The app works fully offline. Connecting an API just makes explanations richer and more conversational — it's optional._",
    timestamp: new Date()
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [quoteOfDay, setQuoteOfDay] = useState(null);
  const [celebrateQuote, setCelebrateQuote] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth <= 768 : false));
  const [settings, setSettings] = useState({
    provider: "none",
    geminiApiKey: "",
    groqApiKey: "",
    ollamaUrl: "http://localhost:11434",
    ollamaModel: "llama3",
    otherApiUrl: "",
    otherApiKey: "",
    otherApiModel: "gpt-4o-mini",
    saved: false
  });
  const [apiStatus, setApiStatus] = useState("unconfigured");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const conversationHistory = useRef([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [PLACEHOLDERS.length]);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleEscClose = (event) => {
      if (event.key !== "Escape") return;
      setIsSidebarOpen(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    };

    window.addEventListener("keydown", handleEscClose);
    return () => window.removeEventListener("keydown", handleEscClose);
  }, [isSidebarOpen]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("fs_theme");
    if (savedTheme) setTheme(savedTheme);

    setShowDisclaimer(true);
  }, []);

  useEffect(() => {
    let active = true;
    const QUOTE_CACHE_KEY = "fs_daily_quote_cache_v1";

    const getDayKey = (date = new Date()) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const readQuoteCache = () => {
      try {
        const raw = localStorage.getItem(QUOTE_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;
        if (parsed.dayKey !== getDayKey()) return null;
        if (!parsed.quote || typeof parsed.quote !== "object") return null;
        return parsed.quote;
      } catch {
        return null;
      }
    };

    const writeQuoteCache = (quotePayload) => {
      try {
        localStorage.setItem(
          QUOTE_CACHE_KEY,
          JSON.stringify({
            dayKey: getDayKey(),
            quote: quotePayload
          })
        );
      } catch {
        // Ignore cache write failures.
      }
    };

    const normalizeQuote = (payload) => {
      if (!payload || typeof payload !== "object") return null;

      const source = payload.data && typeof payload.data === "object" ? payload.data : payload;
      const text = source.quote || source.content || source.text || source.message;
      const author = source.author || source.by || source.source || "Unknown";
      const tags = Array.isArray(source.tags)
        ? source.tags.filter(Boolean)
        : typeof source.tag === "string"
          ? [source.tag]
          : [];

      if (!text || typeof text !== "string") return null;
      return { text: text.trim(), author: String(author).trim(), tags };
    };

    const loadQuote = async () => {
      const cached = readQuoteCache();
      if (cached) {
        if (active) setQuoteOfDay(cached);
        return;
      }

      try {
        const res = await fetch("/api/quotes/daily?tags=business,success");
        const payload = await res.json().catch(() => null);
        if (!res.ok || (payload && payload.success === false)) return;

        const normalized = normalizeQuote(payload);
        if (!normalized) return;

        if (active) setQuoteOfDay(normalized);
        writeQuoteCache(normalized);
      } catch {
        // Ignore quote failures and keep chat experience unaffected.
      }
    };

    loadQuote();
    return () => {
      active = false;
    };
  }, []);

  const acknowledgeDisclaimer = () => {
    setShowDisclaimer(false);
    setCelebrateQuote(true);
    setTimeout(() => setCelebrateQuote(false), 2200);
  };

  const saveSettings = async () => {
    try {
      if (settings.provider === "gemini" && !settings.geminiApiKey.trim()) {
        throw new Error("Please enter your Gemini API key");
      }

      if (settings.provider === "groq" && !settings.groqApiKey.trim()) {
        throw new Error("Please enter your Groq API key");
      }

      if (settings.provider === "other") {
        if (!settings.otherApiUrl.trim()) {
          throw new Error("Please enter Other API base URL");
        }
        if (!settings.otherApiKey.trim()) {
          throw new Error("Please enter Other API key");
        }
      }

      if (settings.provider !== "none") {
        const providerPayload = {
          provider: settings.provider,
          apiKey:
            settings.provider === "gemini"
              ? settings.geminiApiKey
              : settings.provider === "groq"
                ? settings.groqApiKey
                : settings.provider === "other"
                  ? settings.otherApiKey
                  : "",
          ollamaUrl: settings.provider === "ollama" ? settings.ollamaUrl : settings.provider === "other" ? settings.otherApiUrl : "",
          ollamaModel: settings.provider === "ollama" ? settings.ollamaModel : settings.provider === "other" ? settings.otherApiModel : ""
        };

        const configRes = await fetch("/api/ai/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(providerPayload)
        });
        const configPayload = await configRes.json().catch(() => null);
        if (!configRes.ok || !configPayload?.success) {
          throw new Error(configPayload?.data?.error || `Failed to save provider config (${configRes.status})`);
        }
      }

      localStorage.setItem("fs_settings", JSON.stringify({
        provider: settings.provider,
        ollamaUrl: settings.ollamaUrl,
        ollamaModel: settings.ollamaModel,
        otherApiUrl: settings.otherApiUrl,
        otherApiModel: settings.otherApiModel
      }));
      setSettings(s => ({ ...s, saved: true }));
      setApiStatus(settings.provider !== "none" ? "ok" : "unconfigured");
      setShowSettings(false);
      const providerLabel = settings.provider === "gemini" ? "Gemini" : settings.provider === "groq" ? "Groq (cloud, free)" : settings.provider === "ollama" ? `Ollama (${settings.ollamaModel})` : settings.provider === "other" ? `Other API (${settings.otherApiModel || "model"})` : "Offline";
      addMessage("assistant", `✅ Settings saved! Using **${providerLabel}** for explanations.\n\n${settings.provider === "none" ? "📖 Offline mode active: you can continue learning concepts, examples, and analogies without internet or API keys." : "🔐 API credentials are loaded into secure backend memory for this browser session only."}`);
    } catch (e) {
      addMessage("assistant", `⚠️ Could not save provider settings: ${e.message || "Unknown error"}`);
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("fs_theme", next);
  };

  const addMessage = (role, content) => {
    const msg = { id: Date.now().toString(), role, content, timestamp: new Date() };
    setMessages(prev => [...prev, msg]);
    if (role === "user") conversationHistory.current.push({ role: "user", content });
    if (role === "assistant") conversationHistory.current.push({ role: "assistant", content });
    return msg;
  };

  const detectMode = (text) => {
    const t = text.toLowerCase();
    if (t.startsWith("eli5 ") || t.includes("explain simply") || t.includes("simple explanation")) return { mode: "eli5", cleaned: text.replace(/^eli5\s+/i, "") };
    if (t.startsWith("deep dive ") || t.startsWith("deep ") || t.includes("explain in detail") || t.includes("advanced")) return { mode: "deep", cleaned: text.replace(/^deep dive\s+/i, "").replace(/^deep\s+/i, "") };
    if (t.startsWith("analogy") || t.startsWith("example for") || t.startsWith("analogy for")) return { mode: "analogy", cleaned: text.replace(/^analogy for?\s+/i, "").replace(/^analogy\s+/i, "") };
    return { mode: "default", cleaned: text };
  };

  const formatNumber = (value, max = 4) => {
    const n = Number(value);
    if (Number.isNaN(n)) return String(value ?? "-");
    return n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: max
    });
  };

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getThinkingDelayMs = (mode, concept) => {
    const byDifficulty = { 1: 1800, 2: 2800, 3: 4200 };
    let delay = byDifficulty[concept?.difficulty] || 2200;
    if (mode === "deep") delay += 1800;
    if (mode === "analogy") delay += 700;
    return delay;
  };

  const formatBackendTimestamp = (timestamp) => {
    const dt = timestamp ? new Date(timestamp) : null;
    if (!dt || Number.isNaN(dt.getTime())) return "Unavailable";
    return dt.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  };

  const getActiveProviderApiKey = () => {
    if (settings.provider === "gemini") return settings.geminiApiKey;
    if (settings.provider === "groq") return settings.groqApiKey;
    if (settings.provider === "other") return settings.otherApiKey;
    return "";
  };

  const getActiveProviderUrl = () => {
    if (settings.provider === "other") return settings.otherApiUrl;
    return settings.ollamaUrl;
  };

  const getActiveProviderModel = () => {
    if (settings.provider === "other") return settings.otherApiModel;
    return settings.ollamaModel;
  };

  const getLiveCurrencyFromBackend = async ({ from, to, amount }) => {
    const params = new URLSearchParams({ from, to, amount: String(amount) });
    const res = await fetch(`/api/rates/currency?${params.toString()}`);
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new Error(payload?.data?.error || `Backend currency API failed (${res.status})`);
    }
    return payload.data;
  };

  const getLiveMetalsFromBackend = async () => {
    const res = await fetch("/api/rates/metals");
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new Error(payload?.data?.error || `Backend metals API failed (${res.status})`);
    }
    return payload.data;
  };

  const handleSpecialCommands = (text) => {
    const t = text.toLowerCase().trim();
    if (t === "topics" || t === "list topics" || t === "all topics") {
      setShowTopics(true);
      return true;
    }
    if (t === "help") {
      addMessage("assistant", `**Finance Sensei Commands 🤖**\n\n- **[concept name]** 🤖 explain a concept (e.g., "inflation")\n- **eli5 [concept]** 🤖 super simple explanation\n- **deep dive [concept]** 🤖 technical deep-dive\n- **analogy for [concept]** 🤖 memorable analogy\n- **100 usd to inr** 🤖 live backend currency conversion\n- **usd to eur** 🤖 live backend exchange rate\n- **gold silver rate today** 🤖 live backend metals rates\n- **topics** 🤖 browse all 16 concepts\n- **settings** 🤖 configure Gemini/Ollama/Groq\n- **help** this menu\n\n_Try: "100 usd to inr", "gold silver rate", or "eli5 compound interest"_`);
      return true;
    }
    if (t === "settings") {
      setShowSettings(true);
      return true;
    }
    return false;
  };

  const sendMessage = useCallback(async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    addMessage("user", trimmed);

    if (handleSpecialCommands(trimmed)) return;

    const currencyQuery = parseCurrencyQuery(trimmed);
    const metalsQuery = isMetalsQuery(trimmed);

    if (currencyQuery || metalsQuery) {
      setIsLoading(true);
      const sections = [];
      const failures = [];

      if (currencyQuery) {
        try {
          const data = await getLiveCurrencyFromBackend(currencyQuery);
          const rateTimestamp = data.rateTimestamp || data.timestamp || data.updatedAt;
          sections.push(
            `**Live Currency Conversion**\n\n` +
            `- ${formatNumber(data.amount, 4)} ${data.from} = **${formatNumber(data.convertedAmount, 4)} ${data.to}**\n` +
            `- Exchange rate: 1 ${data.from} = ${formatNumber(data.exchangeRate, 6)} ${data.to}\n` +
            `- Rate timestamp: ${formatBackendTimestamp(rateTimestamp)}`
          );
        } catch (e) {
          failures.push(`Currency conversion failed: ${e.message}`);
        }
      }

      if (metalsQuery) {
        try {
          const data = await getLiveMetalsFromBackend();
          const goldInrPer1g = Number(data.gold.priceInrPer10g) / 10;
          const goldUsdPer1g = Number(data.gold.priceUsdPer10g) / 10;
          const silverInrPer1g = Number(data.silver.priceInrPer10g) / 10;
          const silverUsdPer1g = Number(data.silver.priceUsdPer10g) / 10;

          sections.push(
            `**Live Gold & Silver**\n\n` +
            `- USD/INR: ${formatNumber(data.usdToInrRate, 6)}\n` +
            `- Gold (1g): **INR ${formatNumber(goldInrPer1g, 4)}** | USD ${formatNumber(goldUsdPer1g, 4)}\n` +
            `- Gold (10g): **INR ${formatNumber(data.gold.priceInrPer10g, 4)}** | USD ${formatNumber(data.gold.priceUsdPer10g, 4)}\n` +
            `- Silver (1g): **INR ${formatNumber(silverInrPer1g, 4)}** | USD ${formatNumber(silverUsdPer1g, 4)}\n` +
            `- Silver (10g): **INR ${formatNumber(data.silver.priceInrPer10g, 4)}** | USD ${formatNumber(data.silver.priceUsdPer10g, 4)}`
          );
        } catch (e) {
          failures.push(`Metals rates failed: ${e.message}`);
        }
      }

      if (sections.length > 0) {
        const extra = failures.length ? `\n\n⚠️ ${failures.join(" | ")}` : "";
        addMessage("assistant", `${sections.join("\n\n---\n\n")}${extra}\n\n_⚠️ Market rates can change quickly. Finance Sensei can make mistakes, so cross-check with your bank/broker or an official exchange before acting._`);
      } else {
        addMessage("assistant", `⚠️ ${failures.join(" | ") || "Live rates request failed."}\n\nMake sure backend is running and your .env keys are set.`);
      }

      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { mode, cleaned } = detectMode(trimmed);
    const concept = findConcept(cleaned);

    if (!concept) {
      // Generic finance question
      setIsLoading(false);
      if (settings.provider !== "none") {
        setIsLoading(true);
        try {
          const genericConcept = { name: "Finance Question", definition: trimmed, simple_explanation: "", deep_explanation: "", analogy: "", example: null, quip: "Knowledge is the best investment." };
          const history = [...conversationHistory.current.slice(-6), { role: "user", content: trimmed }];
          const reply = await callBackendLlm(settings.provider, history, genericConcept, mode, getActiveProviderApiKey(), getActiveProviderModel(), getActiveProviderUrl());
          addMessage("assistant", reply);
        } catch (e) {
          addMessage("assistant", `⚠️ API error: ${e.message}\n\nI couldn't find a concept matching "${trimmed}" in my knowledge base. Try: topics, help, or ask about a specific concept like "inflation" or "credit score".`);
        } finally {
          setIsLoading(false);
        }
      } else {
        addMessage("assistant", `I don't have a concept matching **"${trimmed}"** in my knowledge base.\n\nTry: *inflation, interest rate, EMI, credit score, SIP, mutual fund, stock market, IPO, gold, compound interest, simple interest, loans, credit card, currency exchange, time value of money, central bank*\n\nFor live market data, try: **100 usd to inr** or **gold silver rate today**.\n\nOr type **topics** to browse all concepts.\n\n💡 Connect Gemini, Groq, or Ollama in **Settings** for broader Q&A!`);
        setIsLoading(false);
      }
      return;
    }

    // We have a concept
    if (SOCIAL_CONCEPT_IDS.has(concept.id)) {
      setIsLoading(true);
      await wait(500);
      addMessage("assistant", getSocialReply(concept));
      setIsLoading(false);
      return;
    }

    if (settings.provider === "none") {
      // Offline mode
      await wait(getThinkingDelayMs(mode, concept));
      const answer = getLocalAnswer(concept, mode, cleaned);
      const related = concept.related_topics.map(id => CONCEPTS[id]?.name).filter(Boolean).join(", ");
      addMessage("assistant", `**${concept.name}**\n\n${answer}\n\n---\n📖 **Related:** ${related}\n\n💡 _Use backend-connected provider in Settings for richer, conversational explanations!_`);
      setIsLoading(false);
      return;
    }

    try {
      await wait(getThinkingDelayMs(mode, concept));
      const history = [...conversationHistory.current.slice(-8), { role: "user", content: trimmed }];
      const reply = await callBackendLlm(settings.provider, history, concept, mode, getActiveProviderApiKey(), getActiveProviderModel(), getActiveProviderUrl());
      addMessage("assistant", reply);
    } catch (e) {
      const fallback = getLocalAnswer(concept, mode, cleaned);
      addMessage("assistant", `⚠️ _${e.message} — falling back to local knowledge._\n\n${concept.name}\n\n${fallback}`);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, settings, apiStatus]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^---$/gm, '<hr/>')
      .replace(/^#{1,3} (.+)$/gm, '<strong class="heading">$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  const quickAsk = (text) => { sendMessage(text); inputRef.current?.focus(); };

  const difficultyColor = { 1: "#10b981", 2: "#f59e0b", 3: "#ef4444" };
  const T = theme === "dark" ? {
    bg: "#0a0a0f", headerBg: "#0f0f18", headerBorder: "#1e1e2e",
    msgBg: "#141420", msgBorder: "#1e1e2e", inputBg: "#141420", inputBorder: "#2a2a3a",
    text: "#e8e0d0", textSub: "#d8d0c0", textMuted: "#888", textFaint: "#555",
    userMsgBg: "rgba(244,198,83,0.12)", userMsgBorder: "rgba(244,198,83,0.25)", userMsgText: "#f0e8d0",
    chipBg: "rgba(255,255,255,0.04)", chipBorder: "#2a2a3a", chipText: "#888",
    accent: "#f4c653", accentDim: "rgba(244,198,83,0.1)", accentBorder: "rgba(244,198,83,0.25)",
    modalBg: "#0f0f18", modalBorder: "#2a2a3a", overlay: "rgba(0,0,0,0.85)",
    topicBg: "#141420", topicBorder: "#2a2a3a",
    scrollThumb: "#333", inputText: "#e8e0d0", inputPlaceholder: "#555",
    settingsBtnBg: "rgba(255,255,255,0.05)", settingsBtnBorder: "#2a2a3a", settingsBtnText: "#aaa",
    pillActiveBg: "rgba(244,198,83,0.1)", pillActiveBorder: "#f4c653", pillActiveText: "#f4c653",
    pillBg: "transparent", pillBorder: "#2a2a3a", pillText: "#666",
    footerText: "#444", blockquoteColor: "#c8b89a", codeColor: "#f4c653", emColor: "#a8c4a2",
    infoBg: "rgba(244,198,83,0.06)", infoBorder: "rgba(244,198,83,0.2)", infoText: "#c8b89a",
  } : {
    bg: "#f7f5f0", headerBg: "#ffffff", headerBorder: "#e8e2d8",
    msgBg: "#ffffff", msgBorder: "#ede8e0", inputBg: "#ffffff", inputBorder: "#d8d0c4",
    text: "#2a2016", textSub: "#3d3020", textMuted: "#7a6e60", textFaint: "#b0a898",
    userMsgBg: "rgba(180,130,20,0.08)", userMsgBorder: "rgba(180,130,20,0.2)", userMsgText: "#2a2016",
    chipBg: "rgba(0,0,0,0.04)", chipBorder: "#ddd8ce", chipText: "#7a6e60",
    accent: "#b87e0a", accentDim: "rgba(184,126,10,0.08)", accentBorder: "rgba(184,126,10,0.2)",
    modalBg: "#ffffff", modalBorder: "#ddd8ce", overlay: "rgba(0,0,0,0.5)",
    topicBg: "#faf8f4", topicBorder: "#ede8e0",
    scrollThumb: "#ccc8be", inputText: "#2a2016", inputPlaceholder: "#b0a898",
    settingsBtnBg: "rgba(0,0,0,0.04)", settingsBtnBorder: "#ddd8ce", settingsBtnText: "#7a6e60",
    pillActiveBg: "rgba(184,126,10,0.1)", pillActiveBorder: "#b87e0a", pillActiveText: "#b87e0a",
    pillBg: "transparent", pillBorder: "#ddd8ce", pillText: "#9a8e80",
    footerText: "#b0a898", blockquoteColor: "#8a7e6e", codeColor: "#b87e0a", emColor: "#5a7a5a",
    infoBg: "rgba(184,126,10,0.06)", infoBorder: "rgba(184,126,10,0.2)", infoText: "#8a6e20",
  };

  const pageBackgroundImage = theme === "dark"
    ? "url('/your-gold-black-image.jpg')"
    : "radial-gradient(circle at 15% 15%, rgba(255, 244, 214, 0.8) 0%, rgba(255, 244, 214, 0) 35%), radial-gradient(circle at 88% 12%, rgba(214, 234, 255, 0.75) 0%, rgba(214, 234, 255, 0) 38%), linear-gradient(135deg, #fffdfa 0%, #f8f3e8 44%, #f2e9d7 100%)";

  const pageBackgroundAttachment = theme === "dark" ? "fixed" : "scroll";

  return (
    <div style={{
      fontFamily: "'Crimson Pro', 'Georgia', serif",
      background: T.bg,
      backgroundImage: pageBackgroundImage,
      backgroundSize: "cover",
      backgroundAttachment: pageBackgroundAttachment,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      textAlign: "left",
      color: T.text,
      transition: "background 0.3s, color 0.3s"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${T.scrollThumb}; border-radius: 2px; }
        .msg-content strong { color: ${T.accent}; font-weight: 600; }
        .msg-content { text-align: left; }
        .msg-content em { color: ${T.emColor}; font-style: italic; }
        .msg-content code { font-family: 'JetBrains Mono', monospace; background: ${T.accentDim}; padding: 1px 5px; border-radius: 3px; font-size: 0.85em; color: ${T.codeColor}; }
        .msg-content blockquote { border-left: 3px solid ${T.accent}; padding-left: 12px; margin: 6px 0; color: ${T.blockquoteColor}; font-style: italic; }
        .msg-content hr { border: none; border-top: 1px solid ${T.msgBorder}; margin: 12px 0; }
        .msg-content .heading { display: block; margin-top: 12px; color: ${T.accent}; font-size: 1.05em; letter-spacing: 0.02em; }
        .chip:hover { opacity: 0.75; transform: translateY(-1px); }
        .send-btn:hover:not(:disabled) { background: ${T.accent} !important; color: ${T.bg} !important; }
        .topic-card:hover { border-color: ${T.accent} !important; background: ${T.accentDim} !important; }
        .close-btn:hover { opacity: 1 !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes quotePop {
          0% { opacity: 0.2; transform: translateY(-8px) scale(0.96); }
          55% { opacity: 1; transform: translateY(0) scale(1.03); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes quoteShimmer {
          0% { left: -35%; }
          100% { left: 120%; }
        }
        .msg-animate { animation: slideIn 0.25s ease; }
        .quote-celebrate {
          position: relative;
          overflow: hidden;
          animation: quotePop 0.75s ease;
        }
        .quote-celebrate::after {
          content: "";
          position: absolute;
          top: -20%;
          left: -35%;
          width: 30%;
          height: 140%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.38), transparent);
          animation: quoteShimmer 1.5s ease;
          pointer-events: none;
        }
        textarea { outline: none !important; }
        input { outline: none !important; }
        a { color: ${T.accent}; }
      `}</style>

      {/* Header */}
      <div style={{ background: T.headerBg, borderBottom: `1px solid ${T.headerBorder}`, padding: isMobile ? "12px 12px" : "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, transition: "background 0.3s", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}><SenseiIcon size={28} /></div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: "1.4rem", fontWeight: 600, color: T.accent, letterSpacing: "-0.01em" }}>Finance Sensei</div>
            <div style={{ fontSize: "0.72rem", color: T.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>FINANCIAL EDUCATION · NOT ADVICE</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", overflowX: isMobile ? "auto" : "visible", whiteSpace: isMobile ? "nowrap" : "normal", paddingBottom: isMobile ? 2 : 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: apiStatus === "ok" ? "#10b981" : "#aaa", boxShadow: apiStatus === "ok" ? "0 0 6px #10b981" : "none", flexShrink: 0 }} title={apiStatus === "ok" ? "API connected — richer explanations active" : "Offline mode — full knowledge base available"} />
          <button
            onClick={() => setIsSidebarOpen(true)}
            title="Open Treasury Tools (Insights). Press Esc to close."
            style={{ background: "#f59e0b", color: "#000", border: "none", padding: "5px 12px", borderRadius: 6, fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Crimson Pro', serif" }}
          >
            📊 Treasury Tools
          </button>
          <button onClick={toggleTheme} style={{ background: T.settingsBtnBg, border: `1px solid ${T.settingsBtnBorder}`, color: T.settingsBtnText, padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: "0.9rem" }} title="Toggle light/dark">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button onClick={() => setShowTopics(true)} style={{ background: T.accentDim, border: `1px solid ${T.accentBorder}`, color: T.accent, padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Crimson Pro', serif" }}>Topics</button>
          <button onClick={() => setShowSettings(true)} style={{ background: T.settingsBtnBg, border: `1px solid ${T.settingsBtnBorder}`, color: T.settingsBtnText, padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Crimson Pro', serif" }}>⚙ Settings</button>
        </div>
      </div>

      {quoteOfDay && (
        <div style={{ width: "100%", maxWidth: 780, margin: "8px auto 0", padding: "0 16px" }}>
          <div className={celebrateQuote ? "quote-celebrate" : ""} style={{ background: T.infoBg, border: `1px solid ${T.infoBorder}`, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: "0.72rem", color: T.accent, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>QUOTE OF THE DAY ✨</div>
            <div style={{ fontSize: "0.9rem", color: T.textSub, lineHeight: 1.5, fontStyle: "italic" }}>
              "{quoteOfDay.text}"
            </div>
            <div style={{ fontSize: "0.76rem", color: T.textMuted, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>- {quoteOfDay.author || "Unknown"}</div>
          </div>
        </div>
      )}

      {/* Chat */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 780, width: "100%", margin: "0 auto" }}>
        {messages.map((msg) => (
          <div key={msg.id} className="msg-animate" style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg,#f4c653,#e8973a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, marginTop: 1 }}><SenseiIcon size={26} /></div>
            )}
            {msg.role === "user" && (
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: theme === "dark" ? "#24354f" : "#d8c8ae", border: `1px solid ${theme === "dark" ? "#3f5a81" : "#b79d78"}`, color: theme === "dark" ? "#e7f0ff" : "#4a3722", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 4, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>YOU</div>
            )}
            <div style={{ maxWidth: "82%" }}>
              {msg.role !== "user" && (
                <div style={{ fontSize: "0.68rem", color: theme === "dark" ? "#c7d4f5" : "#6c5b4a", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace", textAlign: "left", letterSpacing: "0.06em", fontWeight: 600 }}>
                  FINANCE SENSEI
                </div>
              )}
              <div style={{
                background: msg.role === "user" ? T.userMsgBg : T.msgBg,
                border: `1px solid ${msg.role === "user" ? T.userMsgBorder : T.msgBorder}`,
                borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                padding: "12px 16px",
                fontSize: "0.95rem",
                lineHeight: 1.65,
                textAlign: "left",
                color: msg.role === "user" ? T.userMsgText : T.textSub,
                boxShadow: theme === "light" ? "0 1px 4px rgba(0,0,0,0.06)" : "none"
              }}>
                <div className="msg-content" dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                <div style={{ fontSize: "0.68rem", color: T.textFaint, marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f4c653,#e8973a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}><SenseiIcon size={15} /></div>
            <div style={{ background: T.msgBg, border: `1px solid ${T.msgBorder}`, borderRadius: "4px 16px 16px 16px", padding: "14px 18px", display: "flex", gap: 6, alignItems: "center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent, animation: `pulse 1.2s ease ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick chips */}
      <div style={{ maxWidth: 780, width: "100%", margin: "0 auto", padding: "0 16px 8px" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["100 usd to inr", "gold silver rate", "inflation", "eli5 EMI", "deep dive SIP", "stock market"].map(q => (
            <button key={q} className="chip" onClick={() => quickAsk(q)} style={{ background: T.chipBg, border: `1px solid ${T.chipBorder}`, color: T.chipText, padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontSize: "0.78rem", fontFamily: "'Crimson Pro', serif", transition: "all 0.15s" }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ maxWidth: 780, width: "100%", margin: "0 auto", padding: isMobile ? "8px 12px 14px" : "8px 16px 16px" }}>
        <div style={{ display: "flex", gap: 8, background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 12, padding: isMobile ? "10px 8px 10px 12px" : "10px 8px 10px 14px", alignItems: "center", boxShadow: theme === "light" ? "0 2px 8px rgba(0,0,0,0.08)" : "none" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDERS[placeholderIndex]}
            rows={1}
            style={{ flex: 1, background: "transparent", border: "none", color: T.inputText, fontSize: isMobile ? "0.92rem" : "0.95rem", fontFamily: "'Crimson Pro', serif", lineHeight: 1.45, resize: "none", minHeight: 30, maxHeight: 110, textAlign: "left", paddingTop: 4, paddingBottom: 2 }}
          />
          <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || isLoading}
            style={{ background: input.trim() ? T.accentDim : "transparent", border: `1px solid ${input.trim() ? T.accentBorder : T.inputBorder}`, color: input.trim() ? T.accent : T.textFaint, width: 36, height: 36, borderRadius: 8, cursor: input.trim() ? "pointer" : "default", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}>
            ↑
          </button>
        </div>
        <div style={{ fontSize: "0.7rem", color: T.footerText, textAlign: "center", marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>Finance Sensei can make mistakes. Cross-check important decisions with trusted sources.</div>
      </div>

      {/* First-visit disclaimer */}
      {showDisclaimer && (
        <div style={{ position: "fixed", inset: 0, background: T.overlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120, padding: 20 }}>
          <div style={{ background: T.modalBg, border: `1px solid ${T.modalBorder}`, borderRadius: 16, width: "100%", maxWidth: 560, padding: 24, boxShadow: "0 24px 70px rgba(0,0,0,0.35)" }}>
            <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: "1.5rem", color: T.accent, fontWeight: 600, marginBottom: 8 }}>Before You Continue</div>
            <div style={{ color: T.textSub, lineHeight: 1.6, fontSize: "0.95rem", marginBottom: 12 }}>
              Finance Sensei is for learning and may occasionally be wrong, outdated, or incomplete.
            </div>
            <div style={{ color: T.textSub, lineHeight: 1.6, fontSize: "0.9rem", marginBottom: 18 }}>
              Cross-check prices, rates, and decisions with official or trusted sources before acting, especially for trades, loans, and investments.
            </div>
            <button
              onClick={acknowledgeDisclaimer}
              style={{ width: "100%", background: "linear-gradient(135deg,#f4c653,#e8973a)", color: "#0a0a0f", border: "none", borderRadius: 10, padding: "12px 14px", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontWeight: 700, fontSize: "0.98rem" }}
            >
              I Understand, Continue
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 95 }}
        />
      )}

      {/* Treasury Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "min(420px, 92vw)",
          height: "100vh",
          background: theme === "dark" ? "#0f0f18" : "#ffffff",
          borderLeft: `1px solid ${T.modalBorder}`,
          transform: isSidebarOpen ? "translateX(0)" : "translateX(105%)",
          transition: "transform 0.25s ease",
          zIndex: 100,
          padding: "18px 14px 20px",
          overflowY: "auto"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ color: T.accent, margin: 0, fontFamily: "'Crimson Pro', serif" }}>Insights</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{ color: T.text, background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <GlobalMarkets />
        <div style={{ height: "14px" }} />
        <AssetAllocation />
      </aside>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: "fixed", inset: 0, background: T.overlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: T.modalBg, border: `1px solid ${T.modalBorder}`, borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: "1.3rem", color: T.accent, fontWeight: 600 }}>⚙ Settings</div>
              <button className="close-btn" onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: "1.3rem", opacity: 0.7, transition: "opacity 0.15s" }}>✖</button>
            </div>

            {/* API framing notice */}
            <div style={{ background: T.infoBg, border: `1px solid ${T.infoBorder}`, borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
              <div style={{ fontSize: "0.82rem", color: T.infoText, lineHeight: 1.5 }}>
                💡 <strong style={{ color: T.accent }}>API is optional.</strong> Finance Sensei works fully offline. For richer chat, choose a provider below and add your key. <em>Keys are kept in backend memory for this browser session and auto-cleared on refresh.</em>
              </div>
            </div>

            {/* Theme toggle */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.82rem", color: T.textMuted, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>APPEARANCE</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["dark", "light"].map(t => (
                  <button key={t} onClick={() => { setTheme(t); localStorage.setItem("fs_theme", t); }}
                    style={{ flex: 1, padding: "9px", borderRadius: 8, border: `1px solid ${theme === t ? T.accent : T.modalBorder}`, background: theme === t ? T.accentDim : "transparent", color: theme === t ? T.accent : T.textMuted, cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Crimson Pro', serif", transition: "all 0.15s" }}>
                    {t === "dark" ? "🌙 Dark" : "☀️ Light"}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider selection */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.82rem", color: T.textMuted, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>LLM PROVIDER</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { id: "none", label: "📖 Offline", sub: "No API needed" },
                  { id: "gemini", label: "✦ Gemini", sub: "Google · Free tier" },
                  { id: "groq", label: "⚡ Groq", sub: "Cloud · Free · Fast" },
                  { id: "ollama", label: "🦙 Ollama", sub: "Local or self-hosted" },
                  { id: "other", label: "🧩 Other API", sub: "OpenAI-compatible" },
                ].map(p => (
                  <button key={p.id} onClick={() => setSettings(s => ({ ...s, provider: p.id }))}
                    style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${settings.provider === p.id ? T.accent : T.modalBorder}`, background: settings.provider === p.id ? T.accentDim : "transparent", color: settings.provider === p.id ? T.accent : T.textMuted, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div style={{ fontSize: "0.88rem", fontFamily: "'Crimson Pro', serif", fontWeight: 600 }}>{p.label}</div>
                    <div style={{ fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace", opacity: 0.7, marginTop: 2 }}>{p.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {settings.provider === "gemini" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.82rem", color: T.textMuted, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>GEMINI API KEY</label>
                <input
                  type="password"
                  value={settings.geminiApiKey}
                  onChange={e => setSettings(s => ({ ...s, geminiApiKey: e.target.value }))}
                  placeholder="AIza..."
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.modalBorder}`, borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: "0.9rem", fontFamily: "'JetBrains Mono', monospace" }}
                />
                <div style={{ fontSize: "0.72rem", color: T.textFaint, marginTop: 4 }}>Your key is used by backend requests for this app session.</div>
              </div>
            )}

            {settings.provider === "groq" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.82rem", color: T.textMuted, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>GROQ API KEY</label>
                <input
                  type="password"
                  value={settings.groqApiKey}
                  onChange={e => setSettings(s => ({ ...s, groqApiKey: e.target.value }))}
                  placeholder="gsk_..."
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.modalBorder}`, borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: "0.9rem", fontFamily: "'JetBrains Mono', monospace" }}
                />
                <div style={{ fontSize: "0.72rem", color: T.textFaint, marginTop: 4 }}>Your key is used by backend requests for this app session.</div>
              </div>
            )}

            {settings.provider === "ollama" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.82rem", color: T.textMuted, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>OLLAMA URL</label>
                <input value={settings.ollamaUrl} onChange={e => setSettings(s => ({ ...s, ollamaUrl: e.target.value }))}
                  placeholder="http://localhost:11434"
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.modalBorder}`, borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: "0.9rem", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }} />
                <label style={{ display: "block", fontSize: "0.82rem", color: T.textMuted, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>MODEL NAME</label>
                <input value={settings.ollamaModel} onChange={e => setSettings(s => ({ ...s, ollamaModel: e.target.value }))}
                  placeholder="llama3"
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.modalBorder}`, borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: "0.9rem", fontFamily: "'JetBrains Mono', monospace" }} />
                <div style={{ fontSize: "0.72rem", color: T.textFaint, marginTop: 4 }}>Local: keep URL as localhost. Self-hosted VPS: change URL to your server. Models: llama3, mistral, phi3, gemma...</div>
              </div>
            )}

            {settings.provider === "other" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.82rem", color: T.textMuted, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>OTHER API BASE URL</label>
                <input
                  value={settings.otherApiUrl}
                  onChange={e => setSettings(s => ({ ...s, otherApiUrl: e.target.value }))}
                  placeholder="https://api.openai.com"
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.modalBorder}`, borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: "0.9rem", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}
                />

                <label style={{ display: "block", fontSize: "0.82rem", color: T.textMuted, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>OTHER API KEY</label>
                <input
                  type="password"
                  value={settings.otherApiKey}
                  onChange={e => setSettings(s => ({ ...s, otherApiKey: e.target.value }))}
                  placeholder="sk-..."
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.modalBorder}`, borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: "0.9rem", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}
                />

                <label style={{ display: "block", fontSize: "0.82rem", color: T.textMuted, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>OTHER API MODEL</label>
                <input
                  value={settings.otherApiModel}
                  onChange={e => setSettings(s => ({ ...s, otherApiModel: e.target.value }))}
                  placeholder="gpt-4o-mini"
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.modalBorder}`, borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: "0.9rem", fontFamily: "'JetBrains Mono', monospace" }}
                />

                <div style={{ fontSize: "0.72rem", color: T.textFaint, marginTop: 4 }}>
                  Uses OpenAI-compatible <strong>/v1/chat/completions</strong> format.
                </div>
              </div>
            )}

            {settings.provider === "none" && (
              <div style={{ background: T.infoBg, border: `1px solid ${T.infoBorder}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: "0.85rem", color: T.infoText }}>📖 Offline mode enabled: ask for explanations, analogies, and practical examples anytime — no internet or API key required.</div>
              </div>
            )}

            <button onClick={saveSettings} style={{ width: "100%", background: "linear-gradient(135deg,#f4c653,#e8973a)", color: "#0a0a0f", border: "none", borderRadius: 8, padding: "11px", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: "1rem", fontWeight: 600, letterSpacing: "0.02em" }}>
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Topics Modal */}
      {showTopics && (
        <div style={{ position: "fixed", inset: 0, background: T.overlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: T.modalBg, border: `1px solid ${T.modalBorder}`, borderRadius: 16, padding: 24, width: "100%", maxWidth: 640, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: "1.3rem", color: T.accent, fontWeight: 600 }}>📖 All Concepts</div>
              <button className="close-btn" onClick={() => setShowTopics(false)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: "1.3rem", opacity: 0.7, transition: "opacity 0.15s" }}>✖</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
              {Object.values(CONCEPTS).sort((a, b) => a.difficulty - b.difficulty).map(c => (
                <button key={c.id} className="topic-card" onClick={() => { setShowTopics(false); quickAsk(c.name); }}
                  style={{ background: T.topicBg, border: `1px solid ${T.topicBorder}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <div style={{ fontSize: "0.88rem", color: T.text, fontFamily: "'Crimson Pro', serif", marginBottom: 6, lineHeight: 1.3 }}>{c.name}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.68rem", background: CATEGORY_COLORS[c.category] + "22", color: CATEGORY_COLORS[c.category], padding: "2px 7px", borderRadius: 10, fontFamily: "'JetBrains Mono', monospace" }}>{c.category}</span>
                    <span style={{ fontSize: "0.68rem", color: difficultyColor[c.difficulty], fontFamily: "'JetBrains Mono', monospace" }}>{"● ".repeat(c.difficulty)}</span>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {Object.entries(CATEGORY_COLORS).map(([cat, col]) => (
                <span key={cat} style={{ fontSize: "0.72rem", color: col, fontFamily: "'JetBrains Mono', monospace" }}>■ {cat}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}