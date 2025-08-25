const fetch = require('node-fetch');
const cors = (res) => res.setHeader('Access-Control-Allow-Origin', '*');

async function sendWhatsapp(payment) {
  const valor = Number(payment.transaction_amount || 0)
    .toFixed(2)
    .replace('.', ',');
  
  const mensagem = [
    `✅ Pagamento aprovado!`,
    `Pedido: ${payment.id}`,
    `Valor: R$ ${valor}`,
    `Cliente: ${payment.payer?.email || '—'}`,
    `Status: ${payment.status}`,
    `Detalhe: ${payment.status_detail || '—'}`
  ].join('\n');

  const url = `https://graph.facebook.com/v15.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

  await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: process.env.WHATSAPP_NUMBER,
      type: "text",
      text: { body: mensagem }
    })
  });
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const raw = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const id = raw?.data?.id || raw?.id || (raw?.resource ? String(raw.resource).split('/').pop() : null);

    if (!id) {
      // Mercado Pago pode enviar testes sem ID
      return res.status(200).send('no id');
    }

    // Confirma no servidor do Mercado Pago
    const resp = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });
    const payment = await resp.json();

    // Envia WhatsApp se o pagamento estiver aprovado
    if (payment?.status === 'approved') {
      try { 
        await sendWhatsapp(payment); 
      } catch (e) { 
        console.error('whatsapp error', e); 
      }
    }

    return res.status(200).send('ok');
  } catch (e) {
    console.error(e);
    // 200 evita re-tentativas infinitas do Mercado Pago
    return res.status(200).send('error');
  }
};
