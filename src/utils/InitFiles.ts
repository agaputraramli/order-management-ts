import fs from 'fs/promises';
import path from 'path';

const initFiles = async () => {
  const runningPath = path.join(__dirname, '../database/runningNumbers.json');
  const customerPath = path.join(__dirname, '../mock/customers.json');

  await fs.mkdir(path.dirname(runningPath), { recursive: true });
  await fs.mkdir(path.dirname(customerPath), { recursive: true });

  try {
    await fs.access(runningPath);
  } catch {
    await fs.writeFile(runningPath, '{}');
    console.log('✅ runningNumbers.json dibuat');
  }

  try {
    await fs.access(customerPath);
  } catch {
    const dummyCustomers = [
      { id: 1, name: 'Jhon Doe', email: 'jhon.doe@gmail.com' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' }
    ];
    await fs.writeFile(customerPath, JSON.stringify(dummyCustomers, null, 2));
    console.log('customers.json dibuat dengan dummy data');
  }
};

export default initFiles;
