// api/create-checkout-session.js

// Importa la librería de Stripe. Lee la clave secreta de la configuración segura de Vercel.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// --- CONFIGURACIÓN DE REDIRECCIÓN (AJUSTA ESTAS 2 URLs) ---
const SUCCESS_URL = 'https://tudominio.com/gracies'; 
const CANCEL_URL = 'https://tudominio.com/torna-a-donar';
// -----------------------------------------------------------

module.exports = async (req, res) => {
    // Vercel te da el cuerpo de la petición en req.body
    if (req.method !== 'POST') {
        // Devuelve un error si no es un POST (lo que enviará tu JS)
        return res.status(405).json({ error: 'Mètode no permès. Només POST.' });
    }

    const { amount, frequency } = req.body;
    
    // Validación de entrada
    if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Quantitat de donació no vàlida.' });
    }
    
    const amountInCents = Math.round(amount * 100);

    try {
        let session_params = {
            payment_method_types: ['card'],
            locale: 'ca', // O 'es' para español.
            // La URL de éxito incluye el ID de la sesión para seguimiento posterior
            success_url: SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: CANCEL_URL,
            
            mode: 'payment', // Por defecto: Pago único
            line_items: [{
                price_data: {
                    currency: 'eur', 
                    unit_amount: amountInCents,
                    product_data: {
                        name: 'Donació a la Causa',
                    },
                },
                quantity: 1,
            }],
        };

        // Lógica para Donación Mensual (Suscripción)
        if (frequency === 'monthly') {
            session_params.mode = 'subscription';
            session_params.line_items[0].price_data.product_data.name = 'Donació Mensual';
            session_params.line_items[0].price_data.recurring = { interval: 'month' };
        }

        const session = await stripe.checkout.sessions.create(session_params);
        
        // Devuelve el ID de la sesión al JavaScript del navegador
        res.status(200).json({ id: session.id }); 

    } catch (e) {
        // Manejo de errores
        console.error("Stripe Error:", e.message);
        res.status(500).json({ error: e.message || 'Error intern en crear la sessió de pagament.' });
    }
};