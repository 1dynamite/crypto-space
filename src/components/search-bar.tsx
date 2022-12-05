import { useRef, useState } from "react";

export default function SearchBar(props: {
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
