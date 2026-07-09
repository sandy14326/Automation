import { defineConfig } from 'vite';
import '@vitejs/plugin-react';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});
