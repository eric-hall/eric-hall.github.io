let currentPage = 1;
let perPage = 9;
let username = 'eric-hall';
let cachedRepos = [];
let init = false;

window.onload = async function() {
    init = true;
    loadRepositories();
}

async function loadRepositories() {
    if (!init) {
        username = document.getElementById('username').value;
        init = false;
    }
    currentPage = 1;
    cachedRepos = [];
    document.getElementById('pageNumber').innerText = `Page: ${currentPage}`;
    await fetchAndCacheRepositories(username);
    displayRepositories();
}

async function fetchAndCacheRepositories() {
    if (!username) {
        alert('Please enter a GitHub username.');
        return;
    }

    try {
        let page = 1;
        let repos = [];

        // Cache repos
        while (true) {
            const repoResponse = await fetch(`https://api.github.com/users/${username}/repos?page=${page}&per_page=100`);
            const batch = await repoResponse.json();

            if (batch.length === 0) break;
            repos = repos.concat(batch);
            page++;
        }

        cachedRepos = repos;

    } catch (error) {
        console.error('Error fetching repositories:', error);
        document.getElementById('repositories-grid').innerHTML = '<p>Error fetching repositories.</p>';
    }
}

function displayRepositories() {
    const repoContainer = document.getElementById('repositories-grid');
    repoContainer.innerHTML = '';

    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const reposToDisplay = cachedRepos.slice(start, end);

    if (reposToDisplay.length === 0) {
        repoContainer.innerHTML = '<p>No repositories found.</p>';
        return;
    }

    for (let repo of reposToDisplay) {
        displayRepository(repo);
    }
}

async function displayRepository(repo) {
    const repoContainer = document.getElementById('repositories-grid');
    
    try {
        const [commitsResponse, languagesResponse] = await Promise.all([
            fetch(repo.commits_url.replace('{/sha}', '')),
            fetch(repo.languages_url)
        ]);

        const commits = await commitsResponse.json();
        const languages = await languagesResponse.json();

        const repoCard = document.createElement('div');
        repoCard.classList.add('repo-card');
        repoCard.innerHTML = `
            <h3>${repo.name}</h3>
            <p>${repo.description || 'No description'}</p>
            <p><strong>Created at:</strong> ${new Date(repo.created_at).toLocaleDateString()}</p>
            <p><strong>Last updated:</strong> ${new Date(repo.updated_at).toLocaleDateString()}</p>
            <p><strong>Commits:</strong> ${commits.length}</p>
            <p><strong>Languages:</strong> ${Object.keys(languages).join(', ') || 'None'}</p>
            <p><strong>Watchers:</strong> ${repo.watchers_count}</p>`;

        repoContainer.appendChild(repoCard);
    } catch (error) {
        console.error('Error fetching repository details:', error);
    }
}

function nextPage() {
    if ((currentPage * perPage) < cachedRepos.length) {
        currentPage++;
        document.getElementById('pageNumber').innerText = `Page: ${currentPage}`;
        displayRepositories();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        document.getElementById('pageNumber').innerText = `Page: ${currentPage}`;
        displayRepositories();
    }
}
