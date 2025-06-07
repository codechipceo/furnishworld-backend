// collections/Orders.ts
import { authenticated } from '@/access/authenticated';
import { CollectionConfig } from 'payload';

export const Orders: CollectionConfig = {
  slug: 'orders',
  auth: false,
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      return {
        user: {
          equals: req.user.id,
        },
      }
    },
    create: ({ req }) => !!req.user,
    update: authenticated,
    delete: () => false,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { readOnly: true },
      defaultValue: ({ user }) => user?.id,
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
        },
        {
          name: 'color',
          type: 'text',
        },
        {
          name: 'size',
          type: 'text',
        },
        {
          name: 'quantity',
          type: 'number',
        },
        {
          name: 'price',
          type: 'number',
        },
      ],
    },
    {
      name: 'total',
      type: 'number',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'paid', 'shipped', 'cancelled'],
      defaultValue: 'pending',
    },
  ],
}
