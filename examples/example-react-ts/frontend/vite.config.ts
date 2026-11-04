import react from '@vitejs/plugin-react';
import { glConfig } from 'glidelite/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  ...glConfig,
  plugins: [react()]
});
