import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'


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
    {
      name: 'caption',
      type: 'richText',
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
