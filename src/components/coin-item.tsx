import { CoinItemPropsType } from "../types";

export default function CoinItem(props: CoinItemPropsType) {
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
