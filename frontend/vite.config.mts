import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue({
        template: {
            compilerOptions: {
                // Skip some checks for production builds
                isCustomElement: () => false,
            }
        }
    })],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    server: {
        proxy: {
            '/api': 'http://localhost:3000',
        },
    },
    build: {
        // Skip type checking during build
        rollupOptions: {
            onwarn: () => {},
        }
    },
    esbuild: {
        // Disable some strict checks
        logOverride: { 'this-is-undefined-in-esm': 'silent' }
    }
});
