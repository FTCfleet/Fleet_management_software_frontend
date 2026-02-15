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
  CircularProgress,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { Edit, Delete } from "@mui/icons-material";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import ModernSpinner from "../components/ModernSpinner";
import ClientModal from "../components/ClientModal";
import SearchFilterBar, { highlightMatch } from "../components/SearchFilterBar";
import Pagination from "../components/Pagination";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AllClientPage() {
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [clientType, setClientType] = useState("all");
  const [isAdding, setIsAdding] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const filtersRef = useRef({ name: "", type: "all" });
  const { isDarkMode, colors } = useOutletContext() || {};
  
  const headerStyle = { color: colors?.textPrimary || "#1E3A5F", fontWeight: "bold" };
  const rowStyle = { color: colors?.textSecondary || "#25344E", maxWidth: "200px" };

  const fetchClients = useCallback(
    async ({ page = 1, name, type } = {}) => {
      setIsLoading(true);
      const searchName =
        typeof name === "string" ? name.trim() : filtersRef.current.name;
      const clientCategory =
        typeof type === "string" && type.length > 0
          ? type
          : filtersRef.current.type;

      filtersRef.current = {
        name: searchName,
        type: clientCategory,
      };

      const token = localStorage.getItem("token");

      try {
        const params = new URLSearchParams({
          page: String(page),
          name: searchName,
          type: clientCategory,
        });

        const res = await fetch(
          `${BASE_URL}/api/admin/manage/regular-client?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch clients");
        }

        const data = await res.json();
        const {
          clients = [],
          page: serverPage = page,
          pageSize: serverPageSize = clients.length,
          totalPages: serverTotalPages = 0,
          totalClients: serverTotalClients = clients.length,
        } = data.body || {};
        console.log(data.body);
        setClients(clients);
        setCurrentPage(serverPage);
        setPageSize(serverPageSize);
        setTotalPages(serverTotalPages);
        setTotalClients(serverTotalClients);
      } catch (error) {
        console.error("Failed to fetch clients", error);
        setClients([]);
        setPageSize(0);
        setTotalPages(0);
        setTotalClients(0);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchClients({ page: 1 });
  }, [fetchClients]);

  const applyFilter = ({searchValue} = {}) => {
    if (!clients || clients.length === 0) {
      return;
    }
    const val = searchValue ?? nameFilter;
    setNameFilter(val);
    setCurrentPage(1);
    fetchClients({ page: 1, name: val, type: clientType });
  };

  const clearFilter = () => {
    setNameFilter("");
    setClientType("all");
    setCurrentPage(1);
    fetchClients({ page: 1, name: "", type: "all" });
  };


  const handleEdit = (client) => {
    setCurrentClient({ ...client });
    setIsModalOpen(true);
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setClientToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading2(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/regular-client`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: clientToDelete,
      }),
    });

    await res.json();
    await fetchClients({ page: currentPage });
    setIsLoading2(false);
    setDeleteModalOpen(false);
    setClientToDelete(null);
    return;
  };

  const goToPage = (pageNumber) => {
    if (pageNumber < 1) {
      return;
    }
    const computedTotalPages =
      totalPages || (totalClients && pageSize ? Math.ceil(totalClients / pageSize) : 0);
    if (computedTotalPages && pageNumber > computedTotalPages) {
      return;
    }
    setCurrentPage(pageNumber);
    fetchClients({ page: pageNumber });
  };

  const handlePreviousPage = () => {
    if (currentPage <= 1) {
      return;
    }
    goToPage(currentPage - 1);
  };

  const handleNextPage = () => {
    const computedTotalPages =
      totalPages || (totalClients && pageSize ? Math.ceil(totalClients / pageSize) : 0);
    if (computedTotalPages && currentPage >= computedTotalPages) {
      return;
    }
    goToPage(currentPage + 1);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const handleAdd = () => {
    setCurrentClient({
      name: "",
      phoneNo: "",
      address: "",
      gst: "",
      isSender: true,
    });
    setIsModalOpen(true);
    setIsAdding(true);
  };

  const handleSaveOrAdd = async () => {
    setIsLoading1(true);
    const token = localStorage.getItem("token");
    let method, body;
    if (isAdding) {
      method = "POST";
      body = {
        name: currentClient.name.toUpperCase(),
        phoneNo: currentClient.phoneNo ? currentClient.phoneNo : "NA",
        address: currentClient.address ? currentClient.address : "NA",
        gst: currentClient.gst ? currentClient.gst : "NA",
        isSender: currentClient.isSender,
      };
    } else {
      method = "PUT";
      body = {
        id: currentClient._id,
        updates: {
          name: currentClient.name.toUpperCase(),
          isSender: currentClient.isSender,
          phoneNo: currentClient.phoneNo ? currentClient.phoneNo : "NA",
          address: currentClient.address ? currentClient.address : "NA",
          gst: currentClient.gst ? currentClient.gst : "NA"
        },
      };
    }
    const res = await fetch(`${BASE_URL}/api/admin/manage/regular-client`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (res.status === 409) {
      alert("Client already exists");
      setIsLoading1(false);
      // setIsModalOpen(false);
      return;
    }
    const data = await res.json();
    if (data.error?.includes("duplicate")) {
      alert("Client exists");
    }
    await fetchClients({ page: currentPage });
    setIsLoading1(false);
    setIsModalOpen(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setCurrentClient(null);
  };

  const handleFieldChange = (field, value) => {
    setCurrentClient({ ...currentClient, [field]: value });
  };

  const memoizedClients = useMemo(() => {
    const perPage = pageSize || clients.length || 0;
    const offset = perPage ? (currentPage - 1) * perPage : 0;
    return clients.map((client, index) => ({
      ...client,
      serial: offset + index + 1,
    }));
  }, [clients, currentPage, pageSize]);

  const resolvedTotalPages = useMemo(() => {
    if (totalPages) {
      return totalPages;
    }
    if (totalClients && pageSize) {
      return Math.ceil(totalClients / pageSize);
    }
    return totalClients > 0 ? 1 : 0;
  }, [totalPages, totalClients, pageSize]);

  const visibleRange = useMemo(() => {
    if (!memoizedClients.length) {
      return { start: 0, end: 0 };
    }
    return {
      start: memoizedClients[0].serial,
      end: memoizedClients[memoizedClients.length - 1].serial,
    };
  }, [memoizedClients]);

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", ...headerStyle }}>
        Client Details
      </Typography>

      {/* Filters */}
      <SearchFilterBar
        isDarkMode={isDarkMode}
        colors={colors}
        searchValue={nameFilter}
        onSearchChange={setNameFilter}
        searchPlaceholder="Search by Client Name"
        onApply={applyFilter}
        onClear={clearFilter}
        isLoading={isLoading}
        showDropdown={true}
        dropdownValue={clientType}
        onDropdownChange={setClientType}
        dropdownOptions={[
          { value: "sender", label: "Sender" },
          { value: "receiver", label: "Receiver" },
        ]}
        dropdownPlaceholder="All Clients"
        dropdownPlaceholderValue='all'
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
            Add Client
          </Button>
        }
      />
      <Pagination
        currentPage={currentPage}
        totalPages={resolvedTotalPages}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
        isLoading={isLoading}
        infoText={memoizedClients.length > 0
          ? `Showing ${visibleRange.start} - ${visibleRange.end} of ${totalClients} clients`
          : `Showing 0 of ${totalClients} clients`}
        isDarkMode={isDarkMode}
        colors={colors}
      />

      {/* Client Table */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2, 
        boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
        backgroundColor: colors?.bgCard || "#ffffff",
        border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e0e5eb"
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Sl No.</TableCell>
              <TableCell sx={headerStyle}>Client Name</TableCell>
              <TableCell sx={headerStyle}>Phone Number</TableCell>
              <TableCell sx={headerStyle}>Client Address</TableCell>
              <TableCell sx={headerStyle}>GST</TableCell>
              <TableCell sx={headerStyle}>Client Type</TableCell>
              <TableCell sx={{ ...headerStyle, textAlign: "center" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <ModernSpinner size={28} />
                </TableCell>
              </TableRow>
            ) : memoizedClients.length > 0 ? (
              memoizedClients.map((client) => (
                <TableRow key={client._id || client.serial}>
                  <TableCell sx={rowStyle}>{client.serial}.</TableCell>
                  <TableCell sx={rowStyle}>{highlightMatch(client.name, nameFilter, isDarkMode)}</TableCell>
                  <TableCell sx={rowStyle}>{client.phoneNo}</TableCell>
                  <TableCell sx={rowStyle}>{client.address}</TableCell>
                  <TableCell sx={rowStyle}>{client.gst}</TableCell>
                  <TableCell sx={rowStyle}>
                    {client.isSender ? "Sender" : "Receiver"}
                  </TableCell>
                  
                  <TableCell sx={{ ...headerStyle, textAlign: "center" }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(client)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(client._id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No data to display
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      

      <ClientModal
        open={isModalOpen}
        onClose={handleClose}
        client={currentClient}
        onFieldChange={handleFieldChange}
        onSubmit={handleSaveOrAdd}
        isAdding={isAdding}
        isSubmitting={isLoading1}
        isDarkMode={isDarkMode}
        colors={colors}
      />
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
            Delete Client
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
