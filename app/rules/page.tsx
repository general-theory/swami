'use client';

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function Rules() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            The SWAMI RULES
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master the art of college football prediction and become the ultimate Swami
          </p>
        </div>
        
        <div className="space-y-8">
          {/* Object Section */}
          <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                Object
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                It&apos;s simple. Each player starts the season with a mythical $1000. The player with the most moola after the bowl games is deemed the &apos;Swami&apos;. 
                This year, the season will start September 2nd, and run every week there are a full slate of games through &quot;bowl week&quot;.
              </p>
            </CardContent>
          </Card>

          {/* Rules Section */}
          <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-3xl">📋</span>
                Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                Every Tuesday morning, 16 games will be chosen from an online site. The games and the &apos;opening lines&apos; will be posted to the website. 
                These lines are subject to change, due to injuries and the like. On Thursday, final lines will be distributed. These are the official 
                lines used to place your bets. All bets for the week must be in by 12pm CST on Friday. Occasionally there is a worthwhile Thursday 
                night game. If it is a selected game and you choose to bet on it, ALL your bets for the week must be in by Thursday 4pm.
              </p>

              {/* Sample Games Table */}
              <Card className="bg-slate-100 dark:bg-slate-700 border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    Sample Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300 dark:border-gray-600">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">FAVORITE</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">LINE</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">UNDERDOG</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-200">at Alabama</td>
                          <td className="py-3 px-4 text-center font-semibold text-gray-900 dark:text-white">27</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-200">Auburn</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-200">at Florida</td>
                          <td className="py-3 px-4 text-center font-semibold text-gray-900 dark:text-white">3</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-200">Miami</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Key Points */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">🔑</span>
                  Key Points
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-200">Enter the team name and dollar amount you want to wager</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-200">All bets must be in multiples of $10</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-200">Minimum bet is 1/2 of your current monies if you have positive earnings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-200">If you go in the hole ≥ $1000, you&apos;re out</span>
                    </li>
                  </ul>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-200">Maximum bet is what will get you back to your original $1000 if you&apos;re in negative earnings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-200">If you fail to turn in bets, your minimum bid will be placed on the Favorite with the largest line</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-200">Bets can be submitted anytime after Tuesday&apos;s email but cannot be changed once submitted</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-200">If a line moves to NL (no line), the bet is cancelled</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-200">Results and standings are updated Monday morning</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 