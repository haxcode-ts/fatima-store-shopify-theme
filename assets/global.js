/**
 * Fatima Store Theme - Global JavaScript
 * Save as: assets/global.js
 */

// Cart functionality
class CartManager {
  constructor() {
    this.init();
  }

  init() {
    // Update cart count on page load
    this.updateCartCount();
    
    // Listen for cart updates
    document.addEventListener('cart:updated', () => {
      this.updateCartCount();
    });
  }

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      const cartCountElements = document.querySelectorAll('[id="cart-icon-bubble"]');
      
      cartCountElements.forEach(element => {
        element.textContent = cart.item_count;
        element.style.display = cart.item_count > 0 ? 'flex' : 'none';
      });
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  async addToCart(variantId, quantity = 1) {
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: variantId,
            quantity: quantity
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const data = await response.json();
      
      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('cart:updated'));
      
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }
}

// Mobile menu toggle
class MobileMenu {
  constructor() {
    this.menuToggle = document.querySelector('.mobile-menu-toggle');
    this.nav = document.querySelector('.header-nav');
    
    if (this.menuToggle) {
      this.init();
    }
  }

  init() {
    this.menuToggle.addEventListener('click', () => {
      this.toggleMenu();
    });
  }

  toggleMenu() {
    this.nav.classList.toggle('mobile-open');
    this.menuToggle.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  }
}

// Smooth scroll for anchor links
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href !== '#' && href !== '#!') {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }
}

// Newsletter form handler
class NewsletterForm {
  constructor() {
    this.forms = document.querySelectorAll('.subscribe-form');
    if (this.forms.length > 0) {
      this.init();
    }
  }

  init() {
    this.forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(form);
      });
    });
  }

  async handleSubmit(form) {
    const email = form.querySelector('input[type="email"]').value;
    const button = form.querySelector('button[type="submit"]');
    const originalText = button.textContent;

    try {
      button.textContent = 'Subscribing...';
      button.disabled = true;

      // Add your newsletter subscription logic here
      // This is a placeholder - implement with your actual newsletter service
      await new Promise(resolve => setTimeout(resolve, 1000));

      button.textContent = 'Subscribed! ✓';
      form.reset();

      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 3000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      button.textContent = 'Error. Try again.';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 3000);
    }
  }
}

// Image lazy loading
class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll('img[loading="lazy"]');
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      });

      this.images.forEach(img => imageObserver.observe(img));
    }
  }
}

// Announcement bar close
class AnnouncementBar {
  constructor() {
    this.bar = document.querySelector('.announcement-bar');
    this.closeBtn = document.querySelector('.announcement-close');
    
    if (this.bar && this.closeBtn) {
      this.init();
    }
  }

  init() {
    // Check if user has closed it before
    if (sessionStorage.getItem('announcementClosed')) {
      this.bar.style.display = 'none';
    }

    this.closeBtn.addEventListener('click', () => {
      this.bar.style.display = 'none';
      sessionStorage.setItem('announcementClosed', 'true');
    });
  }
}

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CartManager();
  new MobileMenu();
  new SmoothScroll();
  new NewsletterForm();
  new LazyLoader();
  new AnnouncementBar();
});

// Utility functions
const FatimaStore = {
  // Format money
  formatMoney(cents, format = '${{amount}}') {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    
    const value = (cents / 100.0).toFixed(2);
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    
    return format.replace(placeholderRegex, value);
  },

  // Debounce function
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Show notification
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : '#f44336'};
      color: white;
      padding: 15px 25px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
};

// Export for use in other scripts
window.FatimaStore = FatimaStore;
window.cartManager = new CartManager();