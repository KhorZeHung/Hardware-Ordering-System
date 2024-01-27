import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material-next/CircularProgress";
import RoomMaterialInput from "../../components/Form/Input/RoomMaterialInput";
import NormalInput from "../../components/Form/Input/NormalInput";
import InputOption from "../../components/Form/Input/InputOption";
import { newQuoteData } from "../../data";

const NewQuote = () => {
  const [currentLocation, setCurrentLocation] = useState(undefined);
  const [formInputValue, setFormInputValue] = useState({
    quote_product_lists: [{ roomName: "room 1", productList: [] }],
  });
  const [totalNumRoom, setTotalNumRoom] = useState(1);

  var inputLists = newQuoteData;

  const formHandler = (e, name, value, index = null) => {
    const inputValue = value || e.target.value;

    setFormInputValue((prev) => {
      if (Array.isArray(prev[name])) {
        return {
          ...prev,
          [name]: (prev[name][index] = value),
        };
      }
      return { ...prev, [name]: inputValue };
    });
  };

  const addRoomHandler = (e) => {
    e.preventDefault();
    var numOfRooms = totalNumRoom + 1;

    var productListArray = [
      ...formInputValue.quote_product_lists,
      {
        roomName: `room ${numOfRooms}`,
        product_list: [],
      },
    ];

    setTotalNumRoom(numOfRooms);
    formHandler(null, "quote_product_lists", productListArray);
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

  const createRoomHandler = Array.from({ length: totalNumRoom }, (_, index) => (
    <RoomMaterialInput
      key={index}
      datas={{
        index: index,
        formHandler: formHandler,
        defaultProductList: formInputValue.quote_product_lists[index],
      }}
    />
  ));

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
          {
            <>
              <div style={{ margin: "1rem 0" }}>{createRoomHandler}</div>
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
                onClick={(e) => addRoomHandler(e)}>
                +
              </button>
              <div className="formAction" style={{ marginTop: "3rem" }}>
                <input type="submit" value="create quote" />
              </div>
            </>
          }
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
