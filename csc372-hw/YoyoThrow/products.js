const productDataUrl = "resources/products.json";

window.addEventListener("load", onLoad, true);

function onLoad() {
    fetch(productDataUrl)
    .then(response => response.json())
    .then(data => loadProducts(data))
    .catch(error => console.error("Error loading product data:", error));
}

function loadProducts(products) {

    const productGrid = document.getElementById("product-grid");
    productGrid.innerHTML = ""; // Clear the grid

    products.forEach(product => {

        // Create the product card
        const productCard = document.createElement("div");
        productCard.className = "product-card";

        const img = document.createElement("img");
        img.src = product.image;
        img.alt = product.name;
        productCard.appendChild(img);

        const name = document.createElement("h3");
        name.textContent = product.name;
        productCard.appendChild(name);

        const description = document.createElement("p");
        description.textContent = product.description;
        productCard.appendChild(description);

        const price = document.createElement("p");
        price.className = "price";
        price.textContent = `$${product.price.toFixed(2)}`;
        productCard.appendChild(price);

        const button = document.createElement("button");
        button.className = "common-btn";

        if (product.url) {
            button.textContent = "View Details";
            button.onclick = function () {
                window.location.href = product.url;
            };
        } else {
            // If there"s no URL, disable the button for now
            button.textContent = "Buy Now";
            button.disabled = true;
        }

        productCard.appendChild(button);
        productGrid.appendChild(productCard);
    });
}
