// Initial data
const initialRestaurants = [
    "Evelia", "Rufino", "Tony wu", "Acido", "Mengano", "Niño gordo", 
    "Anafe", "Bis bristo", "Ajo negro", "Aramburu", "Uddo", "Kuro Neko",
    "Crizia", "Idilio", "Piedra pasillo", "Tigre morado", "Kefi", 
    "Mess cocina", "Raggio", "Marta restaurante"
];

// App state
let restaurants = [...initialRestaurants];
let ratings = {};
let selectedUser = 'pamolita';
let currentRating = {
    restaurant: '',
    entrada: 1,
    main: 1,
    dessert: 1
};

// DOM elements
const restaurantSelect = document.getElementById('restaurantSelect');
const userButtons = document.querySelectorAll('.btn-user');
const ratingGrids = document.querySelectorAll('.rating-grid');
const saveButton = document.getElementById('saveRating');
const averageDisplay = document.getElementById('averageScore');
const addFormToggle = document.getElementById('toggleAddForm');
const addForm = document.getElementById('addRestaurantForm');
const newRestaurantInput = document.getElementById('newRestaurantName');
const addRestaurantBtn = document.getElementById('addRestaurant');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeRestaurantSelect();
    setupEventListeners();
    updateStats();
    updateAllRankings();
});

// Initialize restaurant select dropdown
function initializeRestaurantSelect() {
    restaurantSelect.innerHTML = '<option value="">Choose restaurant...</option>';
    restaurants.forEach(restaurant => {
        const option = document.createElement('option');
        option.value = restaurant;
        option.textContent = restaurant;
        restaurantSelect.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // User selection
    userButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            userButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedUser = this.dataset.user;
        });
    });

    // Restaurant selection
    restaurantSelect.addEventListener('change', function() {
        currentRating.restaurant = this.value;
        updateSaveButton();
    });

    // Rating grids
    ratingGrids.forEach(grid => {
        const category = grid.dataset.category;
        const buttons = grid.querySelectorAll('.btn-rating');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                const value = parseInt(this.dataset.value);
                
                // Update active state
                buttons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Update current rating
                currentRating[category] = value;
                
                // Update display
                document.getElementById(category === 'entrada' ? 'entradaValue' : 
                                     category === 'main' ? 'mainValue' : 'dessertValue').textContent = value;
                
                updateAverage();
            });
        });
    });

    // Save rating
    saveButton.addEventListener('click', saveRating);

    // Add restaurant form
    addFormToggle.addEventListener('click', function() {
        addForm.classList.toggle('d-none');
        const icon = this.querySelector('i');
        if (addForm.classList.contains('d-none')) {
            icon.className = 'bi bi-plus-circle me-2';
            this.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Add Restaurant';
        } else {
            icon.className = 'bi bi-x-circle me-2';
            this.innerHTML = '<i class="bi bi-x-circle me-2"></i>Cancel';
        }
    });

    addRestaurantBtn.addEventListener('click', addRestaurant);
    
    newRestaurantInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addRestaurant();
        }
    });
}

// Update average display
function updateAverage() {
    const avg = ((currentRating.entrada + currentRating.main + currentRating.dessert) / 3).toFixed(1);
    averageDisplay.textContent = avg;
}

// Update save button state
function updateSaveButton() {
    saveButton.disabled = !currentRating.restaurant;
}

// Save rating
function saveRating() {
    if (!currentRating.restaurant) return;

    const promedio = parseFloat(((currentRating.entrada + currentRating.main + currentRating.dessert) / 3).toFixed(1));
    
    if (!ratings[currentRating.restaurant]) {
        ratings[currentRating.restaurant] = {};
    }
    
    ratings[currentRating.restaurant][selectedUser] = {
        entrada: currentRating.entrada,
        main: currentRating.main,
        dessert: currentRating.dessert,
        promedio: promedio
    };

    // Reset form
    currentRating = { restaurant: '', entrada: 1, main: 1, dessert: 1 };
    restaurantSelect.value = '';
    
    // Reset rating buttons
    ratingGrids.forEach(grid => {
        const buttons = grid.querySelectorAll('.btn-rating');
        buttons.forEach(b => b.classList.remove('active'));
        buttons[0].classList.add('active');
    });
    
    // Reset displays
    document.getElementById('entradaValue').textContent = '1';
    document.getElementById('mainValue').textContent = '1';
    document.getElementById('dessertValue').textContent = '1';
    updateAverage();
    updateSaveButton();
    updateStats();
    updateAllRankings();

    // Show success feedback
    showToast('Rating saved successfully!', 'success');
}

// Add new restaurant
function addRestaurant() {
    const name = newRestaurantInput.value.trim();
    if (name && !restaurants.includes(name)) {
        restaurants.push(name);
        initializeRestaurantSelect();
        newRestaurantInput.value = '';
        addForm.classList.add('d-none');
        addFormToggle.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Add Restaurant';
        updateStats();
        showToast('Restaurant added successfully!', 'success');
    }
}

// Update stats
function updateStats() {
    document.getElementById('totalRestaurants').textContent = restaurants.length;
    document.getElementById('totalRated').textContent = Object.keys(ratings).length;
}

// Update all rankings
function updateAllRankings() {
    updateUserRanking('pamolita');
    updateUserRanking('ramiro');
    updateGlobalRanking();
}

// Update user ranking
function updateUserRanking(user) {
    const container = document.getElementById(user + 'Rankings');
    const userRatings = getRankedRestaurants(user);
    
    if (userRatings.length === 0) {
        container.innerHTML = '<div class="text-center py-5 text-muted">No ratings yet</div>';
        return;
    }
    
    container.innerHTML = userRatings.map((restaurant, index) => {
        const rating = ratings[restaurant][user];
        const badgeClass = index < 3 ? 'bg-gradient-yellow animate-pulse' : 'bg-secondary';
        const cardClass = user === 'pamolita' ? 'pamolita' : 'ramiro';
        
        return `
            <div class="ranking-card ${cardClass}">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex align-items-center">
                            <span class="badge ${badgeClass} me-3 px-3 py-2 fw-bold">#${index + 1}</span>
                            <span class="fw-semibold text-light">${restaurant}</span>
                        </div>
                        <div class="d-flex align-items-center">
                            <i class="bi bi-star-fill text-warning me-1"></i>
                            <span class="fw-bold fs-5 text-${user === 'pamolita' ? 'pink' : 'cyan'}">${rating.promedio}</span>
                        </div>
                    </div>
                    <div class="row g-2 mt-3">
                        <div class="col-4">
                            <div class="text-center p-2 rounded" style="background: rgba(16, 185, 129, 0.1);">
                                <div class="small text-muted">Entrada</div>
                                <div class="text-green fw-bold">${rating.entrada}</div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="text-center p-2 rounded" style="background: rgba(245, 158, 11, 0.1);">
                                <div class="small text-muted">Main</div>
                                <div class="text-orange fw-bold">${rating.main}</div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="text-center p-2 rounded" style="background: rgba(139, 92, 246, 0.1);">
                                <div class="small text-muted">Dessert</div>
                                <div class="text-purple fw-bold">${rating.dessert}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Update global ranking
function updateGlobalRanking() {
    const container = document.getElementById('globalRankings');
    const globalRatings = getOverallRanking();
    
    if (globalRatings.length === 0) {
        container.innerHTML = '<div class="text-center py-5 text-muted">No ratings yet</div>';
        return;
    }
    
    container.innerHTML = globalRatings.map((restaurant, index) => {
        const badgeClass = index < 3 ? 'bg-gradient-yellow animate-pulse' : 'bg-secondary';
        
        return `
            <div class="ranking-card global">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex align-items-center">
                            <span class="badge ${badgeClass} me-3 px-3 py-2 fw-bold">#${index + 1}</span>
                            <span class="fw-semibold text-light">${restaurant.name}</span>
                        </div>
                        <div class="d-flex align-items-center">
                            <i class="bi bi-star-fill text-warning me-1"></i>
                            <span class="fw-bold fs-5 gradient-text">${restaurant.overall}</span>
                        </div>
                    </div>
                    <div class="d-flex justify-content-center gap-4">
                        ${restaurant.pamolitaRating > 0 ? `
                            <div class="d-flex align-items-center">
                                <div class="user-dot bg-pink me-2"></div>
                                <span class="text-pink fw-bold">${restaurant.pamolitaRating}</span>
                            </div>
                        ` : ''}
                        ${restaurant.ramiroRating > 0 ? `
                            <div class="d-flex align-items-center">
                                <div class="user-dot bg-cyan me-2"></div>
                                <span class="text-cyan fw-bold">${restaurant.ramiroRating}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Get ranked restaurants for user
function getRankedRestaurants(user) {
    return restaurants
        .filter(restaurant => ratings[restaurant] && ratings[restaurant][user])
        .sort((a, b) => {
            const ratingA = ratings[a][user].promedio;
            const ratingB = ratings[b][user].promedio;
            return ratingB - ratingA;
        });
}

// Get overall ranking
function getOverallRanking() {
    return restaurants
        .filter(restaurant => {
            const hasRatings = ratings[restaurant];
            return hasRatings && (hasRatings.pamolita || hasRatings.ramiro);
        })
        .map(restaurant => {
            const pamolitaRating = ratings[restaurant].pamolita?.promedio || 0;
            const ramiroRating = ratings[restaurant].ramiro?.promedio || 0;
            const count = (pamolitaRating > 0 ? 1 : 0) + (ramiroRating > 0 ? 1 : 0);
            const overall = count > 0 ? parseFloat(((pamolitaRating + ramiroRating) / count).toFixed(1)) : 0;
            
            return {
                name: restaurant,
                overall: overall,
                pamolitaRating: pamolitaRating,
                ramiroRating: ramiroRating
            };
        })
        .sort((a, b) => b.overall - a.overall);
}

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'success' ? 'success' : 'info'} position-fixed`;
    toast.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    toast.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-check-circle-fill me-2"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}