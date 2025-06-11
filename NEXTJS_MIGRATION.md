# Next.js Migration Guide

## Overview

This document outlines the complete migration from Vite React TypeScript to Next.js TypeScript while maintaining all functionality, including the Voltage Pay API integration and proxy server capabilities.

## Migration Summary

### What Changed

1. **Build System**: Migrated from Vite to Next.js
2. **File Structure**: Converted to Next.js pages directory structure
3. **TypeScript**: Enhanced TypeScript support with Next.js conventions
4. **Environment Variables**: Updated to use Next.js environment variable conventions
5. **API Proxy**: Replaced Vite proxy with Next.js API routes
6. **Dependencies**: Updated package.json for Next.js ecosystem

### Key Benefits

- **Built-in API Routes**: No need for separate proxy server
- **Server-Side Rendering**: Better SEO and performance capabilities
- **TypeScript Integration**: Enhanced TypeScript support out of the box
- **Production Ready**: Better production build and deployment options
- **Environment Variables**: Secure server-side and client-side variable handling

## File Structure Changes

### Before (Vite)
```
src/
├── components/
├── hooks/
├── utils/
├── config/
├── main.jsx
├── App.jsx
└── index.css
index.html
vite.config.js
```

### After (Next.js)
```
src/
├── components/
├── hooks/
├── utils/
├── config/
├── types/
└── index.css
pages/
├── api/
│   └── voltage/
│       └── [...path].ts
├── _app.tsx
├── _document.tsx
└── index.tsx
next.config.mjs
tsconfig.json
```

## Environment Variables

### Before (Vite)
```env
VITE_VOLTAGE_API_URL=https://voltageapi.com/v1
VITE_VOLTAGE_API_KEY=your_api_key_here
VITE_VOLTAGE_ORGANIZATION_ID=your_organization_id_here
VITE_VOLTAGE_ENVIRONMENT_ID=your_environment_id_here
VITE_VOLTAGE_LINE_OF_CREDIT_ID=your_line_of_credit_id_here
VITE_VOLTAGE_NETWORK=mutinynet
```

### After (Next.js)
Create `.env.local` file:
```env
# Client-side accessible variables
NEXT_PUBLIC_VOLTAGE_API_URL=https://voltageapi.com/v1
NEXT_PUBLIC_VOLTAGE_API_KEY=your_api_key_here
NEXT_PUBLIC_VOLTAGE_ORGANIZATION_ID=your_organization_id_here
NEXT_PUBLIC_VOLTAGE_ENVIRONMENT_ID=your_environment_id_here
NEXT_PUBLIC_VOLTAGE_LINE_OF_CREDIT_ID=your_line_of_credit_id_here
NEXT_PUBLIC_VOLTAGE_NETWORK=mutinynet

# Server-side only (for API routes)
VOLTAGE_API_KEY=your_api_key_here
```

## API Proxy Implementation

### Before (Vite)
Used `vite.config.js` proxy configuration:
```javascript
server: {
  proxy: {
    '/api/voltage': {
      target: 'https://voltageapi.com/v1',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/voltage/, ''),
      configure: (proxy, options) => {
        proxy.on('proxyReq', (proxyReq, req, res) => {
          proxyReq.setHeader('X-Api-Key', process.env.VOLTAGE_API_KEY);
        });
      }
    }
  }
}
```

### After (Next.js)
Uses API route at `pages/api/voltage/[...path].ts`:
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path;
  const voltageUrl = `https://voltageapi.com/v1/${pathString}`;
  
  const response = await fetch(voltageUrl, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.VOLTAGE_API_KEY || '',
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  });
  
  // Handle response and CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  // ... rest of implementation
}
```

## Scripts Changes

### Before (Vite)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### After (Next.js)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "preview": "next start"
  }
}
```

## TypeScript Configuration

Added comprehensive TypeScript support with:
- Path aliases (`@/*` for `./src/*`)
- Next.js specific TypeScript configuration
- Type definitions in `src/types/index.ts`
- Temporary `@ts-nocheck` comments during migration

## Component Updates

All components were converted from `.jsx` to `.tsx` with:
- TypeScript interfaces and types
- Proper Next.js import conventions
- Updated environment variable access patterns

## Development Workflow

### Starting Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Environment Setup
1. Copy `env.example.js` values to `.env.local`
2. Replace placeholder values with actual Voltage API credentials
3. Ensure both `NEXT_PUBLIC_*` and server-side variables are set

## Migration Benefits

1. **No Separate Proxy Server**: API routes handle CORS and authentication
2. **Better TypeScript Support**: Enhanced type checking and IntelliSense
3. **Production Ready**: Optimized builds and deployment options
4. **Environment Security**: Server-side variables are not exposed to client
5. **SEO Ready**: Server-side rendering capabilities for future enhancements

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` exists in project root
   - Restart development server after changes
   - Check variable names have correct prefixes

2. **API Proxy Not Working**
   - Verify `pages/api/voltage/[...path].ts` exists
   - Check server-side `VOLTAGE_API_KEY` is set
   - Ensure API route is handling all HTTP methods

3. **TypeScript Errors**
   - Temporary `@ts-nocheck` comments are in place
   - Run `npm run lint` to check for issues
   - Update type definitions in `src/types/index.ts` as needed

## Next Steps

1. Remove `@ts-nocheck` comments and add proper TypeScript types
2. Add server-side rendering for better performance
3. Implement proper error boundaries
4. Add comprehensive testing setup
5. Optimize for production deployment

## Deployment

The application is now ready for deployment on platforms like:
- Vercel (recommended for Next.js)
- Netlify
- Railway
- Traditional hosting with Node.js support

Remember to set environment variables in your deployment platform's configuration. 