import app from './app';
import initFiles from './utils/InitFiles';

const PORT = 3000;

initFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
});