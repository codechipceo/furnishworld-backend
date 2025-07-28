import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Helper function to add CORS headers
const addCorsHeaders = (response: Response): Response => {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

export const placeOrder = async (req: any): Promise<Response> => {

  console.log("Step 1 : ORDER PLACEMENT INIT")
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    const response = new Response(null, { status: 200 })
    return addCorsHeaders(response)
  }

  try {
    // Parse the request body properly
    let body
    if (req.body) {
      if (typeof req.body === 'string') {
        body = JSON.parse(req.body)
      } else if (req.body instanceof ReadableStream) {
        const text = await new Response(req.body).text()
        body = JSON.parse(text)
      } else {
        body = req.body
      }
    }

    const { items, total, shippingAddress } = body || {}

    console.log("Step 2 : BODY PARSED ", body)

    if (!req.user) {
      const authErrorResponse = Response.json({ error: 'User not authenticated' }, { status: 401 })
      return addCorsHeaders(authErrorResponse)
    }

    if (!items || !total || !shippingAddress) {
      const validationErrorResponse = Response.json({ error: 'Missing required order details' }, { status: 400 })
      return addCorsHeaders(validationErrorResponse)
    }

    // // Step 1: Create Razorpay order first
    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        user_id: req.user.id,
        items_count: items.length,
      },
    })

    console.log("Step 3 : Razorpay Order Created", razorpayOrder)

    // Step 2: Create order in database with Razorpay order ID
    const order = await req.payload.create({
      collection: 'orders',
      data: {
        customer: req.user.id,
        items,
        total,
        shippingAddress,
        razorpayOrderId: razorpayOrder.id, // Store Razorpay order ID
        status: 'pending',
        paymentStatus: 'created', // Payment not yet attempted
      },
    })

    console.log("Step 4 : Order Created", order)

    const response = Response.json({
      success: true,
      order,
      razorpayOrder, // Send Razorpay order details to frontend
      message: 'Order created successfully',
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Error placing order:', error )
    const errorResponse = Response.json({ error: 'Failed to place order' }, { status: 500 })
    return addCorsHeaders(errorResponse)
  }
}
