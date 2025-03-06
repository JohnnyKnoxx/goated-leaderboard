"use client";  // ✅ Required for Next.js client components

import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilSunday());

  // ✅ Fetch leaderboard data from API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("https://api.goated.com/user/affiliate/referral-leaderboard/OQID5MA");
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Full API Response:", data);

        const sortedData = data.data
          .filter((player) => player.wagered?.this_month > 0)  // ✅ Ensure wagered data exists
          .sort((a, b) => b.wagered.this_month - a.wagered.this_month)
          .slice(0, 7);  // ✅ Show top 7 players only

        setLeaderboard(sortedData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError(`Failed to load leaderboard: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // ✅ Countdown Timer for Next Payout (Sunday 23:59 UTC)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilSunday());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function getTimeUntilSunday() {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    const nextSunday = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysUntilSunday,
      23, 59, 59
    ));

    const timeDiff = nextSunday - now;
    const seconds = Math.floor((timeDiff / 1000) % 60);
    const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
    const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds };
  }

  // ✅ Prize Distribution
  const prizes = ["$100", "$80", "$60", "$50", "$40", "$30", "$20"];

  return (
    <div className="max-w-7xl mx-auto p-8 sm:p-16 bg-black text-white rounded-lg shadow-lg text-center">
      
      {/* 🏆 Johnny Knox Weekly Prize Section */}
      <div className="mb-6">
        <h2 className="text-6xl sm:text-8xl font-extrabold text-[#FFD700] leading-tight">
          Johnny Knox
        </h2>
        <h3 className="text-5xl sm:text-7xl font-bold text-[#FFD700]">
          $400 Weekly
        </h3>
      </div>

      {/* Goated Leaderboard Title */}
      <h1 className="text-5xl sm:text-6xl font-bold text-[#FFD700] mb-4">
        Goated Leaderboard
      </h1>

      {/* Countdown Timer */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#FFD700]">Next Payout In:</h2>
        <p className="text-2xl font-semibold text-gray-300">
          {`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
        </p>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <p className="text-center text-gray-300 text-2xl">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500 text-2xl">{error}</p>
      ) : (
        <>
          {/* Header Row */}
          <div className="grid grid-cols-4 text-gray-400 font-semibold text-xl sm:text-4xl pb-4 sm:pb-6 border-b-2 border-gray-600">
            <span className="text-left pl-4">PLACE</span>
            <span className="text-left">USER</span>
            <span className="text-right">WAGER</span>
            <span className="text-right pr-4">PRIZE</span>
          </div>

          {leaderboard.length > 0 ? (
            leaderboard.map((player, index) => {
              const firstThree = player.name.slice(0, 3).toUpperCase();
              const lastTwo = player.name.length > 2 ? player.name.slice(-2).toUpperCase() : "**";

              return (
                <div key={player.uid} className="grid grid-cols-4 py-5 sm:py-6 border-b-2 border-gray-700 items-center text-2xl sm:text-5xl">
                  <span className="text-gray-400 text-left pl-4">{index + 1}.</span>
                  <span className="text-[#FFD700] font-bold text-left">
                    {firstThree}***{lastTwo}
                  </span>
                  <span className="text-gray-300 text-right text-3xl sm:text-4xl tracking-wide">
                    ${player.wagered.this_month.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[#FFD700] font-bold text-right pr-4 text-3xl sm:text-4xl">
                    {prizes[index] || "$0"}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-300 text-2xl mt-6">No players qualified this month.</p>
          )}
        </>
      )}
    </div>
  );
}
