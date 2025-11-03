/**
 * PayPal REST API Direct Implementation
 * Fallback if SDK doesn't work
 */

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal Access Token
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Create PayPal Order
export async function createPayPalOrder(amount: number, returnUrl: string, cancelUrl: string) {
  try {
    const accessToken = await getAccessToken();

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2),
        },
        description: 'TaskInn Wallet Deposit',
      }],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: 'TaskInn',
        user_action: 'PAY_NOW',
      },
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`PayPal API error: ${JSON.stringify(error)}`);
    }

    const order = await response.json();
    return {
      id: order.id,
      status: order.status,
      links: order.links,
      approvalUrl: order.links?.find((link: any) => link.rel === 'approve')?.href,
    };
  } catch (error) {
    console.error('createPayPalOrder error:', error);
    throw error;
  }
}

// Capture PayPal Order
export async function capturePayPalOrder(orderId: string) {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`PayPal capture error: ${JSON.stringify(error)}`);
    }

    const capture = await response.json();
    return {
      id: capture.id,
      status: capture.status,
      amount: parseFloat(capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '0'),
      captureId: capture.purchase_units?.[0]?.payments?.captures?.[0]?.id,
    };
  } catch (error) {
    console.error('capturePayPalOrder error:', error);
    throw error;
  }
}