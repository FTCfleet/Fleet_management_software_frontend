import { React } from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import TrackShipmentPage from "../pages/TrackShipmentPage";
import AboutPage from "../pages/AboutPage";
import FAQPage from "../pages/FAQPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgetPasswordPage from "../pages/ForgetPasswordPage";
import OtpPage from "../pages/Otpage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import AddOrderPage from "../pages/AddOrderPage";
import AllTruckPage from "../pages/AllTruckPage";
import AllEmployeePage from "../pages/AllEmployeePage";
import AllLedgerPage from "../pages/AllLedgerPage";
import AllOrderPage from "../pages/AllOrderPage";
import GenReportPage from "../pages/GenReportPage";
import ErrorPage from "../pages/ErrorPage";
import AuthTemplate from "../components/AuthTemplate";
import UserTemplate from "../components/UserTemplate";
import PrivateRoute from "./PrivateRoute";
import ViewOrderPage from "../pages/ViewOrderPage";
import ViewLedgerPage from "../pages/ViewLedgerPage";

function AllRoutes() {
  return (
    <Routes>
      <Route exact path="/" element={<HomePage />} />
      <Route exact path="/track" element={<TrackShipmentPage />} />
      <Route exact path="/about" element={<AboutPage />} />
      <Route exact path="/faq" element={<FAQPage />} />
      <Route path="/auth/*" element={<AuthTemplate />}>
        <Route exact path="login" element={<LoginPage />} />
        <Route exact path="register" element={<RegisterPage />} />
        <Route exact path="forget" element={<ForgetPasswordPage />} />
        <Route
          exact
          path="otp"
          element={
            <PrivateRoute
              element={<OtpPage />}
              requiredStep="otp"
              redirectTo="/auth/forget"
            />
          }
        />
        <Route
          exact
          path="reset"
          element={
            <PrivateRoute
              element={<ResetPasswordPage />}
              requiredStep="reset"
              redirectTo="/auth/otp"
            />
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Route>
      <Route path="/user/*" element={<UserTemplate />}>
        <Route exact path="edit/*">
          <Route exact path="order/:id" element={<AddOrderPage edit={true} />} />
          <Route
            exact
            path="ledger/:id"
            element={<ViewLedgerPage edit={true} />}
          />
        </Route>
        <Route exact path="employees" element={<AllEmployeePage />} />
        <Route exact path="trucks" element={<AllTruckPage />} />
        <Route exact path="add/order" element={<AddOrderPage />} />
        <Route exact path="order/:type" element={<AllOrderPage />} />
        <Route exact path="ledgers/:type" element={<AllLedgerPage />} />
        <Route exact path="view/*">
          <Route exact path="order/:id" element={<ViewOrderPage />} />
          <Route exact path="ledger/:id" element={<ViewLedgerPage />} />
        </Route>
        <Route exact path="gen-report" element={<GenReportPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default AllRoutes;
