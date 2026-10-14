const config = {
  app: { name: 'Home-X', version: '1.0.0' },
  api: {
    host: (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, ''),
    user: process.env.EXPO_PUBLIC_API_USER || '',
    pass: process.env.EXPO_PUBLIC_API_PASSWORD || '',
  },
};

export default config;
