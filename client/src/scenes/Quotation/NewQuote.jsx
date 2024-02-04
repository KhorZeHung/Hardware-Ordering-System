import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material-next/CircularProgress";
import RoomMaterialInput, {
  calculateSubTotal,
} from "../../components/Form/Input/RoomMaterialInput";
import { newQuoteData } from "../../data";
import QuoteProjSummary from "../../components/Card/QuoteProjSummary";
import { constructInput } from "../../components/Form/FormBody";

const NewQuote = ({ datas }) => {
  const {
    // eslint-disable-next-line
    endPoint = null,
    isQuote = false,
    isNew = false, // eslint-disable-next-line
    readOnly = false,
  } = datas;

  const [isLoading, setIsLoading] = useState(true);
  const [formInputValue, setFormInputValue] = useState({
    quote_product_lists: [
      {
        roomName: "room 1",
        productList: [
          { name: "product 1", quantity: 2, unit_price: 12.5 },
          { name: "product 4", quantity: 12, unit_price: 64.5 },
        ],
      },
      {
        roomName: "room 2",
        productList: [{ name: "product 1", quantity: 2, unit_price: 25.0 }],
      },
    ],
    quote_sub_total: 849.0,
    quote_discount: 0,
    quote_grand_total: 849.0,
  });
  const [formInputLists, setFormInputLists] = useState(newQuoteData);
  const [totalNumRoom, setTotalNumRoom] = useState(2);

  const formHandler = (
    e,
    name,
    value,
    index = null,
    changeSubTotalValue = 0
  ) => {
    const inputValue = value || parseFloat(e.target.value);

    setFormInputValue((prev) => {
      const { quote_sub_total, quote_grand_total, ...rest } = prev;

      return {
        ...rest,
        [name]:
          Array.isArray(prev[name]) && index !== null
            ? prev[name].map((item, i) =>
                i === index ? { ...item, ...inputValue } : item
              )
            : inputValue,
        quote_sub_total: quote_sub_total + changeSubTotalValue,
        quote_grand_total: quote_grand_total + changeSubTotalValue,
      };
    });
  };

  const addRoomHandler = (e, defaultValue = []) => {
    e.preventDefault();
    const numOfRooms = totalNumRoom + 1;
    const changeValue = calculateSubTotal(defaultValue);

    const productListArray = [
      ...formInputValue.quote_product_lists,
      {
        roomName: `room ${numOfRooms}`,
        productList: defaultValue,
      },
    ];

    setTotalNumRoom(numOfRooms);
    setFormInputValue((prev) => ({
      ...prev,
      quote_product_lists: productListArray,
      quote_sub_total: prev.quote_sub_total + parseFloat(changeValue),
      quote_grand_total: prev.quote_grand_total + parseFloat(changeValue),
    }));
  };

  const deleteRoomHandler = (index) => {
    const changeValue = calculateSubTotal(
      formInputValue.quote_product_lists[index].productList
    );

    setTotalNumRoom((prev) => prev - 1);
    setFormInputValue((prev) => {
      const newProductList = [...prev.quote_product_lists];
      newProductList.splice(index, 1);

      return {
        ...prev,
        quote_product_lists: newProductList,
        quote_sub_total: prev.quote_sub_total - parseFloat(changeValue),
        quote_grand_total: prev.quote_grand_total - parseFloat(changeValue),
      };
    });
  };

  const discountHandler = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setFormInputValue((prev) => ({
      ...prev,
      quote_discount: value,
      quote_grand_total: prev.quote_sub_total - value,
    }));
  };

  const createRoomHandler = () => {
    return formInputValue.quote_product_lists.map((value, index) => {
      return (
        <RoomMaterialInput
          key={"room" + index}
          datas={{
            index: index,
            formHandler: formHandler,
            defaultProductList: value,
            addRoomHandler: addRoomHandler,
            deleteRoomHandler: deleteRoomHandler,
          }}
        />
      );
    });
  };

  const needCurrentLocation = isQuote && isNew;
  useEffect(() => {
    if (needCurrentLocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;

        const nominatimApiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

        fetch(nominatimApiUrl)
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              console.error("Error:", data.error);
            } else {
              const result = data.display_name;
              setFormInputLists((prev) => {
                return prev.map((item, i) => {
                  if (item.name === "quote_address") {
                    return { ...item, defaultValue: result };
                  }
                  return { ...item };
                });
              });
              formHandler(null, "quote_location", result);
            }
          })
          .catch((error) => {
            console.error("Error fetching address:", error);
          })
          .finally(() => setIsLoading(false));
      });
    } else {
      setIsLoading(false);
    }
  }, [needCurrentLocation]);

  return (
    <>
      {!isLoading ? (
        <form method="post" className="formBody" style={{ width: "80%" }}>
          <p className="title">new quote</p>
          <div className="formInputLists" style={{ marginBottom: "3rem" }}>
            {constructInput(formInputLists, formHandler)}
          </div>
          <div style={{ margin: "1rem 0" }}>{createRoomHandler()}</div>
          <button className="addRoom" onClick={addRoomHandler}>
            +
          </button>
          <QuoteProjSummary
            formInputValue={formInputValue}
            discountHandler={discountHandler}
          />
          <div
            className="formAction"
            style={{ margin: "2rem auto 0", maxWidth: "500px" }}>
            <button className="center">
              <span
                className="material-symbols-outlined"
                style={{ paddingRight: "0.5rem", fontSize: "1rem" }}>
                picture_as_pdf
              </span>
              create pdf
            </button>
            <button className="center">
              <span
                className="material-symbols-outlined"
                style={{ paddingRight: "0.5rem", fontSize: "1rem" }}>
                file_save
              </span>
              save quote
            </button>
          </div>
        </form>
      ) : (
        <div className="center" style={{ height: "400px", width: "100%" }}>
          <CircularProgress />
        </div>
      )}
    </>
  );
};

export default NewQuote;
