// Global variables
let currentProductData = null;

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}Form`).classList.add('active');
    
    // Reset forms when switching tabs
    if (tabName === 'add') {
        document.getElementById('productAddForm').reset();
        document.getElementById('idError').textContent = '';
        document.getElementById('numberError').textContent = '';
    } else {
        document.getElementById('update_id').value = '';
        document.getElementById('productUpdateForm').reset();
        document.getElementById('productUpdateForm').style.display = 'none';
        document.getElementById('productNotFound').textContent = '';
        document.getElementById('updateImagesContainer').innerHTML = '';
        document.getElementById('updateFeaturesContainer').innerHTML = '';
    }
}

// Load product data for update
async function loadProduct() {
    const productId = document.getElementById('update_id').value;
    if (!productId) return;
    
    try {
        const response = await fetch(`https://homesalle.vercel.app/api/products`);
        const products = await response.json();
        const product = products.find(p => p.id == productId);
        
        if (!product) {
            document.getElementById('productNotFound').textContent = 'Produk tidak ditemukan';
            document.getElementById('productUpdateForm').style.display = 'none';
            return;
        }
        
        // Save current product data for reference
        currentProductData = product;
        
        document.getElementById('productNotFound').textContent = '';
        
        // Fill the form with product data
        document.getElementById('up_id').value = product.id;
        document.getElementById('up_number').value = product.number || '';
        document.getElementById('up_name').value = product.name || '';
        document.getElementById('up_category').value = product.category || '';
        document.getElementById('up_price').value = product.price || '';
        document.getElementById('up_originalPrice').value = product.originalPrice || '';
        document.getElementById('up_image').value = product.image || '';
        document.getElementById('up_link').value = product.link || '';
        document.getElementById('up_rating').value = product.rating || '';
        document.getElementById('up_reviews').value = product.reviews || '';
        document.getElementById('up_ribuan').value = product.ribuan || '';
        document.getElementById('up_stock').value = product.stock || '';
        document.getElementById('up_description').value = product.description || '';
        document.getElementById('up_specifications').value = product.specifications || '';
        
        // Handle array fields - images
        const imagesContainer = document.getElementById('updateImagesContainer');
        imagesContainer.innerHTML = '';
        if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
                addUpdateImageField(img);
            });
        } else {
            addUpdateImageField();
        }
        
        // Handle array fields - features
        const featuresContainer = document.getElementById('updateFeaturesContainer');
        featuresContainer.innerHTML = '';
        if (product.features && product.features.length > 0) {
            product.features.forEach(feat => {
                addUpdateFeatureField(feat);
            });
        } else {
            addUpdateFeatureField();
        }
        
        document.getElementById('productUpdateForm').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memuat data produk');
    }
}

// Add image field in update form
function addUpdateImageField(value = '') {
    const container = document.getElementById('updateImagesContainer');
    const div = document.createElement('div');
    div.className = 'array-field';
    div.innerHTML = `
        <input type="text" name="images[]" value="${value}" placeholder="URL gambar">
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Hapus</button>
    `;
    container.appendChild(div);
}

// Add feature field in update form
function addUpdateFeatureField(value = '') {
    const container = document.getElementById('updateFeaturesContainer');
    const div = document.createElement('div');
    div.className = 'array-field';
    div.innerHTML = `
        <input type="text" name="features[]" value="${value}" placeholder="Fitur produk">
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Hapus</button>
    `;
    container.appendChild(div);
}

// Add image field in add form
function addImageField() {
    const container = document.getElementById('addImagesContainer');
    const div = document.createElement('div');
    div.className = 'array-field';
    div.innerHTML = `
        <input type="text" name="images[]" placeholder="URL gambar">
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Hapus</button>
    `;
    container.appendChild(div);
}

// Add feature field in add form
function addFeatureField() {
    const container = document.getElementById('addFeaturesContainer');
    const div = document.createElement('div');
    div.className = 'array-field';
    div.innerHTML = `
        <input type="text" name="features[]" placeholder="Fitur produk">
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Hapus</button>
    `;
    container.appendChild(div);
}

// Handle add form submission
document.getElementById('productAddForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Reset error messages
    document.getElementById('idError').textContent = '';
    document.getElementById('numberError').textContent = '';
    
    const id = document.getElementById('add_id').value;
    const number = document.getElementById('add_number').value;
    
    // Validate required fields
    if (!id) {
        document.getElementById('idError').textContent = 'ID harus diisi';
        return;
    }
    
    if (!number) {
        document.getElementById('numberError').textContent = 'Number harus diisi';
        return;
    }
    
    try {
        // Check for duplicate ID and Number
        const response = await fetch('http://localhost:5000/api/products');
        const products = await response.json();
        
        if (products.some(p => p.id == id)) {
            document.getElementById('idError').textContent = 'ID sudah digunakan';
            return;
        }
        
        if (products.some(p => p.number == number)) {
            document.getElementById('numberError').textContent = 'Number sudah digunakan';
            return;
        }
        
        // Submit form if validation passes
        const formData = new FormData(this);
        const addResponse = await fetch('http://localhost:5000/api/products/add', {
            method: 'POST',
            body: formData
        });
        
        const result = await addResponse.json();
        
        if (addResponse.ok) {
            alert(result.message);
            this.reset();
            // Reset array fields
            document.getElementById('addImagesContainer').innerHTML = '';
            document.getElementById('addFeaturesContainer').innerHTML = '';
            // Add one empty field for each array
            addImageField();
            addFeatureField();
        } else {
            throw new Error(result.message || 'Gagal menambahkan produk');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Handle update form submission
document.getElementById('productUpdateForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(this);
        
        // For empty fields, we want to send empty string to clear the value
        const fieldsToCheck = [
            'name', 'category', 'image', 'link', 'ribuan', 
            'description', 'specifications'
        ];
        
        fieldsToCheck.forEach(field => {
            if (!formData.get(field)) {
                formData.set(field, '');
            }
        });
        
        // For number fields, we want to send 0 if empty
        const numberFields = [
            'number', 'price', 'originalPrice', 'reviews', 'stock'
        ];
        
        numberFields.forEach(field => {
            if (!formData.get(field)) {
                formData.set(field, '0');
            }
        });
        
        // For rating field
        if (!formData.get('rating')) {
            formData.set('rating', '0.0');
        }
        
        const response = await fetch('http://localhost:5000/api/products/update', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            // Reload the product to show updated data
            loadProduct();
        } else {
            throw new Error(result.message || 'Gagal mengupdate produk');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Initialize forms with one empty array field each
document.addEventListener('DOMContentLoaded', function() {
    addImageField();
    addFeatureField();
});
