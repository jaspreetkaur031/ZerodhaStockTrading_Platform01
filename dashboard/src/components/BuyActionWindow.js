import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";

// 1. Accept 'price' prop (this is the base price per stock)
const BuyActionWindow = ({ uid, price }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const generalContext = useContext(GeneralContext);

  // 2. Calculate the total price
  const totalPrice = (stockQuantity * price).toFixed(2);

  const handleBuyClick = () => {
    const numQuantity = parseFloat(stockQuantity);

    if (numQuantity <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    axios.post("http://localhost:3002/newOrder", {
      name: uid,
      qty: numQuantity,
      price: price, // Send the base price
      mode: "BUY",
    });
    generalContext.closeBuyWindow();
  };

  const handleCancelClick = () => {
    generalContext.closeBuyWindow();
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
              // 4. THIS IS THE FIX: Show the calculated 'totalPrice'
              value={totalPrice}
              readOnly // 5. Make it read-only
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        {/* 6. Show the calculated 'totalPrice' here as well */}
        <span>Margin required ₹{totalPrice}</span>
        <div>
          <Link className="btn btn-blue" onClick={handleBuyClick}>
            Buy
          </Link>
          <Link to="" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;