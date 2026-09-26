import { Router } from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { listMaterials, uploadMaterial } from "../controllers/materialController.js";

const router = Router();

router.post("/upload", auth, upload.none(), uploadMaterial);
router.get("/", auth, listMaterials);

export default router;
