import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
    server: {
        https: {
            key: fs.readFileSync('certificates/dev.key'),
            cert: fs.readFileSync('certificates/dev.cert')
        },
        host: true,
        port: 5173,
        watch: {
            usePolling: true,
        },
    }
});