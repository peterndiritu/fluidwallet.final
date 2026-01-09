
export const fetchPrice = async (symbol: string): Promise<number> => {
  try {
    const response = await fetch(`https://api.coinbase.com/v2/prices/${symbol}-USD/spot`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return parseFloat(data.data.amount);
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}`, error);
    return 0;
  }
};

export const fetchAllPrices = async (symbols: string[]) => {
  const prices: Record<string, number> = {};
  await Promise.all(
    symbols.map(async (symbol) => {
      const price = await fetchPrice(symbol);
      if (price > 0) prices[symbol] = price;
    })
  );
  return prices;
};
