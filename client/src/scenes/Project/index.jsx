import React from "react";
import "../index.css";
import TableWithSmlCard from "../../components/Table/TableWithSmlCard";
import { projectData } from "../../data";

const Project = () => {
  return (
    <div className="contentMainBody">
      <TableWithSmlCard datas={projectData} />
    </div>
  );
};

export default Project;
