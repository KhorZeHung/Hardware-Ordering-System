import React, { useState } from "react";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { contactData } from "../../data";
import CustomModal from "../../components/Modal/CustomModal";
import "../index.css";

const Contact = () => {
  const [isSupplierPage, setIsSupplierPage] = useState("supplier");
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <>
      <div className="contentMainBody">
        <ul className="subPageOption">
          {["supplier", "product"].map((pages, index) => (
            <li
              key={index}
              onClick={() => setIsSupplierPage(pages)}
              className={isSupplierPage === pages ? "selected" : ""}>
              {pages}
            </li>
          ))}
        </ul>
        <TableWithSmlCard datas={contactData[isSupplierPage]} />
        <span className="addNewItem" onClick={() => setModalIsOpen(true)}>
          +
        </span>
      </div>
      {
        <CustomModal
          open={modalIsOpen}
          closeFunc={() => setModalIsOpen(false)}
          formStructure={contactData[isSupplierPage]["newModalForm"]}
        />
      }
    </>
  );
};

export default Contact;
