window.addEventListener("load", loadComponents, true);

function loadComponents() {
    // Load header and footer
    fetch('admin-header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('admin-header').innerHTML = data;
        });
}
