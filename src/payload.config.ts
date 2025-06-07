// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { gcsStorage } from '@payloadcms/storage-gcs' // <--- Make sure this is the importimport sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
dotenv.config()

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { Colors, Sizes } from './collections/Colors'
import { Products } from './collections/Products'
import { Cart } from './collections/Cart'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { Orders } from './collections/Orders'
import { Customers } from './collections/Customers'

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
  cors: [getServerSideURL(), 'http://localhost:5173'].filter(Boolean),
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
          }
        },
      },

      bucket: process.env.GCS_BUCKET || '', // Your GCS bucket name
      options: {
        credentials: JSON.parse(process.env.GCS_CREDENTIALS || '{}'), // Your service account key JSON
        projectId: process.env.GCS_PROJECT_ID, // Your Google Cloud Project ID
        // apiEndpoint: 'https://www.googleapis.com', // Optional: for custom endpoints
      },
      acl: 'Public',
      // clientUploads: true,
      // acl: 'publicRead', // Optional: Set public access for uploaded files (be careful with this!)
      // clientUploads: true, // Set to true for direct client-side uploads (important for Vercel/small server limits)
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
