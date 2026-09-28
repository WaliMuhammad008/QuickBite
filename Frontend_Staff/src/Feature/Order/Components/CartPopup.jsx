import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../Context/CartContext";
import "../styles/index.css";
import {
  FaTimes,
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaArrowLeft,
  FaUtensils,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { resolveImageUrl } from "../../../utils/imageOptimizer";

const CartPopup = () => {
  const navigate = useNavigate();
  const {
    isCartOpen,
    toggleCart,
    cartItems,
    removeFromCart,
    updateQty,
    placeOrder,
  } = useCart();
  const [showConfirm, setShowConfirm] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (cartId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [cartId]: !prev[cartId],
    }));
  };

  if (!isCartOpen) return null;

  const totalAmount = cartItems.reduce(
    (total, item) => total + parseFloat(item.price) * (item.qty || 1),
    0,
  );

  const confirmOrder = () => {
    placeOrder();
    setShowConfirm(false);
  };

  return (
    <div className="cart-overlay" onClick={toggleCart}>
      <div className="cart-popup" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="cart-header">
          <div className="cart-header-left">
            <div className="back-btn-box" onClick={toggleCart}>
              <FaArrowLeft size={16} />
            </div>
            <h5 className="cart-title">
              <FaShoppingCart className="cart-title-icon" /> My Order
            </h5>
          </div>
          <div className="item-count-badge">{cartItems.length} Items</div>
        </div>

        {/* BODY */}
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart-state">
              <FaUtensils className="empty-cart-icon" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={item.cartId} 
                className={`cart-item ${expandedItems[item.cartId] ? "expanded" : ""}`}
                onClick={() => toggleExpand(item.cartId)}
              >
                <div className="cart-img-box">
                  <img
                    src={resolveImageUrl(item.img || item.image, 150)}
                    alt={item.title}
                    className="cart-item-img object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/100x100?text=Food";
                    }}
                  />
                </div>

                <div className="cart-info">
                  <div className="cart-item-header">
                    <h6 className="item-title">{item.title}</h6>
                    {((item.size && item.size !== "Regular") || item.note) && (
                      <div className="expand-icon" onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(item.cartId);
                      }}>
                        {expandedItems[item.cartId] ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    )}
                  </div>

                  {((item.size && item.size !== "Regular") || item.note) && (
                    <div className="item-meta animate-slide-down">
                      {item.size && item.size !== "Regular" && (
                        <div className="item-size">
                          <span className="meta-label">Size:</span> {item.size}
                        </div>
                      )}
                      {item.note && (
                        <div className="item-note">
                          <span className="meta-label">Note:</span> "{item.note}"
                        </div>
                      )}
                    </div>
                  )}

                  <div className="price-row">
                    <span className="item-price">
                      Rs. {item.price * (item.qty || 1)}
                    </span>
                  </div>
                </div>

                <div className="cart-controls">
                  <FaTrash
                    className="delete-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(item.cartId);
                    }}
                  />
                  <div className="qty-box" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(item.cartId, -1)}
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="qty-value">{item.qty || 1}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(item.cartId, 1)}
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="total-row">
              <span className="total-label">Total Amount</span>
              <span className="total-price">Rs. {totalAmount}</span>
            </div>
            <button
              className="btn-checkout"
              onClick={() => {
                toggleCart();
                navigate("/checkout");
              }}
            >
              CHECKOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPopup;
