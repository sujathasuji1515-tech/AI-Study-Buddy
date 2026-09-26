import Material from "../models/Material.js";

export async function uploadMaterial(req, res) {
  try {
    const { title, subject, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and content are required" });

    const material = await Material.create({
      user: req.user.id,
      title,
      subject,
      content
    });

    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function listMaterials(req, res) {
  const materials = await Material.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(materials);
}
