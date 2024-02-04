import React from "react";
import "../index.css";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { quoteData } from "../../data";
import { Link } from "react-router-dom";

const Quotation = () => {
  return (
    <div className="contentMainBody">
      <TableWithSmlCard datas={quoteData} />
      <span className="addNewItem">
        <Link to="./new-quote">+</Link>
      </span>
    </div>
  );
};

export default Quotation;
