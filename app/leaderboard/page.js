import Leaderboard from "../components/Leaderboard";  // ✅ Correct relative path

export default function LeaderboardPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <Leaderboard />
    </main>
  );
}
