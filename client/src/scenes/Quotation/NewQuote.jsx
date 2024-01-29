import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material-next/CircularProgress";
import RoomMaterialInput from "../../components/Form/Input/RoomMaterialInput";
import NormalInput from "../../components/Form/Input/NormalInput";
import InputOption from "../../components/Form/Input/InputOption";
import { newQuoteData } from "../../data";

const NewQuote = () => {
  const [currentLocation, setCurrentLocation] = useState(undefined);
  const [formInputValue, setFormInputValue] = useState({
    quote_product_lists: [
      {
        roomName: "room 1",
        productList: [{ name: "product 1", quantity: 2, unit_price: 12.49 }],
      },
      {
        roomName: "room 2",
        productList: [{ name: "product 1", quantity: 2, unit_price: 12.49 }],
      },
    ],
  });
  const [totalNumRoom, setTotalNumRoom] = useState(2);
  var inputLists = newQuoteData;

  const formHandler = (e, name, value, index = null) => {
    const inputValue = value || e.target.value;

    setFormInputValue((prev) => {
      if (Array.isArray(prev[name]) && index !== null) {
        return {
          ...prev,
          [name]: prev[name].map((item, i) =>
            i === index ? { ...item, ...inputValue } : item
          ),
        };
      }
      return { ...prev, [name]: inputValue };
    });
  };

  const addRoomHandler = (e, defaultValue = []) => {
    e.preventDefault();
    var numOfRooms = totalNumRoom + 1;

    const productListArray = [
      ...formInputValue.quote_product_lists,
      {
        roomName: `room ${numOfRooms}`,
        productList: defaultValue,
      },
    ];

    setTotalNumRoom(numOfRooms);
    formHandler(null, "quote_product_lists", productListArray);
  };

  const deleteRoomHandler = (index) => {
    setTotalNumRoom((prev) => prev - 1);
    setFormInputValue((prev) => {
      const newProductList = [...prev.quote_product_lists];
      newProductList.splice(index, 1);
      return {
        ...prev,
        quote_product_lists: newProductList,
      };
    });
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const longitude = position.coords.longitude;
      const latitude = position.coords.latitude;

      const nominatimApiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

      fetch(nominatimApiUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error("Error:", data.error);
            setCurrentLocation(null);
          } else {
            const result = data.display_name;
            formHandler(null, "quote_location", result);
            setCurrentLocation(result);
          }
        })
        .catch((error) => {
          console.error("Error fetching address:", error);
          setCurrentLocation(null);
        });
    });
  }, []);

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

  return (
    <>
      {currentLocation !== undefined ? (
        <form method="post" className="formBody" style={{ width: "80%" }}>
          <p className="title">new quote</p>
          <div className="formInputLists" style={{ marginBottom: "3rem" }}>
            <NormalInput
              datas={inputLists[0]}
              formHandler={(e) => formHandler(e, inputLists[0].name)}
            />
            <NormalInput
              datas={inputLists[1]}
              formHandler={(e) => formHandler(e, inputLists[1].name)}
            />
            <NormalInput
              datas={inputLists[2]}
              formHandler={(e) => formHandler(e, inputLists[2].name)}
            />
            <NormalInput
              datas={{ ...inputLists[3], defaultValue: currentLocation }}
              formHandler={(e) => formHandler(e, inputLists[3].name)}
            />
            <InputOption
              datas={inputLists[4]}
              formHandler={(e) => formHandler(e, inputLists[4].name)}
            />
          </div>
          <div style={{ margin: "1rem 0" }}>{createRoomHandler()}</div>
          <button
            style={{
              display: "block",
              margin: "0 auto",
              fontSize: "1.5rem",
              borderRadius: "100%",
              padding: 0,
              width: "30px",
              height: "30px",
            }}
            onClick={addRoomHandler}>
            +
          </button>
          <div className="formAction" style={{ marginTop: "3rem" }}>
            <button className="center">
              <span
                class="material-symbols-outlined"
                style={{ paddingRight: "0.5rem", fontSize: "1rem" }}>
                picture_as_pdf
              </span>
              create pdf
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
