window.onload = function() {
    // Hide all asides
    document.querySelectorAll('aside').forEach(aside => {
        aside.style.display = 'none';
    });

    // Add event listeners to all articles to handle clicks
    document.querySelectorAll('.restaurant-section').forEach(section => {
        const articles = section.querySelectorAll('article');
        articles.forEach(article => {
            article.addEventListener('click', function() {
                showDescription(article, section);
            });
        });
        // Select the first article in each section on page load
        showDescription(articles[0], section);
    });
};

function showDescription(selectedArticle, section) {
    // Deselect all articles within the clicked section
    const articles = section.querySelectorAll('article');
    articles.forEach(article => article.classList.remove('recommend-selected'));

    // Select the clicked article
    selectedArticle.classList.add('recommend-selected');

    // Update the dropdown description for this section
    const dropdown = section.querySelector('.recommend-dropdown');
    dropdown.textContent = selectedArticle.getAttribute('data-description');
    dropdown.style.display = 'block';
}

function toggleAside(id) {
    const aside = document.getElementById(id);
    aside.style.display = aside.style.display === 'block' ? 'none' : 'block';
}