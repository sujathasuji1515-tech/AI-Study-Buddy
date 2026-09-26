import { Router } from "express";
import auth from "../middleware/auth.js";
import { flashcards, quiz, studyPlan, summarize } from "../controllers/aiController.js";

const router = Router();

router.post("/summary/:id", auth, summarize);
router.post("/flashcards", auth, flashcards);
router.post("/quiz", auth, quiz);
router.post("/study-plan", auth, studyPlan);

export default router;
