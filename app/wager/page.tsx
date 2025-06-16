'use client';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Game {
  id: number;
  homeTeam: {
    id: number;
    name: string;
    logo: string | null;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string | null;
  };
  spread: number | null;
}

export default function Wager() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games/active');
        if (!response.ok) throw new Error('Failed to fetch games');
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchGames();
    }
  }, [isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const handleRowClick = (gameId: number) => {
    // TODO: Implement wager placement
    console.log('Place wager for game:', gameId);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Place Your Wagers</h1>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-800 text-gray-300">
              <th className="px-4 py-2 text-left">Amount Wagered</th>
              <th className="px-4 py-2 text-left">Favored</th>
              <th className="px-4 py-2 text-left">Spread</th>
              <th className="px-4 py-2 text-left">Underdog</th>
              <th className="px-4 py-2 text-left">Amount Wagered</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => {
              const isHomeFavored = game.spread !== null && game.spread < 0;
              const spread = game.spread === null ? 'NL' : Math.abs(game.spread).toString();

              return (
                <tr 
                  key={game.id}
                  onClick={() => handleRowClick(game.id)}
                  className="border-b border-gray-700 hover:bg-gray-800 cursor-pointer"
                >
                  <td className="px-4 py-2">0</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {isHomeFavored ? (
                        <>
                          <span>@</span>
                          <span>{game.homeTeam.name}</span>
                          {game.homeTeam.logo && (
                            <Image
                              src={game.homeTeam.logo}
                              alt={`${game.homeTeam.name} logo`}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <span>{game.awayTeam.name}</span>
                          {game.awayTeam.logo && (
                            <Image
                              src={game.awayTeam.logo}
                              alt={`${game.awayTeam.name} logo`}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">{spread}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {isHomeFavored ? (
                        <>
                          <span>{game.awayTeam.name}</span>
                          {game.awayTeam.logo && (
                            <Image
                              src={game.awayTeam.logo}
                              alt={`${game.awayTeam.name} logo`}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <span>@</span>
                          <span>{game.homeTeam.name}</span>
                          {game.homeTeam.logo && (
                            <Image
                              src={game.homeTeam.logo}
                              alt={`${game.homeTeam.name} logo`}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">0</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 