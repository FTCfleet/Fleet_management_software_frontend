import React, { useState, useEffect, useRef } from "react";
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
  Checkbox,
} from "@mui/material";
import {
  useParams,
  useNavigate,
  Link,
  useOutletContext,
} from "react-router-dom";
import ledger from "../assets/ledger.jpg";
import { useAuth } from "../routes/AuthContext";
import {
  FaTrash,
  FaExclamationTriangle,
  FaTruckLoading,
  FaPrint,
} from "react-icons/fa";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
import { dateFormatter } from "../utils/dateFormatter";
// import { Delete } from "react-feather";
// import { Memory } from "@mui/icons-material";

const BASE_URL = import.meta.env.VITE_BASE_URL;
let delOrders = [];

export default function ViewLedgerPage() {
  const { id } = useParams();
  const [ledgerData, setLedgerData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totals, setTotals] = useState({ freight: 0, hamali: 0, charges: 0 });
  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  // const [allWarehouse, setAllWarehouse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [counter, setCounter] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const modalData = useRef({
    headingText: "",
    text: "",
    textColor: "",
    icon: "",
    buttonText: "",
    func: () => {},
  });
  const { isAdmin, isSource } = useAuth();
  const navigate = useNavigate();
  const { setIsScreenLoading, setIsScreenLoadingText } = useOutletContext();

  const headerStyle = { color: "#1E3A5F", fontWeight: "bold" };
  const rowStyle = { color: "#25344E" };

  useEffect(() => {
    // fetchWarehouse();
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
      alert("No such Memo found");
      setIsLoading1(false);
      return;
    }
    setLedgerData(data.body);
    console.log(data.body);
    if (data.body.sourceWarehouse)
      setSourceWarehouse(data.body.sourceWarehouse.warehouseID);
    if (data.body.destinationWarehouse)
      setDestinationWarehouse(data.body.destinationWarehouse.warehouseID);
    setOrders(data.body.parcels);
    setIsLoading1(false);
  };

  // const fetchWarehouse = async () => {
  //   const response = await fetch(`${BASE_URL}/api/warehouse/get-all`);
  //   if (response.ok) {
  //     const data = await response.json();
  //     setAllWarehouse(data.body);
  //   }
  // };

  const handleDelete = (index) => {
    delOrders.push(orders[index]._id);
    orders.splice(index, 1);
    setOrders([...orders]);
  };

  const handleModalOpen = (headingText, text, buttonText, textColor, func) => {
    modalData.current.headingText = headingText;
    modalData.current.text = text;
    modalData.current.textColor = textColor;
    modalData.current.buttonText = buttonText;
    modalData.current.func = func;
    setModalOpen(true);
    // setIsScreenLoading(true);
    // setIsScreenLoadingText("Dispatching Memo...");
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
      alert("Select Station location");
      return;
    }
    setIsScreenLoading(true);
    setIsScreenLoadingText("Loading Please wait...");
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
    setIsScreenLoadingText("");
    setIsScreenLoading(false);
    if (response.ok) {
      alert("Orders dispatched successfully");
      // navigate("/user/ledgers/all");
    } else {
      alert("Error occurred");
    }
    setModalOpen(false);
    fetchData();
    setCounter(0);
    // window.location.reload();
  };

  const handleVerify = async () => {
    setIsScreenLoading(true);
    setIsScreenLoadingText("Loading Please Wait...");
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
      return;
    }
    const data = await response.json();
    setIsScreenLoadingText("");
    setIsScreenLoading(false);
    if (!data.flag) {
      alert("Error occurred " + data.message);
    } else {
      alert("Orders delivered successfully");
      setModalOpen(false);
      setCounter(0);
      fetchData();
    }
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
    setModalOpen(false);
    if (data.flag) {
      navigate("/user/ledgers/all");
    } else {
      alert("Error occurred " + data.message);
    }
  };

  const handlePrint = async () => {
    try {
      setIsScreenLoading(true);
      setIsScreenLoadingText("Generating Memo Receipt...");
      const response = await fetch(
        `${BASE_URL}/api/ledger/generate-ledger-receipt/${id}`
      );
      const blob = await response.blob();
      const pdfURL = URL.createObjectURL(blob);
      window.open(pdfURL, "_blank");
      // const iframe = document.createElement("iframe");
      // iframe.style.display = "none";
      // iframe.src = pdfURL;

      
      // iframe.addEventListener("load", () => {
      //   iframe.contentWindow?.focus();
      //   iframe.contentWindow?.print();
      // });
      // document.body.appendChild(iframe);
    } catch (error) {
      alert("Failed to load or print the PDF.");
    }
    setIsScreenLoadingText("");
    setIsScreenLoading(false);
  };

  const handleCheckboxChange = (value) => {
    // console.log(value);
    if (value) {
      // counter++;
      setCounter((prev) => prev + 1);
    } else {
      setCounter((prev) => prev - 1);
      // counter--;
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
      {/* Top Section: Memo Details + Image */}
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
            Memo Details
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
            <Box sx={{ display: "flex", gap: "40px" }}>
              <Box>
                <Typography sx={rowStyle}>
                  <strong>Memo No:</strong> {ledgerData.ledgerId}
                </Typography>
                <Typography sx={rowStyle}>
                  <strong>Source Station:</strong>{" "}
                  {ledgerData.sourceWarehouse?.name}
                </Typography>
                <Typography sx={rowStyle}>
                  <strong>Destination Station:</strong>{" "}
                  {ledgerData.destinationWarehouse?.name}
                </Typography>
                <Typography sx={rowStyle}>
                  <strong>Status:</strong>{" "}
                  {ledgerData.status?.charAt(0).toUpperCase() +
                    ledgerData.status?.slice(1)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={rowStyle}>
                  <strong>Lorry Freight: </strong>
                  {ledgerData.lorryFreight}
                </Typography>
                <Typography sx={rowStyle}>
                  <strong>Created On: </strong>
                  {dateFormatter(ledgerData.dispatchedAt)}
                </Typography>
                <Typography sx={rowStyle}>
                  <strong>Delivered On: </strong>
                  {dateFormatter(ledgerData.deliveredAt)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={rowStyle}>
                  <strong>Truck No:</strong> {ledgerData.vehicleNo}
                </Typography>
                <Typography sx={rowStyle}>
                  <strong>Driver Name: </strong>
                  {ledgerData.driverName}
                </Typography>
                <Typography sx={rowStyle}>
                  <strong>Driver Phone: </strong>
                  {ledgerData.driverPhone}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Right Section - Image */}
        <Box sx={{ flex: "0 0 150px", marginLeft: "20px" }}>
          <img
            src={ledger}
            alt="Memo"
            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
          />
        </Box>
      </Box>

      {/* Memo Table */}
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: "#ffffff", borderRadius: "8px" }}
      >
        <Typography variant="h6" sx={{ padding: "16px", ...headerStyle }}>
          Memo orders ({counter}/{orders.length})
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}></TableCell>
              <TableCell sx={headerStyle}>Sl No.</TableCell>
              <TableCell sx={headerStyle}>LR No.</TableCell>
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
                  <TableCell sx={rowStyle}>
                    <Checkbox
                      onChange={(e) => handleCheckboxChange(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell sx={rowStyle}>{index + 1}.</TableCell>
                  <TableCell sx={rowStyle}>{order.trackingId}</TableCell>
                  <TableCell sx={rowStyle}>{order.items.length}</TableCell>
                  <TableCell sx={rowStyle}>{order.sender.name}</TableCell>
                  <TableCell sx={rowStyle}>{order.receiver.name}</TableCell>
                  <TableCell sx={rowStyle}>
                    <TextField type="text" size="small" value={order.freight} />
                  </TableCell>
                  <TableCell sx={rowStyle}>
                    <TextField type="text" size="small" value={order.hamali} />
                  </TableCell>
                  <TableCell sx={rowStyle}>
                    <TextField type="text" size="small" value={order.charges} />
                  </TableCell>
                  {ledgerData.status === "pending" && (
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={(e) => handleDelete(index)}
                      >
                        <FaTrash size={20} />
                      </IconButton>
                    </TableCell>
                  )}
                  <TableCell>
                    <IconButton
                      color="primary"
                      target="_blank"
                      href={`/user/view/order/${order.trackingId}`}
                    >
                      <IoArrowForwardCircleOutline size={24} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}

            {/* Totals Row */}
            <TableRow>
              <TableCell sx={rowStyle}></TableCell>
              <TableCell colSpan={2} sx={{ ...headerStyle }}>
                Total
              </TableCell>
              <TableCell sx={{ ...rowStyle, fontWeight: "bold" }}>
                {orders.reduce((sum, order) => sum + order.items.length, 0)}
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
        <button
          className="button button-large"
          onClick={() =>
            handleModalOpen(
              "Dispatch Truck",
              "",
              "Confirm",
              "#25344e",
              handleDispatch
            )
          }
        >
          <FaTruckLoading style={{ marginRight: "8px" }} />
          Dispatch Truck
        </button>
      )}
      {(isSource || isAdmin) && ledgerData.status === "dispatched" && (
        <button
          className="button button-large"
          onClick={() =>
            handleModalOpen(
              "Deliver Truck",
              "",
              "Confirm",
              "#25344e",
              handleVerify
            )
          }
        >
          <TbTruckDelivery size="19" style={{ marginRight: "8px" }} />
          Deliver Truck
        </button>
      )}

      <button className="button button-large" onClick={() => {
        handlePrint();
      }}>
        {" "}
        <FaPrint style={{ marginRight: "8px" }} />
        Download Memo
      </button>

      {isAdmin && (
        <button
          className="button button-large"
          onClick={() =>
            handleModalOpen(
              "Delete Memo",
              "Are you sure you want to delete this?",
              "Delete",
              "#d32f2f",
              handleDeleteLedger
            )
          }
        >
          <FaTrash style={{ marginRight: "8px" }} /> Delete Memo
        </button>
      )}

      {/* Confirmation Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
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
              color: modalData.current.textColor,
              fontSize: "36px",
              marginBottom: "12px",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              marginBottom: "12px",
              color: modalData.current.textColor,
            }}
          >
            {modalData.current.headingText}
          </Typography>
          <Typography
            sx={{
              marginBottom: "20px",
              color: "#374151",
              fontSize: "15px",
            }}
          >
            {modalData.current.text}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <Button
              variant="outlined"
              sx={{ borderColor: "#1E3A5F", color: "#1E3A5F" }}
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: modalData.current.textColor,
                display: "flex",
                gap: "8px",
              }}
              onClick={modalData.current.func}
            >
              {modalData.current.buttonText}
              {isLoading && (
                <CircularProgress
                  size={15}
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
