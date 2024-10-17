function uploadJSON() {

    const fileInput = document.getElementById("jsonFile");
    const output = document.getElementById("output");
    output.innerHTML = ""; // Clear previous output

    if (!fileInput.files.length) {
        output.innerHTML = "<p class='upload-error'>Please select a file to upload.</p>";
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            validateJSON(data);
        } catch (error) {
            output.innerHTML = "<p class='upload-error'>Invalid JSON format. Please check your file.</p>";
        }
    };

    reader.readAsText(file);
}

function validateJSON(data) {

    const output = document.getElementById("output");
    if (!Array.isArray(data)) {
        output.innerHTML = "<p class='upload-error'>The JSON must be an array of products.</p>";
        return;
    }

    let ids = new Set();
    let errors = [];

    data.forEach((item, index) => {
        if (!item.id || typeof item.id !== "number") {
            errors.push(`Product at index ${index} is missing a valid 'id'.`);
        } else if (ids.has(item.id)) {
            errors.push(`Duplicate 'id' found at index ${index}. Each product must have a unique 'id'.`);
        }
        ids.add(item.id);

        if (!item.name || typeof item.name !== "string") {
            errors.push(`Product at index ${index} is missing a valid 'name'.`);
        }
        if (!item.description || typeof item.description !== "string") {
            errors.push(`Product at index ${index} is missing a valid 'description'.`);
        }
        if (!item.category || typeof item.category !== "string") {
            errors.push(`Product at index ${index} is missing a valid 'category'.`);
        }
        if (!item.image || typeof item.image !== "string") {
            errors.push(`Product at index ${index} is missing a valid 'image' path.`);
        }
        if (typeof item.price !== "number") {
            errors.push(`Product at index ${index} is missing a valid 'price'.`);
        }
        if (item.url !== null && typeof item.url !== "string") {
            errors.push(`Product at index ${index} has an invalid 'url'. It must be a string or null.`);
        }
    });

    if (errors.length > 0) {
        output.innerHTML = `<p class='upload-error'>${errors.join("<br>")}</p>`;
    } else {
        output.innerHTML = "<p class='upload-success'>JSON file is valid and ready for upload!</p>";
    }
}
