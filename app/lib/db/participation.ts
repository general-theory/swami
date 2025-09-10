export function calculateBetLimits(balance: number) {
  // Check if player is out of the game (balance <= -1000)
  if (balance <= -1000) {
    return { minBet: 0, maxBet: 0, isOutOfGame: true };
  }

  // Calculate minimum bet
  let minBet = 0;
  if (balance > 0) {
    // Calculate half of balance and round up to nearest 10
    minBet = Math.ceil((balance / 2) / 10) * 10;
  }

  // Calculate maximum bet (absolute value of balance + 1000)
  const maxBet = Math.abs(balance) + 1000;

  return { minBet, maxBet, isOutOfGame: false };
} 