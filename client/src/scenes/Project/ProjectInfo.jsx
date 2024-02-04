import React, { useState } from "react";
import RoomMaterialInput from "../../components/Form/Input/RoomMaterialInput";
import { constructInput } from "../../components/Form/FormBody";
import { projData } from "../../data";
import AccountStatusCard from "../../components/Card/AccountStatusCard";
import ProjActionFab from "../../components/FloatingActionButton/ProjActionFab";

const ProjectInfo = () => {
  // const progressArray = [
  //   { title: "process", percent: 30 },
  //   { title: "total paid", percent: 50 },
  //   { title: "profit margin", percent: 58.61 },
  // ];

  // eslint-disable-next-line
  const [formInputLists, setFormInputLists] = useState(projData || null);

  return (
    <div
      className="projectInfo"
      style={{ position: "relative", boxSizing: "border-box" }}>
      <div style={{ width: "70vw", margin: "0 auto" }}>
        {/* <GridRoundProgressBarCard progressArrays={progressArray} /> */}
        <div className="formBody">
          <div className="formInputLists" style={{ marginBottom: "3rem" }}>
            {constructInput(formInputLists, null)}
          </div>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <RoomMaterialInput
                key={i}
                datas={{
                  disable: true,
                  defaultProductList: {
                    roomName: `room ${i + 1}`,
                    productList: [
                      { name: "product 1", quantity: 2, unit_price: 12.5 },
                      { name: "product 4", quantity: 12, unit_price: 64.5 },
                    ],
                  },
                }}
              />
            ))}
        </div>
        <AccountStatusCard />
      </div>
      <ProjActionFab />
    </div>
  );
};

export default ProjectInfo;
