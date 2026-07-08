export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  console.log('Submit function called');

  const { name, email, company, score, tier, vendor, inventory, fulfilment, cost, vendor_tier, inventory_tier, fulfilment_tier, cost_tier, industry, team_size, merch_challenge } = req.body;

  console.log('Received data:', { name, email, company, score, tier, industry, team_size });

  if (!email) return res.status(400).json({ error: 'Email is required' });

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('BREVO_API_KEY is not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  console.log('API key found, sending to Brevo...');

  try {
    const payload = {
      email,
      attributes: {
        FIRSTNAME: name || '',
        COMPANY: company || '',
        MERCH_SCORE: score || 0,
        MERCH_TIER: tier || '',
        MERCH_VENDOR_SCORE: vendor || 0,
        MERCH_INVENTORY_SCORE: inventory || 0,
        MERCH_FULFILMENT_SCORE: fulfilment || 0,
        MERCH_COST_SCORE: cost || 0,
        MERCH_VENDOR_TIER: vendor_tier || '',
        MERCH_INVENTORY_TIER: inventory_tier || '',
        MERCH_FULFILMENT_TIER: fulfilment_tier || '',
        MERCH_COST_TIER: cost_tier || '',
        INDUSTRY: industry || '',
        TEAM_SIZE: team_size || '',
        MERCH_CHALLENGE: merch_challenge || ''
      },
      listIds: [6],
      updateEnabled: true
    };

    console.log('Payload:', JSON.stringify(payload));

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('Brevo response status:', response.status);
    console.log('Brevo response body:', responseText);

    if (!response.ok) {
      return res.status(response.status).json({ error: responseText });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
