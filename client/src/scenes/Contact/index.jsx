import React, { useState } from "react";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { contactData } from "../../data";
import "../index.css";

const Contact = () => {
  const [supplierPage, setSupplierPage] = useState("supplier");

  return (
    <div className="contentMainBody">
      <ul className="subPageOption">
        {["supplier", "product"].map((pages, index) => (
          <li
            key={index}
            onClick={() => setSupplierPage(pages)}
            className={supplierPage === pages ? "selected" : ""}>
            {pages}
          </li>
        ))}
      </ul>
      <TableWithSmlCard datas={contactData[supplierPage]} />
    </div>
  );
};

export default Contact;
