// api/checkout.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// PEGA AQUÍ TUS 12 IDs DE STRIPE
const PRICES = {
  once: {
    '5': 'price_1Sh5M3I9oHZMMldyEediK6l0',
    '10': 'price_1Sh5MQI9oHZMMldyz82vbGpw',
    '20': 'price_1Sh5MpI9oHZMMldyTA8KSYFg',
    '50': 'price_1Sh5NMI9oHZMMldyeNNJLmL9',
    '100': 'price_1Sh5NiI9oHZMMldyhz8JT48q',
    '200': 'price_1Sh5ORI9oHZMMldySCTE9OoX',
  },
  monthly: {
    '5': 'price_1Sh5OvI9oHZMMldyOS5Jj7VB',
    '10': 'price_1Sh5PgI9oHZMMldyT0lT3wKh',
    '20': 'price_1Sh5MpI9oHZMMldyTA8KSYFg',
    '50': 'price_1Sh5Q7I9oHZMMldyykzqCmEb',
    '100': 'price_1Sh5QLI9oHZMMldyP2GWFG73',
    '200': 'price_1Sh5QsI9oHZMMldywcN96mrS',
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { amount, frequency } = req.body;
    
    // Buscamos el ID correcto según lo que eligió el usuario
    const priceId = PRICES[frequency]?.[amount];

    if (!priceId) {
      return res.status(400).json({ error: 'Combinación de precio no encontrada' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // Aquí le pasamos el ID directo de Stripe
          quantity: 1,
        },
      ],
      mode: frequency === 'monthly' ? 'subscription' : 'payment',
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/donate.html`,
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
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