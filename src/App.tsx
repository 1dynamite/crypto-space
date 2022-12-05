import { useEffect, useRef, useState } from "react";
import "./App.css";

import SearchBar from "./components/search-bar";
import CoinItem from "./components/coin-item";
import {
  CoinType,
  GetAllCoinsResponseType,
  GetPricesResponseType,
  RefType,
} from "./types";

import { getAllCoins, getPrices } from "./api";

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
  }, []);

  useEffect(() => {
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
