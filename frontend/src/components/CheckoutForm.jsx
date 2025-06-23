import React from "react";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import toast from "react-hot-toast";

const CheckoutForm = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (result.error) {
      toast.error(result.error.message);
    } else if (result.paymentIntent.status === "succeeded") {
      toast.success("🎉 Payment successful!");
      onSuccess();
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#1a202c", // Tailwind gray-900
        "::placeholder": {
          color: "#a0aec0", // Tailwind gray-400
        },
      },
      invalid: {
        color: "#e53e3e", // Tailwind red-600
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Card Information
        </label>
        <div className="border rounded-md px-3 py-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-purple-500">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe}
        className="w-10/12 bg-purple-600 text-white font-semibold py-3 rounded hover:bg-purple-700 transition"
      >
        Pay Now
      </button>
    </form>
  );
};

export default CheckoutForm;
