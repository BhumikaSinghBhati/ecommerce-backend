import { Router } from "express";
import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", protect, createPaymentOrder);
router.post("/verify", protect, verifyPayment);

export default router;
