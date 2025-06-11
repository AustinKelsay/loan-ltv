# 🔗 CORS Issue Resolved - Vite Proxy Solution

## Problem
The Voltage API doesn't include CORS headers for browser requests, causing this error:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://voltageapi.com/v1/...
```

## ✅ Solution Applied
We've configured **Vite's built-in proxy** to handle the CORS issue. No separate server needed!

## 🚀 Setup Complete

The `vite.config.js` file now includes proxy configuration that:
- Routes `/api/voltage/*` requests to `https://voltageapi.com/v1/*`
- Adds proper CORS headers automatically
- Injects your API key from environment variables
- Logs all proxy requests for debugging

## 🎯 Just Start Your App

```bash
# Simply start your development server
npm run dev
```

That's it! The proxy is built into Vite and will automatically handle all Voltage API requests.

## 🔧 How It Works

1. **Frontend** makes requests to `http://localhost:3001/api/voltage/*`
2. **Proxy Server** forwards requests to `https://voltageapi.com/v1/*`
3. **Proxy Server** adds CORS headers to the response
4. **Frontend** receives the response without CORS errors

## 📝 Alternative Solutions

### Option 1: Browser Extension (Development Only)
Install a CORS browser extension like "CORS Unblock" for quick testing.

### Option 2: Vite Proxy Configuration
Add to your `vite.config.js`:
```javascript
export default defineConfig({
  // ... other config
  server: {
    proxy: {
      '/api/voltage': {
        target: 'https://voltageapi.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/voltage/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('X-Api-Key', process.env.VITE_VOLTAGE_API_KEY);
          });
        },
      },
    },
  },
});
```

### Option 3: Production Backend
For production, implement the proxy logic in your backend service:
- Next.js API routes
- Express.js server
- Serverless functions (Vercel, Netlify)

## ⚠️ Important Notes

1. **Development Only**: This proxy is for development. In production, use a proper backend.
2. **API Key Security**: The proxy helps keep your API key on the server side.
3. **HTTPS**: For production, ensure your backend uses HTTPS.
4. **Rate Limiting**: Consider adding rate limiting to the proxy for production use.

## 🎯 Next Steps

Once the proxy is running, your Voltage API calls should work without CORS errors. The loan-ltv demo will be able to:

✅ Create custodial wallets  
✅ Generate Lightning invoices  
✅ Send Lightning payments  
✅ Check payment statuses  
✅ Handle auto-liquidation flows 