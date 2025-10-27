import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;


if (!paystackSecretKey) {
  throw new Error('PAYSTACK_SECRET_KEY is required');
}

// Check if Cloudinary is configured


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

     {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              bucket: process.env.S3_BUCKET,
              region: process.env.S3_REGION,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              endpoint: process.env.S3_ENDPOINT,
              prefix:'product/'            
            },
          },
        ],
      },
    },
  
  ],

 
})