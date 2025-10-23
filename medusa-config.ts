import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;

if (!paystackSecretKey) {
  throw new Error('PAYSTACK_SECRET_KEY is required');
}


const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const cloudinaryConfigured = CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET;
const fileServicePlugin = cloudinaryConfigured
  ? {
    resolve: `medusa-file-cloudinary`,
    options: {
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    },
  }
  : {
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: "uploads",
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
          // other payment providers like stripe, paypal etc
          {
            resolve: "medusa-payment-paystack",
            options: {
              secret_key:paystackSecretKey,
            } satisfies import("medusa-payment-paystack").PluginOptions,
          },
        ],
      },
    },

    fileServicePlugin
  ],
})
