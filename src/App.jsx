import { useEffect, useState, useRef } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [selectedColors, setSelectedColors] = useState({});
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minPopularity, setMinPopularity] = useState("");
  const scrollContainerRef = useRef(null);

  const fetchProducts = async (minPriceParam, maxPriceParam, minPopParam) => {
    const params = new URLSearchParams();
    if (minPriceParam) params.append("minPrice", minPriceParam);
    if (maxPriceParam) params.append("maxPrice", maxPriceParam);
    if (minPopParam) params.append("minPopularity", minPopParam);

    try {
      //const res = await fetch(`http://localhost:8080/api/products?${params.toString()}`);
      const res = await fetch(`https://product-backend-2-b868.onrender.com/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data);

      const initialColors = {};
      data.forEach((_, i) => {
        initialColors[i] = "yellow";
      });
      setSelectedColors(initialColors);
    } catch (err) {
      console.error("API hatası:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFilter = () => {
    fetchProducts(minPrice, maxPrice, minPopularity);
  };

  const handleColorChange = (productIndex, color) => {
    setSelectedColors({ ...selectedColors, [productIndex]: color });
  };

  const scrollLeft = () => {
    scrollContainerRef.current.scrollBy({
      left: -800,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollContainerRef.current.scrollBy({
      left: 800,
      behavior: "smooth",
    });
  };

  // Mouse drag scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    let isDown = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
      isDown = true;
      container.classList.add("active");
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      container.classList.remove("active");
    };

    const handleMouseUp = () => {
      isDown = false;
      container.classList.remove("active");
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5; // sürükleme hızı
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="app-container">
      <h1>Product List</h1>

      <div className="filter-form">
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <input
          type="number"
          step="0.1"
          placeholder="Min Popularity (0-1)"
          value={minPopularity}
          onChange={(e) => setMinPopularity(e.target.value)}
        />
        <button onClick={handleFilter}>Apply Filters</button>
      </div>

      <div className="slider">
        <button onClick={scrollLeft}>◀</button>

        <div className="products-container" ref={scrollContainerRef}>
          {products.map((p, index) => {
            const selectedColor = selectedColors[index] || "yellow";

            return (
              <div key={index} className="product-card">
                <img src={p.images[selectedColor]} alt={p.name} />
                <h2>{p.name}</h2>
                <p>${p.priceUsd} USD</p>

                <div className="color-picker">
                  <div className="color-buttons">
                    {Object.keys(p.images).map((color) => {
                      const colorMap = {
                        yellow: "#FFD966",
                        rose: "#F4B6C2",
                        white: "#e0ddddff",
                        gray: "#C0C0C0",
                        blue: "#6BAED6",
                        green: "#A3D9A5",
                      };
                      const bgColor = colorMap[color] || color;

                      return (
                        <button
                          key={color}
                          onClick={() => handleColorChange(index, color)}
                          className={selectedColor === color ? "selected" : ""}
                          style={{
                            backgroundColor: bgColor,
                            border: "2px solid white",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="color-name">{selectedColor}</div>
                </div>

                <div className="star-rating-wrapper">
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className={`star ${p.popularityOutOf5 >= i ? "filled" : ""}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="star-score">{p.popularityOutOf5.toFixed(1)}/5</span>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={scrollRight}>▶</button>
      </div>
    </div>
  );
}

export default App;
