// collections/Orders.ts
import { authenticated } from '@/access/authenticated'
import { CollectionConfig, User } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  auth: false,
  access: {
    read: ({ req }) => {
      if (!req.user) return false

      // Check if user is from 'users' collection and has admin role
      if (req.user.collection === 'users' && (req.user as any).role === 'admin') {
        return true
      }

      // Otherwise, allow only orders belonging to the user
      return {
        customer: {
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
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
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
    {
      name: 'total',
      type: 'number',
      required: true,
      admin: {
        description: 'Total amount of the order',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'paid', 'shipped', 'cancelled'],
      defaultValue: 'pending',
      admin: {
        description: 'Order status',
        readOnly: true,
      },
    },
    {
      name: 'deliveryStatus',
      type: 'select',
      options: [
        { label: 'Not Shipped', value: 'not_shipped' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Out for Delivery', value: 'out_for_delivery' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Returned', value: 'returned' },
      ],
      defaultValue: 'not_shipped',
      admin: {
        description: 'Track current delivery status of the order',
      },
    },
    // Payment related fields
    {
      name: 'razorpayOrderId',
      type: 'text',
      admin: {
        description: 'Razorpay order ID (created first)',
        readOnly: true,
      },
    },
    {
      name: 'razorpayPaymentId',
      type: 'text',
      admin: {
        description: 'Razorpay payment ID (created after payment)',
        readOnly: true,
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      options: ['created', 'attempted', 'paid', 'failed', 'refunded'],
      defaultValue: 'created',
      admin: {
        description: 'Payment status from Razorpay',
        readOnly: true,
      },
    },
    {
      name: 'paymentMethod',
      type: 'text',
      admin: {
        description: 'Payment method used (card, upi, netbanking, etc.)',
        readOnly: true,
      },
    },
    {
      name: 'paidAt',
      type: 'date',
      admin: {
        description: 'Timestamp when payment was completed',
        readOnly: true,
      },
    },
    // Shipping address
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
        },
        {
          name: 'address',
          type: 'textarea',
          required: true,
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'state',
          type: 'text',
          required: true,
        },
        {
          name: 'pincode',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
