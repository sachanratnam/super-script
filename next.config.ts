import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add headers configuration for CORS and embedding
  async headers() {
    const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
    const allowedEmbeddingOrigin = process.env.ALLOWED_EMBEDDING_ORIGIN || '*';

    // Split ALLOWED_ORIGIN by comma and trim whitespace, handle '*' case
    const allowedOrigins = allowedOrigin === '*' ? ['*'] : allowedOrigin.split(',').map(origin => origin.trim());

    // Note: Access-Control-Allow-Origin header does not support multiple origins directly except for '*'.
    // If multiple specific origins are needed, the server needs logic to check the request Origin header
    // and echo back that specific origin if it's in the allowed list.
    // For simplicity with Next.js headers, we often use '*' or a single specific origin.
    // Here, we'll use the first specific origin if provided, otherwise default to '*'.
    // A middleware approach would be needed for dynamic multi-origin support.
    const corsOriginHeaderValue = allowedOrigins[0]; // Use the first (or '*')

    return [
      {
        // Apply these headers to all API routes and server actions paths
        // Adjust the source path if your API/actions are under a specific prefix e.g., '/api/:path*'
        source: '/:path*', // Covers Server Actions and potential API routes
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          // Use the determined CORS origin value
          { key: 'Access-Control-Allow-Origin', value: corsOriginHeaderValue },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },

          // Content Security Policy (CSP) for framing
          // Controls which origins are allowed to embed this page in an iframe.
          // Replace '*' with specific space-separated domains like 'https://example.com https://sub.example.com' in production.
          { key: 'Content-Security-Policy', value: `frame-ancestors ${allowedEmbeddingOrigin}` }

          // Remove or comment out X-Frame-Options if setting CSP frame-ancestors
          // { key: 'X-Frame-Options', value: 'SAMEORIGIN' }, // Default, prevents embedding except by the same origin
        ],
      },
    ];
  },
};

export default nextConfig;
