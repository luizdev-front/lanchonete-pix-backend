// api/check-payment.js
function cors(res) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}


module.exports = async (req, res) => {
cors(res);
if (req.method === 'OPTIONS') return res.status(204).end();


const id = req.query?.id || (req.url?.includes('?') ? new URL(req.url, 'http://x').searchParams.get('id') : null);
if (!id) return res.status(400).json({ error: 'id obrigatório' });


try {
const r = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
});
const data = await r.json();
if (!r.ok) return res.status(r.status).json({ error: data });


return res.status(200).json({ id: data.id, status: data.status, status_detail: data.status_detail });
} catch (e) {
console.error(e);
return res.status(500).json({ error: 'check-payment falhou' });
}
};
