import { Request, Response } from 'express';
import OrderService from '../services/OrderService';
import fs from 'fs';
import path from 'path';

export default class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const { name, email, address, payment_type, items } = req.body;

      if (!name || !address || !payment_type || !Array.isArray(items)) {
        return res.status(400).json({ message: 'Invalid request payload' });
      }

      const customerData = fs.readFileSync(path.join(__dirname, '../mock/customers.json'), 'utf-8');
      const customers = JSON.parse(customerData);

      const customer = customers.find((c: any) => c.name === name || c.email === email);

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      await new Promise(resolve => setTimeout(resolve, 3000));

      const order = await OrderService.processOrder({
        id_customer: customer.id,
        name: customer.name,
        email: customer.email,
        address,
        payment_type,
        items
      });

      return res.status(201).json({
        message: 'Order berhasil diproses',
        result: {
          order_number: order.no_order,
        },
      });
    } catch (error: any) {
      console.error('Error processing order:', error);
      return res.status(500).json({
        message: error.message || 'Internal Server Error',
      });
    }
  }
}
