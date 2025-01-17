import {
    AppBar,
    Box,
    Typography,
    Button,
    ButtonGroup,
} from "@mui/material";
import { Link, NavLink } from "react-router-dom";
import logoImg from '../assets/logo.jpg'
import "../css/header.css"
import { useAuth } from "../routes/AuthContext";

const HeaderTabs = () => {
    const {isLoggedIn} = useAuth();
    const tabs = [
        { url: "/", text: "Home" },
        { url: "/track", text: "Track Shipment" },
        { url: "/about", text: "About Us" },
        { url: "/faq", text: "FAQ" },
        isLoggedIn ? { url: "/user/parcel/all", text: "Dashboard" } : { url: "/auth/login", text: "Login" },
    ]
    return (
        <ButtonGroup sx={{ textDecoration: "none", marginRight: 1 }}>
            {tabs.map((item, index) => (
                <NavLink key={index} className="navlink" to={item.url}>
                    <Button className="header-button" style={{border:'none', outline: 'none'}}color='inherit'>{item.text}</Button>
                </NavLink>
            ))}
        </ButtonGroup>
    );
};


const Header = () => {
    return (
        <div className="header-box">
            <AppBar
                sx={{
                    backgroundColor: "rgb(29, 53, 87)",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 2,
                        minHeight: "60px",
                    }}
                >
                    <Link style={{ textDecoration: "none", display: "flex", alignItems: "center" }} to="/">
                        <img src={logoImg} height='50px'></img>
                    </Link>
                </Box>
                <HeaderTabs />
            </AppBar>
        </div>
    );
};

export default Header;