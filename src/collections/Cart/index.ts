// import type { CollectionConfig } from 'payload'

// export const Cart: CollectionConfig = {
//   slug: 'cart',
//   auth: false,
//   access: {
//     read: ({ req }) => {
//       if (!req.user) return false
//       return {
//         customer: {
//           equals: req.user.id,
//         },
//       }
//     },
//     create: ({ req }) => !!req.user,
//     update: ({ req }) => !!req.user,
//     delete: ({ req }) => !!req.user,
//   },

//   hooks: {
//     beforeChange: [
//       ({ req, operation, data }) => {
//         if (operation === 'create' && req.user) {
//           return {
//             ...data,
//             customer: req.user.id,
//           }
//         }
//         return data
//       },
//     ],
//   },

//   fields: [
//     {
//       name: 'customer',
//       type: 'relationship',
//       relationTo: 'customers',
//       required: true,
//       admin: { readOnly: true },
//       access: {
//         update: () => false, // Optional: block update from API
//       },
//     },
//     {
//       name: 'items',
//       type: 'array',
//       fields: [
//         {
//           name: 'product',
//           type: 'relationship',
//           relationTo: 'products',
//           required: true,
//         },
//         {
//           name: 'color',
//           type: 'text',
//           required: true,
//         },
//         {
//           name: 'size',
//           type: 'text',
//           required: true,
//         },
//         {
//           name: 'price',
//           type: 'text',
//           required: true,
//         },
//         {
//           name: 'quantity',
//           type: 'number',
//           required: true,
//           defaultValue: 1,
//         },
//       ],
//     },
//   ],
// }

import type { CollectionConfig } from 'payload'

export const Cart: CollectionConfig = {
  slug: 'cart',
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      return {
        customer: {
          equals: req.user.id,
        },
      }
    },
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },

  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' || operation === 'update') {
          const { product, variant } = data.items


          if (!product || !variant) {
            throw new Error('Product and variant are required')
          }

          const productDoc = await req.payload.findByID({
            collection: 'products',
            id: product,
          })

          const variantExists = productDoc.variants?.some((v) => v.id === variant)

          if (!variantExists) {
            throw new Error(`Variant ${variant} does not belong to product ${product}`)
          }

          return {
            ...data,
            customer: req?.user?.id,
          }
        }

        return data
      },
    ],
  },

  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      admin: { readOnly: true },
      access: {
        update: () => false,
      },
    },
    {
      name: 'items',
      type: 'group',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'variant',
          type: 'text', // or `relationship` if variants are in a separate collection
          required: true,
        },
        {
          name: 'color',
          type: 'text', // or relationship if colors are separate
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
        },
      ],
    },
  ],
}
