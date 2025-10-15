"use client";
import { useEffect, useState } from "react";
import BoxFieldComponent from "../components/BoxFieldComponent";
import "@muahub/styles/style.css";

export default function YeuThichPage() {
  const [favoriteFields, setFavoriteFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allMakeups, setAllMakeups] = useState([]);

  useEffect(() => {
    // Lấy tất cả dịch vụ
    const fetchAllMakeups = async () => {
      try {
        const res = await fetch('/api/services');
        const json = await res.json();
        if (json && json.success) {
          setAllMakeups(json.data || []);
        }
      } catch (e) {
        console.error('Failed to load makeups:', e);
      }
    };
    fetchAllMakeups();
  }, []);

  useEffect(() => {
    // Khi allMakeups đã có, lọc theo id yêu thích
    const favIds = JSON.parse(localStorage.getItem("favoriteServices") || "[]");
    if (!allMakeups.length) {
      setFavoriteFields([]);
      setLoading(false);
      return;
    }
    const filtered = allMakeups.filter((item) => favIds.includes(item._id));
    setFavoriteFields(filtered);
    setLoading(false);
  }, [allMakeups]);

  return (
    <div className="container py-5">
      <h2 className="mb-4" style={{ color: "#ff5c95", fontWeight: 700 }}>Dịch vụ yêu thích của bạn</h2>
      {loading ? (
        <div>Đang tải...</div>
      ) : favoriteFields.length === 0 ? (
        <div>Bạn chưa có dịch vụ nào trong danh sách yêu thích.</div>
      ) : (
        <div className="row">
          {favoriteFields.map((field) => (
            <BoxFieldComponent key={field._id} field={field} />
          ))}
        </div>
      )}
    </div>
  );
}
