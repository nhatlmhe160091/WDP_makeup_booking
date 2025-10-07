import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const types = [5, 7, 11];

const SelectServiceComponent = ({ fields, setFields, openingTime, closingTime }) => {
  const [viewDetail, setViewDetail] = useState({
    5: false,
    7: false,
    11: false
  });

  // update if openingTime or closingTime change
  useEffect(() => {
    setFields((prevFields) => {
      const newFields = { ...prevFields };
      types.forEach((fieldIndex) => {
        if (newFields[fieldIndex].isAvailable) {
          const data = generateTimeSlots(
            openingTime.format("HH:mm"),
            closingTime.format("HH:mm"),
            newFields[fieldIndex].timeMatch
          );
          newFields[fieldIndex].timeDetail = data;
        }
      });
      return newFields;
    });
  }, [openingTime, closingTime, setFields]);

  const handleFieldChange = (fieldIndex, field, value) => {
    setFields((prevFields) => {
      const newFields = { ...prevFields };
      newFields[fieldIndex] = { ...newFields[fieldIndex], [field]: value };
      if (field === "timeMatch") {
        const data = generateTimeSlots(
          openingTime.format("HH:mm"),
          closingTime.format("HH:mm"),
          newFields[fieldIndex].timeMatch
        );
        newFields[fieldIndex].timeDetail = data;
      }
      return newFields;
    });
  };

  // console.log(fields);

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
                {fields[fieldIndex].name}
              </Typography>

              {/* form checkbox */}
              <input
                type="checkbox"
                checked={fields[fieldIndex].isAvailable}
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
                value={fields[fieldIndex].price}
                onChange={(e) => {
                  handleFieldChange(fieldIndex, "price", e.target.value);
                }}
                disabled={!fields[fieldIndex].isAvailable}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                label="Số lượng"
                type="number"
                fullWidth
                variant="outlined"
                value={fields[fieldIndex].count}
                onChange={(e) => {
                  handleFieldChange(fieldIndex, "count", e.target.value);
                }}
                disabled={!fields[fieldIndex].isAvailable}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                label="Thời lượng (phút)"
                type="number"
                fullWidth
                variant="outlined"
                value={fields[fieldIndex].timeMatch}
                onChange={(e) => {
                  handleFieldChange(fieldIndex, "timeMatch", e.target.value);
                }}
                disabled={!fields[fieldIndex].isAvailable}
              />
            </Grid>

            <Grid item xs={12} sx={{ borderBottom: "1px solid #e0e0e0", paddingBottom: 2 }}>
              <Button
                variant="contained"
                disabled={!fields[fieldIndex].isAvailable}
                onClick={() => setViewDetail((prev) => ({ ...prev, [fieldIndex]: !prev[fieldIndex] }))}
              >
                Chi tiết
              </Button>

              {viewDetail[fieldIndex] && fields[fieldIndex].timeDetail.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" marginTop={2}>
                    Chi tiết thời gian
                  </Typography>
                  <Grid container spacing={2}>
                    {fields[fieldIndex].timeDetail.map((time, index) => (
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
