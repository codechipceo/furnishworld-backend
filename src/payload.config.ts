// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { gcsStorage } from '@payloadcms/storage-gcs' // <--- Make sure this is the importimport sharp from 'sharp' // sharp-import
import dotenv from 'dotenv'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
dotenv.config()

import { defaultLexical } from '@/fields/defaultLexical'
import { Cart } from './collections/Cart'
import { Categories } from './collections/Categories'
import { Colors, Sizes } from './collections/Colors'
import { Customers } from './collections/Customers'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { getServerSideURL } from './utilities/getURL'
import { placeOrder } from './endpoints/place-order'
import { verifyPayment } from './endpoints/verify-payment'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      // beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  endpoints: [
    {
      path: '/payment/place-order',
      method: 'post',
      handler: placeOrder,
    },
    {
      path: '/payment/verify-payment',
      method: 'post',
      handler: verifyPayment,
    },
  ],

  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Colors,
    Sizes,
    Products,
    Cart,
    Orders,
    Customers,
  ],
  cors: [
    getServerSideURL(),
    'http://localhost:5173',
    'https://furnishworld.in',
    'https://www.furnishworld.in',
    'http://qgog0ccwg8o0skw000448sgo.168.231.120.103.sslip.io',
  ].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    gcsStorage({
      enabled: process.env.GCS_BUCKET ? true : false, // Conditionally enable if GCS_BUCKET env var is set
      collections: {
        media: {
          prefix: 'products',
          disablePayloadAccessControl: true,
          generateFileURL: (doc) => {
            return `https://storage.googleapis.com/furnishworld/products/${doc.filename}`
          },
        },
      },

      bucket: process.env.GCS_BUCKET || '', // Your GCS bucket name
      options: {
        credentials: process.env.GCS_CREDENTIALS_ENCRYPT
          ? JSON.parse(Buffer.from(process.env.GCS_CREDENTIALS_ENCRYPT, 'base64').toString('utf-8'))
          : {},

        projectId: process.env.GCS_PROJECT_ID, // Your Google Cloud Project ID
      },
      acl: 'Public',
    }),
    // storage-adapter-placeholder
  ],

  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
