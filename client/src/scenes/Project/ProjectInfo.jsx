import React from "react";
import GridRoundProgressBarCard from "../../components/Card/GridRoundProgressBarCard";
import RoomMaterialInput from "../../components/Form/Input/RoomMaterialInput";

const ProjectInfo = () => {
  const progressArray = [
    { title: "process", percent: 30 },
    { title: "total paid", percent: 50 },
    { title: "profit margin", percent: 58.61 },
  ];

  return (
    <div style={{ width: "70vw", margin: "0 auto" }}>
      <GridRoundProgressBarCard progressArrays={progressArray} />
      <div className="formBody">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <RoomMaterialInput
              key={i}
              datas={{
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
    </div>
  );
};

export default ProjectInfo;
