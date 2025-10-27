import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const types = [5, 7, 11];

const SelectServiceComponent = ({ packages, setPackages, openingTime, closingTime }) => {
  const [viewDetail, setViewDetail] = useState({
    5: false,
    7: false,
    11: false
  });

  // update if openingTime or closingTime change
  useEffect(() => {
    setPackages((prevPackages) => {
      const newPackages = { ...prevPackages };
      types.forEach((fieldIndex) => {
        if (newPackages[fieldIndex].isAvailable) {
          const data = generateTimeSlots(
            openingTime.format("HH:mm"),
            closingTime.format("HH:mm"),
            newPackages[fieldIndex].timeMatch
          );
          newPackages[fieldIndex].timeDetail = data;
        }
      });
      return newPackages;
    });
  }, [openingTime, closingTime, setPackages]);

  const handleFieldChange = (fieldIndex, field, value) => {
    setPackages((prevPackages) => {
      const newPackages = { ...prevPackages };
      newPackages[fieldIndex] = { ...newPackages[fieldIndex], [field]: value };
      if (field === "timeMatch") {
        const data = generateTimeSlots(
          openingTime.format("HH:mm"),
          closingTime.format("HH:mm"),
          newPackages[fieldIndex].timeMatch
        );
        newPackages[fieldIndex].timeDetail = data;
      }
      return newPackages;
    });
  };

  // console.log(packages);

  function generateTimeSlots(openTime, closeTime, matchDuration) {
    function timeToMinutes(time) {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    }

    function minutesToTime(minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}:${mins.toString().padStart(2, "0")}`;
    }

    const startMinutes = timeToMinutes(openTime);
    const endMinutes = timeToMinutes(closeTime);
    const breakTime = 10; // 10 phút nghỉ
    const result = [];

    let currentStart = startMinutes;

    matchDuration = Number(matchDuration);
    if (matchDuration === 0) {
      return [];
    }
    while (currentStart + matchDuration <= endMinutes) {
      const currentEnd = currentStart + matchDuration;
      result.push(`${minutesToTime(currentStart)} - ${minutesToTime(currentEnd)}`);
      currentStart = currentEnd + breakTime;
    }

    return result;
  }

  return (
    <>
      {types.map((fieldIndex) => (
        <Grid item xs={12} key={fieldIndex}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" marginBottom={2} gap={2}>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: "500"
                }}
              >
                {packages[fieldIndex].name}
              </Typography>

              {/* form checkbox */}
              <input
                type="checkbox"
                checked={packages[fieldIndex].isAvailable}
                style={{ width: "16px", height: "16px" }}
                onChange={(e) => {
                  handleFieldChange(fieldIndex, "isAvailable", e.target.checked);
                }}
              />
            </Box>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              {/* Giá dịch vụ */}
              <TextField
                label="Giá dịch vụ (VND)"
                type="number"
                fullWidth
                variant="outlined"
                value={packages[fieldIndex].price}
                onChange={(e) => {
                  handleFieldChange(fieldIndex, "price", e.target.value);
                }}
                disabled={!packages[fieldIndex].isAvailable}
              />
            </Grid>



            <Grid item xs={4}>
              <TextField
                label="Thời lượng (phút)"
                type="number"
                fullWidth
                variant="outlined"
                value={packages[fieldIndex].timeMatch}
                onChange={(e) => {
                  handleFieldChange(fieldIndex, "timeMatch", e.target.value);
                }}
                disabled={!packages[fieldIndex].isAvailable}
              />
            </Grid>

            <Grid item xs={12} sx={{ borderBottom: "1px solid #e0e0e0", paddingBottom: 2 }}>
              <Button
                variant="contained"
                disabled={!packages[fieldIndex].isAvailable}
                onClick={() => setViewDetail((prev) => ({ ...prev, [fieldIndex]: !prev[fieldIndex] }))}
              >
                Chi tiết
              </Button>

              {viewDetail[fieldIndex] && packages[fieldIndex].timeDetail.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" marginTop={2}>
                    Chi tiết thời gian
                  </Typography>
                  <Grid container spacing={2}>
                    {packages[fieldIndex].timeDetail.map((time, index) => (
                      <Grid item xs={3} key={index}>
                        <Typography>{time}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      ))}
    </>
  );
};

export default SelectServiceComponent;
