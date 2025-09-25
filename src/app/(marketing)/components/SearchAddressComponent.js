import { useCallback, useEffect, useRef, useState } from "react";

const SearchAddressComponent = ({ onSearch, className, oldSearch = "" }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [search, setSearch] = useState({
    province: "",
    district: "",
    ward: ""
  });

  const allDistricts = useRef({});
  const allWards = useRef({});
  const oldSearchedsRef = useRef(false);

  useEffect(() => {
    if (oldSearch.length > 0 && !oldSearchedsRef.current) {
      const dataArr = oldSearch.split(", ");
      let provinceStr = "";
      let districtStr = "";
      let wardStr = "";

      if (dataArr.length === 3) {
        [wardStr, districtStr, provinceStr] = dataArr;
      }
      if (dataArr.length === 2) {
        [districtStr, provinceStr] = dataArr;
      }
      if (dataArr.length === 1) {
        [provinceStr] = dataArr;
      }

      const province = provinces.find((p) => p.name.toLowerCase() === provinceStr.toLowerCase());
      const district = districts.find((d) => d.name.toLowerCase() === districtStr.toLowerCase());
      const ward = wards.find((w) => w.name.toLowerCase() === wardStr.toLowerCase());

      setSearch({
        province: province?.id || "",
        district: district?.id || "",
        ward: ward?.id || ""
      });
    }
  }, [districts, oldSearch, provinces, wards]);

  useEffect(() => {
    let address = "";
    if (search.ward) {
      const ward = wards.find((w) => w.id === search.ward);
      address = (ward?.name || "") + ", ";
    }
    if (search.district) {
      const district = districts.find((d) => d.id === search.district);
      address += (district?.name || "") + ", ";
    }
    if (search.province) {
      const province = provinces.find((p) => p.id === search.province);
      address += province?.name || "";
    }
    onSearch(address);
  }, [districts, onSearch, provinces, search, wards]);

  const getDistricts = useCallback((provinceId) => {
    if (allDistricts.current[provinceId]) {
      setDistricts(allDistricts.current[provinceId]);
    } else {
      fetch(`https://open.oapi.vn/location/districts/${provinceId}?size=100`)
        .then((response) => response.json())
        .then((data) => {
          allDistricts.current[provinceId] = data.data;
          setDistricts(data.data);
        });
    }
    setWards([]);
  }, []);

  const getWards = useCallback((districtId) => {
    if (allWards.current[districtId]) {
      setWards(allWards.current[districtId]);
    } else {
      fetch(`https://open.oapi.vn/location/wards/${districtId}?size=100`)
        .then((response) => response.json())
        .then((data) => {
          allWards.current[districtId] = data.data;
          setWards(data.data);
        });
    }
  }, []);

  useEffect(() => {
    getWards(search.district);
  }, [getWards, search.district]);

  useEffect(() => {
    getDistricts(search.province);
  }, [getDistricts, search.province]);

  useEffect(() => {
    fetch("https://open.oapi.vn/location/provinces?size=100")
      .then((response) => response.json())
      .then((data) => setProvinces(data.data));
  }, []);

  const handleProvinceChange = (e) => {
    oldSearchedsRef.current = true;
    const provinceId = e.target.value;
    setSearch({
      province: provinceId,
      district: "",
      ward: ""
    });
  };

  const handleDistrictChange = (e) => {
    oldSearchedsRef.current = true;

    const districtId = e.target.value;
    setSearch({
      ...search,
      district: districtId,
      ward: ""
    });
  };

  const handleWardChange = (e) => {
    oldSearchedsRef.current = true;

    setSearch({
      ...search,
      ward: e.target.value
    });
  };

  return (
    <>
      <div className={`${className}`}>
        <select className={`form-select`} value={search.province} onChange={handleProvinceChange}>
          <option value="">Chọn Tỉnh/Thành phố</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
      </div>
      <div className={`${className}`}>
        <select className={`form-select`} value={search.district} onChange={handleDistrictChange}>
          <option value="">Chọn Quận/Huyện</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </div>
      <div className={`${className}`}>
        <select className={`form-select`} value={search.ward} onChange={handleWardChange}>
          <option value="">Chọn Phường/Xã</option>
          {wards.map((ward) => (
            <option key={ward.id} value={ward.id}>
              {ward.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default SearchAddressComponent;
