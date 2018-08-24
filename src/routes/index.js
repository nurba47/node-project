import { Router } from "express";
const router = Router();

router.use("/api", require("./api").default);

export default router;
