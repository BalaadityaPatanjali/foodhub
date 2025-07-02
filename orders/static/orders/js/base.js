// Enhanced base.js for FoodHub
window.add_to_cart = function(item) {
    try {
        console.log('Adding to cart:', item);
        
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Ensure price is a number and fix currency
        const price = parseFloat(item.price) || 0;
        
        // Create properly formatted cart item
        const cartItem = {
            item_description: item.item_description || 'Unknown Item',
            price: price,
            image_url: item.image_url || 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_1280.jpg',
            quantity: 1,
            toppings: item.toppings || []
        };
        
        // Check if item already exists
        const existingIndex = cart.findIndex(existing => 
            existing.item_description === cartItem.item_description &&
            JSON.stringify(existing.toppings || []) === JSON.stringify(cartItem.toppings || [])
        );
        
        if (existingIndex !== -1) {
            // Update quantity if item exists
            cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        } else {
            // Add new item
            cart.push(cartItem);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Show success message with $ currency
        window.showToast(`${cartItem.item_description} added to cart ($${price.toFixed(2)})`);
        
        console.log('Cart updated:', cart);
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        window.showToast('Error adding item to cart');
    }
};

window.showToast = function(message) {
    const toast = document.createElement("div");
    toast.className = "custom-toast show";
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        z-index: 1001;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        opacity: 0;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Update cart count in navbar
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        // Update all possible cart count elements
        const cartSelectors = [
            '.cart-badge',
            '.cart-count', 
            '#cart-count',
            '[class*="cart"]',
            '[id*="cart"]'
        ];
        
        cartSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element && element.textContent !== undefined) {
                        // Only update if it looks like a number
                        if (/^\d+$/.test(element.textContent.trim()) || element.textContent.trim() === '') {
                            element.textContent = totalItems;
                        }
                    }
                });
            } catch (e) {
                // Ignore selector errors
            }
        });
        
        console.log('Cart count updated to:', totalItems);
        
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    console.log('Base.js loaded successfully');
});

// Pizza toppings function (if not defined elsewhere)
if (typeof window.pizza_toppings === 'undefined') {
    window.pizza_toppings = function(index, sizeType, price, pizzaName) {
        console.log('Pizza toppings called:', { index, sizeType, price, pizzaName });
        
        // If toppings modal exists, use it
        if (window.pizzaPageInstance && window.pizzaPageInstance.openToppingsModal) {
            const pizzaData = {
                index: index,
                size: sizeType.split(' ')[0],
                type: sizeType.split(' ')[1], 
                name: pizzaName,
                price: parseFloat(price)
            };
            window.pizzaPageInstance.openToppingsModal(pizzaData);
        } else {
            // Fallback: add pizza without toppings
            const item = {
                item_description: `${sizeType} ${pizzaName} Pizza`,
                price: parseFloat(price),
                image_url: "https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_1280.jpg"
            };
            window.add_to_cart(item);
        }
    };
}