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
  FormControl, InputLabel
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import ledger from "../assets/ledger.jpg";
import { useAuth } from "../routes/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;
let delOrders = [];

export default function ViewLedgerPage({ admin }) {
  const { id } = useParams();
  const [ledgerData, setLedgerData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totals, setTotals] = useState({ freight: 0, hamali: 0 });
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [allWarehouse, setAllWarehouse] = useState([]);
  const { isAdmin, isSource } = useAuth();


  useEffect(() => {
    fetchWarehouse();
    fetchData();
  }, []);

  useEffect(() => {
    let totalfreight = 0;
    let totalhamali = 0;
    orders.forEach(element => {
      totalfreight += element.freight;
      totalhamali += element.hamali;
    });

    setTotals({
      freight: totalfreight,
      hamali: totalhamali
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
    if (type === 'freight')
      orders[index].freight = value;
    else
      orders[index].hamali = value;
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
    // alert('Implement Save');
    // return;
    let hamali_freight = orders.map((item) => { return { trackingId: item.trackingId, hamali: item.hamali, freight: item.freight } });
    // console.log(hamali_freight);
    // let hamali_freight = [];
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
        // freight: freightLst,
        // hamali: hamaliLst,
        hamali_freight: hamali_freight,
        ...(isAdmin ? { sourceWarehouse: sourceWarehouse } : {})
      }),
    });
    if (response.ok) {
      alert("orders dispatched successfully");
    } else {
      alert("Error occurred");
    }
    console.log(await response.json());
  };

  // const handleDispatch = async () => {
  //   alert('Implement Dispatch');
  // };

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
          <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignorders: "center" }}>
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
                  {allWarehouse.filter(w => !w.isSource).map(w => (
                    <MenuItem key={w.warehouseID} value={w.warehouseID}>{w.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignorders: "center" }}>
            <Typography sx={rowStyle}>
              <strong>Delivery Station:</strong>{" "}
            </Typography>
            {ledgerData.destinationWarehouse ? (
              <Typography sx={rowStyle}>
                {ledgerData.destinationWarehouse.name}
              </Typography>
              // ledgerData.destinationWarehouse
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
                  {allWarehouse.filter(w => !w.isSource).map(w => (
                    <MenuItem key={w.warehouseID} value={w.warehouseID}>{w.name}</MenuItem>
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
              <TableCell sx={headerStyle}>Actions</TableCell>
              <TableCell sx={headerStyle}>View</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length !== 0 && orders.map((order, index) => (
              <TableRow key={order.trackingId}>
                <TableCell sx={rowStyle}>{index + 1}</TableCell>
                <TableCell sx={rowStyle}>{order.trackingId}</TableCell>
                <TableCell sx={rowStyle}>{order.items.length}</TableCell>
                <TableCell sx={rowStyle}>{order.sender.name ? order.sender.name : "NA"}</TableCell>
                <TableCell sx={rowStyle}>{order.receiver.name ? order.receiver.name : "NA"}</TableCell>
                <TableCell sx={rowStyle}>
                  <TextField
                    type="text"
                    size="small"
                    value={order.freight}
                    onChange={(e) => handleUpdate(e.target.value, index, 'freight')}
                  />
                </TableCell>
                <TableCell sx={rowStyle}>
                  <TextField
                    type="text"
                    size="small"
                    value={order.hamali}
                    onChange={(e) => handleUpdate(e.target.value, index, 'hamali')}
                  />
                </TableCell>
                <TableCell>
                  <IconButton color="error" onClick={(e) => handleDelete(index)}>
                    <Cancel />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <Button>View</Button>
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
      <button className="button button-large" onClick={handleDispatch}>
        Dispatch Truck
      </button>
    </Box>
  );
}
