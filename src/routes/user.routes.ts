import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Profile fetched successfully",
    user: (req as any).user,
  });
});

export default router;
