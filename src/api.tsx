import { GetAllCoinsResponseType, GetPricesResponseType } from "./types";

const API_KEY =
  "bdc372ca6bcc9dc7048dff2da9c479d6b522af36cf4fd2825302a980a7bb82e8";

const BASE_URL = "https://min-api.cryptocompare.com/data";

export const getAllCoins = async (signal: AbortSignal) => {
  const url = `${BASE_URL}/all/coinlist?api_key=${API_KEY}`;

  try {
    const value = await fetch(url, { signal });
    return (await value.json()) as Promise<GetAllCoinsResponseType>;
  } catch (e) {
    throw e;
  }
};

export const getPrices = async (coinSymbols: string[], signal: AbortSignal) => {
  const commaSeparatedSymbols = coinSymbols.reduce(
    (acc, el, i) => `${acc},${el}`
  );

  const url = `${BASE_URL}/pricemulti?fsyms=${commaSeparatedSymbols}&tsyms=USD&api_key=${API_KEY}`;

  try {
    const value = await fetch(url, { signal });
    return (await value.json()) as GetPricesResponseType;
  } catch (e) {
    throw e;
  }
};
