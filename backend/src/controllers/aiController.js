import Material from "../models/Material.js";
import Summary from "../models/Summary.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import StudyPlan from "../models/StudyPlan.js";
import { askGemini } from "../utils/gemini.js";

export async function summarize(req, res) {
  try {
    const material = await Material.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    const prompt = `Summarize this study material clearly for a student. Use headings and concise bullet points.

${material.content}`;

    const content = await askGemini(prompt);

    const saved = await Summary.create({
      user: req.user.id,
      material: material._id,
      content
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function flashcards(req, res) {
  try {
    const { materialId } = req.body;

    if (!materialId) {
      return res.status(400).json({
        message: "Material ID is required"
      });
    }

    const material = await Material.findOne({
      _id: materialId,
      user: req.user.id
    });

    if (!material) {
      return res.status(404).json({
        message: "Material not found"
      });
    }

    const prompt = `Create 10 study flashcards from the following study material.
Return JSON only as an array of objects with "question" and "answer".

Study material:

${material.content}`;

    const text = await askGemini(prompt);

    let cards;

    try {
      cards = JSON.parse(
        text.replace(/```json|```/g, "").trim()
      );
    } catch {
      cards = [
        {
          question: "Generated flashcards",
          answer: text
        }
      ];
    }

    const saved = await Flashcard.create({
      user: req.user.id,
      material: material._id,
      cards
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function quiz(req, res) {
  try {
    const { content, materialId } = req.body;

    if (!content) {
      return res.status(400).json({
        message: "Content is required"
      });
    }

    const prompt = `Create 5 multiple-choice quiz questions from this material. Return JSON only as an array of objects with "question", "options" (array of 4 strings), and "answer".

${content}`;

    const text = await askGemini(prompt);

    let questions;

    try {
      questions = JSON.parse(
        text.replace(/```json|```/g, "").trim()
      );
    } catch {
      questions = [
        {
          question: "Generated quiz",
          options: [],
          answer: text
        }
      ];
    }

    const saved = await Quiz.create({
      user: req.user.id,
      material: materialId,
      questions
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function studyPlan(req, res) {
  try {
    const { goal, days, hoursPerDay } = req.body;

    if (!goal) {
      return res.status(400).json({
        message: "Goal is required"
      });
    }

    const prompt = `Create a practical student study plan. Goal: ${goal}. Days: ${days || 7}. Hours per day: ${hoursPerDay || 1}. Include daily tasks, revision, and short breaks.`;

    const plan = await askGemini(prompt);

    const saved = await StudyPlan.create({
      user: req.user.id,
      goal,
      plan
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}