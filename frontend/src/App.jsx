import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Scraper from "./components/Scraper";

const stripePromise = loadStripe("pk_test_51RbxO2RA6d6y3GOGZxmrAcVlgVygSIEqpGUKcvZsEYfIeX0c6OL7igBAPhaSqSDURMmonjvI79sEaVVX8JKLBe0o00XUsrTjD7");

function App() {
  return (
    <>
      <div className="bg-gray-900">
        <div className="container w-full mx-auto bg-gray-900">
          <Elements stripe={stripePromise}>
            <Scraper />
          </Elements>
        </div>
      </div>
    </>
  );
}

export default App;
