// Simple script to wait for backend to be ready
import http from 'http';

const checkBackend = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/financial/wide',
      method: 'GET',
      timeout: 1000
    };

    const req = http.request(options, (res) => {
      console.log('✓ Backend is ready!');
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
};

const waitForBackend = async () => {
  console.log('Waiting for backend to start...');
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds max

  while (attempts < maxAttempts) {
    const isReady = await checkBackend();
    if (isReady) {
      console.log('Backend is ready! Starting frontend...');
      return;
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.stdout.write('.');
  }

  console.log('\n⚠ Backend did not start in time, starting frontend anyway...');
};

waitForBackend().then(() => {
  process.exit(0);
});
