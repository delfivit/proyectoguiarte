// Shopping cart management for Alimentos
let cart = [];
let productStock = {}; // Stock actual de productos

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
  'yerba-organica': 3.80,       // per gram (3800/1000)
  'jabon-liquido-ropa': 3.50,   // per ml (3500/1000)
  'detergente-ecologico': 2.80  // per ml (2800/1000)
};

// Google Sheets Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz07K2NyNpbXpRisv-1-fETxOod_XBUYQPN8jVoWX6VxwIm13vCsqD8CdqNYBwtEDDH/exec';

// Initialize cart from localStorage and load stock
function initCart() {
  const savedCart = localStorage.getItem('alimentosCart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartBadge();
  }
  // Cargar stock al iniciar
  loadStock();
}

// Cargar stock desde Google Sheets usando JSONP
function loadStock() {
  // Usar JSONP para evitar problemas de CORS
  const callbackName = 'handleStockResponse_' + Date.now();
  window[callbackName] = function(data) {
    if (data.status === 'success') {
      productStock = data.stock;
      updateProductsVisibility();
      console.log('Stock cargado:', productStock);
    } else {
      console.error('Error al cargar stock:', data.message);
    }
    // Limpiar
    delete window[callbackName];
  };
  
  const script = document.createElement('script');
  script.src = SCRIPT_URL + '?action=getStock&callback=' + callbackName;
  script.onerror = function() {
    console.error('Error al cargar el script de stock');
    delete window[callbackName];
  };
  document.head.appendChild(script);
}

// Actualizar visibilidad de productos según stock
function updateProductsVisibility() {
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    // Buscar tanto input como select
    const input = card.querySelector('input[data-product], select[data-product]');
    if (input) {
      const productId = input.getAttribute('data-product');
      const stock = productStock[productId] || 0;
      const button = card.querySelector('.btn-add-to-cart');
      
      if (stock <= 0) {
        // Sin stock - deshabilitar y agregar badge
        card.style.opacity = '0.5';
        button.disabled = true;
        button.textContent = 'Sin Stock';
        button.style.background = '#666';
        button.style.cursor = 'not-allowed';
        
        // Deshabilitar el input/select
        input.disabled = true;
        
        // Agregar badge de sin stock
        if (!card.querySelector('.out-of-stock-badge')) {
          const badge = document.createElement('div');
          badge.className = 'out-of-stock-badge';
          badge.textContent = 'Agotado';
          badge.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            background: #f44336;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            z-index: 10;
          `;
          card.style.position = 'relative';
          card.appendChild(badge);
        }
      } else {
        // Con stock - habilitar y ajustar máximo
        card.style.opacity = '1';
        button.disabled = false;
        button.textContent = 'Agregar';
        button.style.background = '';
        button.style.cursor = 'pointer';
        input.disabled = false;
        
        // Ajustar máximo disponible según tipo de control
        if (input.tagName === 'INPUT') {
          // Para inputs, establecer max
          input.setAttribute('max', stock);
        }
        
        // Remover badge si existe
        const badge = card.querySelector('.out-of-stock-badge');
        if (badge) badge.remove();
      }
    }
  });
}

// Actualizar opciones de un select según stock disponible (legacy - ya no se usa)
function updateSelectOptions(select, maxStock) {
  const productId = select.getAttribute('data-product');
  const options = Array.from(select.options);
  
  options.forEach(option => {
    const value = parseInt(option.value);
    if (value > maxStock) {
      option.disabled = true;
      option.textContent += ' (Sin stock)';
    } else {
      option.disabled = false;
      // Remover " (Sin stock)" si ya estaba
      option.textContent = option.textContent.replace(' (Sin stock)', '');
    }
  });
  
  // Si la opción seleccionada está sin stock, cambiar a la primera disponible
  if (parseInt(select.value) > maxStock) {
    for (let i = 0; i < options.length; i++) {
      if (parseInt(options[i].value) <= maxStock) {
        select.value = options[i].value;
        break;
      }
    }
  }
}

// Add product to cart
function addToCart(productId, productName) {
  // Get input or select element
  const inputOrSelect = document.querySelector(`input[data-product="${productId}"], select[data-product="${productId}"]`);
  const quantity = parseInt(inputOrSelect.value);
  
  if (!quantity || quantity <= 0) {
    alert('Por favor ingresá una cantidad válida');
    return;
  }
  
  // Verificar stock disponible
  const availableStock = productStock[productId];
  if (availableStock !== undefined && quantity > availableStock) {
    const unit = getUnit(productId);
    alert(`⚠️ Stock insuficiente.\nDisponible: ${availableStock} ${unit}\nIntentaste agregar: ${quantity} ${unit}`);
    return;
  }
  
  // Check if product already in cart
  const existingIndex = cart.findIndex(item => item.id === productId);
  
  if (existingIndex > -1) {
    // Verificar que la suma no exceda el stock
    const newTotal = cart[existingIndex].quantity + quantity;
    if (availableStock !== undefined && newTotal > availableStock) {
      const unit = getUnit(productId);
      alert(`⚠️ Stock insuficiente.\nDisponible: ${availableStock} ${unit}\nYa tenés en el carrito: ${cart[existingIndex].quantity} ${unit}\nIntentaste agregar: ${quantity} ${unit}`);
      return;
    }
    // Sum quantities if product already exists
    cart[existingIndex].quantity = newTotal;
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
  const btn = inputOrSelect.closest('.product-card, .product-item').querySelector('.btn-add-to-cart, .btn-add-cart');
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
  if (productId === 'leche-tambo' || productId === 'jabon-liquido-ropa' || productId === 'detergente-ecologico') return 'ml';
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
  
  // Prepare cart items with prices
  const cartItems = cart.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    price: calculateItemPrice(item.id, item.quantity),
    priceFormatted: formatPrice(calculateItemPrice(item.id, item.quantity))
  }));
  
  // Prepare data for Google Sheets
  const orderData = {
    action: 'submitOrder', // Important: specify the action
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
    cartItems: cartItems, // Detailed items with prices for stock deduction
    totalPrice: totalPrice,
    totalPriceFormatted: formatPrice(totalPrice)
  };
  
  try {
    const response = await fetch(SCRIPT_URL, {
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
    
    // Reload stock after order
    setTimeout(() => {
      loadStock();
    }, 2000);
    
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
  
  // Inicializar Google Places Autocomplete cuando la API esté lista
  initGooglePlacesAutocomplete();
  
  // Close modals on outside click
  ['cartModal', 'loginModal'].forEach(modalId => {
    document.getElementById(modalId).addEventListener('click', (e) => {
      if (e.target.id === modalId) {
        closeModal(modalId);
      }
    });
  });
});

// Inicializar Google Places Autocomplete
function initGooglePlacesAutocomplete() {
  // Esperar a que la API de Google Maps esté cargada
  const checkGoogleMaps = setInterval(() => {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      clearInterval(checkGoogleMaps);
      
      const addressInput = document.getElementById('userAddress');
      const postalCodeInput = document.getElementById('userPostalCode');
      
      // Configurar autocompletado para Argentina
      const autocomplete = new google.maps.places.Autocomplete(addressInput, {
        componentRestrictions: { country: 'ar' },
        fields: ['address_components', 'formatted_address', 'geometry'],
        types: ['address']
      });
      
      // Cuando el usuario selecciona una dirección
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.address_components) {
          console.log('No se pudo obtener la dirección completa');
          return;
        }
        
        // Extraer componentes de la dirección
        let streetNumber = '';
        let route = '';
        let locality = '';
        let postalCode = '';
        
        place.address_components.forEach(component => {
          const types = component.types;
          
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          }
          if (types.includes('route')) {
            route = component.long_name;
          }
          if (types.includes('locality')) {
            locality = component.long_name;
          }
          if (types.includes('postal_code')) {
            postalCode = component.long_name;
          }
        });
        
        // Construir dirección formateada
        let fullAddress = '';
        if (route) {
          fullAddress = route;
          if (streetNumber) {
            fullAddress += ' ' + streetNumber;
          }
          if (locality) {
            fullAddress += ', ' + locality;
          }
        } else {
          // Si no hay calle específica, usar la dirección formateada
          fullAddress = place.formatted_address;
        }
        
        // Actualizar los campos
        addressInput.value = fullAddress;
        
        // Autocompletar código postal si está disponible
        if (postalCode && !postalCodeInput.value) {
          postalCodeInput.value = postalCode;
        }
        
        console.log('Dirección seleccionada:', fullAddress);
        console.log('CP:', postalCode);
      });
    }
  }, 100);
  
  // Timeout de seguridad (30 segundos)
  setTimeout(() => {
    clearInterval(checkGoogleMaps);
  }, 30000);
}

// Export functions to global scope
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
