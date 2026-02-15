import React, { useState, useEffect } from "react";
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
  searchValue2 = "",
  onSearchChange2,
  searchPlaceholder2 = "Search...",
  showSearch2 = false,
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
  dropdownPlaceholderValue = "",
  extraButtons,
  showSearch = true,
}) => {
  // Local state for search inputs to avoid parent re-renders on every keystroke
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [localSearch2, setLocalSearch2] = useState(searchValue2);

  // Sync local state when parent resets values (e.g. external clear)
  useEffect(() => { setLocalSearch(searchValue); }, [searchValue]);
  useEffect(() => { setLocalSearch2(searchValue2); }, [searchValue2]);

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: isDarkMode ? colors?.bgPrimary : "#f8fafc",
      color: colors?.textPrimary,
      fontSize: { xs: "0.85rem", sm: "0.875rem", md: "0.9rem" },
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
    fontSize: { xs: "0.85rem", sm: "0.875rem", md: "0.9rem" },
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
    height: "40px",
    borderRadius: "10px",
    textTransform: "none",
    fontSize: { xs: "0.8rem", sm: "0.825rem", md: "0.875rem" },
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
    height: "40px",
    fontSize: { xs: "0.8rem", sm: "0.825rem", md: "0.875rem" },
    "&:hover": {
      borderColor: isDarkMode ? "rgba(255,183,77,0.5)" : "#1E3A5F",
      backgroundColor: isDarkMode ? "rgba(255,183,77,0.05)" : "rgba(30,58,95,0.05)",
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        alignItems: { xs: "stretch", lg: "center" },
        gap: { xs: 1.5, sm: 1.5, lg: 2 },
        p: { xs: 1.5, sm: 1.75, md: 2, lg: 2.5 },
        mb: 3,
        backgroundColor: colors?.bgCard || "#ffffff",
        borderRadius: "16px",
        boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.06)",
        border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb",
      }}
    >
      {/* Top Row on Tablet: DatePicker + Dropdown */}
      {(showDatePicker && showDropdown) && (
        <Box
          sx={{
            display: { xs: "none", sm: "flex", lg: "none" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            width: "100%",
            order: 0,
          }}
        >
          {/* DatePicker - Leftmost */}
          <Box sx={{ flexShrink: 0 }}>
            <CustomDatePicker
              value={dateValue}
              onChange={onDateChange}
              disabled={isLoading}
              isDarkMode={isDarkMode}
              colors={colors}
            />
          </Box>
          
          {/* Dropdown - Rightmost */}
          <Box sx={{ flexShrink: 0, minWidth: "200px" }}>
            <Select
              value={dropdownValue}
              onChange={(e) => onDropdownChange(e.target.value)}
              displayEmpty
              size="small"
              sx={{
                ...selectStyle,
                width: "100%",
              }}
            >
              <MenuItem value={dropdownPlaceholderValue}>{dropdownPlaceholder}</MenuItem>
              {dropdownOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      )}
      
      {/* DatePicker only on Tablet when no Dropdown */}
      {(showDatePicker && !showDropdown) && (
        <Box
          sx={{
            display: { xs: "none", sm: "block", lg: "none" },
            width: "100%",
            order: 0,
          }}
        >
          <CustomDatePicker
            value={dateValue}
            onChange={onDateChange}
            disabled={isLoading}
            isDarkMode={isDarkMode}
            colors={colors}
          />
        </Box>
      )}
      
      {/* Dropdown only on Tablet when no DatePicker */}
      {(!showDatePicker && showDropdown) && (
        <Box
          sx={{
            display: { xs: "none", sm: "block", lg: "none" },
            width: "100%",
            order: 0,
          }}
        >
          <Select
            value={dropdownValue}
            onChange={(e) => onDropdownChange(e.target.value)}
            displayEmpty
            size="small"
            sx={{
              ...selectStyle,
              width: "100%",
            }}
          >
            <MenuItem value={dropdownPlaceholderValue}>{dropdownPlaceholder}</MenuItem>
            {dropdownOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}

      {/* DatePicker for Mobile and Desktop */}
      {showDatePicker && (
        <Box sx={{ 
          display: { xs: "flex", sm: "none", lg: "block" },
          flexShrink: 0,
          order: { xs: 0, lg: 1 },
          width: { xs: "100%", lg: "auto" },
          justifyContent: { xs: "center", lg: "flex-start" },
          "& .MuiTextField-root": {
            width: { xs: "100%", lg: "auto" }
          },
          "& .MuiInputBase-root": {
            width: { xs: "100%", lg: "auto" }
          }
        }}>
          <CustomDatePicker
            value={dateValue}
            onChange={onDateChange}
            disabled={isLoading}
            isDarkMode={isDarkMode}
            colors={colors}
          />
        </Box>
      )}

      {/* Search Section: Search + Apply/Clear - All in one row for tablet/desktop, column for mobile */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 1.5, sm: 1, md: 1.5 },
          flex: 1,
          minWidth: 0,
          order: { xs: 1, sm: 1, lg: showDatePicker ? 2 : 1 },
        }}
      >
        {/* Search Input */}
        {showSearch && (
          <TextField
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            variant="outlined"
            size="small"
            disabled={localSearch2.length > 0}
            sx={{
              ...inputStyle,
              flex: { xs: "none", sm: 1 },
              minWidth: { sm: "120px", md: "150px" },
            }}
            slotProps={{
              input:{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors?.textMuted, fontSize: "1.2rem" }} />
                </InputAdornment>
              ),
            }}}
          />
        )}
        
        {/* Second Search Input */}
        {showSearch2 && onSearchChange2 && (
          <TextField
            placeholder={searchPlaceholder2}
            value={localSearch2}
            onChange={(e) => setLocalSearch2(e.target.value)}
            variant="outlined"
            size="small"
            disabled={localSearch.length > 0}
            sx={{
              ...inputStyle,
              flex: { xs: "none", sm: 1 },
              minWidth: { sm: "120px", md: "150px" },
            }}
            slotProps={{
              input:{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors?.textMuted, fontSize: "1.2rem" }} />
                </InputAdornment>
              ),
            }}}
          />
        )}

        {/* Apply & Clear Buttons */}
        {(onApply || onClear) && (
          <Box sx={{ 
            display: "flex", 
            gap: { xs: 1, sm: 0.75, md: 1 }, 
            flexShrink: 0,
          }}>
            {onApply && (
              <Button
                variant="contained"
                onClick={() => {
                  onApply({searchValue: localSearch, searchValue2: localSearch2});
                }}
                disabled={isLoading}
                sx={{
                  ...applyButtonStyle,
                  flex: { xs: 1, sm: "none" },
                  px: { xs: 2, sm: 1.5, md: 2, lg: 2.5 },
                  minWidth: { xs: "70px", sm: "60px", md: "70px", lg: "80px" },
                }}
              >
                Apply
              </Button>
            )}
            {onClear && (
              <Button
                variant="outlined"
                onClick={() => {
                  setLocalSearch("");
                  setLocalSearch2("");
                  if (onClear) onClear();
                }}
                disabled={isLoading}
                sx={{
                  ...clearButtonStyle,
                  flex: { xs: 1, sm: "none" },
                  px: { xs: 1.5, sm: 1.25, md: 1.5, lg: 2 },
                  minWidth: { xs: "60px", sm: "50px", md: "60px", lg: "70px" },
                }}
              >
                Clear
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Right Section: Dropdown + Extra Buttons (Mobile & Desktop) */}
      {(showDropdown || extraButtons) && (
        <Box
          sx={{
            display: { 
              xs: "flex", 
              sm: extraButtons ? "flex" : "none", 
              lg: "flex" 
            },
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch" },
            gap: { xs: 1.5 },
            flexShrink: 0,
            width: { xs: "100%", lg: "auto" },
            order: { xs: 2, lg: 3 },
            justifyContent: { xs: "stretch", lg: "flex-end" },
          }}
        >
          {showDropdown && (
            <Box sx={{ display: { xs: "block", sm: "none", lg: "block" } }}>
              <Select
                value={dropdownValue}
                onChange={(e) => onDropdownChange(e.target.value)}
                displayEmpty
                size="small"
                sx={{
                  ...selectStyle,
                  width: { xs: "100%", lg: "180px" },
                  maxWidth: { lg: "200px" },
                  minWidth: { lg: "160px" },
                }}
              >
                <MenuItem value={dropdownPlaceholderValue}>{dropdownPlaceholder}</MenuItem>
                {dropdownOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
          {extraButtons && (
            <Box sx={{ 
              display: "flex", 
              gap: 1,
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "stretch", sm: "flex-start" },
              flexWrap: "wrap"
            }}>
              {extraButtons}
            </Box>
          )}
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
  
  if (!lowerSearch || !lowerText.startsWith(lowerSearch)) return text;
  
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
