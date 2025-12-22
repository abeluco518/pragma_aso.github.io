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