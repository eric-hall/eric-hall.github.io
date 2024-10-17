const productDataUrl = "../resources/products.json";

window.addEventListener("load", onLoad, true);

function onLoad() {
    fetch(productDataUrl)
    .then(response => response.json())
    .then(data => loadProducts(data))
    .catch(error => console.error("Error loading product data:", error));
}

function loadProducts(products) {

    const tableBody = document.querySelector("#product-table tbody");
    tableBody.innerHTML = ""; // Clear the existing rows

    // Create table cells
    products.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>${product.category}</td>
                <td>${product.image}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <button>Edit</button>
                    <button>Archive</button>
                    <button>Delete</button>
                </td>
            `;
        tableBody.appendChild(row);
    });
}

function saveChanges() {
    alert("Save functionality not implemented.");
}
