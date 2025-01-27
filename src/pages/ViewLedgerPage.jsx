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
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import ledger from "../assets/ledger.jpg";


const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function ViewLedgerPage({admin}) {
  const { id } = useParams();
  const [ledgerData, setLedgerData] = useState([]);
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ freight: 0, hamali: 0 });
  const [freightLst, setFreightLst] = useState([]);
  const [hamaliLst, setHamaliLst] = useState([]);
  const [warehouseNo, setWarehouseNo] = useState("");
  const [allWarehouse, setAllWarehouse] = useState([]);

  useEffect(() => {
    fetchWarehouse();
    fetchData();
  }, []);

  useEffect(() => {
    setTotals({
      freight: freightLst.reduce((a, b) => a + b, 0),
      hamali: hamaliLst.reduce((a, b) => a + b, 0),
    });
  }, [freightLst, hamaliLst]);

  // console.log(items);

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
    console.log(data.items);
    if (data.items.itemId)
    setItems(data.items.map((item) => item.itemId));
    setFreightLst(data.items.map((item) => (item.freight ? item.freight : 0)));
    setHamaliLst(data.items.map((item) => (item.hamali ? item.hamali : 0)));
  };

  const fetchWarehouse = async () => {
    const response = await fetch(`${BASE_URL}/api/warehouse/get-all`);
    if (response.ok) {
      const data = await response.json();
      setAllWarehouse(data.body);
    }
  };

  const handleFreightUpdate = (value, index) => {
    value = parseInt(value);
    const updatedFreight = [...freightLst];
    updatedFreight[index] = value;
    setFreightLst(updatedFreight);
  };

  const handleHamaliUpdate = (value, index) => {
    value = parseInt(value);
    const updatedHamali = [...hamaliLst];
    updatedHamali[index] = value;
    setHamaliLst(updatedHamali);
  };

  // Styling variables
  const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
  const rowStyle = { color: "#25344E" };

  const handleDelete = (index) => {
    items.splice(index, 1);
    hamaliLst.splice(index, 1);
    freightLst.splice(index, 1);
    setFreightLst([...freightLst]);
  };

  const handleSave = async () => {
    alert('Implement Save');
    return ;
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/ledger/edit/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        warehouseId: warehouseNo,
        items: items,
        freight: freightLst,
        hamali: hamaliLst,
      }),
    });
    if (response.ok) {
      alert("Items dispatched successfully");
    } else {
      alert("Error occurred");
    }
  };

  const handleDispatch = async () => {
    alert('Implement Dispatch');
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
          <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignItems: "center" }}>
            <Typography sx={rowStyle}>
              <strong>Delivery Station:</strong>{" "}
            </Typography>
            {ledgerData.destinationWarehouse ? (
              ledgerData.destinationWarehouse
            ) : (
              <Select
                id="warehouse-select"
                value={warehouseNo}
                onChange={(event) => setWarehouseNo(event.target.value)}
                // fullWidth
                style={{
                  width: "40%",
                  textAlign: "left",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                }}
              >
                {allWarehouse &&
                  allWarehouse.map((element) => (
                    <MenuItem
                      value={element.warehouseID}
                      key={element.warehouseID}
                    >
                      {element.name}
                    </MenuItem>
                  ))}
              </Select>
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
          Ledger Items
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Item Name</TableCell>
              <TableCell sx={headerStyle}>LR No</TableCell>
              <TableCell sx={headerStyle}>Packages</TableCell>
              <TableCell sx={headerStyle}>Consignee</TableCell>
              <TableCell sx={headerStyle}>Freight</TableCell>
              <TableCell sx={headerStyle}>Hamali</TableCell>
              <TableCell sx={headerStyle}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length !==0 && items.map((item, index) => (
              <TableRow key={item.itemId}>
                <TableCell sx={rowStyle}>{item.name}</TableCell>
                <TableCell sx={rowStyle}>{item.parcelId}</TableCell>
                <TableCell sx={rowStyle}>{item.quantity}</TableCell>
                <TableCell sx={rowStyle}>{item.status}</TableCell>
                <TableCell sx={rowStyle}>
                  <TextField
                    type="number"
                    size="small"
                    value={freightLst[index]}
                    onChange={(e) => handleFreightUpdate(e.target.value, index)}
                  />
                </TableCell>
                <TableCell sx={rowStyle}>
                  <TextField
                    type="number"
                    size="small"
                    value={hamaliLst[index]}
                    onChange={(e) => handleHamaliUpdate(e.target.value, index)}
                  />
                </TableCell>
                <TableCell>
                  <IconButton color="error" onClick={(e) => handleDelete(index)}>
                    <Cancel />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {/* Totals Row */}
            <TableRow>
              <TableCell colSpan={2} sx={{ ...headerStyle }}>
                Total
              </TableCell>
              <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>
                {items.length}
              </TableCell>
              <TableCell sx={rowStyle}>---</TableCell>
              <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>
                {totals.freight}
              </TableCell>
              <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>
                {totals.hamali}
              </TableCell>
              <TableCell>---</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <button className="button button-large" onClick={handleSave}>
        Save Items
      </button>
      <button className="button button-large" onClick={handleDispatch}>
        Dispatch Items
      </button>
    </Box>
  );
}
