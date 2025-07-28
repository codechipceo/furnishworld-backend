import crypto from 'crypto'
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

export const verifyPayment = async (req: any): Promise<Response> => {
  console.log("Step 1 : PAYMENT VERIFICATION INIT")
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    const response = new Response(null, { status: 200 })
    return addCorsHeaders(response)
  }
  try {
    // Parse the request body properly
    let parsedBody;
    if (req.body) {
      if (typeof req.body === 'string') {
        parsedBody = JSON.parse(req.body);
      } else if (req.body instanceof ReadableStream) {
        const text = await new Response(req.body).text();
        parsedBody = JSON.parse(text);
      } else {
        parsedBody = req.body;
      }
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = parsedBody || {};

    console.log("Step 2 : PAYMENT VERIFICATION INIT", parsedBody)
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      const missingParamsResponse = Response.json({ error: 'Missing required payment parameters' }, { status: 400 })
      return addCorsHeaders(missingParamsResponse)
    }

    // Step 1: Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      const invalidSignatureResponse = Response.json({ error: 'Invalid payment signature' }, { status: 400 })
      return addCorsHeaders(invalidSignatureResponse)
    }

    // Step 2: Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id)

    console.log("Step 3 : Payment Details Fetched", payment)

    // Step 3: Update order based on payment status
    if (payment.status === 'captured') {
      console.log("Step 4 : Payment Captured")
      await req.payload.update({
        collection: 'orders',
        id: order_id,
        data: {
          razorpayPaymentId: razorpay_payment_id, // Now we have the payment ID
          paymentStatus: 'paid',
          status: 'paid',
          paymentMethod: payment.method,
          paidAt: new Date(payment.created_at * 1000), // Convert Unix timestamp
        },
      })

      // Clear user's cart after successful payment
      console.log("Step 5 : Clearing Cart")
      try {
        await req.payload.delete({
          collection: 'cart',
          where: {
            customer: {
              equals: req.user?.id,
            },
          },
        })
      } catch (cartError) {
        console.warn('Failed to clear cart:', cartError)
      }

      const successResponse = Response.json({
        success: true,
        message: 'Payment verified and order updated successfully',
        payment_id: razorpay_payment_id,
      })
      return addCorsHeaders(successResponse)
    } else {
      // Payment failed or pending
      console.log("Step 6 : Payment Failed or Pending")
      await req.payload.update({
        collection: 'orders',
        id: order_id,
        data: {
          razorpayPaymentId: razorpay_payment_id,
          paymentStatus: payment.status === 'failed' ? 'failed' : 'attempted',
          status: 'pending',
          paymentMethod: payment.method,
        },
      })

      console.log("Step 7 : Payment Failed or Pending")
      const failedResponse = Response.json({ error: `Payment ${payment.status}` }, { status: 400 })
      return addCorsHeaders(failedResponse)
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    const errorResponse = Response.json({ error: 'Payment verification failed' }, { status: 500 })
    return addCorsHeaders(errorResponse)
  }
}
