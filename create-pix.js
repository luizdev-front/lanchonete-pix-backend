import { QrCodePix } from 'qrcode-pix';

export default async function handler(req, res) {
  const { amount, name, message } = req.query;

  const qrCodePix = QrCodePix({
    version: '01',
    key: 'sua-chave-pix-aqui', // chave Pix do recebedor
    name: name || 'Seu Nome',
    city: 'SANTOS',
    amount: parseFloat(amount) || 0,
    message: message || 'Pagamento via site'
  });

  const buffer = await qrCodePix.toImageBuffer();
  const base64 = buffer.toString('base64');

  res.status(200).json({
    qrCode: `data:image/png;base64,${base64}`
  });
}
