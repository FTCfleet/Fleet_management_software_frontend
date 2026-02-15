import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Chip } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaTruck, FaUser, FaCalendarAlt, FaChevronDown, FaChevronUp, FaClipboardList, FaSync, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar, { highlightMatch } from "../components/SearchFilterBar";
import CustomDialog from "../components/CustomDialog";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const EnquiriesPage = () => {
  const { isDarkMode, colors } = useOutletContext();
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [searchValue, setSearchValue] = useState("");
  const [lastSearchValue, setLastSearchValue] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/service-enquiry/all`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setEnquiries(data.data || data.body || []);
      } else {
        toast.error("Failed to fetch enquiries", { position: "bottom-right" });
      }
    } catch (error) {
      toast.error("Network error", { position: "bottom-right" });
    } finally {
      setIsLoading(false);
    }
  };

  const markEnquiriesAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/service-enquiry/mark-read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        // Notify other components that enquiries have been marked as read
        window.dispatchEvent(new CustomEvent('enquiriesMarkedAsRead'));
      }
    } catch (error) {
      console.error("Failed to mark enquiries as read:", error);
    }
  };

  useEffect(() => { 
    fetchEnquiries(); 
    markEnquiriesAsRead(); // Mark as read when page loads
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getServiceColor = (type) => {
    const serviceColors = { "Parcel": "#4CAF50", "Full Load": "#2196F3", "Part Load": "#FF9800", "Warehouse": "#9C27B0", "Other": "#607D8B" };
    return serviceColors[type] || "#607D8B";
  };

  const openDeleteDialog = (enquiry, e) => {
    e.stopPropagation();
    setEnquiryToDelete(enquiry);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!enquiryToDelete) return;
    setDeletingId(enquiryToDelete._id);
    setDeleteDialogOpen(false);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/service-enquiry/${enquiryToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setEnquiries((prev) => prev.filter((e) => e._id !== enquiryToDelete._id));
        toast.success("Enquiry deleted", { position: "top-center" });
      } else {
        toast.error("Failed to delete", { position: "top-center" });
      }
    } catch (error) {
      toast.error("Network error", { position: "top-center" });
    } finally {
      setDeletingId(null);
      setEnquiryToDelete(null);
    }
  };

  const handleSearchChange = (value) => {
    // Prevent leading spaces (spaces at the beginning), allow everything else
    const processedValue = value.replace(/^\s+/, '');
    setSearchValue(processedValue);
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setServiceFilter("");
  };

  // Helper function to check if search matches location
  const searchMatchesLocation = (enquiry, searchTerm) => {
    if (!searchTerm) return false;
    const lowerSearch = searchTerm.toLowerCase();
    return enquiry.pickupLocation?.toLowerCase().startsWith(lowerSearch) ||
           enquiry.deliveryLocation?.toLowerCase().startsWith(lowerSearch);
  };

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch = !searchValue || 
      enquiry.name?.toLowerCase().startsWith(searchValue.toLowerCase()) ||
      enquiry.phone?.startsWith(searchValue) ||
      enquiry.pickupLocation?.toLowerCase().startsWith(searchValue.toLowerCase()) ||
      enquiry.deliveryLocation?.toLowerCase().startsWith(searchValue.toLowerCase());
    const matchesService = !serviceFilter || enquiry.serviceType === serviceFilter;
    return matchesSearch && matchesService;
  });

  // Auto-expand cards where search matches locations
  React.useEffect(() => {
    const trimmedSearch = searchValue?.trim();
    const lastTrimmedSearch = lastSearchValue?.trim();
    
    if (trimmedSearch && filteredEnquiries.length > 0) {
      const locationMatches = filteredEnquiries.filter(enquiry => 
        searchMatchesLocation(enquiry, trimmedSearch)
      );
      if (locationMatches.length > 0) {
        // Expand all cards that have location matches
        const matchIds = new Set(locationMatches.map(enquiry => enquiry._id));
        setExpandedIds(matchIds);
      }
      // Don't change expandedIds if no location matches - let user control manually
    } else if (!trimmedSearch && lastTrimmedSearch) {
      // Only auto-close when search transitions from having content to being empty
      setExpandedIds(new Set());
    }
    
    // Update last search value
    setLastSearchValue(searchValue);
  }, [searchValue, filteredEnquiries, lastSearchValue]);

  const serviceOptions = [
    { value: "Parcel", label: "Parcel" },
    { value: "Full Load", label: "FTL" },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <ModernSpinner size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <ToastContainer 
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        theme={isDarkMode ? "dark" : "light"}
        style={{ width: "auto", maxWidth: "500px" }}
        toastStyle={{
          background: isDarkMode 
            ? "rgba(10, 22, 40, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: isDarkMode ? "1px solid rgba(255, 183, 77, 0.25)" : "1px solid rgba(30, 58, 95, 0.15)",
          borderRadius: "14px",
          color: isDarkMode ? "#fff" : "#1E3A5F",
          boxShadow: isDarkMode ? "0 8px 32px rgba(0, 0, 0, 0.4)" : "0 8px 32px rgba(0, 0, 0, 0.1)",
          minWidth: "400px",
          overflow: "hidden",
        }}
        progressStyle={{
          background: "linear-gradient(90deg, #FFB74D, #FF9800)",
          height: "4px",
          borderRadius: "0 0 14px 14px",
        }}
      />
      <style>{`
        .Toastify__progress-bar { 
          height: 4px !important; 
          bottom: 0 !important;
          border-radius: 0 0 14px 14px !important;
        }
        .Toastify__toast { 
          overflow: hidden !important; 
          padding-bottom: 8px !important;
        }
      `}</style>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: 48, height: 48, background: isDarkMode ? "rgba(255, 183, 77, 0.15)" : "rgba(30, 58, 95, 0.1)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaEnvelope size={22} color={isDarkMode ? "#FFB74D" : "#1E3A5F"} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: colors.textPrimary }}>Service Enquiries</Typography>
            <Typography sx={{ fontSize: "0.85rem", color: colors.textSecondary }}>{enquiries.length} total enquiries</Typography>
          </Box>
        </Box>
        <IconButton onClick={fetchEnquiries} sx={{ background: isDarkMode ? "rgba(255, 183, 77, 0.1)" : "rgba(30, 58, 95, 0.08)", borderRadius: "12px", p: 1.5, "&:hover": { background: isDarkMode ? "rgba(255, 183, 77, 0.2)" : "rgba(30, 58, 95, 0.12)" } }}>
          <FaSync size={18} color={isDarkMode ? "#FFB74D" : "#1E3A5F"} />
        </IconButton>
      </Box>

      {/* Delete Confirmation Dialog */}
      <CustomDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Enquiry"
        message={`Are you sure you want to delete the enquiry from "${enquiryToDelete?.name}"? This action cannot be undone.`}
        type="delete"
        confirmText="Delete"
        cancelText="Cancel"
        showCancel={true}
      />

      {/* Search & Filter Bar */}
      <SearchFilterBar
        isDarkMode={isDarkMode}
        colors={colors}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by name, phone, location..."
        onClear={handleClearFilters}
        showDropdown={true}
        dropdownValue={serviceFilter}
        onDropdownChange={setServiceFilter}
        dropdownOptions={serviceOptions}
        dropdownPlaceholder="All Services"
      />

      {/* Enquiries List */}
      {filteredEnquiries.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8, background: colors.bgSecondary, borderRadius: "16px", border: `1px solid ${colors.border}` }}>
          <FaClipboardList size={48} color={colors.textMuted} style={{ marginBottom: 16, opacity: 0.5 }} />
          <Typography sx={{ color: colors.textSecondary, fontSize: "1.1rem" }}>{enquiries.length === 0 ? "No enquiries yet" : "No matching enquiries"}</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AnimatePresence>
            {filteredEnquiries.map((enquiry, index) => (
              <motion.div key={enquiry._id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Box sx={{
                  background: colors.bgSecondary,
                  borderRadius: "16px",
                  border: `1px solid ${colors.border}`,
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  "&:hover": { borderColor: isDarkMode ? "rgba(255, 183, 77, 0.3)" : "rgba(30, 58, 95, 0.2)" },
                }}>
                  {/* Main Row */}
                  <Box onClick={() => {
                    const newExpandedIds = new Set(expandedIds);
                    if (expandedIds.has(enquiry._id)) {
                      newExpandedIds.delete(enquiry._id);
                    } else {
                      newExpandedIds.add(enquiry._id);
                    }
                    setExpandedIds(newExpandedIds);
                  }} sx={{ p: { xs: 2, sm: 3 }, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                    {/* Left - Serial Number, Name & Date */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
                      {/* Serial Number */}
                      <Box sx={{ width: 36, height: 36, background: isDarkMode ? "rgba(255, 183, 77, 0.15)" : "rgba(30, 58, 95, 0.1)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Typography sx={{ fontWeight: 700, color: isDarkMode ? "#FFB74D" : "#1E3A5F", fontSize: "0.9rem" }}>{index + 1}</Typography>
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, color: colors.textPrimary, fontSize: "1rem" }}>{highlightMatch(enquiry.name, searchValue, isDarkMode)}</Typography>
                        <Typography sx={{ color: colors.textMuted, fontSize: "0.8rem", mt: 0.25 }}>{formatDate(enquiry.createdAt)}</Typography>
                      </Box>
                    </Box>
                    {/* Center - Service Type Chip */}
                    <Box sx={{ display: "flex", justifyContent: "center", flex: 1 }}>
                      <Chip 
                        label={enquiry.serviceType} 
                        sx={{ 
                          height: 32, 
                          fontSize: "0.85rem", 
                          fontWeight: 700, 
                          px: 1,
                          background: `linear-gradient(135deg, ${getServiceColor(enquiry.serviceType)}25 0%, ${getServiceColor(enquiry.serviceType)}15 100%)`, 
                          color: getServiceColor(enquiry.serviceType), 
                          border: `1.5px solid ${getServiceColor(enquiry.serviceType)}50`,
                          borderRadius: "10px",
                          "& .MuiChip-label": { px: 1.5 }
                        }} 
                      />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 }, flexShrink: 0 }}>
                      {/* Phone + Call Now */}
                      <Box sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 1.5, 
                        px: { xs: 1.5, sm: 2 }, 
                        py: 0.75, 
                        background: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.03)", 
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        borderRadius: "10px", 
                        border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)"}` 
                      }}>
                        <Typography sx={{ color: colors.textPrimary, fontWeight: 600, fontSize: { xs: "0.85rem", sm: "0.95rem" }, display: { xs: "none", sm: "block" } }}>{enquiry.phone}</Typography>
                        <a href={`tel:${enquiry.phone}`} style={{ textDecoration: "none" }} onClick={(e) => e.stopPropagation()}>
                          <Box sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 1, 
                            background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)", 
                            borderRadius: "8px", 
                            px: 2, 
                            py: 0.75, 
                            cursor: "pointer", 
                            transition: "all 0.2s", 
                            "&:hover": { transform: "scale(1.03)" } 
                          }}>
                            <FaPhone size={12} color="#1D3557" />
                            <Box component="span" sx={{ color: "#1D3557", fontSize: "0.85rem", fontWeight: 700 }}>Call Now</Box>
                          </Box>
                        </a>
                      </Box>
                      {/* Delete Button */}
                      <IconButton 
                        onClick={(e) => openDeleteDialog(enquiry, e)} 
                        disabled={deletingId === enquiry._id}
                        sx={{ 
                          p: 1, 
                          background: isDarkMode ? "rgba(244, 67, 54, 0.1)" : "rgba(244, 67, 54, 0.08)", 
                          borderRadius: "8px",
                          "&:hover": { background: isDarkMode ? "rgba(244, 67, 54, 0.2)" : "rgba(244, 67, 54, 0.15)" }
                        }}
                      >
                        <FaTrash size={14} color="#F44336" />
                      </IconButton>
                      {expandedIds.has(enquiry._id) ? <FaChevronUp color={colors.textMuted} /> : <FaChevronDown color={colors.textMuted} />}
                    </Box>
                  </Box>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedIds.has(enquiry._id) && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3, pt: 2, borderTop: `1px solid ${colors.border}` }}>
                          {/* Locations */}
                          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: 2, background: isDarkMode ? "rgba(76, 175, 80, 0.08)" : "rgba(76, 175, 80, 0.05)", borderRadius: "10px", border: `1px solid ${isDarkMode ? "rgba(76, 175, 80, 0.2)" : "rgba(76, 175, 80, 0.15)"}` }}>
                              <FaMapMarkerAlt size={16} color="#4CAF50" style={{ marginTop: 2, flexShrink: 0 }} />
                              <Box>
                                <Typography sx={{ fontSize: "0.7rem", color: "#4CAF50", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Pickup Location</Typography>
                                <Typography sx={{ color: colors.textPrimary, fontWeight: 500, fontSize: "0.9rem", mt: 0.25 }}>{highlightMatch(enquiry.pickupLocation, searchValue, isDarkMode)}</Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: 2, background: isDarkMode ? "rgba(244, 67, 54, 0.08)" : "rgba(244, 67, 54, 0.05)", borderRadius: "10px", border: `1px solid ${isDarkMode ? "rgba(244, 67, 54, 0.2)" : "rgba(244, 67, 54, 0.15)"}` }}>
                              <FaMapMarkerAlt size={16} color="#F44336" style={{ marginTop: 2, flexShrink: 0 }} />
                              <Box>
                                <Typography sx={{ fontSize: "0.7rem", color: "#F44336", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Delivery Location</Typography>
                                <Typography sx={{ color: colors.textPrimary, fontWeight: 500, fontSize: "0.9rem", mt: 0.25 }}>{highlightMatch(enquiry.deliveryLocation, searchValue, isDarkMode)}</Typography>
                              </Box>
                            </Box>
                          </Box>

                          {/* Description */}
                          {enquiry.description && (
                            <Box sx={{ mt: 2, p: 2, background: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderRadius: "10px", border: `1px solid ${colors.border}` }}>
                              <Typography sx={{ fontSize: "0.7rem", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600, mb: 0.5 }}>Goods Description</Typography>
                              <Typography sx={{ color: colors.textSecondary, fontSize: "0.9rem" }}>{enquiry.description}</Typography>
                            </Box>
                          )}
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      )}
    </Box>
  );
};

export default EnquiriesPage;
