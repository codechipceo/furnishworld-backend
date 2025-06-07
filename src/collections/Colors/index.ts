// collections/Colors.js

import { CollectionConfig } from 'payload'

export const Colors: CollectionConfig = {
  slug: 'colors', // The collection's slug in the URL
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name', // The name of the color
      type: 'text',
      required: true,
    },
    {
      name: 'hexCode', // Hexadecimal color code (optional)
      type: 'text',
      required: false,
    },
  ],
  admin: {
    useAsTitle: 'name',
  },
}

export const Sizes: CollectionConfig = {
  slug: 'size',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'size',
      type: 'text',
      required: true,
    },
  ],
  admin: {
    useAsTitle: 'size',
  },
}
