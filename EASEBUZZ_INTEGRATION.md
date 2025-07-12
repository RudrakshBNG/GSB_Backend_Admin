# Easebuzz Payment Gateway Integration

This document explains how to use the Easebuzz payment gateway integration in your GSB application.

## Setup

### 1. Environment Variables

Add these variables to your `.env` file:

```env
EASEBUZZ_MERCHANT_KEY=your_easebuzz_merchant_key
EASEBUZZ_SALT=your_easebuzz_salt
EASEBUZZ_ENV=test  # or 'prod' for production
BACKEND_URL=http://localhost:3000  # Your backend URL
```

### 2. Get Easebuzz Credentials

1. Sign up at [Easebuzz](https://www.easebuzz.in/)
2. Get your Merchant Key and Salt from the dashboard
3. For testing, use the test environment credentials

## API Endpoints

### 1. Initiate Payment

**POST** `/api/easebuzz/initiate`

Initiates a new payment transaction.

**Request Body:**

```json
{
  "userId": "user_id_here",
  "amount": 299,
  "subscriptionType": "monthly",
  "description": "Monthly subscription",
  "successUrl": "https://yourapp.com/payment-success",
  "failureUrl": "https://yourapp.com/payment-failure",
  "productinfo": "GSB Monthly Subscription"
}
```

**Response:**

```json
{
  "success": true,
  "paymentUrl": "https://testpay.easebuzz.in/payment/initiateLink",
  "paymentData": {
    "key": "merchant_key",
    "txnid": "GSB1234567890abcde",
    "amount": "299",
    "productinfo": "GSB Monthly Subscription",
    "firstname": "Customer Name",
    "email": "customer@email.com",
    "phone": "9999999999",
    "surl": "success_url",
    "furl": "failure_url",
    "hash": "generated_hash",
    "udf1": "user_id",
    "udf2": "monthly",
    "udf3": "app",
    "udf4": "payment_record_id",
    "udf5": ""
  },
  "transactionId": "GSB1234567890abcde",
  "paymentId": "payment_record_id"
}
```

### 2. Check Payment Status

**GET** `/api/easebuzz/status/:transactionId`

Check the status of a payment transaction.

**Response:**

```json
{
  "success": true,
  "payment": {
    "transactionId": "GSB1234567890abcde",
    "amount": 299,
    "status": "completed",
    "subscriptionType": "monthly",
    "paymentDate": "2023-12-01T10:30:00.000Z",
    "user": {
      "fullName": "Customer Name",
      "phoneNumber": "9999999999",
      "email": "customer@email.com"
    },
    "easebuzzPaymentId": "easebuzz_payment_id",
    "bankRefNum": "bank_reference",
    "paymentMode": "Credit Card"
  }
}
```

### 3. Payment Success Callback

**POST** `/api/easebuzz/success`

This endpoint is called by Easebuzz when payment is successful.

### 4. Payment Failure Callback

**POST** `/api/easebuzz/failure`

This endpoint is called by Easebuzz when payment fails.

### 5. Get All Easebuzz Payments (Admin)

**GET** `/api/easebuzz/payments?page=1&limit=10&status=completed`

Get paginated list of Easebuzz payments.

### 6. Refund Payment (Admin)

**POST** `/api/easebuzz/refund`

```json
{
  "transactionId": "GSB1234567890abcde",
  "refundAmount": 299,
  "refundReason": "Customer request"
}
```

## Frontend Integration

### React Native Example

```javascript
import axios from "axios";

const initiatePayment = async (userId, amount, subscriptionType) => {
  try {
    const response = await axios.post(
      "http://your-backend.com/api/easebuzz/initiate",
      {
        userId,
        amount,
        subscriptionType,
        description: `${subscriptionType} subscription`,
        successUrl: "myapp://payment-success",
        failureUrl: "myapp://payment-failure",
      },
    );

    if (response.data.success) {
      // Open Easebuzz payment page
      const { paymentUrl, paymentData } = response.data;

      // For React Native, you can use WebView or open in browser
      // For web, you can submit the form or use their SDK
      openPaymentPage(paymentUrl, paymentData);

      return response.data.transactionId;
    }
  } catch (error) {
    console.error("Payment initiation failed:", error);
    throw error;
  }
};

const checkPaymentStatus = async (transactionId) => {
  try {
    const response = await axios.get(
      `http://your-backend.com/api/easebuzz/status/${transactionId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Status check failed:", error);
    throw error;
  }
};
```

### Web Example

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Payment</title>
  </head>
  <body>
    <script>
      function initiatePayment() {
        fetch("/api/easebuzz/initiate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "user123",
            amount: 299,
            subscriptionType: "monthly",
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              // Create and submit form to Easebuzz
              const form = document.createElement("form");
              form.method = "POST";
              form.action = data.paymentUrl;

              // Add all payment data as hidden inputs
              Object.keys(data.paymentData).forEach((key) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = data.paymentData[key];
                form.appendChild(input);
              });

              document.body.appendChild(form);
              form.submit();
            }
          });
      }
    </script>

    <button onclick="initiatePayment()">Pay Now</button>
  </body>
</html>
```

## Payment Flow

1. **Initiate Payment**: Call `/api/easebuzz/initiate` with user and payment details
2. **Redirect to Easebuzz**: Use the returned `paymentUrl` and `paymentData` to redirect user to Easebuzz
3. **User Completes Payment**: User enters card details and completes payment on Easebuzz
4. **Callback Handling**: Easebuzz calls your success/failure URLs
5. **Verify Payment**: Your backend verifies the payment and updates the database
6. **Update User**: If successful, user subscription is activated

## Security Features

- **Hash Verification**: All payment responses are verified using SHA512 hash
- **Transaction ID**: Unique transaction IDs are generated for each payment
- **Database Tracking**: All payments are tracked in your database
- **Status Validation**: Payment status is validated before updating user subscription

## Testing

For testing, use Easebuzz test credentials:

- Use test credit card numbers provided by Easebuzz
- Set `EASEBUZZ_ENV=test` in your environment
- Test both success and failure scenarios

## Subscription Types Supported

- `monthly`: Monthly subscription
- `yearly`: Yearly subscription
- `lifetime`: Lifetime subscription

## Error Handling

The integration includes comprehensive error handling:

- Invalid user ID
- Missing required fields
- Hash verification failures
- Payment failures
- Network errors

## Logs

Payment activities are logged for debugging:

- Payment initiation
- Success/failure callbacks
- Hash verification
- Status checks

Check your server logs for detailed payment flow information.
