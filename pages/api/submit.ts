import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import { MongoClient } from 'mongodb';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadsDir = path.join(process.cwd(), 'public/receipts');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Error parsing form data' });

    const orderId = 'ORD' + Math.floor(Math.random() * 1000000);
    const data = {
      orderId,
      full_name: fields.full_name?.toString(),
      pan_number: fields.pan_number?.toString(),
      email: fields.email?.toString(),
      income_type: fields.income_type?.toString(),
      document_name: files.document?.originalFilename || '',
      submitted_at: new Date(),
    };

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([500, 400]);
    page.drawText(`Order Receipt - ${orderId}`, { x: 50, y: 350, size: 20, color: rgb(0, 0, 0) });
    let y = 320;
    Object.entries(data).forEach(([k, v]) => {
      page.drawText(`${k}: ${v}`, { x: 50, y, size: 12 });
      y -= 20;
    });
    const pdfBytes = await pdfDoc.save();
    const pdfPath = path.join(uploadsDir, `${orderId}.pdf`);
    fs.writeFileSync(pdfPath, pdfBytes);

    // Save to MongoDB
    const client = await MongoClient.connect(process.env.MONGO_URL!);
    const db = client.db();
    await db.collection('orders').insertOne(data);
    await client.close();

    res.status(200).json({ orderId, receiptUrl: `/receipts/${orderId}.pdf` });
  });
}
