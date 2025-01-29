import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { AiOutlineCalendar } from "react-icons/ai";
import "../css/table.css"; // Import CSS
import "../css/calendar.css"; // Import Calendar CSS
import { IoArrowForwardCircleOutline } from "react-icons/io5"; // Icon for View Ledger
import { useAuth } from "../routes/AuthContext"

const BASE_URL = import.meta.env.VITE_BASE_URL;

const EditOrderPage = () => {
};

export default EditOrderPage;