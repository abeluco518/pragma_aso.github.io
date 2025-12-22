import './sass/main.scss';

const menuButton = document.querySelector('#menu');
const navBar = document.querySelector('.header__nav');
let menuOpen = false;

menuButton.addEventListener('click', () => {
  menuOpen = !menuOpen;

  if (menuOpen) {
    navBar.classList.add('is-open');
    menuButton.style.transform = 'rotate(180deg)';
  } else {
    navBar.classList.remove('is-open');
    menuButton.style.transform = 'rotate(0deg)';
  }
});


// --- PEGA ESTO EN TU main.js ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializamos Stripe usando window.Stripe para evitar el error "undefined"
    let stripe;
    if (window.Stripe) {
        stripe = window.Stripe('pk_live_51SBGx6I9oHZMMldyZSlt3TxXJvWPjpjFO8clU8Qj6qJwPUYewedoxL5eKDvjW2nh853HFa7slSyvPmoP4AD0k54Y00UJ2KM0S3');
    } else {
        console.error("Error: La librería de Stripe no se ha cargado. Revisa tu HTML.");
        return;
    }

    // 2. Selectores
    const seleccioContainer = document.querySelector('.donate__seleccio');
    const amountContainer = document.querySelector('.donate__amounts');
    const submitForm = document.querySelector('#submit-form');

    // Estado local
    let selectedFrequency = 'once'; 
    let selectedAmount = null;

    // Si los elementos no existen en esta página, no hacemos nada (evita errores en otras páginas)
    if (!seleccioContainer || !amountContainer || !submitForm) return;

    // --- LÓGICA DE BOTONES ---

    // A. Click en Frecuencia
    seleccioContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        seleccioContainer.querySelectorAll('button').forEach(b => b.classList.remove('add-blue'));
        btn.classList.add('add-blue');
        selectedFrequency = btn.classList.contains('donate__once') ? 'once' : 'monthly';
    });

    // B. Click en Cantidad
    amountContainer.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            amountContainer.querySelectorAll('button').forEach(b => b.classList.remove('add-blue'));
            btn.classList.add('add-blue');
            selectedAmount = btn.dataset.amount;
        });
    });

    // C. Click en Donar (Llamada al Backend)
    submitForm.addEventListener('click', async (e) => {
        e.preventDefault();

        if (!selectedAmount) {
            alert('Selecciona una cantidad antes de continuar.');
            return;
        }

        const originalText = submitForm.textContent;
        submitForm.textContent = 'Cargando...';
        submitForm.disabled = true;

        try {
            // Llamada a tu API (la carpeta /api/checkout.js)
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: selectedAmount, frequency: selectedFrequency })
            });

            const session = await response.json();
            
            if (session.error) throw new Error(session.error);

            // Redirección segura
            const result = await stripe.redirectToCheckout({ sessionId: session.id });
            if (result.error) alert(result.error.message);

        } catch (error) {
            console.error(error);
            alert('Error: ' + error.message);
            submitForm.textContent = originalText;
            submitForm.disabled = false;
        }
    });
});