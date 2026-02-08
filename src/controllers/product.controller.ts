import { Request, Response } from "express";
import Product from "../models/product.model";

/* =====================
   CREATE PRODUCT (ADMIN)
===================== */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Product creation failed", error });
  }
};

/* =====================
   GET ALL PRODUCTS
===================== */
export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({ isActive: true });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Fetching products failed" });
  }
};

/* =====================
   GET SINGLE PRODUCT
===================== */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch {
    res.status(500).json({ message: "Error fetching product" });
  }
};

/* =====================
   UPDATE PRODUCT (ADMIN)
===================== */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch {
    res.status(500).json({ message: "Product update failed" });
  }
};

/* =====================
   DELETE PRODUCT (ADMIN)
===================== */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted (soft delete)" });
  } catch {
    res.status(500).json({ message: "Product delete failed" });
  }
};
