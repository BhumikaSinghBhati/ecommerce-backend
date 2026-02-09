import { Request, Response } from "express";
import Cart from "../models/cart.model";
import Product from "../models/product.model";

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

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price,
      });
    }

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Add to cart failed" });
  }
};

/* =====================
   GET CART
===================== */
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cart) {
      return res.json({ items: [], totalAmount: 0 });
    }

    res.json(cart);
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

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();
    res.json(cart);
  } catch {
    res.status(500).json({ message: "Update cart failed" });
  }
};

/* =====================
   REMOVE ITEM
===================== */
export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();
    res.json(cart);
  } catch {
    res.status(500).json({ message: "Remove item failed" });
  }
};

/* =====================
   CLEAR CART
===================== */
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], totalAmount: 0 }
    );

    res.json({ message: "Cart cleared" });
  } catch {
    res.status(500).json({ message: "Clear cart failed" });
  }
};
