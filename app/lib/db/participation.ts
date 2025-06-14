export function calculateBetLimits(balance: number) {
  // Calculate minimum bet
  let minBet = 0;
  if (balance > 0) {
    // Calculate half of balance and round up to nearest 10
    minBet = Math.ceil((balance / 2) / 10) * 10;
  }

  // Calculate maximum bet (absolute value of balance + 1000)
  const maxBet = Math.abs(balance) + 1000;

  return { minBet, maxBet };
} 