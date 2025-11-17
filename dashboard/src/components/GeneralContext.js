import React, { useState } from "react";

import BuyActionWindow from "./BuyActionWindow";
import SellActionWindow from "./SellActionWindow";

// 1. FIX: Define that openBuyWindow takes 'price'
const GeneralContext = React.createContext({
  showBuyWindow: false,
  showSellWindow: false,
  openBuyWindow: (uid, price) => {}, // <-- FIX
  closeBuyWindow: () => {},
  openSellWindow: (uid) => {}, // This is correct
  closeSellWindow: () => {},
});

export const GeneralContextProvider = (props) => {
  const [showBuyWindow, setShowBuyWindow] = useState(false);
  const [showSellWindow, setShowSellWindow] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);
  
  // 2. FIX: Add state to hold the price for the Buy window
  const [selectedStockPrice, setSelectedStockPrice] = useState(null);

  // 3. FIX: Update handler to accept and set 'price'
  const handleOpenBuyWindow = (uid, price) => {
    setSelectedStockId(uid);
    setSelectedStockPrice(price); // <-- FIX
    setShowBuyWindow(true);
  };

  const handleCloseBuyWindow = () => {
    setShowBuyWindow(false);
    setSelectedStockId(null);
    setSelectedStockPrice(null); // <-- FIX (reset the price)
  };

  // 4. This is correct (no price)
  const handleOpenSellWindow = (uid) => {
    setSelectedStockId(uid);
    setShowSellWindow(true);
  };

  const handleCloseSellWindow = () => {
    setShowSellWindow(false);
    setSelectedStockId(null);
  };

  return (
    <GeneralContext.Provider
      value={{
        showBuyWindow,
        showSellWindow,
        openBuyWindow: handleOpenBuyWindow,
        closeBuyWindow: handleCloseBuyWindow,
        openSellWindow: handleOpenSellWindow,
        closeSellWindow: handleCloseSellWindow,
      }}
    >
      {props.children}

      {/* 5. FIX: Pass 'price' prop to BuyActionWindow
           AND add check to prevent crash */}
      {showBuyWindow && typeof selectedStockPrice === "number" && (
        <BuyActionWindow uid={selectedStockId} price={selectedStockPrice} />
      )}

      {/* 6. This is correct (no price prop) */}
      {showSellWindow && <SellActionWindow uid={selectedStockId} />}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;