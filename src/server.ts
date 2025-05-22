import app from './app';
import initFiles from './utils/InitFiles';
import OrderWorker from './workers/OrderWorker';

OrderWorker.start();
const PORT = 3000;

initFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
});