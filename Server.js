const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
app.use(cors());
app.use(express.json());

const port = 3000;

// Local Mongo URI
const MONGO_URI = "mongodb://localhost:27017/recipe"; // <-- local DB

const connectDb = async () => { 
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to Local MongoDB");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
};

// Define schema & model
const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: { type: [String], required: true },
  instructions: { type: String, required: true },
});

const Recipe = mongoose.model("Recipe", recipeSchema);

// Routes
app.post("/recipe", async (req, res) => {
  try {
    const { name, ingredients, instructions } = req.body;
    const recipe = new Recipe({ name, ingredients, instructions });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/recipe", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
app.put("/recipe/:id", async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

app.get('/recipes', async (req, res) => {
  try {
    const allRecipes = await Recipe.find();
    res.json(allRecipes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
// DELETE recipe by ID
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


connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});
