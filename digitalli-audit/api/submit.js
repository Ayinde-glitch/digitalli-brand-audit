export default async function handler(req, res) {
  // Allow CORS from any origin (your Webflow site, Vercel preview, etc.)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, company, score, tier, vendor, inventory, fulfilment, cost } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: name || '',
          COMPANY: company || '',
          MERCH_SCORE: score,
          MERCH_TIER: tier,
          MERCH_VENDOR_SCORE: vendor,
          MERCH_INVENTORY_SCORE: inventory,
          MERCH_FULFILMENT_SCORE: fulfilment,
          MERCH_COST_SCORE: cost
        },
        listIds: [6],
        updateEnabled: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo error:', data);
      return res.status(response.status).json({ error: data.message || 'Brevo error' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
