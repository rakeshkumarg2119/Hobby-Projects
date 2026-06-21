import React, { useState, useEffect } from 'react';

const GlobalMarkets = () => {
  // We start with "Base Prices" and let them fluctuate
  const [prices, setPrices] = useState({
    gold: 72450,
    silver: 88200,
    usdInr: 83.42,
    fearLevel: 65
  });

  // Sensei's Simulation Engine: Moves prices slightly every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        gold: prev.gold + (Math.random() * 20 - 10), // Moves +/- 10 Rs
        silver: prev.silver + (Math.random() * 50 - 25), // Moves +/- 25 Rs
        usdInr: parseFloat((prev.usdInr + (Math.random() * 0.04 - 0.02)).toFixed(2)),
        fearLevel: Math.min(Math.max(prev.fearLevel + (Math.random() * 4 - 2), 10), 90)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const theme = {
    bg: "#0f172a",
    card: "#1e293b",
    text: "#f1f5f9",
    gold: "#f59e0b",
    silver: "#94a3b8",
    blue: "#3b82f6",
    border: "#334155"
  };

  return (
    <div style={{ 
      background: theme.card, color: theme.text, padding: '24px', 
      borderRadius: '16px', border: `1px solid ${theme.border}`,
      maxWidth: '500px', margin: '20px auto', fontFamily: "'Inter', sans-serif" 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>🏮 Sensei's Live Watch</h3>
        <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></span>
          LIVE SIMULATION
        </span>
      </div>

      {/* PRICE GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: theme.gold, fontWeight: 'bold' }}>GOLD (10g)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>₹{prices.gold.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
        </div>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: theme.silver, fontWeight: 'bold' }}>SILVER (1kg)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>₹{prices.silver.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
        </div>
      </div>

      {/* THE FEAR METER */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
          <span>Market Fear Index</span>
          <span style={{ color: theme.gold }}>{prices.fearLevel > 70 ? 'High Panic' : 'Stable'}</span>
        </div>
        <div style={{ height: '6px', background: '#334155', borderRadius: '3px', position: 'relative' }}>
          <div style={{ 
            position: 'absolute', left: `${prices.fearLevel}%`, top: '-5px', 
            width: '16px', height: '16px', background: theme.gold, 
            borderRadius: '50%', boxShadow: `0 0 12px ${theme.gold}`,
            transition: 'left 0.5s ease-out'
          }}></div>
        </div>
      </div>

      {/* TUG OF WAR */}
      <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px' }}>
        <div style={{ fontSize: '0.8rem', marginBottom: '10px' }}>Currency Tug-of-War</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span>🇮🇳 INR</span>
          <div style={{ flex: 1, height: '2px', background: theme.border, margin: '0 10px', position: 'relative' }}>
            <div style={{ 
                position: 'absolute', 
                left: `${(prices.usdInr - 82) * 20}%`, // Logic to move the knot based on rate
                top: '-8px', fontSize: '1rem', transition: 'left 0.5s' 
            }}>🪢</div>
          </div>
          <span>USD 🇺🇸</span>
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.blue }}>$1 = ₹{prices.usdInr}</div>
      </div>

      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '20px', fontStyle: 'italic', textAlign: 'center' }}>
        "When the Rupee weakens, your local power fades, but your global value grows."
      </p>
    </div>
  );
};

export default GlobalMarkets;