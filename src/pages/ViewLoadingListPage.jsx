import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TextField,
  Button,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import ModernSpinner from "../components/ModernSpinner";
import CustomDialog from "../components/CustomDialog";
import { useDialog } from "../hooks/useDialog";
import {
  useParams,
  useOutletContext,
  useNavigate
} from "react-router-dom";

import {
  FaTruck,
  FaMapMarkerAlt,
  FaFileAlt,
} from "react-icons/fa";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { dateFormatter } from "../utils/dateFormatter";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function ViewLoadingListPage() {
  const { id } = useParams();
  const [listData, setListData] = useState({});
  const [parcels, setParcels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode, colors } = useOutletContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { dialogState, hideDialog, showError } = useDialog();
  const [lorryFreight, setLorryFreight] = useState(0);

  const headerStyle = { color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" };
  const rowStyle = { color: colors?.textSecondary || "#25344E" };
  const accentColor = isDarkMode ? "#FFB74D" : "#1D3557";
  const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px", backgroundColor: isDarkMode ? colors?.bgPrimary : "#f9fafb", "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: accentColor }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accentColor, borderWidth: "2px" } }, "& .MuiInputLabel-root.Mui-focused": { color: accentColor } };
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/api/loadinglist/track/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok || !data.flag) {
        showError(data.message || "Error occurred while fetching loading list", "Error");
        setIsLoading(false);
        return;
      }
      setListData(data.body);
      setParcels(data.body.parcels || []);
    } catch (err) {
      showError("Failed to fetch loading list details", "Error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateMemo = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/api/ledger/new-ll`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ loadingListId: id, lorryFreight }),
      });
      const data = await response.json();
      if (!response.ok || !data.flag) {
        showError(data.message || "Error occurred while fetching loading list", "Error");
        setIsLoading(false);
        return;
      }
      navigate(`/user/view/ledger/${data.body}`);
    } catch (err) {
      showError("Failed to fetch loading list details", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPackages = parcels.reduce((sum, p) => sum + (p.count || 0), 0);

  return (
    <Box
      sx={{
        padding: "20px",
        backgroundColor: colors?.bgPrimary || "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Loading List Details Section */}
      <Box
        sx={{
          backgroundColor: colors?.bgCard || "#ffffff",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.08)",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e0e5eb",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
            <ModernSpinner size={40} />
          </Box>
        ) : (
          <Box sx={{ padding: { xs: "16px", md: "24px" } }}>
            {/* Top Row: ID + Chip */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
                gap: 2,
                mb: 3,
                pb: 3,
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "14px",
                    background: isDarkMode
                      ? "linear-gradient(135deg, rgba(255,183,77,0.2) 0%, rgba(255,183,77,0.1) 100%)"
                      : "linear-gradient(135deg, #1E3A5F 0%, #2d4a6f 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaFileAlt size={24} color={isDarkMode ? colors?.accent : "#fff"} />
                </Box>
                <Box>
                  {/* <Typography sx={{ color: colors?.textSecondary, fontSize: "0.75rem", fontWeight: 500, mb: 0.25 }}>
                  </Typography> */}
                  <Typography sx={{ color: colors?.textPrimary, fontSize: { xs: "1rem", md: "1.4rem" }, fontWeight: 700, wordBreak: "break-all" }}>
                    Loading List - {" "}
                    {dateFormatter(listData.createdAt)}
                  </Typography>
                </Box>
              </Box>

            </Box>

            {/* Route Section */}
            <Box
              sx={{
                mb: 3,
                pb: 3,
                borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <FaMapMarkerAlt size={16} color={isDarkMode ? colors?.accent : "#1E3A5F"} />
                <Typography sx={{ color: colors?.textPrimary, fontSize: "0.9rem", fontWeight: 600 }}>
                  Route
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 2, md: 4 },
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                {/* Source */}
                <Box
                  sx={{
                    flex: 1,
                    backgroundColor: isDarkMode ? "rgba(34, 197, 94, 0.1)" : "#f0fdf4",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    border: isDarkMode ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>A</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: isDarkMode ? "#86efac" : "#166534", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      From
                    </Typography>
                    <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                      {listData.sourceWarehouse?.name || "N/A"}
                    </Typography>
                  </Box>
                </Box>

                {/* Arrow/Line */}
                <Box
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    alignItems: "center",
                    flex: "0 0 auto",
                  }}
                >
                  <Box sx={{ width: 40, height: 2, backgroundColor: isDarkMode ? "rgba(255,255,255,0.2)" : "#cbd5e1" }} />
                  <FaTruck size={20} color={isDarkMode ? colors?.accent : "#1E3A5F"} style={{ margin: "0 8px" }} />
                  <Box sx={{ width: 40, height: 2, backgroundColor: isDarkMode ? "rgba(255,255,255,0.2)" : "#cbd5e1" }} />
                </Box>

                {/* Mobile Arrow */}
                <Box sx={{ display: { xs: "block", sm: "none" } }}>
                  <Typography sx={{ color: colors?.textSecondary, fontSize: "1.2rem" }}>↓</Typography>
                </Box>

                {/* Destination */}
                <Box
                  sx={{
                    flex: 1,
                    backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.1)" : "#fef2f2",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    border: isDarkMode ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid #fecaca",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>B</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: isDarkMode ? "#fca5a5" : "#991b1b", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      To
                    </Typography>
                    <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                      {listData.destinationWarehouse?.name || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Info Cards Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
                gap: 2,
              }}
            >
              <Box sx={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: "10px", padding: "14px 16px", border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }}>
                <Typography sx={{ color: colors?.textSecondary, fontSize: "0.7rem", fontWeight: 500, mb: 0.5 }}>
                  Vehicle No
                </Typography>
                <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                  {listData.vehicleNo || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: "10px", padding: "14px 16px", border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }}>
                <Typography sx={{ color: colors?.textSecondary, fontSize: "0.7rem", fontWeight: 500, mb: 0.5 }}>
                  Driver Name
                </Typography>
                <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                  {listData.driverName || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: "10px", padding: "14px 16px", border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }}>
                <Typography sx={{ color: colors?.textSecondary, fontSize: "0.7rem", fontWeight: 500, mb: 0.5 }}>
                  Driver Phone
                </Typography>
                <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                  {listData.driverPhone || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: "10px", padding: "14px 16px", border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }}>
                <Typography sx={{ color: colors?.textSecondary, fontSize: "0.7rem", fontWeight: 500, mb: 0.5 }}>
                  Created At
                </Typography>
                <Typography sx={{ color: colors?.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                  {dateFormatter(listData.createdAt) || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ backgroundColor: isDarkMode ? "rgba(255,183,77,0.1)" : "#fffbeb", borderRadius: "10px", padding: "14px 16px", border: isDarkMode ? "1px solid rgba(255,183,77,0.2)" : "1px solid #fde68a" }}>
                <Typography sx={{ color: isDarkMode ? colors?.accent : "#92400e", fontSize: "0.7rem", fontWeight: 500, mb: 0.5 }}>
                  Total Packages
                </Typography>
                <Typography sx={{ color: isDarkMode ? colors?.accent : "#1E3A5F", fontWeight: 700, fontSize: "1.05rem" }}>
                  {totalPackages}
                </Typography>
              </Box>
            </Box>

            {/* Scanned By */}
            <Box sx={{ mt: 2, pt: 2, borderTop: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
              {listData.scannedBy && (
                <Typography sx={{ color: colors?.textSecondary, fontSize: "0.75rem", fontWeight: 500 }}>
                  Scanned By: <span style={{ color: colors?.textPrimary, fontWeight: 600 }}>{listData.scannedBy?.name || "N/A"}</span>
                  {listData.scannedBy?.phoneNo && (
                    <span style={{ color: colors?.textSecondary, fontWeight: 400 }}> ({listData.scannedBy.phoneNo})</span>
                  )}
                </Typography>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField label="Lorry Freight"  value={lorryFreight} onChange={(e) => setLorryFreight(e.target.value || 0)} sx={textFieldSx} size="small" inputProps={{ tabIndex: 2 }} />
                <button className="button button-medium" sx={{ color: colors?.textSecondary, fontSize: "0.75rem", fontWeight: 500 }} onClick={handleCreateMemo}>
                  Create Memo
                </button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Parcels Table */}
      <Box sx={{ backgroundColor: colors?.bgCard || "#ffffff", borderRadius: "12px", boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden", border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb" }}>
        <Typography variant="h6" sx={{ padding: "16px", ...headerStyle }}>
          Parcels ({parcels.length})
        </Typography>

        {/* Mobile Card View */}
        {isMobile ? (
          <Box sx={{ p: 2, pt: 0 }}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <ModernSpinner size={36} />
              </Box>
            ) : parcels.length !== 0 ? (
              <>
                {parcels.map((entry, index) => (
                  <Card key={entry.parcel?.trackingId || index} sx={{ mb: 1.5, borderRadius: 2, boxShadow: isDarkMode ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.06)", backgroundColor: colors?.bgCard || "#ffffff", border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb" }}>
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F", fontSize: "0.95rem" }}>
                            {index + 1}. {entry.parcel?.trackingId || "N/A"}
                          </Typography>
                          <Typography sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.75rem", mt: 0.5 }}>
                            Count: <strong>{entry.count}</strong>
                          </Typography>
                        </Box>
                        <IconButton size="small" color="primary" target="_blank" href={`/user/view/order/${entry.parcel?.trackingId}`}>
                          <IoArrowForwardCircleOutline size={20} />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                {/* Mobile Total */}
                <Card sx={{ mt: 2, borderRadius: 2, backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc", border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb" }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F" }}>Total Parcels</Typography>
                      <Typography sx={{ fontWeight: 700, color: isDarkMode ? colors?.accent : colors?.textPrimary || "#1E3A5F" }}>{parcels.length}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, color: colors?.textPrimary || "#1E3A5F" }}>Total Count</Typography>
                      <Typography sx={{ fontWeight: 700, color: isDarkMode ? colors?.accent : colors?.textPrimary || "#1E3A5F" }}>{totalPackages}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 4, color: colors?.textSecondary || "#64748b" }}>No parcels in this loading list.</Box>
            )}
          </Box>
        ) : (
          /* Desktop Table View */
          <TableContainer component={Paper} sx={{ boxShadow: "none", backgroundColor: colors?.bgCard || "#ffffff" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors?.tableHeader || "#f8fafc" }}>
                  <TableCell sx={headerStyle}>Sl No.</TableCell>
                  <TableCell sx={headerStyle}>Tracking ID</TableCell>
                  <TableCell sx={headerStyle}>Count</TableCell>
                  <TableCell sx={headerStyle}>View LR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <ModernSpinner size={28} />
                    </TableCell>
                  </TableRow>
                ) : parcels.length !== 0 ? (
                  <>
                    {parcels.map((entry, index) => (
                      <TableRow key={entry.parcel?.trackingId || index} hover>
                        <TableCell sx={rowStyle}>{index + 1}.</TableCell>
                        <TableCell sx={{ ...rowStyle, fontWeight: 600 }}>{entry.parcel?.trackingId || "N/A"}</TableCell>
                        <TableCell sx={rowStyle}>{entry.count}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            target="_blank"
                            href={`/user/view/order/${entry.parcel?.trackingId}`}
                          >
                            <IoArrowForwardCircleOutline size={24} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow sx={{ backgroundColor: colors?.tableHeader || "#f8fafc" }}>
                      <TableCell sx={{ ...headerStyle }}>Total</TableCell>
                      <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>{parcels.length} parcels</TableCell>
                      <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>{totalPackages}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: colors?.textSecondary || "#64748b" }}>
                      No parcels in this loading list.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <CustomDialog
        open={dialogState.open}
        onClose={hideDialog}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        showCancel={dialogState.showCancel}
      />
    </Box>
  );
}
