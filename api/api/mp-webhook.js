// api/mp-webhook.js


async function sendEmail({ payment, to }) {
const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT || 465),
secure: String(process.env.SMTP_PORT || 465) === '465',
auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});


const valor = Number(payment.transaction_amount || 0).toFixed(2).replace('.', ',');
const assunto = `✅ PIX aprovado - Pedido ${payment.id}`;
const texto = [
`Pagamento aprovado!`,
`Pedido: ${payment.id}`,
`Valor: R$ ${valor}`,
`Cliente: ${payment.payer?.email || '—'}`,
`Status: ${payment.status}`,
`Detalhe: ${payment.status_detail || '—'}`
].join('\n');


await transporter.sendMail({ from: process.env.FROM_EMAIL, to, subject: assunto, text: texto });
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


// Segurança: confirma no servidor do MP
const resp = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
});
const payment = await resp.json();


if (payment?.status === 'approved' && process.env.SELLER_EMAIL) {
try { await sendEmail({ payment, to: process.env.SELLER_EMAIL }); }
catch (e) { console.error('email error', e); }
}


return res.status(200).send('ok');
} catch (e) {
console.error(e);
// 200 evita re-tentativas infinitas do MP
return res.status(200).send('error');
}
};
