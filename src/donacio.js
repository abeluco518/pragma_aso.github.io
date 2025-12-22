
// src/donacio.js
const stripe = Stripe('pk_test_51SBGxMEXQiLN7acL3dqTBnaFKVpUL29O3vBXHFG3dU0ADEIdKrluIO9A9O3W01YfZMu589vUc5dQaiPfkkw0Nl100026cwdFEp'); 

// Selectores
const seleccioContainer = document.querySelector('.donate__seleccio');
const amountContainer = document.querySelector('.donate__amounts');
const submitForm = document.querySelector('#submit-form');

// Estado
let selectedFrequency = 'once'; // 'once' o 'monthly'
let selectedAmount = null;      // '5', '10', '20', etc.

// 1. Click en Frecuencia
seleccioContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    seleccioContainer.querySelectorAll('button').forEach(b => b.classList.remove('add-blue'));
    btn.classList.add('add-blue');

    // Detectamos si es el botón de una vez o mensual
    selectedFrequency = btn.classList.contains('donate__once') ? 'once' : 'monthly';
});

// 2. Click en Cantidad
amountContainer.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
        amountContainer.querySelectorAll('button').forEach(b => b.classList.remove('add-blue'));
        btn.classList.add('add-blue');
        
        // Guardamos el valor exacto del data-amount (ej: "20")
        selectedAmount = btn.dataset.amount;
    });
});

// 3. Click en Donar
submitForm.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!selectedAmount) {
        alert('Selecciona una cantidad antes de continuar.');
        return;
    }

    submitForm.textContent = 'Cargando...';
    submitForm.disabled = true;

    try {
        // Llamada a tu backend en Vercel
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: selectedAmount, frequency: selectedFrequency })
        });

        const session = await response.json();
        
        if (session.error) throw new Error(session.error);

        // Redirección a Stripe
        const result = await stripe.redirectToCheckout({ sessionId: session.id });
        if (result.error) alert(result.error.message);

    } catch (error) {
        console.error(error);
        alert('Error: ' + error.message);
        submitForm.textContent = 'DONA ARA';
        submitForm.disabled = false;
    }
});