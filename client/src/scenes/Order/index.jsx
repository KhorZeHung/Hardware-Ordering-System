import React from "react";
import "../index.css";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { orderData } from "../../data";

const Order = () => {
  return (
    <div className="contentMainBody">
      <TableWithSmlCard datas={orderData} />
    </div>
  );
};

export default Order;
