import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../Firebase/firebase";
import { removeFromCart, updateCartQuantity } from "../Components/cart/cartUtils";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const CartPage = ({ userId }) => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = onSnapshot(
      collection(db, `users/${userId}/cart`),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => doc.data());
        setCart(items);
      }
    );
    return () => unsubscribe();
  }, [userId]);

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleRemove = async (id) => {
    try {
      await removeFromCart(userId, id);
      toast.success("🗑️ Product removed from cart");
    } catch (err) {
      toast.error("❌ Failed to remove item", err);
    }
  };

  const handleQtyChange = async (id, qty) => {
    const newQty = parseInt(qty);
    if (newQty < 1 || isNaN(newQty)) return;
    await updateCartQuantity(userId, id, newQty);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.warning("Your cart is empty");
      return;
    }
    navigate("/checkout", { state: { cartItems: cart, total } });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2> Your Cart</h2>
      {cart.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.id}
              style={{ border: "1px solid #ddd", padding: 10, margin: 10 }}
            >
              <img src={item.image} alt={item.title} width="100" />
              <h4>{item.title}</h4>
              <p>{item.price} EGP</p>
              <input
                type="number"
                value={item.quantity}
                min={1}
                onChange={(e) => handleQtyChange(item.id, e.target.value)}
              />
              <button onClick={() => handleRemove(item.id)}>Remove</button>
            </div>
          ))}
          <h3>Total: {total.toFixed(2)} EGP</h3>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Proceed to Checkout
          </Button>
        </>
      )}
    </div>
  );
};

export default CartPage;