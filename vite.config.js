import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '^/accounts': {
                target: 'http://localhost:4001',
                changeOrigin: true,
                secure: false,
            },
            '^/events': {
                target: 'http://localhost:4001',
                changeOrigin: true,
                secure: false,
            },
            '^/registry': {
                target: 'http://localhost:4001',
                changeOrigin: true,
                secure: false,
            },
            '^/config': {
                target: 'http://localhost:4001',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom', '@mui/material', 'dayjs'],
                    'organizer': [
                        './src/component/organizer/OrganizerHome.jsx',
                        './src/component/organizer/OrganizerSettings.jsx',
                        './src/component/organizer/OrganizerEvent.jsx',
                        './src/component/organizer/CreateEvent.jsx',
                        './src/component/organizer/OrganizerReport.jsx',
                        './src/component/organizer/AIEventPreview.jsx',
                        './src/component/template/OrganizerTemplate.jsx'
                    ],
                    'attendee': [
                        './src/component/attendee/AttendeeHome.jsx',
                        './src/component/attendee/AttendeeProfile.jsx',
                        './src/component/attendee/AttendeeFavoriteEvents.jsx',
                        './src/component/attendee/AttendeeInterest.jsx',
                        './src/component/template/AttendeeProfileSettings.jsx'
                    ],
                    'dashboard': [
                        './src/component/dashboard/Dashboard.tsx',
                        './src/component/dashboard/components/MainGrid.js',
                        './src/component/dashboard/components/users/UserManagement.tsx',
                        './src/component/dashboard/components/event/EventReport.tsx',
                        './src/component/dashboard/components/event/EventManagement.tsx'
                    ]
                }
            }
        },
        commonjsOptions: {
            include: [/node_modules/],
            extensions: ['.js', '.cjs'],
            strictRequires: true,
            transformMixedEsModules: true,
        },
    },
    optimizeDeps: {
        include: ['dayjs', 'dayjs/plugin/relativeTime'],
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
    }
})
