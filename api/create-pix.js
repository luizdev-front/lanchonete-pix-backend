const { QrCodePix } = require('qrcode-pix');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { amount, name, message } = req.query;

  try {
    const qrCodePix = QrCodePix({
      version: '01',
      key: '48567777852',
      name: name || 'Luiz Claudio Dias dos Santos Filho',
      city: 'SANTOS',
      amount: parseFloat(amount) || 0,
      message: message || 'Pedido via site'
    });

    const buffer = await qrCodePix.toImageBuffer();
    const base64 = buffer.toString('base64');

    res.status(200).json({
      qrCode: `data:image/png;base64,${base64}`
    });
  } catch (err) {
    console.error('Erro ao gerar QR Code:', err);
    res.status(500).json({ error: 'Erro interno ao gerar o code' });
  }
};
