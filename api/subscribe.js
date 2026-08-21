import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    name,
    email,
    phone,
    whatsapp,
    education,
    occupation,
    education_area,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_campaign,
    utm_content,
    utm_term,
    event_id
  } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const API_KEY = process.env.ACTIVE_API_KEY;
  const API_URL = 'https://ambientalpro.api-us1.com/api/3';

  if (!API_KEY) {
    console.error("ACTIVE_API_KEY is not defined in environment variables");
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // Helper to add field values conditionally
  const addField = (fieldsArray, fieldId, value) => {
    if (value) {
      fieldsArray.push({ field: fieldId, value: value });
    }
  };

  const fieldValues = [];
  addField(fieldValues, '874', education || occupation); // [WK][PÓS][IA.MA] UTM Possui Graduação
  addField(fieldValues, '875', education_area);          // [WK][PÓS][IA.MA] UTM Área de Formação
  addField(fieldValues, '877', utm_source);              // [WK][PÓS][IA.MA] UTM Source
  addField(fieldValues, '878', utm_medium);              // [WK][PÓS][IA.MA] UTM Medium
  addField(fieldValues, '876', utm_campaign);            // [WK][PÓS][IA.MA] UTM Campaign
  addField(fieldValues, '879', utm_content);             // [WK][PÓS][IA.MA] UTM Content
  addField(fieldValues, '872', utm_term);                // [WK][PÓS][IA.MA] UTM Term
  
  // [WK][PÓS][IA.MA] UTM Data de Inscrição (ID 873)
  const currentDateTime = new Date().toISOString();
  addField(fieldValues, '873', currentDateTime);

  // Separate firstName and lastName to cleanly sync in ActiveCampaign
  const nameParts = (name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');

  const rawPhone = (phone || whatsapp || '').toString();
  const cleanPhone = rawPhone.replace(/\D/g, '');

  const contactPayload = {
    contact: {
      email,
      firstName,
      lastName,
      phone: cleanPhone,
      fieldValues
    }
  };

  try {
    // 1. Create or sync the contact
    const contactResponse = await fetch(`${API_URL}/contact/sync`, {
      method: 'POST',
      headers: {
        'Api-Token': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactPayload)
    });

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      console.error('ActiveCampaign Sync Error:', errorText);
      return res.status(contactResponse.status).json({ message: 'Failed to sync contact', details: errorText });
    }

    const contactData = await contactResponse.json();
    const contactId = contactData.contact.id;

    // 2. Add the [WK][PÓS][IA.MA] Lead tag (ID: 477)
    const tagPayload = {
      contactTag: {
        contact: contactId,
        tag: '477'
      }
    };

    const tagResponse = await fetch(`${API_URL}/contactTags`, {
      method: 'POST',
      headers: {
        'Api-Token': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tagPayload)
    });

    if (!tagResponse.ok) {
      const errorText = await tagResponse.text();
      console.error('ActiveCampaign Tag Error:', errorText);
      // We still return success since the contact was created, but log the error.
    }

    // --- META CAPI ---
    const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
    const META_PIXEL_ID = process.env.META_PIXEL_ID || '1373287802810243';

    if (META_CAPI_ACCESS_TOKEN && event_id) {
      try {
        const hashData = (data) => data ? crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex') : undefined;

        const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';

        const capiPayload = {
          data: [
            {
              event_name: 'Lead',
              event_time: Math.floor(Date.now() / 1000),
              event_id: event_id,
              action_source: 'website',
              event_source_url: req.headers.referer || '',
              user_data: {
                em: [hashData(email)],
                ph: cleanPhone ? [hashData('55' + cleanPhone)] : [], // Defaulting to BR country code if missing
                fn: hashData(firstName),
                client_ip_address: clientIp.split(',')[0].trim(),
                client_user_agent: userAgent
              }
            }
          ]
        };

        const capiResponse = await fetch(`https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_ACCESS_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(capiPayload)
        });

        if (!capiResponse.ok) {
          console.error('Meta CAPI Lead Error:', await capiResponse.text());
        }
      } catch (capiError) {
        console.error('Meta CAPI Exception:', capiError);
      }
    }

    return res.status(200).json({ success: true, message: 'Contact processed successfully' });

  } catch (error) {
    console.error('ActiveCampaign Integration Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
