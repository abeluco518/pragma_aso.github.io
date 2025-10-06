// Inicializa Stripe
const stripe = Stripe('pk_test_51SBGxMEXQiLN7acL3dqTBnaFKVpUL29O3vBXHFG3dU0ADEIdKrluIO9A9O3W01YfZMu589vUc5dQaiPfkkw0Nl100026cwdFEp'); 
const SERVERLESS_ENDPOINT = '/src/api/create-checkout-session.js'; 

// Selectores
const seleccioContainer = document.querySelector('.donate__seleccio'); // Frecuencia
const amountContainer = document.querySelector('.donate__amounts');     // Cantidades
const inputAmount = document.querySelector('#wanted_amount');           // Input
const submitForm = document.querySelector('#submit-form');              // Botón enviar

// -------------------- FRECUENCIA --------------------
seleccioContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    // Quitar add-blue de todos y ponerlo en el clicado
    seleccioContainer.querySelectorAll('button').forEach(b => b.classList.remove('add-blue'));
    btn.classList.add('add-blue');

    // Guardar selección
    seleccioContainer.dataset.times = btn.classList.contains('donate__once') ? 'once' : 'monthly';
});

// -------------------- CANTIDAD FIJA --------------------
amountContainer.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
        // Limpiar input
        inputAmount.value = '';

        // Limpiar clases y marcar seleccionado
        amountContainer.querySelectorAll('button').forEach(b => b.classList.remove('add-blue'));
        btn.classList.add('add-blue');

        // Guardar cantidad
        amountContainer.dataset.amount = btn.dataset.amount;
    });
});

// -------------------- INPUT PERSONALIZADO --------------------
inputAmount.addEventListener('input', () => {
    // Limpiar botones
    amountContainer.querySelectorAll('button').forEach(b => b.classList.remove('add-blue'));

    // Marcar input
    inputAmount.classList.add('add-blue');

    // Guardar cantidad
    amountContainer.dataset.amount = inputAmount.value;
});

// -------------------- ENVÍO A STRIPE --------------------
submitForm.addEventListener('click', async (e) => {
    e.preventDefault();

    const amount = amountContainer.dataset.amount;
    const frequency = seleccioContainer.dataset.times;

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert('Per favor, selecciona o introdueix una quantitat vàlida.');
        return;
    }

    submitForm.disabled = true;
    submitForm.textContent = 'Processant pagament...';

    try {
        const response = await fetch(SERVERLESS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: parseFloat(amount), frequency })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en el servidor de Stripe.');
        }

        const session = await response.json();
        const result = await stripe.redirectToCheckout({ sessionId: session.id });
        if (result.error) alert('Error: ' + result.error.message);

    } catch (error) {
        console.error('Error:', error);
        alert('Ha ocorregut un error. Torna a intentar-ho.');
    } finally {
        submitForm.disabled = false;
        submitForm.textContent = 'DONA ARA';
    }
});
