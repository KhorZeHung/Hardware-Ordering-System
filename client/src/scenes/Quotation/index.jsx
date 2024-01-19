import React from "react";
import "../index.css";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { quoteData } from "../../data";

const Quotation = () => {
  return (
    <div className="contentMainBody">
      <TableWithSmlCard datas={quoteData} />
    </div>
  );
};

export default Quotation;
