import { useCallback, useEffect, useRef, useState } from "react";
import { FormControl, InputLabel, MenuItem, Select, Grid } from "@mui/material";

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
    <Grid container spacing={2} className={className}>
      {/* Chọn tỉnh/thành phố */}
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Tỉnh/Thành phố</InputLabel>
          <Select value={search.province} onChange={handleProvinceChange}>
            <MenuItem value="">Chọn Tỉnh/Thành phố</MenuItem>
            {provinces.map((province) => (
              <MenuItem key={province.id} value={province.id}>
                {province.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Chọn quận/huyện */}
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth disabled={!search.province}>
          <InputLabel>Quận/Huyện</InputLabel>
          <Select value={search.district} onChange={handleDistrictChange}>
            <MenuItem value="">Chọn Quận/Huyện</MenuItem>
            {districts.map((district) => (
              <MenuItem key={district.id} value={district.id}>
                {district.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Chọn phường/xã */}
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth disabled={!search.district}>
          <InputLabel>Phường/Xã</InputLabel>
          <Select value={search.ward} onChange={handleWardChange}>
            <MenuItem value="">Chọn Phường/Xã</MenuItem>
            {wards.map((ward) => (
              <MenuItem key={ward.id} value={ward.id}>
                {ward.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default SearchAddressComponent;
