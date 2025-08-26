res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET');
import { QrCodePix } from 'qrcode-pix';

export default async function handler(req, res) {
  const { amount, name, message } = req.query;

 const qrCodePix = QrCodePix({
  version: '01',
  key: '48567777852', // sua chave Pix real
  name: 'Luiz Claudio Dias dos Santos Filho', // nome do titular da chave
  city: 'SANTOS',
  amount: parseFloat(amount) || 0, // valor do pedido
  message: message || 'Pagamento via site'
});

  const buffer = await qrCodePix.toImageBuffer();
  const base64 = buffer.toString('base64');

  res.status(200).json({
    qrCode: `data:image/png;base64,${base64}`
  });
}
