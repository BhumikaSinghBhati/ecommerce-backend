import { Request, Response } from "express";
import Cart from "../models/cart.model";
import Product from "../models/product.model";
import redisClient from "../config/redis";

/* =====================
   ADD TO CART
===================== */
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    const cartKey = `cart:${userId}`;

    // 🔥 HINCRBY automatically adds field if not exists
    await redisClient.hIncrBy(cartKey, productId, quantity);

    res.json({ message: "Item added to cart" });
  } catch {
    res.status(500).json({ message: "Add to cart failed" });
  }
};
/* =====================
   GET CART (CACHE FIRST)
===================== */
/* =====================
   GET CART
===================== */
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const cartKey = `cart:${userId}`;

    const cartItems = await redisClient.hGetAll(cartKey);

    if (!cartItems || Object.keys(cartItems).length === 0) {
      return res.json({ items: [], totalAmount: 0 });
    }

    const productIds = Object.keys(cartItems);

    const products = await Product.find({
      _id: { $in: productIds },
    });

    let totalAmount = 0;

    const items = products.map((product) => {
      const quantity = Number(cartItems[product._id.toString()]);
      const subtotal = quantity * product.price;

      totalAmount += subtotal;

      return {
        product,
        quantity,
        price: product.price,
        subtotal,
      };
    });

    res.json({
      items,
      totalAmount,
    });
  } catch {
    res.status(500).json({ message: "Fetch cart failed" });
  }
};

/* =====================
   UPDATE QUANTITY
===================== */
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { productId, quantity } = req.body;

    const cartKey = `cart:${userId}`;

    if (quantity <= 0) {
      await redisClient.hDel(cartKey, productId);
    } else {
      await redisClient.hSet(cartKey, productId, quantity);
    }

    res.json({ message: "Cart updated" });
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
};


/* =====================
   REMOVE ITEM
===================== */
export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { productId } = req.params;

    const cartKey = `cart:${userId}`;

    await redisClient.hDel(cartKey, productId);

    res.json({ message: "Item removed" });
  } catch {
    res.status(500).json({ message: "Remove failed" });
  }
};


/* =====================
   CLEAR CART
===================== */
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    await redisClient.del(`cart:${userId}`);

    res.json({ message: "Cart cleared" });
  } catch {
    res.status(500).json({ message: "Clear failed" });
  }
};
