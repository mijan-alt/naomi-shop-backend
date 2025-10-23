import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

if (!paystackSecretKey) {
  throw new Error('PAYSTACK_SECRET_KEY is required');
}

// Check if Cloudinary is configured
const cloudinaryConfigured = cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret;

// File service configuration - use Cloudinary if configured, otherwise local
const fileServiceConfig = cloudinaryConfigured
  ? {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "cloudinary",
            options: {
              file_url: `https://res.cloudinary.com/${cloudinaryCloudName}`,
              access_key_id: cloudinaryApiKey,
              secret_access_key: cloudinaryApiSecret,
              region: "auto",
              bucket: cloudinaryCloudName,
              endpoint: `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}`,
              additional_client_config: {
                forcePathStyle: true,
              },
            },
          },
        ],
      },
    }
  : {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: process.env.BACKEND_URL || "http://localhost:9000",
            },
          },
        ],
      },
    };

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    {
      resolve: "./src/modules/payload",
      options: {
        serverUrl: process.env.PAYLOAD_SERVER_URL || "http://localhost:8000",
        apiKey: process.env.PAYLOAD_API_KEY,
        userCollection: process.env.PAYLOAD_USER_COLLECTION || "users",
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "medusa-payment-paystack",
            options: {
              secret_key: paystackSecretKey,
            } satisfies import("medusa-payment-paystack").PluginOptions,
          },
        ],
      },
    },
    fileServiceConfig, // Dynamically use Cloudinary or local storage
  ],
})