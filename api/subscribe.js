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
    utm_content,
    utm_term,
    event_id
  } = req.body;

  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const API_KEY = process.env.ACTIVE_API_KEY;
  const API_URL = 'https://ambientalpro.api-us1.com/api/3';

  if (!API_KEY) {
    console.error('[API Subscribe] ACTIVE_API_KEY is not defined in environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // Helper to add field values conditionally (ignores undefined, null, or empty string)
  const addField = (fieldsArray, fieldId, value) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      fieldsArray.push({ field: String(fieldId), value: String(value).trim() });
    }
  };

  const fieldValues = [];
  addField(fieldValues, '891', education || occupation); // [PERPETUOWORKSHOP][IA] UTM Possui Graduação
  addField(fieldValues, '892', education_area);          // [PERPETUOWORKSHOP][IA] UTM Área de Formação
  addField(fieldValues, '894', utm_source);              // [PERPETUOWORKSHOP][IA] UTM Source
  addField(fieldValues, '895', utm_medium);              // [PERPETUOWORKSHOP][IA] UTM Medium
  addField(fieldValues, '893', utm_campaign);            // [PERPETUOWORKSHOP][IA] UTM Campaign
  addField(fieldValues, '888', utm_content);             // [PERPETUOWORKSHOP][IA] UTM Content
  addField(fieldValues, '889', utm_term);                // [PERPETUOWORKSHOP][IA] UTM Term
  
  // [PERPETUOWORKSHOP][IA] UTM Data de Inscrição (ID 890) - Data e horário completo
  const currentDateTime = new Date().toISOString();
  addField(fieldValues, '890', currentDateTime);

  // Separate firstName and lastName to cleanly sync in ActiveCampaign
  const nameParts = (name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');

  // Sanitize phone (send DDD + number without 55 DDI)
  const rawPhone = (phone || whatsapp || '').toString().trim();
  let digitsOnly = rawPhone.replace(/\D/g, '');
  let cleanPhone = digitsOnly;
  if (digitsOnly.startsWith('55') && (digitsOnly.length === 12 || digitsOnly.length === 13)) {
    cleanPhone = digitsOnly.substring(2);
  }

  const contactPayload = {
    contact: {
      email: cleanEmail,
      firstName,
      lastName,
      phone: cleanPhone,
      fieldValues
    }
  };

  console.log('[API Subscribe] Sincronizando contato no ActiveCampaign:', {
    email: cleanEmail,
    firstName,
    phone: cleanPhone,
    fieldsCount: fieldValues.length
  });

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
      console.error('[API Subscribe] Erro no ActiveCampaign Sync:', errorText);
      return res.status(contactResponse.status).json({ message: 'Failed to sync contact', details: errorText });
    }

    const contactData = await contactResponse.json();
    const contactId = contactData.contact?.id;
    console.log('[API Subscribe] Contato sincronizado com sucesso! ID:', contactId);

    // 2. Add the [PERPETUOWORKSHOP][IA] Lead tag (ID: 484)
    if (contactId) {
      const tagPayload = {
        contactTag: {
          contact: contactId,
          tag: '484'
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
        console.error('[API Subscribe] Erro ao aplicar Tag no ActiveCampaign:', errorText);
      } else {
        console.log('[API Subscribe] Tag 484 aplicada com sucesso!');
      }
    }

    // --- META CAPI ---
    const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
    const META_PIXEL_ID = process.env.META_PIXEL_ID || '1373287802810243';

    if (META_CAPI_ACCESS_TOKEN && event_id) {
      try {
        const hashData = (data) => data ? crypto.createHash('sha256').update(String(data).trim().toLowerCase()).digest('hex') : undefined;

        const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';

        const capiPayload = {
          data: [
            {
              event_name: 'Lead',
              event_time: Math.floor(Date.now() / 1000),
              event_id: event_id,
              action_source: 'website',
              event_source_url: req.headers.referer || 'https://curso.ambientalpro.com.br/workshop-ia',
              user_data: {
                em: [hashData(cleanEmail)],
                ph: cleanPhone ? [hashData(cleanPhone)] : [],
                fn: firstName ? hashData(firstName) : undefined,
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
          console.error('[API Subscribe] Meta CAPI Lead Error:', await capiResponse.text());
        } else {
          console.log('[API Subscribe] Evento Lead enviado com sucesso para Meta CAPI!');
        }
      } catch (capiError) {
        console.error('[API Subscribe] Meta CAPI Exception:', capiError);
      }
    }

    return res.status(200).json({ success: true, message: 'Lead gravado com sucesso!' });

  } catch (error) {
    console.error('[API Subscribe] Exceção geral na integração:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
