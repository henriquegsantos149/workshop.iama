export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
  const META_PIXEL_ID = process.env.META_PIXEL_ID || '1373287802810243';

  if (!META_CAPI_ACCESS_TOKEN) {
    console.error("META_CAPI_ACCESS_TOKEN is not defined in environment variables");
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const { event_name, event_id, event_source_url } = req.body;

  const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  const eventPayload = {
    data: [
      {
        event_name: event_name || 'ViewContent',
        event_time: Math.floor(Date.now() / 1000),
        event_id: event_id,
        action_source: 'website',
        event_source_url: event_source_url || req.headers.referer,
        user_data: {
          client_ip_address: clientIp.split(',')[0].trim(),
          client_user_agent: userAgent
        }
      }
    ]
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Meta CAPI Error:', errorText);
      return res.status(response.status).json({ message: 'Failed to send event to Meta' });
    }

    const json = await response.json();
    return res.status(200).json({ success: true, meta_response: json });
  } catch (error) {
    console.error('Meta CAPI Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
