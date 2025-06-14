'use client';

export default function Rules() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">The SWAMI RULES</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Object</h2>
        <p className="text-lg">
          It's simple. Each player starts the season with a mythical $1000. The player with the most moola after the bowl games is deemed the 'Swami'. 
          This year, the season will start September 2nd, and run every week there are a full slate of games through "bowl week".
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Rules</h2>
        <div className="space-y-4">
          <p>
            Every Tuesday morning, 16 games will be chosen from an online site. The games and the 'opening lines' will be posted to the website. 
            These lines are subject to change, due to injuries and the like. On Thursday, final lines will be distributed. These are the official 
            lines used to place your bets. All bets for the week must be in by 12pm CST on Friday. Occasionally there is a worthwhile Thursday 
            night game. If it is a selected game and you choose to bet on it, ALL your bets for the week must be in by Thursday 4pm.
          </p>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Sample Games</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2">FAVORITE</th>
                    <th className="text-center py-2">LINE</th>
                    <th className="text-left py-2">UNDERDOG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td>at Alabama</td>
                    <td className="text-center">27</td>
                    <td>Auburn</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td>at Florida</td>
                    <td className="text-center">3</td>
                    <td>Miami</td>
                  </tr>
                  {/* Add more sample games as needed */}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Key Points:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Enter the team name and dollar amount you want to wager</li>
              <li>All bets must be in multiples of $10</li>
              <li>Minimum bet is 1/2 of your current monies if you have positive earnings</li>
              <li>If you go in the hole ≥ $1000, you're out</li>
              <li>Maximum bet is what will get you back to your original $1000 if you're in negative earnings</li>
              <li>If you fail to turn in bets, your minimum bid will be placed on the Favorite with the largest line</li>
              <li>Bets can be submitted anytime after Tuesday's email but cannot be changed once submitted</li>
              <li>If a line moves to NL (no line), the bet is cancelled</li>
              <li>Results and standings are updated Monday morning</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
} 