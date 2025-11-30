import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
    const phoneNumber = "8977037039"; // Random number for now

    const handleClick = () => {
        window.open(`https://wa.me/${phoneNumber}`, "_blank");
    };

    return (
        <div
            onClick={handleClick}
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                backgroundColor: "#25D366",
                color: "white",
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                cursor: "pointer",
                zIndex: 1000,
                transition: "transform 0.3s ease-in-out",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
            <FaWhatsapp size={35} />
        </div>
    );
};

export default WhatsAppButton;
