function toggleTheme() {
  document.body.classList.toggle('dark');
}

const SEARCH_API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const LOOKUP_API = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search');
const resultsGrid = document.getElementById('results-grid');
const messageArea = document.getElementById('message-area');
const modal = document.getElementById('recipe-modal');
const modalContent = document.getElementById('recipe-details-content');
const modalCloseBtn = document.getElementById('modal-close-btn');

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();
  console.log("Search Term:", searchTerm);
  if (searchTerm) {
    searchRecipes(searchTerm);
  } else {
    showMessage("Please enter a valid recipe name", true);
  }
});

async function searchRecipes(query) {
  showMessage(`Searching for... ${query}`, false, true);
  resultsGrid.innerHTML = '';
  try {
    const response = await fetch(`${SEARCH_API}${query}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    clearMessage();
    console.log(data);

    if (data.meals) {
      displayRecipes(data.meals);
    } else {
      showMessage(`No recipes found for "${query}". Please try another recipe.`);
    }
  } catch (error) {
    showMessage("An error occurred. Please try again.", true);
  }
}

function showMessage(message, isError = false, isLoading = false) {
  messageArea.textContent = message;
  if (isError) messageArea.classList.add('error');
  else messageArea.classList.remove('error'); // Ensure error class is removed if not an error
  if (isLoading) messageArea.classList.add('loading');
  else messageArea.classList.remove('loading'); // Ensure loading class is removed if not loading
}

function clearMessage() {
  messageArea.textContent = '';
  messageArea.className = 'message';
}

function displayRecipes(recipes) {
  if (!recipes || recipes.length === 0) {
    showMessage("No recipes found.");
    return;
  }
  resultsGrid.innerHTML = ''; // Clear previous results
  recipes.forEach(recipe => {
    const recipeDiv = document.createElement('div');
    recipeDiv.classList.add('recipe-item');
    recipeDiv.dataset.id = recipe.idMeal;
    recipeDiv.innerHTML = `
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy">
      <h3>${recipe.strMeal}</h3>
      `;
    resultsGrid.appendChild(recipeDiv);
  });
}

function showModal() {
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

resultsGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.recipe-item');
  if (card) {
    const recipeId = card.dataset.id;
    getRecipeDetails(recipeId);
  }
});

async function getRecipeDetails(id) {
  modalContent.innerHTML = '<p class="message loading">Loading details...</p>';
  showModal();
  try {
    const response = await fetch(`${LOOKUP_API}${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch recipe details");
    }
    const data = await response.json();
    console.log(data);
    if (data.meals && data.meals.length > 0) {
      displayRecipesDetails(data.meals[0]);
    } else {
      modalContent.innerHTML = '<p class="message error">Recipe details not found.</p>';
    }
  } catch (error) {
    modalContent.innerHTML = '<p class="message error">Failed to load details. Please try again.</p>';
  }
}

modalCloseBtn.addEventListener('click', closeModal);

modal.addEventListener('click', e => {
  if (e.target === modal) {
    closeModal();
  }
});

function displayRecipesDetails(recipe) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`]?.trim();
    const measure = recipe[`strMeasure${i}`]?.trim();

    if (ingredient) {
      ingredients.push(`<li>${measure ? `${measure} ` : ""}${ingredient}</li>`);
    } else {
      break;
    }
  }

  const categoryHTML = recipe.strCategory ?
    `<h3>Category: ${recipe.strCategory}</h3>` :
    "";
  const areaHTML = recipe.strArea ? `<h3>Area: ${recipe.strArea}</h3>` : "";
  const ingredientsHTML = ingredients.length ?
    `<h3>Ingredients</h3><ul>${ingredients.join("")}</ul>` :
    "";
  const instructionsHTML = `<h3>Instructions</h3><p>${
    recipe.strInstructions
      ? recipe.strInstructions.replace(/\r?\n/g, "<br>")
      : "Instructions not available."
  }</p>`;
  const youtubeHTML = recipe.strYoutube ?
    `<h3>Video Recipe</h3><div class="video-wrapper"><a href="${recipe.strYoutube}" target="_blank">Watch on YouTube</a><div>` :
    "";
  const sourceHTML = recipe.strSource ?
    `<div class="source-wrapper"><a href="${recipe.strSource}" target="_blank">View Original Source</a></div>` :
    "";

  modalContent.innerHTML = `
  <h2>${recipe.strMeal}</h2>
  <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
  ${categoryHTML}
  ${areaHTML}
  ${ingredientsHTML}
  ${instructionsHTML}
  ${youtubeHTML}
  ${sourceHTML}
  `;
}