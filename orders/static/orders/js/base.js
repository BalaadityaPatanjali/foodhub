// Enhanced base.js - Universal Food Hub Functions
// This file handles all menu functionality across the entire application

class FoodHubManager {
    constructor() {
        this.cart = this.getCart();
        this.currentPizzaData = null;
        this.selectedToppings = [];
        this.init();
    }

    init() {
        console.log('🍕 Initializing FoodHub Manager...');
        this.updateCartCount();
        this.setupNotificationSystem();
        this.setupPizzaFunctionality();
        this.setupMenuButtons();
    }

    // ========== CART MANAGEMENT ==========
    getCart() {
        try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        } catch (e) {
            console.error('Error parsing cart:', e);
            return [];
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    addToCart(item) {
        try {
            console.log('Adding to cart:', item);
            
            const cartItem = {
                item_description: item.item_description || 'Unknown Item',
                price: parseFloat(item.price) || 0,
                image_url: item.image_url || this.getDefaultImage(item.category),
                quantity: 1,
                toppings: item.toppings || [],
                category: item.category || 'food'
            };
            
            // Check if identical item exists
            const existingIndex = this.cart.findIndex(existing => 
                existing.item_description === cartItem.item_description &&
                JSON.stringify(existing.toppings || []) === JSON.stringify(cartItem.toppings || [])
            );
            
            if (existingIndex !== -1) {
                this.cart[existingIndex].quantity += 1;
                this.showNotification(`Quantity updated for ${cartItem.item_description}!`);
            } else {
                this.cart.push(cartItem);
                this.showNotification(`${cartItem.item_description} added to cart!`);
            }
            
            this.saveCart();
            console.log('✅ Item successfully added to cart');
            
        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            this.showNotification('Error adding item to cart. Please try again.', 'error');
        }
    }

    updateCartCount() {
        try {
            const totalItems = this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            
            const selectors = [
                '.cart-badge', '.cart-count', '#cart-count',
                '[data-cart-count]', '.mobile-cart-count'
            ];
            
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) {
                        element.textContent = totalItems;
                        if (totalItems > 0) {
                            element.style.display = 'inline-flex';
                        } else {
                            element.style.display = 'none';
                        }
                    }
                });
            });
            
            console.log(`Cart count updated: ${totalItems} items`);
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }

    getDefaultImage(category) {
        const defaultImages = {
            pizza: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_1280.jpg',
            pasta: 'https://cdn.pixabay.com/photo/2018/07/18/19/12/pasta-3547078_1280.jpg',
            salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
            sub: 'https://cdn.pixabay.com/photo/2020/06/06/05/31/juicy-sandwich-5265292_1280.jpg',
            platter: 'https://cdn.pixabay.com/photo/2017/01/26/02/06/christmas-wallpaper-2009590_1280.jpg'
        };
        return defaultImages[category] || defaultImages.pizza;
    }

    // ========== PIZZA FUNCTIONALITY ==========
    setupPizzaFunctionality() {
        if (!this.isPageType('pizza')) return;
        
        this.setupPizzaTypeSelection();
        this.setupPizzaButtons();
        this.setupToppingsModal();
    }

    setupPizzaTypeSelection() {
        const regularCard = document.getElementById('regular_pizza_card');
        const sicilianCard = document.getElementById('sicilian_pizza_card');
        
        if (regularCard) {
            regularCard.addEventListener('click', () => this.selectPizzaType('regular'));
        }
        
        if (sicilianCard) {
            sicilianCard.addEventListener('click', () => this.selectPizzaType('sicilian'));
        }
    }

    selectPizzaType(type) {
        console.log('Selecting pizza type:', type);
        
        // Remove selection from all cards
        document.querySelectorAll('.pizza-type-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select the clicked card
        const selectedCard = document.getElementById(`${type === 'regular' ? 'regular_pizza_card' : 'sicilian_pizza_card'}`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Show/hide menus
        const regularMenu = document.getElementById('regular-menu');
        const sicilianMenu = document.getElementById('sicilian-menu');
        const selectedTypeText = document.getElementById('selected-type-text');
        
        if (regularMenu && sicilianMenu) {
            if (type === 'regular') {
                regularMenu.style.display = 'block';
                sicilianMenu.style.display = 'none';
                if (selectedTypeText) selectedTypeText.textContent = 'Regular Pizza Menu';
            } else {
                regularMenu.style.display = 'none';
                sicilianMenu.style.display = 'block';
                if (selectedTypeText) selectedTypeText.textContent = 'Sicilian Pizza Menu';
            }
        }
        
        // Smooth scroll to menu
        setTimeout(() => {
            const menuSection = document.querySelector('#selected-type-text');
            if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    setupPizzaButtons() {
        const pizzaButtons = document.querySelectorAll('.pizza-btn');
        pizzaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handlePizzaButtonClick(button);
            });
        });
    }

    handlePizzaButtonClick(button) {
        const pizzaData = {
            index: button.dataset.index,
            size: button.dataset.size,
            type: button.dataset.type,
            price: parseFloat(button.dataset.price),
            name: button.dataset.name,
            hasToppings: button.dataset.hasToppings === 'true'
        };

        if (pizzaData.hasToppings) {
            this.openToppingsModal(pizzaData);
        } else {
            this.addPizzaToCart(pizzaData, []);
        }
    }

    addPizzaToCart(pizzaData, toppings = []) {
        const toppingsPrice = toppings.length * 1.50;
        const totalPrice = pizzaData.price + toppingsPrice;
        
        let itemDescription = `${pizzaData.size} ${pizzaData.type} Pizza - ${pizzaData.name}`;
        if (toppings.length > 0) {
            itemDescription += ` with ${toppings.join(', ')}`;
        }
        
        const item = {
            item_description: itemDescription,
            price: totalPrice,
            image_url: this.getDefaultImage('pizza'),
            toppings: toppings,
            category: 'pizza'
        };
        
        this.addToCart(item);
    }

    // ========== TOPPINGS MODAL ==========
    setupToppingsModal() {
        const modal = document.getElementById('toppings_modal');
        if (!modal) return;

        // Close handlers
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-toppings');
        const submitBtn = document.getElementById('submit_toppings');
        
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeToppingsModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeToppingsModal());
        if (submitBtn) submitBtn.addEventListener('click', () => this.submitToppings());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeToppingsModal();
        });
        
        // Topping selection
        document.querySelectorAll('.topping-item').forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('change', () => this.updateToppingsCalculation());
            }
            
            item.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    checkbox.checked = !checkbox.checked;
                    this.updateToppingsCalculation();
                }
            });
        });
    }

    openToppingsModal(pizzaData) {
        this.currentPizzaData = pizzaData;
        this.selectedToppings = [];
        
        // Update modal content
        document.getElementById('pizza-name').textContent = pizzaData.name;
        document.getElementById('pizza-details').textContent = `${pizzaData.size} • ${pizzaData.type}`;
        document.getElementById('base-price').textContent = pizzaData.price.toFixed(2);
        document.getElementById('calc-base').textContent = pizzaData.price.toFixed(2);
        document.getElementById('calc-toppings').textContent = '0.00';
        document.getElementById('calc-total').textContent = pizzaData.price.toFixed(2);
        document.getElementById('topping-count').textContent = '0';
        
        // Reset checkboxes
        document.querySelectorAll('#toppings-container input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Show modal
        const modal = document.getElementById('toppings_modal');
        modal.classList.add('show');
    }

    updateToppingsCalculation() {
        const checkedBoxes = document.querySelectorAll('#toppings-container input[type="checkbox"]:checked');
        const toppingsCount = checkedBoxes.length;
        const toppingsPrice = toppingsCount * 1.50;
        const basePrice = this.currentPizzaData ? this.currentPizzaData.price : 0;
        const totalPrice = basePrice + toppingsPrice;
        
        document.getElementById('topping-count').textContent = toppingsCount;
        document.getElementById('calc-toppings').textContent = toppingsPrice.toFixed(2);
        document.getElementById('calc-total').textContent = totalPrice.toFixed(2);
        
        this.selectedToppings = Array.from(checkedBoxes).map(cb => cb.value);
    }

    submitToppings() {
        if (!this.currentPizzaData) return;
        
        this.addPizzaToCart(this.currentPizzaData, this.selectedToppings);
        this.closeToppingsModal();
    }

    closeToppingsModal() {
        const modal = document.getElementById('toppings_modal');
        modal.classList.remove('show');
        this.currentPizzaData = null;
        this.selectedToppings = [];
    }

    // ========== MENU BUTTONS SETUP ==========
    setupMenuButtons() {
        // Setup all menu buttons with data attributes
        this.setupGenericMenuButtons();
        this.setupLegacyButtons();
    }

    setupGenericMenuButtons() {
        const menuButtons = document.querySelectorAll('[data-food-item]');
        menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleGenericMenuButton(button);
            });
        });
    }

    handleGenericMenuButton(button) {
        const item = {
            item_description: button.dataset.description || 'Unknown Item',
            price: parseFloat(button.dataset.price) || 0,
            image_url: button.dataset.image || this.getDefaultImage(button.dataset.category),
            category: button.dataset.category || 'food'
        };
        
        this.addToCart(item);
        this.animateButton(button);
    }

    setupLegacyButtons() {
        // Fix existing onclick buttons
        const onclickButtons = document.querySelectorAll('button[onclick]');
        onclickButtons.forEach(button => {
            const onclickCode = button.getAttribute('onclick');
            if (onclickCode) {
                button.removeAttribute('onclick');
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLegacyButton(onclickCode);
                });
            }
        });
    }

    handleLegacyButton(onclickCode) {
        try {
            if (onclickCode.includes('add_to_cart')) {
                this.executeLegacyAddToCart(onclickCode);
            } else if (onclickCode.includes('pizza_toppings')) {
                this.executeLegacyPizzaToppings(onclickCode);
            }
        } catch (error) {
            console.error('Error handling legacy button:', error);
        }
    }

    executeLegacyAddToCart(onclickCode) {
        const match = onclickCode.match(/add_to_cart\(\s*({[^}]+})\s*\)/);
        if (match) {
            try {
                let jsonStr = match[1].replace(/'/g, '"').replace(/(\w+):/g, '"$1":');
                const item = JSON.parse(jsonStr);
                this.addToCart(item);
            } catch (e) {
                console.error('Error parsing legacy add_to_cart:', e);
            }
        }
    }

    executeLegacyPizzaToppings(onclickCode) {
        const match = onclickCode.match(/pizza_toppings\(\s*(\d+)\s*,\s*'([^']+)'\s*,\s*([\d.]+)\s*,\s*'([^']+)'\s*\)/);
        if (match) {
            const [, index, sizeType, price, pizzaName] = match;
            const [size, type] = sizeType.split(' ');
            const pizzaData = {
                index: parseInt(index),
                size: size,
                type: type,
                name: pizzaName,
                price: parseFloat(price),
                hasToppings: true
            };
            this.openToppingsModal(pizzaData);
        }
    }

    // ========== UI HELPERS ==========
    animateButton(button) {
        const originalText = button.textContent;
        const originalBg = button.style.background;
        
        button.textContent = 'Added!';
        button.style.background = '#10b981';
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = originalBg;
            button.style.transform = 'scale(1)';
        }, 1000);
    }

    isPageType(type) {
        return window.location.pathname.includes(type) || 
               document.body.classList.contains(`${type}-page`) ||
               document.querySelector(`#${type}-menu, .${type}-page, .${type}-grid`);
    }

    // ========== NOTIFICATION SYSTEM ==========
    setupNotificationSystem() {
        if (!document.getElementById('notification-toast')) {
            this.createNotificationToast();
        }
    }

    createNotificationToast() {
        const toast = document.createElement('div');
        toast.id = 'notification-toast';
        toast.style.cssText = `
            position: fixed; top: 120px; right: 20px; background: #10b981; color: white;
            padding: 1rem 1.5rem; border-radius: 12px; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
            z-index: 10001; transform: translateX(100%); transition: transform 0.3s ease;
            display: flex; align-items: center; gap: 0.5rem; max-width: 350px;
        `;
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span id="notification-message">Success!</span>
        `;
        document.body.appendChild(toast);
    }

    showNotification(message, type = 'success') {
        const toast = document.getElementById('notification-toast');
        const messageEl = document.getElementById('notification-message');
        
        if (!toast || !messageEl) {
            this.createNotificationToast();
            return this.showNotification(message, type);
        }
        
        messageEl.textContent = message;
        
        // Set style based on type
        if (type === 'error') {
            toast.style.background = '#ef4444';
            toast.querySelector('i').className = 'fas fa-exclamation-circle';
        } else {
            toast.style.background = '#10b981';
            toast.querySelector('i').className = 'fas fa-check-circle';
        }
        
        // Show notification
        toast.style.transform = 'translateX(0)';
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
        }, 3000);
    }

    // ========== UTILITY FUNCTIONS ==========
    createMenuItem(options) {
        const {
            name,
            description = '',
            prices = {},
            category = 'food',
            hasToppings = false,
            image = null
        } = options;

        const item = document.createElement('div');
        item.className = `${category}-card menu-item`;
        
        const imageUrl = image || this.getDefaultImage(category);
        
        let priceButtons = '';
        Object.entries(prices).forEach(([size, price]) => {
            const buttonClass = size.toLowerCase();
            priceButtons += `
                <button class="price-btn ${buttonClass}" 
                        data-food-item="true"
                        data-description="${size} ${category} - ${name}"
                        data-price="${price}"
                        data-category="${category}"
                        data-image="${imageUrl}">
                    $${price}
                </button>
            `;
        });
        
        item.innerHTML = `
            <div class="${category}-image">
                <img src="${imageUrl}" alt="${name}">
            </div>
            <div class="${category}-info">
                <h3 class="${category}-name">${name}</h3>
                <p class="${category}-description">${description}</p>
                <div class="${category}-prices">
                    ${priceButtons}
                </div>
            </div>
        `;
        
        return item;
    }
}

// Initialize FoodHub Manager
let foodHubManager;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🍕 Initializing FoodHub Manager...');
    foodHubManager = new FoodHubManager();
    
    // Make functions globally available for backward compatibility
    window.add_to_cart = function(item) {
        if (foodHubManager) {
            foodHubManager.addToCart(item);
        }
    };
    
    window.pizza_toppings = function(index, sizeType, price, pizzaName) {
        if (foodHubManager) {
            const [size, type] = sizeType.split(' ');
            const pizzaData = {
                index: index,
                size: size,
                type: type,
                name: pizzaName,
                price: parseFloat(price),
                hasToppings: true
            };
            foodHubManager.openToppingsModal(pizzaData);
        }
    };
    
    window.updateCartCount = function() {
        if (foodHubManager) {
            foodHubManager.updateCartCount();
        }
    };
    
    window.showToast = function(message, type = 'success') {
        if (foodHubManager) {
            foodHubManager.showNotification(message, type);
        }
    };
});

// Update cart count on storage changes
window.addEventListener('storage', function(e) {
    if (e.key === 'cart' && foodHubManager) {
        foodHubManager.cart = foodHubManager.getCart();
        foodHubManager.updateCartCount();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FoodHubManager;
}