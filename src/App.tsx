import { useEffect, useRef, useState } from "react";
import "./App.css";

interface CoinType {
  id: string;
  symbolUrl: string;
  symbolText: string;
  name: string;
  price?: number;
  hasActivity?: null | "bullish" | "bearish";
  animationEnded?: boolean;
}

interface CoinItemPropsType {
  coinData: CoinType;
  handleDelete: (id: string) => void;
}

interface GetAllCoinsResponseType {
  Data: {
    [index: string]: {
      CoinName: string;
      Id: string;
      ImageUrl: string;
      Symbol: string;
    };
  };
}

interface GetPricesResponseType {
  [index: string]: {
    USD: number;
  };
}

interface RefType {
  intervalId?: ReturnType<typeof setInterval>;
  coins: CoinType[];
  animationEndTimeoutId?: ReturnType<typeof setTimeout>;
  getAllCoinsController?: AbortController;
  getPricesController?: AbortController;
  getOnePriceController?: AbortController;
}

const [getAllCoins, getPrices] = (() => {
  const API_KEY =
    "bdc372ca6bcc9dc7048dff2da9c479d6b522af36cf4fd2825302a980a7bb82e8";

  const BASE_URL = "https://min-api.cryptocompare.com/data";

  const getAllCoins = async (signal: AbortSignal) => {
    const url = `${BASE_URL}/all/coinlist?api_key=${API_KEY}`;

    try {
      const value = await fetch(url, { signal });
      return (await value.json()) as Promise<GetAllCoinsResponseType>;
    } catch (e) {
      throw e;
    }
  };

  const getPrices = async (coinSymbols: string[], signal: AbortSignal) => {
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

  return [getAllCoins, getPrices];
})();

function CoinItem(props: CoinItemPropsType) {
  return (
    <div className="coin-item">
      <div className="coin-cell">
        <img
          alt="coin-icon"
          src={props.coinData.symbolUrl}
          width={32}
          height={32}
          className="coin-icon"
        />
        <div className="coin-name">
          <span>{props.coinData.name}</span>
          <span>{props.coinData.symbolText}</span>
        </div>
      </div>
      <div className="price-cell">
        <span
          className={`price-text ${
            !props.coinData.hasActivity || props.coinData.animationEnded
              ? ""
              : props.coinData.hasActivity === "bullish"
              ? "price-text-bullish"
              : "price-text-bearish"
          }`}
        >
          $ {props.coinData.price}
        </span>
      </div>
      <div
        className="delete-icon"
        onClick={() => props.handleDelete(props.coinData.id)}
      >
        <img
          alt="delete-icon"
          src="https://img.icons8.com/material-rounded/24/null/delete-forever.png"
        />
      </div>
    </div>
  );
}

function SearchBar(props: {
  handleSearch: (value: string) => void;
  isLoading: boolean;
  hasNotFounError: boolean;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    setFocus(true);
  };

  const handleBlur = () => {
    setFocus(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.code === "Enter") ref.current?.click();
  };

  return (
    <div
      className={`search-bar ${
        props.hasNotFounError ? "search-bar-error-message" : ""
      }`}
    >
      <input
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="search-input"
        placeholder="Search"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      <div
        className="search-icon"
        onClick={() => props.handleSearch(searchValue)}
        ref={ref}
        style={{ backgroundColor: focus ? "rgba(0,0,0,0.1)" : "" }}
      >
        <img alt="search-icon" src="search-icon.png" />
      </div>
      {props.isLoading && <div className="lds-dual-ring"></div>}
    </div>
  );
}

function App() {
  const [coins, setCoins] = useState<CoinType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDogecoinLoading, setIsDogecoinLoading] = useState(false);
  const [hasNotFounError, setHasNotFoundError] = useState(false);
  const ref = useRef<RefType>({ coins: [] });
  ref.current.coins = coins;

  useEffect(() => {
    const fetchDogecoin = async () => {
      ref.current.getAllCoinsController = new AbortController();

      let allCoins: GetAllCoinsResponseType;
      try {
        setIsDogecoinLoading(true);
        allCoins = await getAllCoins(ref.current.getAllCoinsController.signal);
        setIsDogecoinLoading(false);
      } catch (e) {
        console.log(e);
        return;
      }

      for (const value of Object.values(allCoins.Data)) {
        if (value.CoinName.toLowerCase() === "dogecoin") {
          if (ref.current.coins.find((el) => el.id === value.Id)) return;

          setCoins((coins) => [
            ...coins,
            {
              id: value.Id,
              symbolText: value.Symbol,
              symbolUrl: `https://www.cryptocompare.com/${value.ImageUrl}`,
              name: value.CoinName,
            },
          ]);

          ref.current.getOnePriceController = new AbortController();

          let price: GetPricesResponseType;
          try {
            price = await getPrices(
              [value.Symbol],
              ref.current.getOnePriceController.signal
            );
          } catch (e) {
            console.log(e);
            return;
          }

          setCoins((coins) =>
            coins.map((el) =>
              el.id === value.Id
                ? { ...el, price: price[value.Symbol].USD }
                : el
            )
          );
          return;
        }
      }
    };

    fetchDogecoin();

    ref.current.intervalId = setInterval(async () => {
      if (ref.current.coins.length === 0) return;

      ref.current.getPricesController = new AbortController();

      let prices: GetPricesResponseType;
      try {
        prices = await getPrices(
          ref.current.coins.map((el) => el.symbolText),
          ref.current.getPricesController.signal
        );
      } catch (e) {
        console.log(e);
        return;
      }

      ref.current.animationEndTimeoutId = setTimeout(
        () =>
          setCoins((coins) =>
            coins.map((el) => ({ ...el, animationEnded: true }))
          ),
        2000
      );

      setCoins((coins) =>
        coins.map((el) => {
          if (!prices[el.symbolText]) return el; //check if a new coin was added while fetching prices for old coins

          const newPrice = prices[el.symbolText].USD;

          let hasActivity: any = null;

          if (el.price && el.price < newPrice) hasActivity = "bullish";
          if (el.price && el.price > newPrice) hasActivity = "bearish";

          return {
            ...el,
            price: newPrice,
            hasActivity,
            animationEnded: false,
          };
        })
      );
    }, 5000);

    const intervalId = ref.current.intervalId;
    const animationTimeoutId = ref.current.animationEndTimeoutId;
    const getAllCoinsController = ref.current.getAllCoinsController;
    const getPricesController = ref.current.getPricesController;
    const getOnePriceController = ref.current.getOnePriceController;

    return () => {
      clearInterval(intervalId);
      clearTimeout(animationTimeoutId);
      getAllCoinsController?.abort();
      getPricesController?.abort();
      getOnePriceController?.abort();
    };
  }, []);

  const handleSearch = async (searchValue: string) => {
    setHasNotFoundError(false);
    setIsLoading(true);

    ref.current.getAllCoinsController?.abort(); //avoid duplicate requests upon consecutive search clicks
    ref.current.getOnePriceController?.abort();

    ref.current.getAllCoinsController = new AbortController();

    let allCoins: GetAllCoinsResponseType;
    try {
      allCoins = await getAllCoins(ref.current.getAllCoinsController.signal);
    } catch (e) {
      console.log(e);
      return;
    }

    setIsLoading(false);

    for (const value of Object.values(allCoins.Data)) {
      if (value.CoinName.toLowerCase() === searchValue.toLowerCase()) {
        if (coins.find((el) => el.id === value.Id)) return;

        setCoins((coins) => [
          ...coins,
          {
            id: value.Id,
            symbolText: value.Symbol,
            symbolUrl: `https://www.cryptocompare.com/${value.ImageUrl}`,
            name: value.CoinName,
          },
        ]);

        ref.current.getOnePriceController = new AbortController();

        let price: GetPricesResponseType;
        try {
          price = await getPrices(
            [value.Symbol],
            ref.current.getOnePriceController.signal
          );
        } catch (e) {
          console.log(e);
          return;
        }

        setCoins((coins) =>
          coins.map((el) =>
            el.id === value.Id ? { ...el, price: price![value.Symbol].USD } : el
          )
        );
        return;
      }
    }

    setHasNotFoundError(true);
  };

  const handleDelete = (id: string) => {
    setCoins(coins.filter((e) => e.id !== id));
  };

  return (
    <div className="app">
      <SearchBar
        handleSearch={handleSearch}
        isLoading={isLoading}
        hasNotFounError={hasNotFounError}
      />
      <div className="coins-list">
        <div className="headings">
          <span>Coin</span>
          <span>Price</span>
        </div>
        {isDogecoinLoading && (
          <div className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        )}

        {coins.map((el) => (
          <CoinItem key={el.id} coinData={el} handleDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

export default App;
