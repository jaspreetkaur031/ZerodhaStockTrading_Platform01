import React, { useState, useContext } from "react";

import { Link } from "react-router-dom";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css"; // Re-using the same CSS

// 1. NO 'price' prop
const SellActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  // 2. Add state for price
  const [stockPrice, setStockPrice] = useState(0.0);
  const generalContext = useContext(GeneralContext);

  const handleSellClick = () => {
    const numQuantity = parseFloat(stockQuantity);
    const numPrice = parseFloat(stockPrice); // 3. Get price from state

    // 4. Validate both
    if (numQuantity <= 0 || numPrice <= 0) {
      alert("Quantity and Price must be greater than zero.");
      return;
    }

    axios.post("http://localhost:3002/newOrder", {
      name: uid,
      qty: numQuantity,
      price: numPrice, // 5. Send price from state
      mode: "SELL",
    });
    generalContext.closeSellWindow();
  };

  const handleCancelClick = () => {
    generalContext.closeSellWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
              min="1"
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              // 6. This is editable
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
              min="0.05"
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        {/* 7. Show calculated amount */}
        <span>Amount ₹{(stockQuantity * stockPrice).toFixed(2)}</span>
        <div>
          <Link className="btn btn-red" onClick={handleSellClick}>
            Sell
          </Link>
          <Link to="" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;