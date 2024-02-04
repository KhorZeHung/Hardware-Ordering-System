import React, { useState, useEffect, useRef } from "react";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import Tooltip from "@mui/material/Tooltip";
import "./ProjActionFab.css";

const ProjActionFab = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fabRef = useRef(null);

  const toggleExpansion = () => {
    setIsExpanded((prev) => !prev);
  };

  const closeExpansionOnOutsideClick = (event) => {
    if (fabRef.current && !fabRef.current.contains(event.target)) {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeExpansionOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeExpansionOnOutsideClick);
    };
  }, []);

  return (
    <>
      <div className="projectActionSec">
        <Fab
          ref={fabRef}
          className={`main-fab ${isExpanded ? "expanded" : ""}`}
          size="small"
          onClick={toggleExpansion}>
          <AddIcon />
        </Fab>

        <div className={`expanded-fabs ${isExpanded ? "open" : ""}`}>
          <Tooltip title={"Edit project"}>
            <Fab
              className="fab"
              onClick={() => console.log("Edit clicked")}
              size="small">
              <EditIcon />
            </Fab>
          </Tooltip>

          <Tooltip title={"Download PDF"}>
            <Fab
              className="fab"
              onClick={() => console.log("Produce PDF clicked")}
              size="small">
              <PictureAsPdfIcon />
            </Fab>
          </Tooltip>

          <Tooltip title={"Edit Accounting"}>
            <Fab
              className="fab"
              onClick={() => console.log("Accounting clicked")}
              size="small">
              <AccountBalanceIcon />
            </Fab>
          </Tooltip>
        </div>
      </div>
    </>
  );
};

export default ProjActionFab;
