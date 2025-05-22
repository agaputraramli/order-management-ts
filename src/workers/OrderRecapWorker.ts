import fs from 'fs/promises';
import path from 'path';

const DELIVERED_DIR = path.join(__dirname, '../database/delivered-order');
const RECAP_DIR = path.join(__dirname, '../database/rekap-order');

async function runOrderRecapWorker() {
  setInterval(async () => {
    try {
      const files = await fs.readdir(DELIVERED_DIR);
      const orders: any[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(DELIVERED_DIR, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const json = JSON.parse(content);
          orders.push(json);
        }
      }

      if (orders.length === 0) return;

      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const fileName = `REKAP-ORDER-${day}${month}${year}.json`;
      const filePath = path.join(RECAP_DIR, fileName);

      await fs.mkdir(RECAP_DIR, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(orders, null, 2));

      console.log(`Rekap berhasil: ${fileName}`);
    } catch (err: any) {
      console.error('Gagal rekap order:', err.message);
    }
  }, 5000);
}

runOrderRecapWorker();
