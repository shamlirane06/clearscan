export interface UpiPaymentDetails {
  payload: string;
  payeeVpa?: string;
  payeeName?: string;
  amount?: string;
  currency?: string;
}

export function parseUpiPayPayload(value: string): UpiPaymentDetails | null {
  if (!/^upi:\/\/pay(?:\?|$)/i.test(value.trim())) return null;
  const payload = value.trim();
  try {
    const parsed = new URL(payload);
    if (parsed.protocol.toLowerCase() !== "upi:" || parsed.hostname.toLowerCase() !== "pay") return null;
    const params = parsed.searchParams;
    const amountValue = params.get("am")?.trim();
    const amount = amountValue && /^\d+(?:\.\d{1,2})?$/.test(amountValue) ? amountValue : undefined;
    const currencyValue = params.get("cu")?.trim().toUpperCase();
    return {
      payload,
      payeeVpa: params.get("pa")?.trim() || undefined,
      payeeName: params.get("pn")?.trim() || undefined,
      amount,
      currency: currencyValue && /^[A-Z]{3}$/.test(currencyValue) ? currencyValue : undefined,
    };
  } catch {
    return null;
  }
}
