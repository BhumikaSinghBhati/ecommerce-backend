import { Router } from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller";

import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, addToCart);
router.get("/", protect, getCart);
router.put("/", protect, updateCartItem);
router.delete("/:productId", protect, removeCartItem);
router.delete("/", protect, clearCart);

export default router;
