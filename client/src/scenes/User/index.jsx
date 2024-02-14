import React, { useContext } from "react";
import "../index.css";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { userData } from "../../data";
import { CustomModalContext } from "../../components/Modal/CustomModalProvider";
const User = () => {
  const { openCustomModal } = useContext(CustomModalContext);

  return (
    <>
      <div className="contentMainBody">
        <TableWithSmlCard datas={userData} />
        <span
          className="addNewItem"
          onClick={() => openCustomModal(userData.newModalForm)}>
          +
        </span>
      </div>
    </>
  );
};

export default User;
