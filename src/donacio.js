// Inicializa Stripe con tu clave PUBLICABLE (no secreta)
const stripe = Stripe('pk_test_51SBGxMEXQiLN7acL3dqTBnaFKVpUL29O3vBXHFG3dU0ADEIdKrluIO9A9O3W01YfZMu589vUc5dQaiPfkkw0Nl100026cwdFEp'); 

// Endpoint backend en Vercel
const SERVERLESS_ENDPOINT = '/src/api/create-checkout-session.js'; 

// --- Selectores ---
const seleccio_buttons = document.querySelector('.donate__seleccio');
const once_monthly = document.querySelectorAll('.donate__seleccio button');
const amounts = document.querySelectorAll('.donate__amounts *');
const amount_grid = document.querySelector('.donate__amounts');
const input_amount = document.querySelector('#wanted_amount');
const submit_form = document.querySelector('#submit-form');

// --- Alternar entre "una vegada" y "mensual" ---
seleccio_buttons.addEventListener('click', (e) => {
    e.preventDefault();
    if (seleccio_buttons.dataset.times === 'monthly') {
        seleccio_buttons.dataset.times = 'once';
    } else {
        seleccio_buttons.dataset.times = 'monthly';
    }

    if (seleccio_buttons.dataset.times === 'monthly') {
        once_monthly[0].classList.remove('add-blue');
        once_monthly[1].classList.add('add-blue');
    } else {
        once_monthly[1].classList.remove('add-blue');
        once_monthly[0].classList.add('add-blue');
    }
});

// --- Selección de cantidad fija ---
for (let i = 0; i < amounts.length; i++) {
    amounts[i].addEventListener('click', (e) => {
        e.preventDefault();
    });
}

amount_grid.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.dataset.amount !== undefined) {
        amount_grid.dataset.amount = e.target.dataset.amount;

        if (e.target.id !== 'wanted_amount') {
            input_amount.value = '';
        }

        for (let i = 0; i < amounts.length; i++) {
            amounts[i].classList.remove('add-blue');
        }
        e.target.classList.add('add-blue');
    }
});

// --- Si el usuario escribe en el input ---
input_amount.addEventListener('input', (e) => {
    if (e.target.value.length > 0) {
        for (let i = 0; i < amounts.length; i++) {
            amounts[i].classList.remove('add-blue');
        }
        e.target.classList.add('add-blue');
        amount_grid.dataset.amount = e.target.value;
    }
});

// --- Enviar a Stripe ---
submit_form.addEventListener('click', async (e) => {
    e.preventDefault();

    let amount = amount_grid.dataset.amount;
    const frequency = seleccio_buttons.dataset.times;

    if (input_amount.value && input_amount.classList.contains('add-blue')) {
        amount = input_amount.value;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert('Per favor, selecciona o introdueix una quantitat vàlida.');
        return;
    }

    submit_form.disabled = true;
    submit_form.textContent = 'Processant pagament...';

    try {
        const response = await fetch(SERVERLESS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: parseFloat(amount),
                frequency: frequency,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en el servidor de Stripe.');
        }

        const session = await response.json();

        // Redirige a Stripe
        const result = await stripe.redirectToCheckout({
            sessionId: session.id,
        });

        if (result.error) {
            alert('Error: ' + result.error.message);
        }
    } catch (error) {
        console.error('Error durant el procés:', error);
        alert('Ha ocorregut un error. Torna a intentar-ho.');
    } finally {
        submit_form.disabled = false;
        submit_form.textContent = 'DONA ARA';
    }
});
