import React from "react";
import "../index.css";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { userData } from "../../data";

const User = () => {
  return (
    <div className="contentMainBody">
      <TableWithSmlCard datas={userData} />
    </div>
  );
};

export default User;
