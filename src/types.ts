export interface CoinType {
  id: string;
  symbolUrl: string;
  symbolText: string;
  name: string;
  price?: number;
  hasActivity?: null | "bullish" | "bearish";
  animationEnded?: boolean;
}

export interface CoinItemPropsType {
  coinData: CoinType;
  handleDelete: (id: string) => void;
}

export interface GetAllCoinsResponseType {
  Data: {
    [index: string]: {
      CoinName: string;
      Id: string;
      ImageUrl: string;
      Symbol: string;
    };
  };
}

export interface GetPricesResponseType {
  [index: string]: {
    USD: number;
  };
}

export interface RefType {
  intervalId?: ReturnType<typeof setInterval>;
  coins: CoinType[];
  animationEndTimeoutId?: ReturnType<typeof setTimeout>;
  getAllCoinsController?: AbortController;
  getPricesController?: AbortController;
  getOnePriceController?: AbortController;
}
