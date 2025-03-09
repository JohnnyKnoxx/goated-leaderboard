"use client";
import { useEffect, useState } from "react";

/**
 * Returns the next Sunday at 23:59 UTC from now.
 * If today is already Sunday, it will still point to the upcoming Sunday (7 days later).
 */
function getNextSunday23_59UTC() {
  const now = new Date();

  // getUTCDay() returns 0 for Sunday, 1 for Monday, etc.
  const dayOfWeek = now.getUTCDay(); 
  // Calculate how many days until the next Sunday (0).
  // If today is Sunday, we want 7 days from now, not 0, so use (7 - dayOfWeek) % 7 || 7.
  let daysUntilSunday = (7 - dayOfWeek) % 7;
  if (daysUntilSunday === 0) {
    daysUntilSunday = 7;
  }

  // Create a Date object for the next Sunday at 23:59 UTC
  const target = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysUntilSunday,
      23,
      59,
      0
    )
  );

  return target;
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Function to update the countdown
    function updateCountdown() {
      const now = new Date().getTime();
      const endTime = getNextSunday23_59UTC().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        // If we've passed Sunday 23:59, show 0
        setTimeLeft("0h 0m 0s");
        return;
      }

      // Convert distance to days, hours, minutes, seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      // Format it however you like. Example: "3d 14h 59m 10s"
      let display = "";
      if (days > 0) display += `${days}d `;
      display += `${hours}h ${minutes}m ${seconds}s`;

      setTimeLeft(display);
    }

    // Run once immediately
    updateCountdown();

    // Update every second
    const intervalId = setInterval(updateCountdown, 1000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <p>Countdown to Sunday 23:59 UTC:</p>
      <p className="font-bold">{timeLeft}</p>
    </div>
  );
}
