import crypto from 'crypto';

const COINPAYMENTS_API_URL = 'https://www.coinpayments.net/api.php';

interface CoinPaymentsParams {
  [key: string]: string | number;
}

export class CoinPaymentsClient {
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = process.env.COINPAYMENTS_API_KEY!;
    this.apiSecret = process.env.COINPAYMENTS_API_SECRET!;
  }

  private generateHmac(params: string): string {
    return crypto
      .createHmac('sha512', this.apiSecret)
      .update(params)
      .digest('hex');
  }

  async makeRequest(cmd: string, params: CoinPaymentsParams = {}) {
    const allParams = {
      version: 1,
      cmd,
      key: this.apiKey,
      format: 'json',
      ...params,
    };

    const paramsString = new URLSearchParams(allParams as any).toString();
    const hmac = this.generateHmac(paramsString);

    try {
      const response = await fetch(COINPAYMENTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'HMAC': hmac,
        },
        body: paramsString,
      });

      const data = await response.json();
      
      if (data.error !== 'ok') {
        throw new Error(data.error || 'CoinPayments API error');
      }

      return data.result;
    } catch (error) {
      console.error('CoinPayments API Error:', error);
      throw error;
    }
  }

  // Create a transaction to receive USDT TRC-20
  async createTransaction(amount: number, userId: string, currency: string = 'USDT.TRC20', buyerEmail?: string) {
    return this.makeRequest('create_transaction', {
      amount,
      currency1: 'USD', // Amount in USD
      currency2: currency, // Receive in USDT TRC-20
      buyer_email: buyerEmail || '',
      item_name: 'Wallet Deposit',
      ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/coinpayments/ipn`,
      custom: `TaskInn-${userId}`, // Pass userId for IPN processing
    });
  }

  // Create a withdrawal (payout)
  async createWithdrawal(
    amount: number,
    address: string,
    currency: string = 'USDT.TRC20',
    note?: string
  ) {
    return this.makeRequest('create_withdrawal', {
      amount,
      currency,
      address,
      auto_confirm: 0, // Manual confirmation for security
      note: note || 'Withdrawal',
    });
  }

  // Get transaction info
  async getTransactionInfo(txId: string) {
    return this.makeRequest('get_tx_info', {
      txid: txId,
    });
  }

  // Get withdrawal info
  async getWithdrawalInfo(withdrawalId: string) {
    return this.makeRequest('get_withdrawal_info', {
      id: withdrawalId,
    });
  }
}

export const coinpaymentsClient = new CoinPaymentsClient();
