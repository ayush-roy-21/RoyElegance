// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Cart Functionality
let cartCount = 0;
const cartCountElement = document.querySelector('.cart-count');

// Add to cart functionality
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        cartCount++;
        cartCountElement.textContent = cartCount;
        
        // Add animation to cart icon
        const cartIcon = document.querySelector('.cart-icon');
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 200);
        
        // Show success message
        showNotification('Product added to cart!', 'success');
    });
});

// Wishlist functionality
document.querySelectorAll('.wishlist').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const icon = button.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            button.style.background = '#d4af37';
            button.style.color = 'white';
            showNotification('Added to wishlist!', 'success');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            button.style.background = 'transparent';
            button.style.color = '#d4af37';
            showNotification('Removed from wishlist!', 'info');
        }
    });
});

// Quick view functionality
document.querySelectorAll('.quick-view').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Quick view feature coming soon!', 'info');
    });
});

// Newsletter subscription
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        if (email) {
            showNotification('Thank you for subscribing!', 'success');
            newsletterForm.reset();
        }
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .product-card, .category-card, .about-content, .newsletter-content').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Search functionality
const searchIcon = document.querySelector('.search-icon');
if (searchIcon) {
    searchIcon.addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Search feature coming soon!', 'info');
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Product image lazy loading
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function() {
        this.style.opacity = '1';
    });
    
    img.addEventListener('error', function() {
        this.src = 'https://via.placeholder.com/400x500/f0f0f0/999?text=Image+Not+Available';
    });
});

// Category card hover effects
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Form validation
document.querySelectorAll('input[type="email"]').forEach(input => {
    input.addEventListener('blur', function() {
        const email = this.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.style.borderColor = '#f44336';
            showNotification('Please enter a valid email address', 'error');
        } else {
            this.style.borderColor = '#d4af37';
        }
    });
});

// Performance optimization - Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll events
const debouncedScrollHandler = debounce(() => {
    // Scroll handling logic here if needed
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Elegant Kurtis - Landing Page Loaded');
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close mobile menu if open
        if (navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
        
        // Close notifications
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.remove();
        });
    }
});

// Touch gesture support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - could be used for next product
            console.log('Swipe left detected');
        } else {
            // Swipe right - could be used for previous product
            console.log('Swipe right detected');
        }
    }
}

// API Base URL - change this for production
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://royelegance-18.onrender.com';

// Dynamically load products from backend and render them
async function loadProducts() {
  const res = await fetch(`${API_BASE_URL}/api/products`);
  const products = await res.json();

  const container = document.querySelector('.products');
  container.innerHTML = '';

  products.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.images && product.images[0] ? product.images[0] : ''}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>₹${product.price}</p>
      <button>Add to Cart</button>
    `;
    container.appendChild(card);
  });
}

// Show logged-in user's full name on profile icon
async function showUserNameOnProfile() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/user`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (data.success && data.user && data.user.name) {
      const userIcon = document.querySelector('.user-icon');
      if (userIcon) {
        // Remove any previous name span
        const prev = userIcon.querySelector('.user-name');
        if (prev) prev.remove();
        // Add name next to icon
        const nameSpan = document.createElement('span');
        nameSpan.className = 'user-name';
        nameSpan.textContent = ' ' + data.user.name;
        nameSpan.style.fontWeight = '500';
        nameSpan.style.marginLeft = '8px';
        nameSpan.style.color = '#2c3e50';
        userIcon.appendChild(nameSpan);
      }
    }
  } catch (err) {
    // Fail silently
  }
}

// Call on page load
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/Client/' ) {
  showUserNameOnProfile();
}

// Profile dropdown and login/register/logout functionality
const profileDropdownToggle = document.getElementById('profileDropdownToggle');
const profileDropdown = document.getElementById('profileDropdown');
const logoutBtn = document.getElementById('logoutBtn');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

function updateProfileDropdown() {
  const token = localStorage.getItem('token');
  if (token) {
    // Logged in: show logout, hide login/register
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
  } else {
    // Not logged in: show login/register, hide logout
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'block';
    if (registerBtn) registerBtn.style.display = 'block';
    // Remove any user name span
    const userIcon = document.querySelector('.user-icon');
    if (userIcon) {
      const prev = userIcon.querySelector('.user-name');
      if (prev) prev.remove();
    }
  }
}

if (profileDropdownToggle && profileDropdown) {
  profileDropdownToggle.addEventListener('click', function(e) {
    e.preventDefault();
    updateProfileDropdown();
    profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', function(e) {
    if (!profileDropdown.contains(e.target) && e.target !== profileDropdownToggle && !profileDropdownToggle.contains(e.target)) {
      profileDropdown.style.display = 'none';
    }
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
}
if (loginBtn) {
  loginBtn.addEventListener('click', function() {
    window.location.href = 'login.html';
  });
}
if (registerBtn) {
  registerBtn.addEventListener('click', function() {
    window.location.href = 'register.html';
  });
}

// Innovative Theme Toggle
(function() {
  const themeBtn = document.createElement('button');
  themeBtn.setAttribute('aria-label', 'Toggle dark mode');
  themeBtn.id = 'themeToggleBtn';
  themeBtn.style.position = 'fixed';
  themeBtn.style.bottom = '28px';
  themeBtn.style.right = '28px';
  themeBtn.style.zIndex = '2000';
  themeBtn.style.background = 'linear-gradient(135deg, #d4af37 0%, #c19b2e 100%)';
  themeBtn.style.color = '#fff';
  themeBtn.style.border = 'none';
  themeBtn.style.borderRadius = '50%';
  themeBtn.style.width = '52px';
  themeBtn.style.height = '52px';
  themeBtn.style.boxShadow = '0 4px 16px rgba(0,0,0,0.13)';
  themeBtn.style.fontSize = '1.6rem';
  themeBtn.style.display = 'flex';
  themeBtn.style.alignItems = 'center';
  themeBtn.style.justifyContent = 'center';
  themeBtn.style.cursor = 'pointer';
  themeBtn.style.transition = 'background 0.3s, transform 0.2s';
  themeBtn.style.outline = 'none';
  themeBtn.innerHTML = '<span id="themeIcon">🌙</span>';

  function setTheme(dark) {
    if (dark) {
      document.body.classList.add('dark-mode');
      document.getElementById('themeIcon').textContent = '☀️';
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.getElementById('themeIcon').textContent = '🌙';
      localStorage.setItem('theme', 'light');
    }
  }

  themeBtn.addEventListener('click', function() {
    const isDark = document.body.classList.toggle('dark-mode');
    setTheme(isDark);
    themeBtn.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.15)' },
      { transform: 'scale(1)' }
    ], { duration: 300 });
  });

  // Load theme from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeBtn.innerHTML = '<span id="themeIcon">☀️</span>';
  }

  document.body.appendChild(themeBtn);
})();
