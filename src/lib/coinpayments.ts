import crypto from 'crypto';

const COINPAYMENTS_API_URL = 'https://www.coinpayments.net/api.php';

/**
 * CoinPayments API request helper
 */
async function coinpaymentsRequest(command: string, params: Record<string, any> = {}) {
  const privateKey = process.env.COINPAYMENTS_API_SECRET || '';
  const publicKey = process.env.COINPAYMENTS_API_KEY || '';

  if (!privateKey || !publicKey) {
    throw new Error('CoinPayments credentials are not configured');
  }

  const requestParams = {
    version: 1,
    cmd: command,
    key: publicKey,
    format: 'json',
    ...params,
  };

  // Create HMAC signature
  const paramString = new URLSearchParams(requestParams as any).toString();
  const hmac = crypto.createHmac('sha512', privateKey);
  hmac.update(paramString);
  const signature = hmac.digest('hex');

  try {
    const response = await fetch(COINPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': signature,
      },
      body: paramString,
    });

    const data = await response.json();

    if (data.error !== 'ok') {
      throw new Error(data.error || 'CoinPayments API error');
    }

    return {
      success: true,
      data: data.result,
    };
  } catch (error: any) {
    console.error('CoinPayments API error:', error);
    return {
      success: false,
      error: error.message || 'CoinPayments request failed',
    };
  }
}

/**
 * Create USDT TRC20 deposit address for employer
 */
export async function createUSDTDepositAddress(userId: string) {
  try {
    const result = await coinpaymentsRequest('get_callback_address', {
      currency: 'USDT.TRC20',
      ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/coinpayments/ipn`,
      label: `TaskInn-${userId}`,
    });

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      address: result.data.address,
      pubkey: result.data.pubkey,
      destTag: result.data.dest_tag,
    };
  } catch (error: any) {
    console.error('Create USDT deposit address error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create deposit address',
    };
  }
}

/**
 * Create USDT TRC20 withdrawal/payout for worker
 */
export async function createUSDTWithdrawal(
  recipientAddress: string,
  amount: number,
  note?: string
) {
  try {
    const result = await coinpaymentsRequest('create_withdrawal', {
      currency: 'USDT.TRC20',
      amount: amount.toFixed(2),
      address: recipientAddress,
      auto_confirm: 1,
      note: note || 'TaskInn payout',
    });

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      withdrawalId: result.data.id,
      status: result.data.status,
      amount: result.data.amount,
    };
  } catch (error: any) {
    console.error('Create USDT withdrawal error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create withdrawal',
    };
  }
}

/**
 * Get withdrawal status
 */
export async function getWithdrawalStatus(withdrawalId: string) {
  try {
    const result = await coinpaymentsRequest('get_withdrawal_info', {
      id: withdrawalId,
    });

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      status: result.data.status,
      statusText: result.data.status_text,
      amount: result.data.amount,
      data: result.data,
    };
  } catch (error: any) {
    console.error('Get withdrawal status error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get withdrawal status',
    };
  }
}

/**
 * Get account balances
 */
export async function getCoinPaymentsBalances() {
  try {
    const result = await coinpaymentsRequest('balances');

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      balances: result.data,
    };
  } catch (error: any) {
    console.error('Get balances error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get balances',
    };
  }
}

/**
 * Verify IPN (Instant Payment Notification) signature
 */
export function verifyIPNSignature(
  requestBody: string,
  receivedHmac: string
): boolean {
  const privateKey = process.env.COINPAYMENTS_IPN_SECRET || process.env.COINPAYMENTS_PRIVATE_KEY || '';

  if (!privateKey) {
    console.error('CoinPayments IPN secret is not configured');
    return false;
  }

  const hmac = crypto.createHmac('sha512', privateKey);
  hmac.update(requestBody);
  const calculatedHmac = hmac.digest('hex');

  return calculatedHmac === receivedHmac;
}