import express from "express";
import cors from "cors";

const app = express();

// global middlewares
app.use(cors());
app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.send("E-commerce backend API is up");
});

export default app;
