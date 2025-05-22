import express from 'express';
import bodyParser from 'body-parser';
import orderRoutes from './routes/OrderRoutes';

const app = express();

app.use(bodyParser.json());
app.use('/api', orderRoutes);

export default app;
