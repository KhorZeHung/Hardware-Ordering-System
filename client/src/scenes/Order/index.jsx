import React from "react";
import "../index.css";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { orderData } from "../../data";
import { useNavigate } from "react-router-dom";

const Order = () => {
  const navigate = useNavigate();
  const viewHandler = (id) => {
    navigate(`./${id}`);
  };
  orderData.tableData.checkBox.handlerArray[0].onClickHandler = viewHandler;
  return (
    <div className="contentMainBody">
      <TableWithSmlCard datas={orderData} />
    </div>
  );
};

export default Order;
