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
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { useParams, Link, useNavigate } from "react-router-dom";
import ledger from "../assets/ledger.jpg";
import { useAuth } from "../routes/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;
let delOrders = [];

export default function ViewLedgerPage() {
  const { id } = useParams();
  const [ledgerData, setLedgerData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totals, setTotals] = useState({ freight: 0, hamali: 0 });
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [allWarehouse, setAllWarehouse] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { isAdmin, isSource } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    fetchWarehouse();
    fetchData();
  }, []);

  useEffect(() => {
    let totalfreight = 0;
    let totalhamali = 0;
    orders.forEach((element) => {
      totalfreight += element.freight;
      totalhamali += element.hamali;
    });

    setTotals({
      freight: totalfreight,
      hamali: totalhamali,
    });
  }, [orders]);

  // console.log(orders);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/ledger/track/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      alert("Error occurred");
      return;
    }
    if (response.status === 201) {
      alert("No such Ledger found");
      return;
    }
    const data = (await response.json()).body;
    setLedgerData(data);
    if (data.sourceWarehouse)
      setSourceWarehouse(data.sourceWarehouse.warehouseID);
    if (data.destinationWarehouse)
      setDestinationWarehouse(data.destinationWarehouse.warehouseID);
    setOrders(data.parcels);
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
    else orders[index].hamali = value;
    const updated = [...orders];
    setOrders(updated);
  };

  const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
  const rowStyle = { color: "#25344E" };

  const handleDelete = (index) => {
    delOrders.push(orders[index]._id);
    console.log(delOrders);
    orders.splice(index, 1);
    console.log(orders);
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
    console.log(await response.json());
  };

  const handleVerify = async () => {
    alert("Implement Verify");
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
    console.log(data);
    navigate("/user/ledgers/all");
  };

  const handleDeleteLedger = async () => {
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
    console.log(data);
    if (data.flag) {
      // setIsLoading(false);
      // handleCloseDeleteModal();
      navigate("/user/ledgers/all");
    } else {
      // setIsLoading(false);
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
          alignorders: "flex-start",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <Box sx={{ flex: 1, textAlign: "left" }}>
          <Typography
            variant="h5"
            sx={{ marginBottom: "10px", ...headerStyle }}
          >
            Ledger Details
          </Typography>
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
              alignorders: "center",
            }}
          >
            <Typography sx={rowStyle}>
              <strong>Source Station:</strong>{" "}
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
                  // error={error && !sourceWarehouse}
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
              alignorders: "center",
            }}
          >
            <Typography sx={rowStyle}>
              <strong>Delivery Station:</strong>{" "}
            </Typography>
            {ledgerData.destinationWarehouse ? (
              <Typography sx={rowStyle}>
                {ledgerData.destinationWarehouse.name}
              </Typography>
            ) : (
              <FormControl>
                <InputLabel>Destination Warehouse</InputLabel>
                <Select
                  // width
                  label="Destination Warehouse"
                  value={destinationWarehouse}
                  onChange={(e) => setDestinationWarehouse(e.target.value)}
                  // error={error && !destinationWarehouse}
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
        </Box>
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
              {ledgerData.status === "pending" && (
                <TableCell sx={headerStyle}>Actions</TableCell>
              )}
              <TableCell sx={headerStyle}>View</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length !== 0 &&
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
                    <Link
                      to={`/user/view/order/${order.trackingId}`}
                      target="_blank"
                    >
                      <Button>View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
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
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      {(isSource || isAdmin) && ledgerData.status === "pending" && (
        <button className="button button-large" onClick={handleDispatch}>
          Dispatch Truck
        </button>
      )}
      {(!isSource || isAdmin) && ledgerData.status === "dispatched" && (
        <button className="button button-large" onClick={handleVerify}>
          Verify Truck
        </button>
      )}
      {isAdmin && (
        <button className="button button-large" onClick={handleDeleteLedger}>
          Delete Ledger
        </button>
      )}

      {/* Delete Confirmation Modal 
      <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
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
                */}
    </Box>
  );
}
