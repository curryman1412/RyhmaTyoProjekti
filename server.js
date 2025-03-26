require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const port = process.env.PORT || 3000;

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Set up express-ejs-layouts
app.use(expressLayouts);
app.set("layout", "layout");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Serve static files
app.use(express.static(path.join(__dirname, "includes")));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", async (req, res) => {
  try {
    // Fetch categories from TheMealDB API
    const response = await axios.get(
      "https://www.themealdb.com/api/json/v1/1/categories.php"
    );
    const categories = response.data.categories;
    res.render("index", { categories, error: null });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.render("index", { categories: [], error: "Failed to load categories" });
  }
});

// Search routes
app.get("/search", async (req, res) => {
  try {
    const { query, type } = req.query;
    let response;

    if (type === "ingredient") {
      response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${query}`
      );
    } else {
      response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
      );
    }

    const meals = response.data.meals || [];
    res.render("search", {
      meals,
      query,
      type,
      error: null,
    });
  } catch (error) {
    console.error("Error searching recipes:", error);
    res.render("search", {
      meals: [],
      query: req.query.query,
      type: req.query.type,
      error: "Failed to search recipes",
    });
  }
});

app.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const response = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
    );
    const meals = response.data.meals;
    res.render("category", { meals, category, error: null });
  } catch (error) {
    console.error("Error fetching meals:", error);
    res.render("category", {
      meals: [],
      category: req.params.category,
      error: "Failed to load meals",
    });
  }
});

app.get("/recipe/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );
    const recipe = response.data.meals[0];
    res.render("recipe", { recipe, error: null });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.render("recipe", { recipe: null, error: "Failed to load recipe" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
