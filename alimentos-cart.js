// Shopping cart management for Alimentos
let cart = [];

// Product prices (price per unit: kg, liter, or unit)
const productPrices = {
  'yogurt-griego': 2.80,        // per gram (2800/1000)
  'huevos-campo': 350,          // per unit
  'queso-campo': 8.50,          // per gram (8500/1000)
  'leche-tambo': 1.20,          // per ml (1200/1000)
  'dulce-leche-campo': 4.20,    // per gram (4200/1000)
  'miel-campo': 6.50,           // per gram (6500/1000)
  'lechuga-hidroponica': 1.80,  // per gram (1800/1000)
  'espinaca-hidroponica': 2.20, // per gram (2200/1000)
  'tomate-hidroponico': 2.50,   // per gram (2500/1000)
  'zanahoria-hidroponica': 1.60,// per gram (1600/1000)
  'papa-hidroponica': 1.40,     // per gram (1400/1000)
  'brocoli-hidroponico': 2.80,  // per gram (2800/1000)
  'cebolla-hidroponica': 1.50,  // per gram (1500/1000)
  'morron-hidroponico': 3.20,   // per gram (3200/1000)
  'yerba-organica': 3.80        // per gram (3800/1000)
};

// Initialize cart from localStorage
function initCart() {
  const savedCart = localStorage.getItem('alimentosCart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartBadge();
  }
}

// Add product to cart
function addToCart(productId, productName) {
  const input = document.querySelector(`input[data-product="${productId}"]`);
  const quantity = parseInt(input.value);
  
  if (!quantity || quantity <= 0) {
    alert('Por favor ingresá una cantidad válida');
    return;
  }
  
  // Check if product already in cart
  const existingIndex = cart.findIndex(item => item.id === productId);
  
  if (existingIndex > -1) {
    // Sum quantities if product already exists
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: productId,
      name: productName,
      quantity: quantity,
      unit: getUnit(productId)
    });
  }
  
  saveCart();
  updateCartBadge();
  
  // Visual feedback
  const btn = input.closest('.product-card, .product-item').querySelector('.btn-add-to-cart, .btn-add-cart');
  const originalText = btn.textContent;
  btn.textContent = '✓ Agregado';
  btn.style.background = '#4CAF50';
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
  }, 1500);
}

// Get unit for product (gramos, ml, unidades)
function getUnit(productId) {
  if (productId === 'huevos-campo') return 'unidades';
  if (productId === 'leche-tambo') return 'ml';
  return 'gramos';
}

// Calculate price for item
function calculateItemPrice(productId, quantity) {
  const pricePerUnit = productPrices[productId] || 0;
  
  if (productId === 'huevos-campo') {
    // Eggs: price per unit
    return pricePerUnit * quantity;
  } else {
    // Everything else: price per gram/ml
    return pricePerUnit * quantity;
  }
}

// Format price for display
function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('alimentosCart', JSON.stringify(cart));
}

// Update cart badge
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const totalItems = cart.reduce((sum, item) => sum + 1, 0);
  badge.textContent = totalItems;
  badge.style.display = totalItems > 0 ? 'block' : 'none';
}

// Open cart modal
function openCart() {
  if (cart.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }
  
  const modal = document.getElementById('cartModal');
  const itemsContainer = document.getElementById('cartItems');
  
  // Render cart items
  let html = '<div style="display: flex; flex-direction: column; gap: 16px;">';
  let totalPrice = 0;
  
  cart.forEach((item, index) => {
    const itemPrice = calculateItemPrice(item.id, item.quantity);
    totalPrice += itemPrice;
    
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 12px; gap: 16px;">
        <div style="flex: 1;">
          <strong style="font-size: 1.05rem;">${item.name}</strong><br>
          <span style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">${item.quantity} ${item.unit}</span><br>
          <span style="color: #C77DD4; font-size: 1.1rem; font-weight: 600;">${formatPrice(itemPrice)}</span>
        </div>
        <button onclick="removeFromCart(${index})" style="background: #ff4444; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 250ms ease;">
          Eliminar
        </button>
      </div>
    `;
  });
  html += '</div>';
  
  itemsContainer.innerHTML = html;
  
  // Show total
  document.getElementById('cartTotal').innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <strong style="font-size: 1.1rem;">Total de productos:</strong>
      <strong style="font-size: 1.1rem;">${cart.length}</strong>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(255,255,255,0.1); border-radius: 12px;">
      <strong style="font-size: 1.5rem; color: white;">TOTAL:</strong>
      <strong style="font-size: 1.8rem; color: #C77DD4;">${formatPrice(totalPrice)}</strong>
    </div>
    <p style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-top: 12px; text-align: center;">
      * Precio final sujeto a disponibilidad y método de pago
    </p>
  `;
  
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('active');
}

// Remove item from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  
  if (cart.length === 0) {
    closeModal('cartModal');
  } else {
    openCart(); // Refresh cart view
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('active');
}

// Open checkout (login modal)
function openCheckout() {
  closeModal('cartModal');
  const loginModal = document.getElementById('loginModal');
  loginModal.setAttribute('aria-hidden', 'false');
  loginModal.classList.add('active');
}

// Submit order
async function submitOrder(e) {
  e.preventDefault();
  
  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  const phone = document.getElementById('userPhone').value;
  const address = document.getElementById('userAddress').value;
  const postalCode = document.getElementById('userPostalCode').value;
  const deliveryDay = document.querySelector('input[name="deliveryDay"]:checked')?.value;
  const deliveryTime = document.querySelector('input[name="deliveryTime"]:checked')?.value;
  
  const msgEl = document.getElementById('loginMsg');
  
  // Validate Paraná postal code (3100-3199)
  const postalCodeNum = parseInt(postalCode);
  if (postalCodeNum < 3100 || postalCodeNum > 3199) {
    msgEl.textContent = '❌ Por ahora solo hacemos entregas en Paraná (CP 3100-3199)';
    msgEl.style.color = '#ff4444';
    return;
  }
  
  if (!deliveryDay || !deliveryTime) {
    msgEl.textContent = '❌ Por favor seleccioná día y horario de entrega';
    msgEl.style.color = '#ff4444';
    return;
  }
  
  msgEl.textContent = 'Enviando pedido...';
  msgEl.style.color = '#AE57C0';
  
  const orderNumber = 'PG-' + Date.now();
  const orderDate = new Date().toLocaleString('es-AR', { 
    dateStyle: 'short', 
    timeStyle: 'short' 
  });
  
  // Calculate total
  const totalPrice = cart.reduce((sum, item) => {
    return sum + calculateItemPrice(item.id, item.quantity);
  }, 0);
  
  // Prepare data for Google Sheets
  const orderData = {
    orderNumber: orderNumber,
    date: orderDate,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    customerAddress: address,
    customerPostalCode: postalCode,
    deliveryDay: deliveryDay,
    deliveryTime: deliveryTime,
    items: cart.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', '),
    itemsDetailed: cart.map(item => ({
      ...item,
      price: calculateItemPrice(item.id, item.quantity),
      priceFormatted: formatPrice(calculateItemPrice(item.id, item.quantity))
    })),
    totalPrice: totalPrice,
    totalPriceFormatted: formatPrice(totalPrice)
  };
  
  try {
    // TODO: Replace this URL with your Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzM4HqOQjd6Oqlbfz9JocyX8HhWTUOGyl_edNu6wyou8nZ1BFOCfhMGD6l0ocOk1e2F/exec';
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Important for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    // With no-cors mode, we can't read the response, so we assume success
    msgEl.textContent = '✓ ¡Pedido enviado! Te llegará una confirmación por email.';
    msgEl.style.color = '#4CAF50';
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartBadge();
    
    // Close modal after 3 seconds
    setTimeout(() => {
      closeModal('loginModal');
      document.getElementById('loginForm').reset();
      msgEl.textContent = '';
    }, 3000);
    
  } catch (error) {
    console.error('Error:', error);
    msgEl.textContent = 'Error al enviar el pedido. Por favor contactanos por WhatsApp.';
    msgEl.style.color = '#ff4444';
  }
}

// Format order for email
function formatOrderForEmail(items) {
  return items.map(item => `${item.name}: ${item.quantity} ${item.unit}`).join(', ');
}

// Send confirmation email to customer
async function sendCustomerConfirmation(orderData) {
  try {
    await fetch('https://formsubmit.co/ajax/' + orderData.customer.email, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `Confirmación de pedido - Proyecto Guiarte`,
        _template: 'table',
        Mensaje: `Hola ${orderData.customer.name}! Recibimos tu pedido correctamente.`,
        'Número de Orden': orderData.orderNumber,
        Productos: formatOrderForEmail(orderData.items),
        'Próximos pasos': 'Te contactaremos en breve para coordinar el pago y la entrega.',
        Contacto: 'projectguiarte@gmail.com'
      })
    });
  } catch (error) {
    console.log('Error sending customer confirmation:', error);
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  initCart();
  
  // Cart float button
  document.getElementById('cartFloatBtn').addEventListener('click', openCart);
  
  // Cart modal close
  document.getElementById('cartModalClose').addEventListener('click', () => closeModal('cartModal'));
  
  // Login modal close
  document.getElementById('loginModalClose').addEventListener('click', () => closeModal('loginModal'));
  
  // Checkout button
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
  
  // Login form submit
  document.getElementById('loginForm').addEventListener('submit', submitOrder);
  
  // Close modals on outside click
  ['cartModal', 'loginModal'].forEach(modalId => {
    document.getElementById(modalId).addEventListener('click', (e) => {
      if (e.target.id === modalId) {
        closeModal(modalId);
      }
    });
  });
});

// Export functions to global scope
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
