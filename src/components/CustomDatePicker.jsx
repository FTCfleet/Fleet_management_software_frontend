import { useState } from "react";
import { Box, IconButton, Popover, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { ChevronLeft, ChevronRight, CalendarMonth } from "@mui/icons-material";
import dayjs from "dayjs";

export default function CustomDatePicker({ value, onChange, disabled, isDarkMode, colors }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    if (!disabled) setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleDateChange = (newValue) => {
    const today = dayjs();
    if (newValue && newValue.isAfter(today, "day")) return;
    onChange(newValue ? newValue.format("YYYY-MM-DD") : value);
    handleClose();
  };

  const handlePrevDay = (e) => {
    e.stopPropagation();
    if (disabled) return;
    const currentDate = dayjs(value);
    const newDate = currentDate.subtract(1, "day");
    onChange(newDate.format("YYYY-MM-DD"));
  };

  const handleNextDay = (e) => {
    e.stopPropagation();
    if (disabled) return;
    const currentDate = dayjs(value);
    const today = dayjs();
    if (currentDate.isSame(today, "day") || currentDate.isAfter(today, "day")) return;
    const newDate = currentDate.add(1, "day");
    onChange(newDate.format("YYYY-MM-DD"));
  };

  const formatDisplayDate = (dateStr) => {
    const date = dayjs(dateStr);
    return date.format("DD MMM YYYY");
  };

  const isToday = dayjs(value).isSame(dayjs(), "day");
  const accentColor = isDarkMode ? "#FFB74D" : "#1D3557";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          backgroundColor: isDarkMode ? colors?.bgPrimary || "#0a1628" : "#f8fafc",
          borderRadius: "12px",
          border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.15)" : "#e2e8f0"}`,
          padding: "4px",
          transition: "all 0.2s ease",
          opacity: disabled ? 0.6 : 1,
          "&:hover": {
            borderColor: disabled ? undefined : accentColor,
            boxShadow: disabled ? undefined : `0 0 0 3px ${isDarkMode ? "rgba(255,183,77,0.1)" : "rgba(29,53,87,0.08)"}`,
          },
        }}
      >
        {/* Left Arrow */}
        <IconButton
          size="small"
          onClick={handlePrevDay}
          disabled={disabled}
          sx={{
            color: isDarkMode ? colors?.textSecondary : "#64748b",
            padding: "6px",
            "&:hover": {
              backgroundColor: isDarkMode ? "rgba(255,183,77,0.1)" : "rgba(29,53,87,0.08)",
              color: accentColor,
            },
          }}
        >
          <ChevronLeft sx={{ fontSize: 20 }} />
        </IconButton>

        {/* Date Display */}
        <Box
          onClick={handleClick}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: "8px",
            cursor: disabled ? "not-allowed" : "pointer",
            backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#fff",
            border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
            minWidth: "140px",
            justifyContent: "center",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: disabled ? undefined : (isDarkMode ? "rgba(255,183,77,0.05)" : "#f1f5f9"),
            },
          }}
        >
          <CalendarMonth sx={{ fontSize: 18, color: accentColor }} />
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: colors?.textPrimary || (isDarkMode ? "#f1f5f9" : "#1E3A5F"),
              letterSpacing: "0.01em",
            }}
          >
            {formatDisplayDate(value)}
          </Typography>
        </Box>

        {/* Right Arrow */}
        <IconButton
          size="small"
          onClick={handleNextDay}
          disabled={disabled || isToday}
          sx={{
            color: isToday ? (isDarkMode ? "#4a5568" : "#cbd5e1") : (isDarkMode ? colors?.textSecondary : "#64748b"),
            padding: "6px",
            "&:hover": {
              backgroundColor: isToday ? "transparent" : (isDarkMode ? "rgba(255,183,77,0.1)" : "rgba(29,53,87,0.08)"),
              color: isToday ? undefined : accentColor,
            },
          }}
        >
          <ChevronRight sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Calendar Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: "16px",
              boxShadow: isDarkMode ? "0 10px 40px rgba(0,0,0,0.5)" : "0 10px 40px rgba(0,0,0,0.12)",
              border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
              overflow: "hidden",
            },
          },
        }}
      >
        <DateCalendar
          value={dayjs(value)}
          onChange={handleDateChange}
          maxDate={dayjs()}
          sx={{
            backgroundColor: isDarkMode ? colors?.bgCard || "#132238" : "#fff",
            "& .MuiPickersCalendarHeader-root": {
              backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc",
              borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
              paddingTop: 1.5,
              paddingBottom: 1,
              marginBottom: 0,
            },
            "& .MuiPickersCalendarHeader-label": {
              color: colors?.textPrimary || (isDarkMode ? "#f1f5f9" : "#1E3A5F"),
              fontWeight: 600,
              fontSize: "1rem",
            },
            "& .MuiPickersArrowSwitcher-button": {
              color: isDarkMode ? colors?.textSecondary : "#64748b",
              "&:hover": {
                backgroundColor: isDarkMode ? "rgba(255,183,77,0.1)" : "rgba(29,53,87,0.08)",
                color: accentColor,
              },
            },
            "& .MuiDayCalendar-weekDayLabel": {
              color: isDarkMode ? "#94a3b8" : "#64748b",
              fontWeight: 600,
              fontSize: "0.75rem",
            },
            "& .MuiPickersDay-root": {
              color: colors?.textPrimary || (isDarkMode ? "#f1f5f9" : "#1E3A5F"),
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: isDarkMode ? "rgba(255,183,77,0.15)" : "rgba(29,53,87,0.08)",
              },
              "&.Mui-selected": {
                backgroundColor: `${accentColor} !important`,
                color: isDarkMode ? "#0a1628" : "#fff",
                fontWeight: 700,
                "&:hover": {
                  backgroundColor: isDarkMode ? "#FFA726" : "#25445f",
                },
              },
              "&.MuiPickersDay-today": {
                border: `2px solid ${accentColor}`,
                backgroundColor: "transparent",
                "&:not(.Mui-selected)": {
                  borderColor: accentColor,
                },
              },
              "&.Mui-disabled": {
                color: isDarkMode ? "#4a5568" : "#cbd5e1",
              },
            },
            "& .MuiPickersDay-dayOutsideMonth": {
              color: isDarkMode ? "#4a5568" : "#cbd5e1",
            },
            "& .MuiYearCalendar-root": {
              "& .MuiPickersYear-yearButton": {
                color: colors?.textPrimary || (isDarkMode ? "#f1f5f9" : "#1E3A5F"),
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: isDarkMode ? "rgba(255,183,77,0.15)" : "rgba(29,53,87,0.08)",
                },
                "&.Mui-selected": {
                  backgroundColor: `${accentColor} !important`,
                  color: isDarkMode ? "#0a1628" : "#fff",
                },
              },
            },
          }}
        />
      </Popover>
    </LocalizationProvider>
  );
}
