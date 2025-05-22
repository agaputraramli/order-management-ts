import fs from 'fs/promises';
import path from 'path';

interface OrderItem {
  id_product: number;
  name: string;
  price: number;
  qty: number;
}

interface OrderData {
  id_customer: number;
  name: string;
  email: string;
  address: string;
  payment_type: string;
  items: OrderItem[];
}

interface OrderFileFormat extends OrderData {
  no_order: string;
  total: number;
  status: string;
}

const lockMap: Record<number, boolean> = {}; 

export default class OrderService {
  static async processOrder(data: OrderData): Promise<OrderFileFormat> {
    // Concurrency Lock
    while (lockMap[data.id_customer]) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    lockMap[data.id_customer] = true;

    try {
      const date = new Date();
      const dateStr = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getFullYear()).slice(-2)}`;

      const runningNumber = await this.getAndUpdateRunningNumber(data.id_customer, dateStr);
      const no_order = `ORDER-${data.id_customer}-${dateStr}-${runningNumber}`;

      const total = data.items.reduce((sum, item) => sum + item.price * item.qty, 0);

      const order: OrderFileFormat = {
        ...data,
        no_order,
        total,
        status: 'Order Diterima:'
      };

      const dirPath = path.join(__dirname, '../database/customer-order');
      const filePath = path.join(dirPath, `${no_order}.json`);

      await fs.mkdir(dirPath, { recursive: true });

      let saved = false;
      let retries = 0;
      while (!saved && retries < 3) {
        try {
          await fs.writeFile(filePath, JSON.stringify(order, null, 2));
          saved = true;
        } catch (err) {
          retries++;
          if (retries >= 3) {
            throw new Error('Gagal menyimpan file order setelah 3 kali percobaan');
          }
        }
      }

      return order;
    } finally {
      lockMap[data.id_customer] = false; 
    }
  }

  static async getAndUpdateRunningNumber(id_customer: number, dateStr: string): Promise<string> {
    const runningFile = path.join(__dirname, '../database/runningNumbers.json');
    let runningNumbers: Record<string, number> = {};

    try {
      const data = await fs.readFile(runningFile, 'utf-8');
      runningNumbers = JSON.parse(data);
    } catch {
      runningNumbers = {};
    }

    const key = `${id_customer}-${dateStr}`;
    if (!runningNumbers[key]) {
      runningNumbers[key] = 1;
    } else {
      runningNumbers[key]++;
    }

    await fs.writeFile(runningFile, JSON.stringify(runningNumbers, null, 2));

    return String(runningNumbers[key]).padStart(5, '0');
  }
}
