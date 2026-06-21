import React, { useState } from 'react';

const ASSET_CLASSES = {
  Equity: { color: "#10b981", desc: "Stocks & Mutual Funds (High Growth)" },
  Debt: { color: "#3b82f6", desc: "FDs, Bonds, PPF (Stability)" },
  Gold: { color: "#f59e0b", desc: "SGBs, Physical Gold (Hedge)" },
  Cash: { color: "#6b7280", desc: "Emergency Fund (Liquidity)" }
};

const STRATEGIES = {
  conservative: { name: "The Monk (Conservative)", levels: { Equity: 20, Debt: 60, Gold: 10, Cash: 10 }, quip: "Peace of mind is the greatest wealth." },
  balanced: { name: "The Samurai (Balanced)", levels: { Equity: 50, Debt: 30, Gold: 10, Cash: 10 }, quip: "Balance in all things leads to victory." },
  aggressive: { name: "The Shogun (Aggressive)", levels: { Equity: 80, Debt: 10, Gold: 5, Cash: 5 }, quip: "Fortune favors the bold, but watch your flank." }
};

const STRATEGY_GUIDE = [
  {
    key: "conservative",
    title: "The Monk",
    note: "For stability-first investors who prefer lower volatility and steady progress."
  },
  {
    key: "balanced",
    title: "The Samurai",
    note: "For long-term builders seeking a practical mix of growth and safety."
  },
  {
    key: "aggressive",
    title: "The Shogun",
    note: "For high-risk takers targeting stronger growth with sharper market swings."
  }
];

const AssetAllocation = () => {
  const [activeStrategy, setActiveStrategy] = useState('balanced');
  const theme = {
    bg: "#0f172a",
    card: "#1e293b",
    text: "#f1f5f9",
    border: "#334155"
  };

  const strategy = STRATEGIES[activeStrategy];

  return (
    <div style={{ 
      background: theme.card, 
      borderRadius: '16px', 
      padding: '24px', 
      border: `1px solid ${theme.border}`,
      fontFamily: "'Inter', sans-serif",
      color: theme.text,
      maxWidth: '600px',
      margin: '20px auto'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>⚔️</span> Asset Allocation Strategy
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>"{strategy.quip}"</p>
      </div>

      {/* Strategy Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {Object.keys(STRATEGIES).map((key) => (
          <button
            key={key}
            onClick={() => setActiveStrategy(key)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              background: activeStrategy === key ? '#3b82f6' : theme.border,
              color: activeStrategy === key ? 'white' : '#94a3b8',
              transition: 'all 0.2s'
            }}
          >
            {STRATEGIES[key].name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Strategy Guide Tool */}
      <div style={{ marginBottom: '20px', display: 'grid', gap: '8px' }}>
        {STRATEGY_GUIDE.map((item) => {
          const active = item.key === activeStrategy;
          return (
            <button
              key={item.key}
              onClick={() => setActiveStrategy(item.key)}
              title={item.note}
              style={{
                textAlign: 'left',
                background: active ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? '#3b82f6' : '#334155'}`,
                borderRadius: '10px',
                padding: '10px 12px',
                color: active ? '#dbeafe' : '#cbd5e1',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.86rem', fontWeight: 700, marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{item.note}</div>
            </button>
          );
        })}
      </div>

      {/* Visual Bar */}
      <div style={{ 
        display: 'flex', 
        height: '40px', 
        borderRadius: '10px', 
        overflow: 'hidden', 
        marginBottom: '24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
      }}>
        {Object.entries(strategy.levels).map(([asset, weight]) => (
          <div 
            key={asset}
            style={{ 
              width: `${weight}%`, 
              background: ASSET_CLASSES[asset].color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              color: '#000'
            }}
            title={`${asset}: ${weight}%`}
          >
            {weight > 10 ? `${weight}%` : ''}
          </div>
        ))}
      </div>

      {/* Legend / Details */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {Object.entries(strategy.levels).map(([asset, weight]) => (
          <div key={asset} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            borderLeft: `4px solid ${ASSET_CLASSES[asset].color}`
          }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{asset}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ASSET_CLASSES[asset].desc}</div>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{weight}%</div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '12px', 
        borderRadius: '8px', 
        background: '#3b82f615', 
        fontSize: '0.8rem', 
        color: '#60a5fa',
        border: '1px dashed #3b82f650'
      }}>
        <strong>Sensei's Tip:</strong> This allocation should be rebalanced once a year. If Equity grows to 70%, sell some to bring it back to your {activeStrategy} target.
      </div>
    </div>
  );
};

export default AssetAllocation;