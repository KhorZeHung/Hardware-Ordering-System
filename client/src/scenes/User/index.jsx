import React, { useState } from "react";
import "../index.css";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import CustomModal from "../../components/Modal/CustomModal";
import { userData } from "../../data";
const User = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <>
      <div className="contentMainBody">
        <TableWithSmlCard datas={userData} />
        <span className="addNewItem" onClick={() => setModalIsOpen(true)}>
          +
        </span>
      </div>
      <CustomModal
        open={modalIsOpen}
        closeFunc={() => setModalIsOpen(false)}
        formStructure={userData.newModalForm}
      />
    </>
  );
};

export default User;
