import { Request, Response } from "express";
import Cart from "../models/cart.model";
import Order from "../models/order.model";

export const checkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;

    const orderItems = cart.items.map((item: any) => {
      totalAmount += item.product.price * item.quantity;
      return {
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      };
    });

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
    });

    // Clear cart after order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Checkout failed", error });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({ user: (req as any).user._id }).populate(
    "items.product"
  );
  res.json(orders);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
};


