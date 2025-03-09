"use client"; // Required for Next.js client components
import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("https://api.goated.com/user/affiliate/referral-leaderboard/OQID5MA");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Sort the top 7 players by highest wagered this month
      const sortedData = data.data
        .filter((player) => player.wagered.this_month > 0)
        .sort((a, b) => b.wagered.this_month - a.wagered.this_month)
        .slice(0, 7);

      setLeaderboard(sortedData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setError("Failed to load leaderboard.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch leaderboard on mount and every 5 seconds
  useEffect(() => {
    fetchLeaderboard(); // Fetch immediately
    const interval = setInterval(fetchLeaderboard, 5000); // Fetch every 5 sec

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="bg-black text-yellow-400 p-8 rounded-lg text-center w-full max-w-lg">
      <h1 className="text-3xl font-bold">Johnny Knox</h1>
      <h2 className="text-2xl font-semibold">$400 Weekly</h2>
      <h3 className="text-xl font-bold mt-2">Goated Leaderboard</h3>

      {loading ? (
        <p className="text-white mt-4">Loading leaderboard...</p>
      ) : error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : (
        <table className="w-full mt-4 text-white border border-yellow-400">
          <thead>
            <tr className="border-b border-yellow-400">
              <th className="px-2 py-1">Place</th>
              <th className="px-2 py-1">User</th>
              <th className="px-2 py-1">Wagered</th>
              <th className="px-2 py-1">Prize</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player, index) => (
              <tr key={player.uid} className="border-b border-yellow-400">
                <td className="px-2 py-1">{index + 1}.</td>
                <td className="px-2 py-1 font-bold text-yellow-400">
                  {player.name.slice(0, 3)}***{player.name.slice(-2)}
                </td>
                <td className="px-2 py-1">${player.wagered.this_month.toFixed(2)}</td>
                <td className="px-2 py-1 text-yellow-400 font-bold">
                  ${getPrize(index + 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Prize structure for top 7 players
function getPrize(place) {
  const prizes = [100, 80, 60, 50, 40, 30, 20];
  return place <= prizes.length ? prizes[place - 1] : 0;
}
