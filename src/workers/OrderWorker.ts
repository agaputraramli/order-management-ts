import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';
import pLimit from 'p-limit';

const ORDERS_DIR = path.join(__dirname, '../database/customer-order');
const DELIVERED_DIR = path.join(__dirname, '../database/delivered-order');

const MAX_CONCURRENT = 10;
const MAX_RETRY = 3;

class OrderWorker {
  static async processFile(file: string) {
    let attempts = 0;
    while (attempts < MAX_RETRY) {
      try {
        attempts++;
        
        const orderPath = path.join(ORDERS_DIR, file);
        const deliveredPath = path.join(DELIVERED_DIR, file);

        // Cek apakah file sudah ada di delivered-order
        try {
          await fs.access(deliveredPath);
          console.log(`File ${file} sudah ada di delivered-order, skip.`);
          return;
        } catch {
        }

        const data = await fs.readFile(orderPath, 'utf-8');
        const order = JSON.parse(data);

        order.status = 'Dikirim ke customer';

        // Simpan ulang ke folder customer-order
        await fs.writeFile(orderPath, JSON.stringify(order, null, 2), 'utf-8');
        await fs.copyFile(orderPath, deliveredPath);

        console.log(`Order ${order.no_order} telah diupdate dan dipindah ke delivered-order.`);
        return;
      } catch (error) {
        console.error(`Gagal proses file ${file}, percobaan ke-${attempts}:`, error);
        if (attempts >= MAX_RETRY) {
          console.error(`File ${file} gagal diproses setelah ${MAX_RETRY} kali percobaan.`);
          return;
        }
      }
    }
  }

  static async processOrders() {
    try {
      await fs.mkdir(DELIVERED_DIR, { recursive: true });

      const files = (await fs.readdir(ORDERS_DIR)).filter(f => f.endsWith('.json'));

      const limit = pLimit(MAX_CONCURRENT);

      const promises = files.map(file => limit(() => this.processFile(file)));

      await Promise.all(promises);
    } catch (error) {
      console.error('Error in processing orders:', error);
    }
  }

  static start() {
    cron.schedule('*/10 * * * * *', () => {
      console.log('Cron job running: Process orders...');
      this.processOrders();
    });
  }
}

export default OrderWorker;
