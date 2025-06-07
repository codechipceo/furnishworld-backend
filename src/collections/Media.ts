import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { gcsStorage } from '@payloadcms/storage-gcs'

// const filename = fileURLToPath(import.meta.url)
// const dirname = path.dirname(filename)
const storage = gcsStorage({
  enabled: process.env.GCS_BUCKET ? true : false, // Conditionally enable if GCS_BUCKET env var is set
  collections: {
    media: true,
  },

  bucket: process.env.GCS_BUCKET || '', // Your GCS bucket name
  options: {
    credentials: JSON.parse(process.env.GCS_CREDENTIALS || '{}'), // Your service account key JSON
    projectId: process.env.GCS_PROJECT_ID, // Your Google Cloud Project ID
    // apiEndpoint: 'https://www.googleapis.com', // Optional: for custom endpoints
  },
  // acl: 'publicRead', // Optional: Set public access for uploaded files (be careful with this!)
  // clientUploads: true, // Set to true for direct client-side uploads (important for Vercel/small server limits)
})

export const Media = {
  slug: 'media',

  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
  upload: {
    // When using @payloadcms/storage-gcs, you no longer need staticDir
    // as files are uploaded directly to Google Cloud Storage.
    staticDir: undefined,
    
    disableLocalStorage: true,
    focalPoint: true,
    mimeTypes: ['image/*', 'video/*', 'application/pdf'], // Example: allow images, videos, and PDFs
  },
}
