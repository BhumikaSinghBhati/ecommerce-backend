import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";

import { protect, adminOnly } from "../middlewares/auth.middleware";

const router = Router();

/* PUBLIC */
router.get("/", getProducts);
router.get("/:id", getProductById);

/* ADMIN */
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
