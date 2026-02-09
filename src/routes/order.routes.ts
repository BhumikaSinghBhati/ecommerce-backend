import express from "express";
import {
  checkout,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { protect, adminOnly } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/checkout", protect, checkout);
router.get("/my-orders", protect, getMyOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
