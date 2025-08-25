// api/create-pix.js
return host ? `${proto}://${host}` : undefined;
}


module.exports = async (req, res) => {
cors(res);
if (req.method === 'OPTIONS') return res.status(204).end();
if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });


try {
const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
const { amount, description, email, first_name, last_name, cpf } = body;


const errs = [];
if (!amount || Number(amount) <= 0) errs.push('amount');
if (!email) errs.push('email');
if (!cpf) errs.push('cpf');
if (errs.length) return res.status(400).json({ error: `Campos obrigatórios: ${errs.join(', ')}` });


const payload = {
transaction_amount: Number(amount),
description: description || 'Pedido',
payment_method_id: 'pix',
payer: {
email,
first_name: first_name || '',
last_name: last_name || '',
identification: { type: 'CPF', number: String(cpf) }
},
notification_url: (() => {
const base = getBaseUrl(req);
return base ? `${base}/api/mp-webhook` : undefined;
})()
};


const r = await fetch('https://api.mercadopago.com/v1/payments', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
'X-Idempotency-Key': randomUUID()
},
body: JSON.stringify(payload)
});


const data = await r.json();
if (!r.ok) return res.status(r.status).json({ error: data });


const tx = data.point_of_interaction?.transaction_data || {};
return res.status(200).json({
id: data.id,
status: data.status,
qr_code_base64: tx.qr_code_base64,
qr_code: tx.qr_code
});
} catch (e) {
console.error(e);
return res.status(500).json({ error: 'create-pix falhou' });
}
};
