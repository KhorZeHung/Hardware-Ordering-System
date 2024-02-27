import { useEffect, useState } from "react";
import axios from "axios";
import { APIGateway } from "../data";
import { getCookie } from "./cookie";

const useSupplierInfo = () => {
  const [supplierInfo, setSupplierInfo] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      if (!localStorage.getItem("supplierInfo")) {
        try {
          const response = await axios.get(APIGateway + "/supplier/options", {
            headers: {
              Authorization: `Bearer ${getCookie("token")}`,
            },
          });

          localStorage.setItem(
            "supplierInfo",
            JSON.stringify(response.data.option)
          );
        } catch (error) {
          console.error("Error fetching supplier info:", error);
        }
      }

      setSupplierInfo(JSON.parse(localStorage.getItem("supplierInfo")));
    };
    fetchData();

    return () => {};
  }, []);

  return supplierInfo;
};

export default useSupplierInfo;
