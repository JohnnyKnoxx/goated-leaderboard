"use client";
import React, { useEffect, useState } from "react";

/**
 * Hook to calculate time until the next Sunday at 23:59 UTC.
 * Updates every second on the client side, preventing hydration errors.
 */
function useCountdownToSunday() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function getNextSunday23_59UTC() {
      const now = new Date();
      const dayOfWeek = now.getUTCDay(); // 0 = Sunday
      let daysUntilSunday = (7 - dayOfWeek) % 7;
      // If it's already Sunday, we want the NEXT Sunday (7 days away)
      if (daysUntilSunday === 0) {
        daysUntilSunday = 7;
      }
      return new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + daysUntilSunday,
          23,
          59,
          0
        )
      );
    }

    function updateCountdown() {
      const now = new Date().getTime();
      const end = getNextSunday23_59UTC().getTime();
      const distance = end - now;

      if (distance <= 0) {
        setTimeLeft("0h 0m 0s");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      let display = "";
      if (days > 0) display += `${days}d `;
      display += `${hours}h ${minutes}m ${seconds}s`;
      setTimeLeft(display);
    }

    // Update immediately, then every second
    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return timeLeft;
}

/**
 * Masks the user's name (e.g., "NOT***NI").
 * Adjust or remove this if you prefer no masking.
 */
function maskName(name) {
  if (!name) return "";
  if (name.length <= 5) return name;
  const first3 = name.slice(0, 3).toUpperCase();
  const last2 = name.slice(-2).toUpperCase();
  return `${first3}***${last2}`;
}

/**
 * Returns static prizes for top 7 places:
 * 1 -> $100, 2 -> $90, 3 -> $60, 4 -> $50,
 * 5 -> $40, 6 -> $20, 7 -> $10, else -> $0
 */
function getPrize(rankIndex) {
  switch (rankIndex) {
    case 0: return 100;
    case 1: return 90;
    case 2: return 60;
    case 3: return 50;
    case 4: return 40;
    case 5: return 20;
    case 6: return 10;
    default: return 0;
  }
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);

  // Countdown to Sunday 23:59 UTC
  const timeLeft = useCountdownToSunday();

  // Fetch data from the local proxy route
  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // 'data' is { success, data: [...] }
        const fetchedPlayers = data?.data || [];
        // Sort by weekly wager descending
        const sorted = fetchedPlayers.sort(
          (a, b) => (b.wagered.this_week || 0) - (a.wagered.this_week || 0)
        );
        // Take only top 7
        const top7 = sorted.slice(0, 7);
        setPlayers(top7);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard data:", err);
        setError("Failed to load leaderboard. Please try again later.");
      });
  }, []);

  // Show error message if fetch fails
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
        <h1 className="text-yellow-400 text-4xl font-extrabold mb-2">Johnny Knox</h1>
        <h2 className="text-yellow-400 text-2xl font-bold mb-1">$400 Weekly</h2>
        <h3 className="text-xl font-semibold mb-2">Goated Leaderboard</h3>
        <p className="text-lg font-semibold mb-6 text-red-400">{error}</p>
      </div>
    );
  }

  // Render the black-and-gold leaderboard
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      {/* Title Section */}
      <h1 className="text-yellow-400 text-4xl font-extrabold mb-2">Johnny Knox</h1>
      <h2 className="text-yellow-400 text-2xl font-bold mb-1">$400 Weekly</h2>
      <h3 className="text-xl font-semibold mb-2">Goated Leaderboard</h3>
      <p className="text-lg font-semibold mb-6">
        Next Payout In: <span className="text-yellow-400">{timeLeft}</span>
      </p>

      {/* Leaderboard Table */}
      <div className="w-full max-w-3xl">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-yellow-400">
              <th className="px-4 py-2 text-left">PLACE</th>
              <th className="px-4 py-2 text-left">USER</th>
              <th className="px-4 py-2 text-left">WAGER</th>
              <th className="px-4 py-2 text-left">PRIZE</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
              const place = index + 1;
              const maskedUsername = maskName(player.name);
              const weeklyWager = player.wagered?.this_week || 0;
              const prize = getPrize(index); // top 7 only

              return (
                <tr key={player.uid || index} className="border-b border-gray-800">
                  <td className="px-4 py-2">{place}.</td>
                  <td className="px-4 py-2">{maskedUsername}</td>
                  <td className="px-4 py-2">
                    $
                    {weeklyWager.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-2">${prize}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
