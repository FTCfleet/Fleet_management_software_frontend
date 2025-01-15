import { React } from "react";
import { Outlet } from "react-router-dom";
function UserTemplate() {
  return (
    <div>
        This is User
        <Outlet />

    </div>
  );
}

export default UserTemplate;
