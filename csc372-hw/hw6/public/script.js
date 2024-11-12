const baseURL = 'http://localhost:3000/jokebook';

document.addEventListener("DOMContentLoaded", () => {

    fetchRandomJoke();
    fetchCategories();

    // Subscribe event listeners...

    const jokeForm = document.getElementById("joke-form");
    jokeForm.addEventListener("submit", (event) => {
        event.preventDefault();
        addJoke();
    });

    const randomJokeButton = document.getElementById("random-joke-button");
    randomJokeButton.addEventListener("click", () => {
        fetchRandomJoke();
    });

    const searchButton = document.getElementById("search-button");
    searchButton.addEventListener("click", () => {
        fetchJokesByCategory();
    });
});

// Fetch and display a random joke
function fetchRandomJoke() {
    fetch(`${baseURL}/random`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('random-joke').textContent = `${data.setup} - ${data.delivery}`;
        })
        .catch(error => console.error('Error fetching random joke:', error));
}

// Fetch and display all categories
function fetchCategories() {
    fetch(`${baseURL}/categories`)
        .then(response => response.json())
        .then(data => {
            const categoriesList = document.getElementById('categories-list');
            categoriesList.innerHTML = ''; // Clear existing categories

            data.forEach(category => {
                const li = document.createElement('li');
                li.textContent = category.value;
                li.addEventListener('click', () => fetchJokesByCategory(category.value));
                categoriesList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching categories:', error));
}

// Fetch and display jokes from a specified category
function fetchJokesByCategory(category = null) {
    if (!category) {
        category = document.getElementById('category-input').value.trim();
    }

    fetch(`${baseURL}/${encodeURIComponent(category)}`)
        .then(response => response.json())
        .then(data => {
            const jokeList = document.getElementById('category-jokes');
            jokeList.innerHTML = ''; // Clear existing jokes

            if (data.error) {
                jokeList.innerHTML = `<p>${data.error}</p>`;
            } else {
                data.forEach(joke => {
                    const jokeElement = document.createElement('p');
                    jokeElement.textContent = `${joke.setup} - ${joke.delivery}`;
                    jokeList.appendChild(jokeElement);
                });
            }
        })
        .catch(error => console.error('Error fetching jokes in category:', error));
}

// Adds a new joke from the form data
function addJoke() {

    // Clear any previous error message
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.style.display = 'none';
    errorMessageElement.textContent = '';

    const setup = document.getElementById('joke-setup').value;
    const delivery = document.getElementById('joke-delivery').value;
    const category = document.getElementById('joke-category').value;

    fetch(`${baseURL}/new`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ setup, delivery, category })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error);
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Joke added successfully!');
            fetchJokesByCategory(category); // Refresh jokes in this category

            // Clear form fields
            document.getElementById('joke-setup').value = '';
            document.getElementById('joke-delivery').value = '';
            document.getElementById('joke-category').value = '';
        })
        .catch(error => {
            errorMessageElement.style.display = 'block';
            errorMessageElement.textContent = `Error: ${error.message}`;
        });
}
