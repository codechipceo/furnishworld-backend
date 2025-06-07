import { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Will be auto-generated if left blank',
      },
      hooks: {
        beforeValidate: [
          ({ data, siblingData }) => {
            if (!data?.slug && data?.name) {
              siblingData.slug = data.name
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '')
            }
          },
        ],
      },
      unique: true,
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: true,
    },
    {
      name: 'productImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'altText',
          type: 'text',
        },
      ],
    },
    {
      name: 'colors',
      type: 'relationship',
      relationTo: 'colors',
      hasMany: true,
    },
    {
      name: 'variants',
      type: 'array',
      fields: [
        {
          name: 'size',
          type: 'relationship',
          relationTo: 'size',
        },
        {
          name: 'stock',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'price',
          type: 'number',
        },
      ],
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.variants) {
              data.variants.forEach((variant: any) => {
                const variantParts = []
                if (variant.color?.name) {
                  variantParts.push(variant.color.name)
                }
                if (variant.size) {
                  variantParts.push(variant.size)
                }
                variant.name = variantParts.join(' / ')
              })
            }
          },
        ],
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
    },
    // ------------------------- SEO Fields -------------------------
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
        },
        {
          name: 'keywords',
          type: 'text',
        },
      ],
      admin: {
        description: 'Search Engine Optimization settings',
      },
    },
    // --------------------- Shipping Information ---------------------
    {
      name: 'shipping',
      type: 'group',
      fields: [
        {
          name: 'weight', // Weight in a specific unit (e.g., kg, lbs)
          type: 'number',
        },
        {
          name: 'weightUnit',
          type: 'select',
          options: [
            { label: 'Kilograms (kg)', value: 'kg' },
            { label: 'Pounds (lbs)', value: 'lbs' },
            // Add more units as needed
          ],
        },
        {
          name: 'dimensions',
          type: 'group',
          fields: [
            {
              name: 'length',
              type: 'number',
            },
            {
              name: 'width',
              type: 'number',
            },
            {
              name: 'height',
              type: 'number',
            },
            {
              name: 'unit',
              type: 'select',
              options: [
                { label: 'Centimeters (cm)', value: 'cm' },
                { label: 'Inches (in)', value: 'in' },
                // Add more units as needed
              ],
            },
          ],
        },
      ],
      admin: {
        description: 'Information for shipping calculations',
      },
    },
  ],
  hooks: {
    afterRead: [
      ({ doc }) => {
        return doc
      },
    ],
  },
}
