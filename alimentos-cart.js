// Shopping cart management for Alimentos
let cart = [];

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
    cart[existingIndex].quantity = quantity;
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
  const btn = input.closest('.product-item').querySelector('.btn-add-cart');
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
  cart.forEach((item, index) => {
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 12px;">
        <div>
          <strong>${item.name}</strong><br>
          <span style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">${item.quantity} ${item.unit}</span>
        </div>
        <button onclick="removeFromCart(${index})" style="background: #ff4444; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
          Eliminar
        </button>
      </div>
    `;
  });
  html += '</div>';
  
  itemsContainer.innerHTML = html;
  
  // Show total items
  document.getElementById('cartTotal').innerHTML = `
    <strong>Total de productos: ${cart.length}</strong><br>
    <span style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">El precio final se coordinará por separado</span>
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
  
  const orderNumber = 'PG-' + Date.now();
  const orderDate = new Date().toLocaleString('es-AR', { 
    dateStyle: 'short', 
    timeStyle: 'short' 
  });
  
  const msgEl = document.getElementById('loginMsg');
  msgEl.textContent = 'Enviando pedido...';
  msgEl.style.color = '#AE57C0';
  
  // Prepare data for Google Sheets
  const orderData = {
    orderNumber: orderNumber,
    date: orderDate,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    customerAddress: address,
    items: cart.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', '),
    itemsDetailed: cart
  };
  
  try {
    // TODO: Replace this URL with your Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
    
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
