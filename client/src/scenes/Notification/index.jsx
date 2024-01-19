import React from "react";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { notificationData } from "../../data";

const Notification = () => {
  return (
    <div className="contentMainBody">
      <TableWithSmlCard datas={notificationData} />
    </div>
  );
};

export default Notification;
