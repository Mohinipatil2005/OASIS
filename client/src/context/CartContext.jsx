import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          let normalizedSize = item.size;
          if (normalizedSize === '12in' || normalizedSize === '14in' || normalizedSize === '10in' || !['Small', 'Medium', 'Large'].includes(normalizedSize)) {
            normalizedSize = 'Medium';
          }
          return {
            ...item,
            size: normalizedSize,
            price: Number(item.price) || 299,
            quantity: Number(item.quantity) || 1
          };
        });
      }
      return [];
    } catch (e) {
      console.error('Error parsing cart from localStorage:', e);
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    const saved = localStorage.getItem('coupon');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('coupon');
    }
  }, [coupon]);

  const addToCart = (newItem) => {
    // Find if item already exists in cart (matching ID, size, and customizations)
    const existingItemIndex = cartItems.findIndex((item) => {
      if (item.isCustomized !== newItem.isCustomized) return false;
      
      if (newItem.isCustomized) {
        // Compare custom pizza configurations
        const detailsA = item.customizationDetails;
        const detailsB = newItem.customizationDetails;
        return (
          detailsA.base === detailsB.base &&
          detailsA.sauce === detailsB.sauce &&
          detailsA.cheese === detailsB.cheese &&
          JSON.stringify(detailsA.veggies.sort()) === JSON.stringify(detailsB.veggies.sort()) &&
          JSON.stringify(detailsA.toppings.sort()) === JSON.stringify(detailsB.toppings.sort())
        );
      } else {
        // Compare standard pizza ID and size
        return item.pizza === newItem.pizza && item.size === newItem.size;
      }
    });

    if (existingItemIndex > -1) {
      setCartItems((prevItems) => {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity || 1;
        return updatedItems;
      });
      toast.success(`Updated ${newItem.name} quantity in cart.`);
    } else {
      setCartItems((prevItems) => [...prevItems, { ...newItem, quantity: newItem.quantity || 1 }]);
      toast.success(`${newItem.name} added to cart.`);
    }
  };

  const removeFromCart = (indexToRemove) => {
    const item = cartItems[indexToRemove];
    if (item) {
      toast.success(`${item.name} removed from cart.`);
    }
    setCartItems((prevItems) => prevItems.filter((_, idx) => idx !== indexToRemove));
  };

  const updateCartItemQuantity = (index, newQty) => {
    if (newQty < 1) return;
    setCartItems((prevItems) => {
      const updated = [...prevItems];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const applyCouponCode = (code) => {
    const subtotal = getSubtotal();
    const cleanCode = code.trim().toUpperCase();

    if (cleanCode === 'PIZZA50') {
      setCoupon({
        code: 'PIZZA50',
        type: 'percentage',
        value: 50
      });
      toast.success('Coupon applied: 50% discount!');
      return true;
    } else if (cleanCode === 'WELCOME100') {
      if (subtotal < 400) {
        toast.error('Minimum order subtotal for WELCOME100 is ₹400.');
        return false;
      }
      setCoupon({
        code: 'WELCOME100',
        type: 'flat',
        value: 100
      });
      toast.success('Coupon applied: ₹100 discount!');
      return true;
    } else if (cleanCode === 'FREESHIP') {
      setCoupon({
        code: 'FREESHIP',
        type: 'flat',
        value: 40
      });
      toast.success('Coupon applied: Free shipping active (₹40 off).');
      return true;
    } else {
      toast.error('Invalid coupon code.');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    toast.success('Coupon removed.');
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('coupon');
  };

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const getDiscount = () => {
    if (!coupon) return 0;
    const subtotal = getSubtotal();
    if (coupon.type === 'percentage') {
      return (subtotal * coupon.value) / 100;
    } else if (coupon.type === 'flat') {
      return Math.min(coupon.value, subtotal);
    }
    return 0;
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = getDiscount();
    return Math.max(subtotal - discount, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        coupon,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        applyCouponCode,
        removeCoupon,
        clearCart,
        subtotal: getSubtotal(),
        discount: getDiscount(),
        total: getTotal()
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
