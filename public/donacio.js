// AÑADE ESTO AL INICIO DE TU ARCHIVO JAVASCRIPT
// 1. Inicializa Stripe con tu CLAVE PUBLICABLE
// ¡IMPORTANTE! Asegúrate de que el script de Stripe esté en tu HTML: <script src="https://js.stripe.com/v3/"></script>
const stripe = Stripe('pk_test_51SBGxMEXQiLN7acL3dqTBnaFKVpUL29O3vBXHFG3dU0ADEIdKrluIO9A9O3W01YfZMu589vUc5dQaiPfkkw0Nl100026cwdFEp'); 
// 2. Endpoint de la Función Serverless de Vercel
const SERVERLESS_ENDPOINT = '/api/create-checkout-session'; 

// Selectores basados en tu HTML
const seleccio_buttons = document.querySelector('.donate__seleccio');
const once_monthly = document.querySelectorAll('.donate__seleccio button');
const amounts = document.querySelectorAll('.donate__amounts *');
const amount_grid = document.querySelector('.donate__amounts');
const input_amount = document.querySelector('#wanted_amount');
const submit_form = document.querySelector('#submit-form');


// ----------------------------------------------------------------------
// LÓGICA DE INTERFAZ DE USUARIO (TUS FUNCIONES EXISTENTES)
// ----------------------------------------------------------------------

// Alterna entre donación 'once' (una vez) y 'monthly' (mensual)
seleccio_buttons.addEventListener('click',(e)=>{
    e.preventDefault();
    if(seleccio_buttons.dataset.times==='monthly'){
        seleccio_buttons.dataset.times='once';
    }else{
        seleccio_buttons.dataset.times='monthly';
    }

    if(seleccio_buttons.dataset.times==='monthly'){
        once_monthly[0].classList.remove('add-blue');
        once_monthly[1].classList.add('add-blue');
    }else{
        once_monthly[1].classList.remove('add-blue');
        once_monthly[0].classList.add('add-blue');
    }
});

// Impide la acción por defecto en los botones de cantidad
for(let i=0;i<amounts.length;i++){
    amounts[i].addEventListener('click',(e)=>{
        e.preventDefault();
})};

// Maneja la selección de cantidades fijas
amount_grid.addEventListener('click',(e)=>{
    e.preventDefault();
    // Solo actuamos si se hizo clic en un botón con data-amount o en el input
    if (e.target.dataset.amount !== undefined) {
        // Actualiza el dataset del contenedor principal con la cantidad seleccionada
        amount_grid.dataset.amount = e.target.dataset.amount;
        
        // Limpia el input si se seleccionó un botón fijo
        if (e.target.id !== 'wanted_amount') {
             input_amount.value = '';
        }
        
        // Quita la clase 'add-blue' de todos y la añade al elemento clickado
        for(let i=0;i<amounts.length;i++){
            amounts[i].classList.remove('add-blue');
        }
        e.target.classList.add('add-blue');
    }
}) ;
    
// Limpia la selección de botones si el usuario escribe en el input
input_amount.addEventListener('input', (e) => {
    // Si el usuario escribe, el input se convierte en la selección activa.
    if (e.target.value.length > 0) {
        for(let i=0;i<amounts.length;i++){
            amounts[i].classList.remove('add-blue');
        }
        e.target.classList.add('add-blue');
        amount_grid.dataset.amount = e.target.value;
    }
});


// ----------------------------------------------------------------------
// LÓGICA DE STRIRE (LLAMADA AL SERVIDOR)
// ----------------------------------------------------------------------

submit_form.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // La cantidad final puede venir del input o de la selección fija
    let amount = amount_grid.dataset.amount;
    const frequency = seleccio_buttons.dataset.times; // 'once' o 'monthly'
    
    // **Aseguramos que el valor final es el del input si fue el último modificado**
    if (input_amount.value && input_amount.classList.contains('add-blue')) {
        amount = input_amount.value;
    }
    
    // Validación: cantidad válida y mayor a 0
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert('Per favor, selecciona o introdueix una quantitat vàlida (més gran de 0).');
        return;
    }
    
    // Deshabilitar el botón y mostrar estado
    submit_form.disabled = true;
    submit_form.textContent = 'Processant pagament...';

    // --- Llamar a la Función Serverless ---
    try {
        const response = await fetch(SERVERLESS_ENDPOINT, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Enviamos la cantidad y la frecuencia al servidor (Vercel)
            body: JSON.stringify({ 
                amount: parseFloat(amount), 
                frequency: frequency 
            }),
        });

        if (!response.ok) {
            // Maneja errores de la función serverless
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en el servidor de Stripe.');
        }

        const session = await response.json();
        
        // --- Redirigir a la Página de Tarjeta de Crédito de Stripe ---
        const result = await stripe.redirectToCheckout({
            sessionId: session.id, // ID de la sesión devuelto por la función
        });

        if (result.error) {
            console.error(result.error.message);
            alert('Error al carregar la pàgina de pagament: ' + result.error.message);
        }
    } catch (error) {
        console.error('Error durant el procés de donació:', error);
        alert('Ha ocorregut un error. Torna a intentar-ho.');
    } finally {
        // Vuelve a habilitar el botón si la redirección falla
        submit_form.disabled = false;
        submit_form.textContent = 'DONA ARA';
    }
});