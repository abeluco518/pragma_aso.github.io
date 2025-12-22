// api/checkout.js

// 1. IMPORTANTE: Usamos 'import' porque tu package.json tiene "type": "module"
import Stripe from 'stripe'; 

// 2. Inicializamos Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    '20': 'price_1Sh5MpI9oHZMMldyTA8KSYFg', // OJO: Revisa si este ID es diferente al de 'once' 20€
    '50': 'price_1Sh5Q7I9oHZMMldyykzqCmEb',
    '100': 'price_1Sh5QLI9oHZMMldyP2GWFG73',
    '200': 'price_1Sh5QsI9oHZMMldywcN96mrS',
  }
};

export default async function handler(req, res) {
  // Configuración de cabeceras para evitar problemas de CORS (opcional pero recomendado)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount, frequency } = req.body;
    
    // Buscamos el ID correcto
    const priceId = PRICES[frequency]?.[amount];

    if (!priceId) {
      console.error(`Error: Precio no encontrado para ${amount}€ - ${frequency}`);
      return res.status(400).json({ error: 'Combinación de precio no encontrada' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: frequency === 'monthly' ? 'subscription' : 'payment',
      success_url: `${req.headers.origin}/success.html`, // Asegúrate de que existe success.html
      cancel_url: `${req.headers.origin}/index.html`,    // O volver al inicio
    });

    res.status(200).json({ id: session.id });

  } catch (error) {
    console.error("Error Stripe:", error); // Esto saldrá en los logs de Vercel
    res.status(500).json({ error: error.message });
  }
}