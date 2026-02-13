import { Request, Response } from "express";
import crypto from "crypto";
import razorpay from "../config/razorpay";
import Order from "../models/order.model";

// CREATE RAZORPAY ORDER
export const createPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalAmount * 100, // INR → paise
      currency: "INR",
      receipt: `order_${order._id}`,
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: "Payment creation failed", error });
  }
};

// VERIFY PAYMENT
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        paymentStatus: "paid",
        razorpayPaymentId: razorpay_payment_id,
        status: "confirmed",
      },
      { new: true }
    );

    res.json({
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed", error });
  }
};
