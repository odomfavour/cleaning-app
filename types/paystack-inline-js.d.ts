declare module "@paystack/inline-js" {
  type ResumeCallbacks = {
    onSuccess: (transaction: {
      id: number;
      reference: string;
      message: string;
    }) => void;
    onCancel: () => void;
    onError: (error: { message: string }) => void;
  };

  export default class PaystackPop {
    resumeTransaction(accessCode: string, callbacks: ResumeCallbacks): unknown;
  }
}
