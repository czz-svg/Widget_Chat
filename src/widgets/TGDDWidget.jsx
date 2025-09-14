import React, { useMemo, useState, useEffect } from "react";
import "./tgdd-widget.css";

// ---------- TGDD-STYLE PRODUCT WIDGET (single-file) ----------
// Copy this file into: src/widgets/TGDDWidget.jsx
// Usage in App.jsx: import TGDDWidget from "./widgets/TGDDWidget"; export default () => <TGDDWidget/>;

export default function TGDDWidget({
  items,
  title = "Gợi ý cho bạn",
  sub = "Hàng mới • Trả góp 0% • Ưu đãi online",
  currency = "VND",
  theme
}) {
  const [selected, setSelected] = useState([]); // for "So sánh"
  const [liked, setLiked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tgdd-liked") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("tgdd-liked", JSON.stringify(liked)); }, [liked]);

  // Allow external data, fallback to sample
  const products = useMemo(() => (items && items.length ? items : SAMPLE_PRODUCTS), [items]);
  const toggleCompare = (id) => setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  const toggleLike = (id) => setLiked((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Optional theming via CSS variables
  const themeVars = theme ? {
    "--brand": theme.brand ?? undefined,
    "--card-bg": theme.cardBg ?? undefined,
    "--text": theme.text ?? undefined,
    "--muted": theme.muted ?? undefined,
    "--line": theme.line ?? undefined,
    "--danger": theme.danger ?? undefined,
    "--gold": theme.gold ?? undefined,
  } : undefined;

  return (
    <div className="tgdd-wrap" style={themeVars}>      <div className="tgdd-header">
        <h2>{title}</h2>
        {sub && <div className="tgdd-sub">{sub}</div>}
      </div>

      <div className="tgdd-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            data={p}
            currency={currency}
            liked={liked.includes(p.id)}
            compared={selected.includes(p.id)}
            onToggleCompare={() => toggleCompare(p.id)}
            onToggleLike={() => toggleLike(p.id)}
          />
        ))}
      </div>

      {selected.length > 0 && (
        <CompareBar ids={selected} products={products} onClear={() => setSelected([])} />
      )}
    </div>
  );
}

function ProductCard({ data, currency, liked, compared, onToggleCompare, onToggleLike }) {
  const { name, image, price, oldPrice, rating, reviewCount, installment, promos } = data;
  const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <article className={`tgdd-card ${compared ? "is-compared" : ""}`}>
      {installment && <span className="tgdd-badge">
        {installment}
      </span>}

      {discount > 0 && <span className="tgdd-discount">-{discount}%</span>}

      <button className={`tgdd-like ${liked ? "is-liked" : ""}`} onClick={onToggleLike} aria-label={liked ? "Bỏ yêu thích" : "Yêu thích"}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M12 21s-7.053-4.534-9.243-8.485C1.255 10.106 2.34 6.5 5.657 6.5c2.04 0 3.343 1.25 4.343 2.5 1-1.25 2.303-2.5 4.343-2.5 3.318 0 4.402 3.606 2.9 6.015C19.053 16.466 12 21 12 21z" fill="currentColor"/>
        </svg>
      </button>

      <div className="tgdd-thumb">
        <img src={image} alt={name} loading="lazy" />
      </div>

      <h3 className="tgdd-title" title={name}>{name}</h3>

      <div className="tgdd-rating" aria-label={`Đánh giá ${rating}/5`}>
        <Stars value={rating} />
        <span className="tgdd-reviews">({reviewCount})</span>
      </div>

      <div className="tgdd-price">
        <strong className="tgdd-price-now">{formatPrice(price, currency)}</strong>
        {oldPrice && <span className="tgdd-price-old">{formatPrice(oldPrice, currency)}</span>}
      </div>

      {promos?.length > 0 && (
        <ul className="tgdd-promos">
          {promos.slice(0, 2).map((pm, i) => (
            <li key={i}>🎁 {pm}</li>
          ))}
        </ul>
      )}

      <div className="tgdd-actions">
        <label className="tgdd-compare">
          <input type="checkbox" checked={compared} onChange={onToggleCompare} /> So sánh
        </label>
        <button className="tgdd-buy" onClick={() => alert("Demo: Mua ngay!")}>Mua ngay</button>
      </div>
    </article>
  );
}

function Stars({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empties = 5 - full - (half ? 1 : 0);
  return (
    <span className="tgdd-stars">
      {Array.from({ length: full }).map((_, i) => <Star key={"f"+i} type="full" />)}
      {half && <Star type="half" />}
      {Array.from({ length: empties }).map((_, i) => <Star key={"e"+i} type="empty" />)}
    </span>
  );
}

function Star({ type }) {
  const dFull = "M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.401 8.164L12 19.771 4.665 23.16l1.401-8.164L.132 9.21l8.2-1.192L12 .587z";
  const dHalf = "M12 .587v19.184l7.334 3.389-1.401-8.164 5.934-5.786-8.2-1.192z";
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden className={`star ${type}`}>
      {type === "full" && <path d={dFull} />}
      {type === "half" && (
        <>
          <path d={dFull} className="bg" />
          <path d={dHalf} />
        </>
      )}
      {type === "empty" && <path d={dFull} className="bg" />}
    </svg>
  );
}

function CompareBar({ ids, products, onClear }) {
  const items = ids.map(id => products.find(p => p.id === id)).filter(Boolean);
  return (
    <div className="tgdd-compare-bar" role="region" aria-label="So sánh sản phẩm">
      <div className="tgdd-compare-list">
        {items.map((p) => (
          <div key={p.id} className="tgdd-compare-item">
            <img src={p.image} alt="" />
            <div className="name" title={p.name}>{p.name}</div>
            <div className="price">{formatVND(p.price)}</div>
          </div>
        ))}
      </div>
      <div className="tgdd-compare-actions">
        <button className="tgdd-ghost" onClick={onClear}>Xoá</button>
        <button className="tgdd-primary" onClick={() => alert("Demo: so sánh chưa triển khai")}>So sánh</button>
      </div>
    </div>
  );
}

// ---------- Utils & Sample Data ----------
function formatPrice(n, currency = "VND") {
  try {
    return n.toLocaleString("vi-VN", { style: "currency", currency, maximumFractionDigits: 0 });
  } catch {
    return `${n} ${currency}`;
  }
}

const SAMPLE_PRODUCTS = [
  {
    id: "p1",
    name: "iPhone 15 128GB | Hàng chính hãng VN/A",
    image: "https://picsum.photos/seed/iphone/400/400",
    price: 18990000,
    oldPrice: 21990000,
    rating: 4.7,
    reviewCount: 1253,
    installment: "Trả góp 0%",
    promos: ["Tặng gói iCloud 50GB 3 tháng", "Giảm thêm 500k khi mở thẻ mới"]
  },
  {
    id: "p2",
    name: "Samsung Galaxy A55 5G 8GB/256GB",
    image: "https://picsum.photos/seed/a55/400/400",
    price: 8990000,
    oldPrice: 10490000,
    rating: 4.4,
    reviewCount: 842,
    installment: "Trả góp 0%",
    promos: ["Ưu đãi Galaxy Gift", "Bảo hành 18 tháng"]
  },
  {
    id: "p3",
    name: "Xiaomi Redmi Note 13 Pro 5G 12GB/512GB",
    image: "https://picsum.photos/seed/redmi13/400/400",
    price: 7990000,
    oldPrice: 8990000,
    rating: 4.3,
    reviewCount: 601,
    installment: "Trả góp 0%",
    promos: ["Tặng ốp lưng", "Giảm 10% phụ kiện kèm theo"]
  },
  {
    id: "p4",
    name: "OPPO Reno12 5G 12GB/256GB",
    image: "https://picsum.photos/seed/reno12/400/400",
    price: 10990000,
    oldPrice: 11990000,
    rating: 4.5,
    reviewCount: 410,
    installment: "Trả góp 0%",
    promos: ["Tặng gói bảo hành rơi vỡ 6 tháng"]
  },
  {
    id: "p5",
    name: "Realme C67 8GB/256GB",
    image: "https://picsum.photos/seed/realmec67/400/400",
    price: 5290000,
    oldPrice: 5990000,
    rating: 4.1,
    reviewCount: 219,
    installment: "Trả góp 0%",
    promos: ["Giảm 5% khi mua kèm sim"]
  },
  {
    id: "p6",
    name: "Apple Watch SE GPS 40mm (2023)",
    image: "https://picsum.photos/seed/watchse/400/400",
    price: 5790000,
    oldPrice: 6590000,
    rating: 4.6,
    reviewCount: 330,
    installment: "Trả góp 0%",
    promos: ["Giảm 15% dây đeo"]
  },
  {
    id: "p7",
    name: "Tai nghe Bluetooth AirPods 3",
    image: "https://picsum.photos/seed/airpods3/400/400",
    price: 4190000,
    oldPrice: 4990000,
    rating: 4.2,
    reviewCount: 980,
    installment: "",
    promos: ["Tặng hộp sạc nhanh"]
  },
  {
    id: "p8",
    name: "Laptop ASUS Vivobook 15 i5-12450H/16GB/512GB",
    image: "https://picsum.photos/seed/vivo15/400/400",
    price: 14990000,
    oldPrice: 16990000,
    rating: 4.3,
    reviewCount: 188,
    installment: "Trả góp 0%",
    promos: ["Tặng balo thời trang", "Office H&S 1 năm"]
  },
  {
    id: "p9",
    name: "Máy lọc không khí Xiaomi 4",
    image: "https://picsum.photos/seed/airpurifier4/400/400",
    price: 2790000,
    oldPrice: 3290000,
    rating: 4.0,
    reviewCount: 90,
    installment: "",
    promos: ["Freeship nội thành"]
  },
  {
    id: "p10",
    name: "TV Samsung 43\" 4K UHD 2024",
    image: "https://picsum.photos/seed/tv43/400/400",
    price: 6290000,
    oldPrice: 7990000,
    rating: 4.2,
    reviewCount: 145,
    installment: "Trả góp 0%",
    promos: ["Tặng 12 tháng FPT Play"]
  }
];
