import * as React from "react";

interface Props {
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBox({ onChange, placeholder = "Search..." }: Props) {
  const [searchValue, setSearchValue] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    // Requirement 3: Trigger the update in the parent component's local state array
    onChange(value);
  };

  const clearSearch = () => {
    setSearchValue("");
    onChange("");
  };

  return (
    <div className="search-box-container" style={{ 
      display: "flex", 
      alignItems: "center", 
      background: "#f5f5f5", 
      padding: "5px 15px", 
      borderRadius: "8px",
      border: "1px solid #e0e0e0",
      flexGrow: 1,
      margin: "5 15x"
    }}>
      <span className="material-icons-round" style={{ color: "#969696", marginRight: 10, fontSize: 20 }}>
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        style={{ 
          color: "black",
          border: "none", 
          background: "transparent", 
          outline: "none", 
          width: "100%",
          padding: "5px 0"
        }}
      />
      {searchValue && (
        <span 
          className="material-icons-round" 
          onClick={clearSearch}
          style={{ color: "#969696", cursor: "pointer", fontSize: 18, marginLeft: 5 }}
        >
          close
        </span>
      )}
    </div>
  );
}