import { useState } from "react";
import { Box, IconButton, Popover, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { ChevronLeft, ChevronRight, CalendarMonth, ArrowForward } from "@mui/icons-material";
import dayjs from "dayjs";

function DatePickerBox({ value, onChange, label, disabled, isDarkMode, colors, maxDate }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const accentColor = isDarkMode ? "#FFB74D" : "#1D3557";

  const handleClick = (event) => {
    if (!disabled) setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleDateChange = (newValue) => {
    if (maxDate && newValue && newValue.isAfter(maxDate, "day")) return;
    onChange(newValue ? newValue.format("YYYY-MM-DD") : value);
    handleClose();
  };

  const handlePrevDay = (e) => {
    e.stopPropagation();
    if (disabled) return;
    const newDate = dayjs(value).subtract(1, "day");
    onChange(newDate.format("YYYY-MM-DD"));
  };

  const handleNextDay = (e) => {
    e.stopPropagation();
    if (disabled) return;
    const currentDate = dayjs(value);
    if (maxDate && (currentDate.isSame(maxDate, "day") || currentDate.isAfter(maxDate, "day"))) return;
    const newDate = currentDate.add(1, "day");
    onChange(newDate.format("YYYY-MM-DD"));
  };

  const formatDisplayDate = (dateStr) => dayjs(dateStr).format("DD MMM YYYY");
  const isAtMax = maxDate && dayjs(value).isSame(dayjs(maxDate), "day");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontSize: "0.75rem", color: colors?.textSecondary || "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label}
        </Typography>
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
          <IconButton size="small" onClick={handlePrevDay} disabled={disabled} sx={{ color: isDarkMode ? colors?.textSecondary : "#64748b", padding: "4px", "&:hover": { backgroundColor: isDarkMode ? "rgba(255,183,77,0.1)" : "rgba(29,53,87,0.08)", color: accentColor } }}>
            <ChevronLeft sx={{ fontSize: 18 }} />
          </IconButton>
          <Box onClick={handleClick} sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1, py: 0.5, borderRadius: "8px", cursor: disabled ? "not-allowed" : "pointer", backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#fff", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`, minWidth: "115px", justifyContent: "center", transition: "all 0.2s ease", "&:hover": { backgroundColor: disabled ? undefined : (isDarkMode ? "rgba(255,183,77,0.05)" : "#f1f5f9") } }}>
            <CalendarMonth sx={{ fontSize: 16, color: accentColor }} />
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: colors?.textPrimary || (isDarkMode ? "#f1f5f9" : "#1E3A5F") }}>
              {formatDisplayDate(value)}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleNextDay} disabled={disabled || isAtMax} sx={{ color: isAtMax ? (isDarkMode ? "#4a5568" : "#cbd5e1") : (isDarkMode ? colors?.textSecondary : "#64748b"), padding: "4px", "&:hover": { backgroundColor: isAtMax ? "transparent" : (isDarkMode ? "rgba(255,183,77,0.1)" : "rgba(29,53,87,0.08)"), color: isAtMax ? undefined : accentColor } }}>
            <ChevronRight sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      <Popover open={open} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} transformOrigin={{ vertical: "top", horizontal: "center" }} slotProps={{ paper: { sx: { mt: 1, borderRadius: "16px", boxShadow: isDarkMode ? "0 10px 40px rgba(0,0,0,0.5)" : "0 10px 40px rgba(0,0,0,0.12)", border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb", overflow: "hidden" } } }}>
        <DateCalendar
          value={dayjs(value)}
          onChange={handleDateChange}
          maxDate={maxDate ? dayjs(maxDate) : dayjs()}
          sx={{
            backgroundColor: isDarkMode ? colors?.bgCard || "#132238" : "#fff",
            "& .MuiPickersCalendarHeader-root": { backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc", borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`, paddingTop: 1.5, paddingBottom: 1, marginBottom: 0 },
            "& .MuiPickersCalendarHeader-label": { color: colors?.textPrimary || (isDarkMode ? "#f1f5f9" : "#1E3A5F"), fontWeight: 600, fontSize: "1rem" },
            "& .MuiPickersArrowSwitcher-button": { color: isDarkMode ? colors?.textSecondary : "#64748b", "&:hover": { backgroundColor: isDarkMode ? "rgba(255,183,77,0.1)" : "rgba(29,53,87,0.08)", color: accentColor } },
            "& .MuiDayCalendar-weekDayLabel": { color: isDarkMode ? "#94a3b8" : "#64748b", fontWeight: 600, fontSize: "0.75rem" },
            "& .MuiPickersDay-root": { color: colors?.textPrimary || (isDarkMode ? "#f1f5f9" : "#1E3A5F"), fontSize: "0.875rem", fontWeight: 500, borderRadius: "10px", "&:hover": { backgroundColor: isDarkMode ? "rgba(255,183,77,0.15)" : "rgba(29,53,87,0.08)" }, "&.Mui-selected": { backgroundColor: `${accentColor} !important`, color: isDarkMode ? "#0a1628" : "#fff", fontWeight: 700 }, "&.MuiPickersDay-today": { border: `2px solid ${accentColor}`, backgroundColor: "transparent" }, "&.Mui-disabled": { color: isDarkMode ? "#4a5568" : "#cbd5e1" } },
            "& .MuiPickersDay-dayOutsideMonth": { color: isDarkMode ? "#4a5568" : "#cbd5e1" },
          }}
        />
      </Popover>
    </LocalizationProvider>
  );
}

export default function CustomDateRangePicker({ startDate, endDate, onStartChange, onEndChange, disabled, isDarkMode, colors }) {
  const accentColor = isDarkMode ? "#FFB74D" : "#1D3557";
  
  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", gap: { xs: 2, sm: 3 } }}>
      <DatePickerBox value={startDate} onChange={onStartChange} label="Start Date" disabled={disabled} isDarkMode={isDarkMode} colors={colors} maxDate={endDate} />
      <ArrowForward sx={{ color: accentColor, fontSize: 20, display: { xs: "none", sm: "block" } }} />
      <DatePickerBox value={endDate} onChange={onEndChange} label="End Date" disabled={disabled} isDarkMode={isDarkMode} colors={colors} maxDate={dayjs().format("YYYY-MM-DD")} />
    </Box>
  );
}
