import { useEffect, useState } from "react";
import axios from "axios";
import { APIGateway } from "../data";
import { getCookie } from "./cookie";

const useProductInfo = (setter) => {
  const [returnObj, setReturnObj] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      if (
        !localStorage.getItem("productInfo") ||
        !localStorage.getItem("productByCategory") ||
        !localStorage.getItem("productBySupplier") ||
        !localStorage.getItem("productDescription")
      ) {
        try {
          const response = await axios.get(APIGateway + "/product/options", {
            headers: {
              Authorization: `Bearer ${getCookie("token")}`,
            },
          });
          let productInfo = response.data.option;
          let productByCategory = {};
          let productDescription = {};
          let productBySupplier = {};

          // Process productInfo to create productByCategory, productDescription, and productBySupplier
          productInfo = productInfo.reduce((obj, product) => {
            product.category.forEach((categoryId) => {
              if (!productByCategory[categoryId]) {
                productByCategory[categoryId] = [];
              }
              productByCategory[categoryId].push(product.id);
            });

            if (!productBySupplier[product.supplier]) {
              productBySupplier[product.supplier] = [];
            }
            productBySupplier[product.supplier].push(product.id);

            const { description, ...productWithoutDescription } = product;

            description.forEach((description) => {
              if (!productDescription[product.id]) {
                productDescription[product.id] = [];
              }
              productDescription[product.id].push(description);
            });

            obj[product.id] = productWithoutDescription;

            return obj;
          }, {});

          // Store data in localStorage
          localStorage.setItem("productInfo", JSON.stringify(productInfo));
          localStorage.setItem(
            "productByCategory",
            JSON.stringify(productByCategory)
          );
          localStorage.setItem(
            "productDescription",
            JSON.stringify(productDescription)
          );
          localStorage.setItem(
            "productBySupplier",
            JSON.stringify(productBySupplier)
          );
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }

      setReturnObj({
        productInfo: JSON.parse(localStorage.getItem("productInfo")),
        productByCategory: JSON.parse(
          localStorage.getItem("productByCategory")
        ),
        productBySupplier: JSON.parse(
          localStorage.getItem("productBySupplier")
        ),
        productDescription: JSON.parse(
          localStorage.getItem("productDescription")
        ),
      });
    };

    fetchData();
    return () => {};
  }, []);

  return returnObj;
};

export default useProductInfo;
