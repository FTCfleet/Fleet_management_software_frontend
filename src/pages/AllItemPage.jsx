import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Modal,
  TextField,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { Edit, Delete, Close } from "@mui/icons-material";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import ModernSpinner from "../components/ModernSpinner";
import SearchFilterBar, { highlightMatch } from "../components/SearchFilterBar";
import Pagination from "../components/Pagination";
import { fromDbValue, toDbValue } from "../utils/currencyUtils";
import "../css/main.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AllItemPage() {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItemList, setCurrentItemList] = useState(null);
  const [itemTypes, setItemTypes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const filtersRef = useRef({ name: "" });
  const { isDarkMode, colors } = useOutletContext() || {};
  
  const headerStyle = { color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" };
  const rowStyle = { color: colors?.textSecondary || "#25344E" };

  const fetchItems = useCallback(
    async ({ page = 1, name } = {}) => {
      setIsLoading(true);
      const searchName =
        typeof name === "string" ? name.trim() : filtersRef.current.name;

      filtersRef.current = {
        name: searchName,
      };

      const token = localStorage.getItem("token");

      try {
        const params = new URLSearchParams({
          page: String(page),
          name: searchName,
        });

        const res = await fetch(
          `${BASE_URL}/api/admin/manage/regular-item?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch items");
        }

        const data = await res.json();
        const {
          items: serverItems = [],
          page: serverPage = page,
          pageSize: serverPageSize = serverItems.length,
          totalPages: serverTotalPages = 0,
          totalItems: serverTotalItems = serverItems.length,
        } = data.body || {};

        setItems(serverItems);
        setCurrentPage(serverPage);
        setPageSize(serverPageSize);
        setTotalPages(serverTotalPages);
        setTotalItems(serverTotalItems);
      } catch (error) {
        console.error("Failed to fetch items", error);
        setItems([]);
        setPageSize(0);
        setTotalPages(0);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchItems({ page: 1 });
  }, [fetchItems]);

  const fetchItemTypes = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/admin/manage/item-type`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch item types");
      }
      const data = await res.json();
      setItemTypes(data.body);
    } catch (error) {
      console.error("Failed to fetch item types", error);
      setItemTypes([]);
    }
  }, []);

  useEffect(() => {
    fetchItemTypes();
  }, [fetchItemTypes]);

  const applyFilter = () => {
    const trimmedName = nameFilter.trim();
    setCurrentPage(1);
    fetchItems({ page: 1, name: trimmedName });
  };

  const clearFilter = () => {
    setNameFilter("");
    setCurrentPage(1);
    fetchItems({ page: 1, name: "" });
  };

  const handleEdit = (Item) => {
    const curItem = { ...Item };
    // Convert DB values to display values for editing
    curItem.freight = fromDbValue(Item.freight || 0);
    curItem.hamali = fromDbValue(Item.hamali || 0);
    setCurrentItemList([curItem]);
    setIsModalOpen(true);
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading2(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/regular-item`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        itemId: itemToDelete,
      }),
    });

    await res.json();
    const nextPage =
      currentPage > 1 && items.length === 1 ? currentPage - 1 : currentPage;
    await fetchItems({ page: nextPage });
    setIsLoading2(false);
    setDeleteModalOpen(false);
    setItemToDelete(null);
    return;
  };

  const goToPage = (pageNumber) => {
    if (pageNumber < 1) {
      return;
    }

    const computedTotalPages =
      totalPages || (totalItems && pageSize ? Math.ceil(totalItems / pageSize) : 0);

    if (computedTotalPages && pageNumber > computedTotalPages) {
      return;
    }

    setCurrentPage(pageNumber);
    fetchItems({ page: pageNumber });
  };

  const handlePreviousPage = () => {
    if (currentPage <= 1) {
      return;
    }
    goToPage(currentPage - 1);
  };

  const handleNextPage = () => {
    const computedTotalPages =
      totalPages || (totalItems && pageSize ? Math.ceil(totalItems / pageSize) : 0);

    if (computedTotalPages && currentPage >= computedTotalPages) {
      return;
    }
    goToPage(currentPage + 1);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleAdd = () => {
    setCurrentItemList([
      {
        name: "",
        freight: "",
        hamali: "",
        type: "C/B",
      },
    ]);
    setIsModalOpen(true);
    setIsAdding(true);
  };

  const handleSaveOrAdd = async () => {
    setIsLoading1(true);
    const token = localStorage.getItem("token");
    let method, body;
    // Convert string values to floats for API - backend will multiply by 100
    const itemsForApi = currentItemList.map(item => ({
      ...item,
      freight: parseFloat(item.freight) || 0,
      hamali: parseFloat(item.hamali) || 0
    }));
    if (isAdding) {
      method = "POST";
      body = { items: itemsForApi };
    } else {
      method = "PUT";
      body = { items: itemsForApi };
    }
    const res = await fetch(`${BASE_URL}/api/admin/manage/regular-item`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (res.status === 409 || res.status === 406 || res.status === 407) {
      alert("Item already exists");
      setIsLoading1(false);
      setIsModalOpen(false);
      return;
    }
    await res.json();
    await fetchItems({ page: currentPage });
    setIsLoading1(false);
    setIsModalOpen(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setCurrentItemList(null);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...currentItemList];
    // Keep freight/hamali as strings for decimal input
    if (field === "name") {
      value = value.toUpperCase();
    }

    updatedItems[index][field] = value;
    setCurrentItemList(updatedItems);
  };

  const handleRemove = (index) => {
    const updatedItems = [...currentItemList];
    updatedItems.splice(index, 1);
    setCurrentItemList(updatedItems);
  };

  const memoizedItems = useMemo(() => {
    const perPage = pageSize || items.length || 0;
    const offset = perPage ? (currentPage - 1) * perPage : 0;
    return items.map((item, index) => ({
      ...item,
      serial: offset + index + 1,
    }));
  }, [items, currentPage, pageSize]);

  const groupedItems = useMemo(() => {
    const groups = [];
    for (let i = 0; i < memoizedItems.length; i += 4) {
      groups.push(memoizedItems.slice(i, i + 4));
    }
    return groups;
  }, [memoizedItems]);

  const resolvedTotalPages = useMemo(() => {
    if (totalPages) {
      return totalPages;
    }

    if (totalItems && pageSize) {
      return Math.ceil(totalItems / pageSize);
    }

    return totalItems > 0 ? 1 : 0;
  }, [totalPages, totalItems, pageSize]);

  const visibleRange = useMemo(() => {
    if (!memoizedItems.length) {
      return { start: 0, end: 0 };
    }

    return {
      start: memoizedItems[0].serial,
      end: memoizedItems[memoizedItems.length - 1].serial,
    };
  }, [memoizedItems]);

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc",
    },
    "& .MuiInputLabel-root": { color: colors?.textSecondary },
    "& .MuiOutlinedInput-input": { color: colors?.textPrimary },
  };

  const renderPage2 = () => (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: colors?.textPrimary, fontWeight: 600 }}>Item Name</TableCell>
            <TableCell sx={{ color: colors?.textPrimary, fontWeight: 600 }}>Type</TableCell>
            <TableCell sx={{ color: colors?.textPrimary, fontWeight: 600 }}>Freight</TableCell>
            <TableCell sx={{ color: colors?.textPrimary, fontWeight: 600 }}>Hamali</TableCell>
            {isAdding ? <TableCell sx={{ color: colors?.textPrimary, fontWeight: 600 }}>Actions</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {currentItemList?.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <TextField
                  value={item.name}
                  size="small"
                  onChange={(e) =>
                    handleItemChange(idx, "name", e.target.value)
                  }
                  placeholder="Item Name"
                  fullWidth
                  sx={inputSx}
                />
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <Select
                    value={item.itemType?.name || item.type}
                    onChange={(e) =>
                      handleItemChange(idx, "type", e.target.value)
                    }
                    size="small"
                    sx={{
                      borderRadius: "8px",
                      backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc",
                      color: colors?.textPrimary,
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200
                        },
                      },
                    }}
                  >
                    {itemTypes.map((type) => (
                      <MenuItem key={type._id} value={type.name}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                <TextField
                  type="text"
                  value={item.freight}
                  size="small"
                  onChange={(e) =>
                    handleItemChange(idx, "freight", e.target.value)
                  }
                  fullWidth
                  sx={inputSx}
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="text"
                  value={item.hamali}
                  size="small"
                  onChange={(e) =>
                    handleItemChange(idx, "hamali", e.target.value)
                  }
                  fullWidth
                  sx={inputSx}
                />
              </TableCell>
              {isAdding ? (
                <TableCell>
                  <IconButton color="error" onClick={() => handleRemove(idx)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleSaveOrAdd}
          disabled={isLoading1}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "none",
            background: isDarkMode 
              ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)"
              : "linear-gradient(135deg, #1D3557 0%, #0a1628 100%)",
            color: isDarkMode ? "#0a1628" : "#fff",
            boxShadow: "none",
            "&:hover": {
              background: isDarkMode 
                ? "linear-gradient(135deg, #FFA726 0%, #F57C00 100%)"
                : "linear-gradient(135deg, #25445f 0%, #0f2035 100%)",
              boxShadow: "none",
            },
            "&:disabled": {
              background: isDarkMode ? "rgba(255,183,77,0.3)" : "rgba(29,53,87,0.3)",
            }
          }}
        >
          {isAdding ? "Add Item" : "Save Changes"}
          {isLoading1 && (
            <CircularProgress size={20} sx={{ color: isDarkMode ? "#0a1628" : "#fff", ml: 1 }} />
          )}
        </Button>
      </Box>
    </>
  );

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", ...headerStyle }}>
        Item Details
      </Typography>

      {/* Filters */}
      <SearchFilterBar
        isDarkMode={isDarkMode}
        colors={colors}
        searchValue={nameFilter}
        onSearchChange={setNameFilter}
        searchPlaceholder="Search by Item Name"
        onApply={applyFilter}
        onClear={clearFilter}
        isLoading={isLoading}
        extraButtons={
          <Button
            variant="contained"
            onClick={handleAdd}
            sx={{
              background: isDarkMode ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)" : "linear-gradient(135deg, #1D3557 0%, #0a1628 100%)",
              color: isDarkMode ? "#0a1628" : "#fff",
              fontWeight: 600,
              px: 2,
              height: "40px",
              borderRadius: "10px",
              textTransform: "none",
              whiteSpace: "nowrap",
            }}
          >
            Add Item
          </Button>
        }
      />

      <Pagination
        currentPage={currentPage}
        totalPages={resolvedTotalPages}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
        isLoading={isLoading}
        infoText={memoizedItems.length > 0
          ? `Showing ${visibleRange.start} - ${visibleRange.end} of ${totalItems} items`
          : `Showing 0 of ${totalItems} items`}
        isDarkMode={isDarkMode}
        colors={colors}
      />

      {/* Item Table */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2, 
        boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
        backgroundColor: colors?.bgCard || "#ffffff",
        border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ ...headerStyle, textAlign: "center" }}
                colSpan={4}
              >
                Items
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <ModernSpinner size={28} />
                </TableCell>
              </TableRow>
            ) : memoizedItems.length > 0 ? (
              groupedItems.map((group, rowIdx) => {
                const rowKey =
                  group.map((item) => item._id || item.serial).join("-") ||
                  rowIdx;
                return (
                  <TableRow key={rowKey}>
                    {group.map((item) => (
                      <TableCell
                        key={item._id || item.serial}
                        sx={{ width: "25%", verticalAlign: "top" }}
                      >
                        <Box
                          sx={{
                            border: "1px solid #E5E7EB",
                            borderRadius: 2,
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            minHeight: 150,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ ...headerStyle, fontSize: "1rem" }}
                          >
                            {item.serial}. {highlightMatch(item.name, nameFilter, isDarkMode)} {item.itemType?.name ? `(${item.itemType.name})` : ""}
                          </Typography>
                          <Typography variant="body2" sx={rowStyle}>
                            Type: {item.itemType?.name || "NA"}
                          </Typography>
                          <Typography variant="body2" sx={rowStyle}>
                            Freight: ₹{fromDbValue(item.freight)}
                          </Typography>
                          <Typography variant="body2" sx={rowStyle}>
                            Hamali: ₹{fromDbValue(item.hamali)}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            <IconButton
                              color="primary"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(item._id)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                    ))}
                    {group.length < 4 &&
                      Array.from({ length: 4 - group.length }).map((_, idx) => (
                        <TableCell
                          key={`empty-${rowKey}-${idx}`}
                          sx={{ width: "25%" }}
                        />
                      ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  No data to display
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Add/Edit Item */}
      <Modal open={isModalOpen} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: 700 },
            maxWidth: 700,
            maxHeight: "80vh",
            overflowY: "auto",
            bgcolor: isDarkMode ? "#1a2332" : "#ffffff",
            borderRadius: "16px",
            boxShadow: isDarkMode 
              ? "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)" 
              : "0 25px 50px rgba(0,0,0,0.15)",
            p: 3,
          }}
        >
          <Box sx={{ position: "relative", mb: 3 }}>
            <IconButton
              onClick={handleClose}
              sx={{ 
                position: "absolute", 
                top: -8, 
                right: -8,
                color: colors?.textSecondary,
                "&:hover": { backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }
              }}
            >
              <Close />
            </IconButton>
            <Typography
              variant="h5"
              sx={{ 
                color: colors?.textPrimary,
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {isAdding ? "Add Item" : "Edit Item"}
            </Typography>
          </Box>
          {currentItemList && <Box>{renderPage2()}</Box>}
        </Box>
      </Modal>
      {/* Modal for Delete Confirmation */}
      <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <FaExclamationTriangle
            style={{
              color: "#d32f2f",
              fontSize: "36px",
              marginBottom: "12px",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#d32f2f",
            }}
          >
            Delete Item
          </Typography>
          <Typography
            sx={{
              marginBottom: "20px",
              color: "#374151",
              fontSize: "15px",
            }}
          >
            This action cannot be undone. Are you sure you want to proceed?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <Button
              variant="outlined"
              sx={{ borderColor: "#1E3A5F", color: "#1E3A5F" }}
              onClick={handleCloseDeleteModal}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#d32f2f" }}
              startIcon={<FaTrash />}
              onClick={confirmDelete}
            >
              Delete
              {isLoading2 && (
                <CircularProgress
                  size={22}
                  className="spinner"
                  sx={{ color: "#fff", animation: "none !important", ml: 1 }}
                />
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
