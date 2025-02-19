import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  CircularProgress,
} from "@mui/material";
import { Cancel } from "@mui/icons-material";
import { useParams, useNavigate, Link } from "react-router-dom";
import ledger from "../assets/ledger.jpg";
import { useAuth } from "../routes/AuthContext";
import { FaTrash, FaExclamationTriangle, FaTruckLoading, FaPrint } from "react-icons/fa";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { TbTruckDelivery  } from "react-icons/tb";

const BASE_URL = import.meta.env.VITE_BASE_URL;
let delOrders = [];

export default function ViewLedgerPage() {
  const { id } = useParams();
  const [ledgerData, setLedgerData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totals, setTotals] = useState({ freight: 0, hamali: 0, charges: 0 });
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [allWarehouse, setAllWarehouse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { isAdmin, isSource } = useAuth();
  const navigate = useNavigate();

  const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
  const rowStyle = { color: "#25344E" };

  useEffect(() => {
    fetchWarehouse();
    fetchData();
  }, []);

  useEffect(() => {
    let totalfreight = 0;
    let totalhamali = 0;
    let totalcharges = 0;
    orders.forEach((element) => {
      totalfreight += element.freight;
      totalhamali += element.hamali;
      totalcharges += element.charges;
    });

    setTotals({
      freight: totalfreight,
      hamali: totalhamali,
      charges: totalcharges,
    });
  }, [orders]);

  const fetchData = async () => {
    setIsLoading1(true);
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/ledger/track/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      alert("Error occurred");
      setIsLoading1(false);
      return;
    }
    if (!data.flag) {
      alert("No such Ledger found");
      setIsLoading1(false);
      return;
    }
    setLedgerData(data.body);
    if (data.body.sourceWarehouse)
      setSourceWarehouse(data.body.sourceWarehouse.warehouseID);
    if (data.body.destinationWarehouse)
      setDestinationWarehouse(data.body.destinationWarehouse.warehouseID);
    setOrders(data.body.parcels);
    setIsLoading1(false);
  };

  const fetchWarehouse = async () => {
    const response = await fetch(`${BASE_URL}/api/warehouse/get-all`);
    if (response.ok) {
      const data = await response.json();
      setAllWarehouse(data.body);
    }
  };

  const handleUpdate = (value, index, type) => {
    value = parseInt(value) || 0;
    if (type === "freight") orders[index].freight = value;
    else if (type === "hamali") orders[index].hamali = value;
    else orders[index].charges = value;
    const updated = [...orders];
    setOrders(updated);
  };

  const handleDelete = (index) => {
    delOrders.push(orders[index]._id);
    orders.splice(index, 1);
    setOrders([...orders]);
  };

  const handleDispatch = async () => {
    let hamali_freight = orders.map((item) => {
      return {
        trackingId: item.trackingId,
        hamali: item.hamali,
        freight: item.freight,
      };
    });

    if (!destinationWarehouse || (isAdmin && !sourceWarehouse)) {
      alert("Select Destination");
      return;
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/ledger/edit/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        parcels: { del: delOrders },
        destinationWarehouse: destinationWarehouse,
        hamali_freight: hamali_freight,
        status: "dispatched",
        ...(isAdmin ? { sourceWarehouse: sourceWarehouse } : {}),
      }),
    });
    if (response.ok) {
      alert("orders dispatched successfully");
      navigate("/user/ledgers/all");
    } else {
      alert("Error occurred");
    }
  };

  const handleVerify = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${BASE_URL}/api/ledger/verify-deliver/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      alert("Error occurred");
    }
    const data = await response.json();
    navigate("/user/ledgers/all");
  };

  const handleDeleteLedger = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/admin/manage/ledger`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "DELETE",
      body: JSON.stringify({
        ledgerId: id,
      }),
    });

    const data = await res.json();
    setIsLoading(false);
    setDeleteModalOpen(false);
    if (data.flag) {
      navigate("/user/ledgers/all");
    } else {
      alert("Error occurred");
    }
  };

  return (
    <Box
      sx={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Top Section: Ledger Details + Image */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          minHeight: "150px", 
        }}
      >
        {/* Left Section - Text Content */}
        <Box sx={{ flex: 1, textAlign: "left" }}>
          <Typography
            variant="h5"
            sx={{ marginBottom: "10px", ...headerStyle }}
          >
            Ledger Details
          </Typography>

          {/* Conditional Loader for Data */}
          {isLoading1 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography sx={rowStyle}>
                <strong>Ledger No:</strong> {ledgerData.ledgerId}
              </Typography>
              <Typography sx={rowStyle}>
                <strong>Truck No:</strong> {ledgerData.vehicleNo}
              </Typography>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "20px",
                  alignItems: "center",
                }}
              >
                <Typography sx={rowStyle}>
                  <strong>Source Warehouse:</strong>{" "}
                </Typography>
                {ledgerData.sourceWarehouse ? (
                  <Typography sx={rowStyle}>
                    {ledgerData.sourceWarehouse.name}
                  </Typography>
                ) : (
                  <FormControl>
                    <InputLabel>Source Warehouse</InputLabel>
                    <Select
                      label="Source Warehouse"
                      value={sourceWarehouse}
                      onChange={(e) => setSourceWarehouse(e.target.value)}
                      sx={{ minWidth: "250px" }}
                    >
                      {allWarehouse
                        .filter((w) => !w.isSource)
                        .map((w) => (
                          <MenuItem key={w.warehouseID} value={w.warehouseID}>
                            {w.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "20px",
                  alignItems: "center",
                }}
              >
                <Typography sx={rowStyle}>
                  <strong>Destination Warehouse:</strong>{" "}
                </Typography>
                {ledgerData.destinationWarehouse ? (
                  <Typography sx={rowStyle}>
                    {ledgerData.destinationWarehouse.name}
                  </Typography>
                ) : (
                  <FormControl>
                    <InputLabel>Destination Warehouse</InputLabel>
                    <Select
                      label="Destination Warehouse"
                      value={destinationWarehouse}
                      onChange={(e) => setDestinationWarehouse(e.target.value)}
                      sx={{ minWidth: "250px" }}
                    >
                      {allWarehouse
                        .filter((w) => !w.isSource)
                        .map((w) => (
                          <MenuItem key={w.warehouseID} value={w.warehouseID}>
                            {w.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )}
              </div>
              <Typography sx={rowStyle}>
                <strong>Status:</strong>{" "}
                {ledgerData.status?.charAt(0).toUpperCase() +
                  ledgerData.status?.slice(1)}
              </Typography>
            </>
          )}
        </Box>

        {/* Right Section - Image */}
        <Box sx={{ flex: "0 0 150px", marginLeft: "20px" }}>
          <img
            src={ledger}
            alt="Ledger"
            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
          />
        </Box>
      </Box>

      {/* Ledger Table */}
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: "#ffffff", borderRadius: "8px" }}
      >
        <Typography variant="h6" sx={{ padding: "16px", ...headerStyle }}>
          Ledger orders
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Order No</TableCell>
              <TableCell sx={headerStyle}>LR No</TableCell>
              <TableCell sx={headerStyle}>Packages</TableCell>
              <TableCell sx={headerStyle}>Sender</TableCell>
              <TableCell sx={headerStyle}>Receiver</TableCell>
              <TableCell sx={headerStyle}>Freight</TableCell>
              <TableCell sx={headerStyle}>Hamali</TableCell>
              <TableCell sx={headerStyle}>Statistical Charges</TableCell>
              {ledgerData.status === "pending" && (
                <TableCell sx={headerStyle}>Actions</TableCell>
              )}
              <TableCell sx={headerStyle}>View</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading1 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress
                    size={22}
                    className="spinner"
                    sx={{ color: "#1E3A5F", animation: "none !important" }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              orders.length !== 0 &&
              orders.map((order, index) => (
                <TableRow key={order.trackingId}>
                  <TableCell sx={rowStyle}>{index + 1}</TableCell>
                  <TableCell sx={rowStyle}>{order.trackingId}</TableCell>
                  <TableCell sx={rowStyle}>{order.items.length}</TableCell>
                  <TableCell sx={rowStyle}>{order.sender.name}</TableCell>
                  <TableCell sx={rowStyle}>{order.receiver.name}</TableCell>
                  <TableCell sx={rowStyle}>
                    <TextField
                      type="text"
                      size="small"
                      value={order.freight}
                      disabled={ledgerData.status !== "pending"}
                      onChange={(e) =>
                        handleUpdate(e.target.value, index, "freight")
                      }
                    />
                  </TableCell>
                  <TableCell sx={rowStyle}>
                    <TextField
                      type="text"
                      size="small"
                      value={order.hamali}
                      disabled={ledgerData.status !== "pending"}
                      onChange={(e) =>
                        handleUpdate(e.target.value, index, "hamali")
                      }
                    />
                  </TableCell>
                  <TableCell sx={rowStyle}>
                    <TextField
                      type="text"
                      size="small"
                      value={order.charges}
                      disabled={ledgerData.status !== "pending"}
                      onChange={(e) =>
                        handleUpdate(e.target.value, index, "charges")
                      }
                    />
                  </TableCell>
                  {ledgerData.status === "pending" && (
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={(e) => handleDelete(index)}
                      >
                        <Cancel />
                      </IconButton>
                    </TableCell>
                  )}
                  <TableCell>
                    <Button
                      variant="outlined"
                      sx={{
                        textTransform: "none",
                        color: "#1E3A5F",
                        borderColor: "#1E3A5F",
                      }}
                      target="_blank"
                      href={`/user/view/order/${order.trackingId}`}
                    >
                      <IoArrowForwardCircleOutline size={24} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}

            {/* Totals Row */}
            <TableRow>
              <TableCell colSpan={2} sx={{ ...headerStyle }}>
                Total
              </TableCell>
              <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>
                {orders.length}
              </TableCell>
              <TableCell sx={rowStyle}></TableCell>
              <TableCell sx={rowStyle}></TableCell>
              <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>
                {totals.freight}
              </TableCell>
              <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>
                {totals.hamali}
              </TableCell>
              <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>
                {totals.charges}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      {(isSource || isAdmin) && ledgerData.status === "pending" && (
        <button className="button button-large" onClick={handleDispatch}>
          <FaTruckLoading style={{ marginRight: "8px" }} />Dispatch Truck
        </button>
      )}
      {(!isSource || isAdmin) && ledgerData.status === "verified" && (
        <button className="button button-large" onClick={handleVerify}>
          <TbTruckDelivery  size="19" style={{ marginRight: "8px" }} />Deliver Truck
        </button>
      )}
      <button
        className="button button-large"
        onClick={() => setDeleteModalOpen(true)}
      >
        <FaTrash style={{ marginRight: "8px" }} /> Delete Ledger
      </button>
      <Link to={`${BASE_URL}/api/ledger/generate-ledger-receipt/${id}`}>
        <button className="button button-large"> <FaPrint style={{ marginRight: "8px" }} />Print Ledger</button>
      </Link>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 350,
            bgcolor: "background.paper",
            borderRadius: 3,
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
            Delete Ledger
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
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#d32f2f" }}
              startIcon={<FaTrash />}
              onClick={handleDeleteLedger}
            >
              Delete{" "}
              {isLoading && (
                <CircularProgress
                  size={15}
                  className="spinner"
                  sx={{ color: "#fff", animation: "none !important" }}
                />
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
