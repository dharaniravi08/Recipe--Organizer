const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());


const port = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/recipe";

// const connectDb = async () => {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("Connected to MongoDB");
//   } catch (err) {
//     console.error("MongoDB Connection Error:", err);
//     process.exit(1);
//   }
// };
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // no extra options needed
    console.log(" Connected to MongoDB");
  } catch (err) {
    console.error(" MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};




const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: { type: [String], required: true },
  instructions: { type: String, required: true },
});

const Recipe = mongoose.model("Recipe", recipeSchema);

// CREATE recipe
app.post("/recipe", async (req, res) => {
  try {
    const { name, ingredients, instructions } = req.body;
    if (!name || !ingredients || !instructions) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const recipe = new Recipe({ name, ingredients, instructions });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// READ all recipes
app.get("/recipe", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE recipe
app.put("/recipe/:id", async (req, res) => {
  try {
    const { name, ingredients, instructions } = req.body;
    if (!name || !ingredients || !instructions) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { name, ingredients, instructions },
      { new: true, runValidators: true }
    );
    if (!updatedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

// DELETE recipe
app.delete("/recipe/:id", async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

// Start server
connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

