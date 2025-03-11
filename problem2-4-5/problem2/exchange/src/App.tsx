import React, { useState, useEffect } from 'react';
import './App.css';

type PricesMap = {
  [symbol: string]: number;
};

function getTokenIconUrl(token: string): string {
  try {
    return new URL(`./assets/tokens/${token}.svg`, import.meta.url).href;
  } catch {
    return new URL('./assets/tokens/fallback.svg', import.meta.url).href;
  }
}

const App: React.FC = () => {
  const [pricesMap, setPricesMap] = useState<PricesMap>({});
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');

  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectionSide, setSelectionSide] = useState<'from' | 'to' | null>(null);

  // Light/Dark theme toggle (optional, if you have that feature)
  const [darkMode, setDarkMode] = useState(false);

  // Fetch prices from JSON once
  useEffect(() => {
    fetch('https://interview.switcheo.com/prices.json')
      .then((res) => res.json())
      .then((data: any[]) => {
        const map: PricesMap = {};
        data.forEach((item) => {
          map[item.currency] = item.price;
        });
        setPricesMap(map);
      })
      .catch((err) => {
        console.error('Error fetching prices:', err);
        alert('Failed to load prices.json. See console for details.');
      });
  }, []);

  useEffect(() => {
    if (pricesMap[fromToken] && pricesMap[toToken]) {
      const fromVal   = parseFloat(inputAmount) || 0;
      const fromPrice = pricesMap[fromToken];
      const toPrice   = pricesMap[toToken];
      const ratio     = fromPrice / toPrice;
      setOutputAmount((fromVal * ratio).toFixed(6));
    }
  }, [fromToken, toToken, inputAmount, pricesMap]);

  const handleChangeInputAmount = (value: string) => {
    setInputAmount(value);
  };

  // If user updates "to" amount => recalc "from"
  const handleChangeOutputAmount = (value: string) => {
    setOutputAmount(value);
    if (pricesMap[fromToken] && pricesMap[toToken]) {
      const outVal    = parseFloat(value) || 0;
      const fromPrice = pricesMap[fromToken];
      const toPrice   = pricesMap[toToken];
      const ratio     = fromPrice / toPrice; // from → to
      const fromVal   = outVal / ratio;      // invert ratio
      setInputAmount(fromVal.toFixed(6));
    }
  };

  // Switch "From" and "To"
  const switchTokens = () => {
    // Swap the tokens
    const oldFrom = fromToken;
    const oldTo   = toToken;
    setFromToken(oldTo);
    setToToken(oldFrom);

    // Swap the amounts
    const oldIn  = inputAmount;
    const oldOut = outputAmount;
    setInputAmount(oldOut);
    setOutputAmount(oldIn);
  };

  const confirmSwap = () => {
    const fromAmt = parseFloat(inputAmount) || 0;
    const toAmt   = parseFloat(outputAmount) || 0;
    if (fromAmt <= 0 || toAmt <= 0) {
      alert('Please enter valid amounts to swap.');
      return;
    }
    alert(`Swapping ${fromAmt} ${fromToken} for ${toAmt} ${toToken}...`);
  };

  // Modal logic
  const openModal = (side: 'from' | 'to') => {
    setSelectionSide(side);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectionSide(null);
  };
  const handleSelectToken = (token: string) => {
    if (selectionSide === 'from') {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    closeModal();
  };

  // Theme toggle logic (if you have that feature)
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Display exchange rate
  let exchangeRateText = 'Price data unavailable';
  if (pricesMap[fromToken] && pricesMap[toToken]) {
    const ratio = pricesMap[fromToken] / pricesMap[toToken];
    exchangeRateText = `1 ${fromToken} = ${ratio.toFixed(6)} ${toToken}`;
  }

  const allTokens   = Object.keys(pricesMap).sort();
  const fromIconUrl = getTokenIconUrl(fromToken);
  const toIconUrl   = getTokenIconUrl(toToken);

  return (
    <div className={`app-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <header>
        <div className="header-content">
          <div className="logo">MyDEX</div>
          <button className="connect-wallet-btn">Connect Wallet</button>

          {/* If you have a theme switch */}
          <div className="theme-switcher">
            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={toggleDarkMode}
              />
              <span className="slider round" />
            </label>
          </div>
        </div>
      </header>

      <main>
        <div className="swap-card">
          <h2>Swap</h2>

          {/* From row */}
          <div className="swap-input-container">
            <label>From</label>
            <div className="token-row">
              <div className="token-selector" onClick={() => openModal('from')}>
                <img
                  src={fromIconUrl}
                  className="token-icon"
                  alt={`icon for ${fromToken}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      getTokenIconUrl('fallback');
                  }}
                />
                <span>{fromToken}</span>
                <span className="arrow-down">▼</span>
              </div>
              <input
                type="number"
                placeholder="0.0"
                value={inputAmount}
                onChange={(e) => handleChangeInputAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Switch button in the middle! */}
          <div className="switch-tokens-container">
            <button className="switch-button" onClick={switchTokens}>
              &#x21C5; {/* The up/down arrow character */}
            </button>
          </div>

          {/* To row */}
          <div className="swap-input-container">
            <label>To</label>
            <div className="token-row">
              <div className="token-selector" onClick={() => openModal('to')}>
                <img
                  src={toIconUrl}
                  className="token-icon"
                  alt={`icon for ${toToken}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      getTokenIconUrl('fallback');
                  }}
                />
                <span>{toToken}</span>
                <span className="arrow-down">▼</span>
              </div>
              <input
                type="number"
                placeholder="0.0"
                value={outputAmount}
                onChange={(e) => handleChangeOutputAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Exchange rate */}
          <div className="exchange-rate-info">
            <span>{exchangeRateText}</span>
          </div>

          {/* Confirm Button */}
          <button className="swap-button" onClick={confirmSwap}>
            CONFIRM SWAP
          </button>
        </div>
      </main>

      <footer>
        <div className="footer-content">
          ©2025 MyDEX. All rights reserved.
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Select a Token</h2>
            <div className="token-list">
              {allTokens.map((tk) => {
                const iconUrl = getTokenIconUrl(tk);
                return (
                  <div key={tk} onClick={() => handleSelectToken(tk)}>
                    <img
                      src={iconUrl}
                      alt={tk}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          getTokenIconUrl('fallback');
                      }}
                    />
                    {tk}
                  </div>
                );
              })}
            </div>
            <button className="close-modal" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
