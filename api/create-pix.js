const QRCode = require('qrcode');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { amount, name, message } = req.query;

  try {
    const pixCode = `00020126360014BR.GOV.BCB.PIX011148567777852520400005303986540${amount}5802BR5925${name || 'Luiz Claudio'}6009SANTOS62070503***6304`; // exemplo de código Pix

    const base64 = await QRCode.toDataURL(pixCode);

    res.status(200).json({
      qrCode: base64
    });
  } catch (err) {
    console.error('Erro ao gerar QR Code:', err);
    res.status(500).json({ error: 'Erro interno ao gerar o QR Code' });
  }
};
