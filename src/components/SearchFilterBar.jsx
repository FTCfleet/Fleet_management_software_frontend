import React from "react";
import { Box, TextField, Button, Select, MenuItem, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CustomDatePicker from "./CustomDatePicker";

/**
 * Reusable Search Filter Bar Component
 * Layout: [DatePicker] ... [Search] [Apply] [Clear] ... [Dropdown] [ExtraButtons]
 */
const SearchFilterBar = ({
  isDarkMode,
  colors,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  onApply,
  onClear,
  isLoading = false,
  showDatePicker = false,
  dateValue,
  onDateChange,
  showDropdown = false,
  dropdownValue = "",
  onDropdownChange,
  dropdownOptions = [],
  dropdownPlaceholder = "All",
  extraButtons,
  showSearch = true,
}) => {
  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: isDarkMode ? colors?.bgPrimary : "#f8fafc",
      color: colors?.textPrimary,
      fontSize: "0.9rem",
      height: "40px",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: isDarkMode ? "rgba(255,255,255,0.12)" : "#e2e8f0",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: isDarkMode ? "rgba(255,183,77,0.5)" : "#1E3A5F",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: isDarkMode ? "#FFB74D" : "#1E3A5F",
        borderWidth: "2px",
      },
    },
    "& .MuiInputBase-input::placeholder": {
      color: colors?.textMuted,
      opacity: 1,
    },
  };

  const selectStyle = {
    borderRadius: "10px",
    backgroundColor: isDarkMode ? colors?.bgPrimary : "#f8fafc",
    color: colors?.textPrimary,
    fontSize: "0.9rem",
    height: "40px",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: isDarkMode ? "rgba(255,255,255,0.12)" : "#e2e8f0",
      borderRadius: "10px",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: isDarkMode ? "rgba(255,183,77,0.5)" : "#1E3A5F",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: isDarkMode ? "#FFB74D" : "#1E3A5F",
      borderWidth: "2px",
    },
    "& .MuiSelect-icon": {
      color: colors?.textSecondary,
    },
  };

  const applyButtonStyle = {
    background: isDarkMode
      ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)"
      : "linear-gradient(135deg, #1D3557 0%, #0a1628 100%)",
    color: isDarkMode ? "#0a1628" : "#fff",
    fontWeight: 600,
    px: { xs: 2, sm: 2.5 },
    height: "40px",
    minWidth: { xs: "70px", sm: "80px" },
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "0.875rem",
    boxShadow: "none",
    "&:hover": {
      background: isDarkMode
        ? "linear-gradient(135deg, #FFA726 0%, #F57C00 100%)"
        : "linear-gradient(135deg, #25445f 0%, #0f2035 100%)",
    },
    "&:disabled": {
      background: isDarkMode ? "rgba(255,183,77,0.3)" : "rgba(29,53,87,0.3)",
      color: isDarkMode ? "rgba(10,22,40,0.5)" : "rgba(255,255,255,0.5)",
    },
  };

  const clearButtonStyle = {
    borderColor: isDarkMode ? "rgba(255,255,255,0.2)" : "#d1d5db",
    color: colors?.textSecondary,
    borderRadius: "10px",
    textTransform: "none",
    px: { xs: 1.5, sm: 2 },
    height: "40px",
    minWidth: { xs: "60px", sm: "70px" },
    fontSize: "0.875rem",
    "&:hover": {
      borderColor: isDarkMode ? "rgba(255,183,77,0.5)" : "#1E3A5F",
      backgroundColor: isDarkMode ? "rgba(255,183,77,0.05)" : "rgba(30,58,95,0.05)",
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "center" },
        gap: { xs: 1.5, md: 2 },
        p: { xs: 2, md: 2.5 },
        mb: 3,
        backgroundColor: colors?.bgCard || "#ffffff",
        borderRadius: "16px",
        boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.06)",
        border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb",
      }}
    >
      {/* Left Section: DatePicker */}
      {showDatePicker && (
        <Box sx={{ flexShrink: 0 }}>
          <CustomDatePicker
            value={dateValue}
            onChange={onDateChange}
            disabled={isLoading}
            isDarkMode={isDarkMode}
            colors={colors}
          />
        </Box>
      )}

      {/* Search Section: Search + Apply/Clear - left aligned when no date picker, centered otherwise */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: showDatePicker ? "center" : "flex-start",
          gap: { xs: 1.5, sm: 1 },
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Search Input */}
        {showSearch && (
          <TextField
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              ...inputStyle,
              width: { xs: "100%", sm: "280px", md: "320px" },
              minWidth: { sm: "280px" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors?.textMuted, fontSize: "1.2rem" }} />
                </InputAdornment>
              ),
            }}
          />
        )}

        {/* Apply & Clear Buttons - next to search */}
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          {onApply && (
            <Button
              variant="contained"
              onClick={onApply}
              disabled={isLoading}
              sx={applyButtonStyle}
            >
              Apply
            </Button>
          )}
          {onClear && (
            <Button
              variant="outlined"
              onClick={onClear}
              disabled={isLoading}
              sx={clearButtonStyle}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

      {/* Right Section: Dropdown + Extra Buttons */}
      {(showDropdown || extraButtons) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
          }}
        >
          {showDropdown && (
            <Select
              value={dropdownValue}
              onChange={(e) => onDropdownChange(e.target.value)}
              displayEmpty
              size="small"
              sx={{
                ...selectStyle,
                minWidth: { xs: "100%", sm: "160px" },
              }}
            >
              <MenuItem value="">{dropdownPlaceholder}</MenuItem>
              {dropdownOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          )}
          {extraButtons}
        </Box>
      )}
    </Box>
  );
};

// Utility function to highlight matching text in search results
export const highlightMatch = (text, searchTerm, isDarkMode) => {
  if (!searchTerm || !text) return text;
  
  const lowerText = String(text).toLowerCase();
  const lowerSearch = searchTerm.toLowerCase().trim();
  
  if (!lowerSearch || !lowerText.includes(lowerSearch)) return text;
  
  const index = lowerText.indexOf(lowerSearch);
  const before = String(text).slice(0, index);
  const match = String(text).slice(index, index + lowerSearch.length);
  const after = String(text).slice(index + lowerSearch.length);
  
  return (
    <>
      {before}
      <span
        style={{
          backgroundColor: isDarkMode ? "rgba(255, 183, 77, 0.3)" : "rgba(30, 58, 95, 0.2)",
          color: isDarkMode ? "#FFB74D" : "#1E3A5F",
          fontWeight: 600,
          borderRadius: "2px",
          padding: "0 2px",
        }}
      >
        {match}
      </span>
      {after}
    </>
  );
};

export default SearchFilterBar;
