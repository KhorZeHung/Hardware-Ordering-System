import React, { useState, useEffect } from "react";
import FormBody from "../../components/Form/FormBody";
import CircularProgress from "@mui/material-next/CircularProgress";
import RoomMaterialInput from "../../components/Form/Input/RoomMaterialInput";

const NewQuote = () => {
  const [currentLocation, setCurrentLocation] = useState(undefined);

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
            setCurrentLocation(result);
          }
        })
        .catch((error) => {
          console.error("Error fetching address:", error);
          setCurrentLocation(null);
        });
    });
  }, []);

  const inputLists = [
    {
      type: "text",
      name: "quote_name",
      label: "quote name",
      placeholder: "Describe location or version",
    },
    {
      type: "text",
      name: "quote_client_name",
      label: "Client name",
      placeholder: "Full name with title",
    },
    {
      type: "tel",
      name: "quote_client_contact",
      label: "Client contact number",
      placeholder: "01X-XXX XXXX",
    },
    {
      type: "location",
      name: "quote_location",
      label: "Location",
      defaultValue: currentLocation || "",
      placeholder: "full address with unit",
    },
    {
      type: "option",
      name: "quote_prop_type",
      label: "Type",
      options: ["condo", "shoplot", "retail shop", "shopping mall", "terrace"],
    },
    {
      type: "number",
      name: "quote_num_of_room",
      label: "Total room",
      placeholder: "Room + bathroom",
    },
  ];

  return (
    <>
      {currentLocation !== undefined ? (
        <FormBody inputLists={inputLists} submitValue="create quote" />
      ) : (
        <div className="center" style={{ height: "400px", width: "100%" }}>
          <CircularProgress />
        </div>
      )}
      <RoomMaterialInput datas={{ index: 1 }} />
      <RoomMaterialInput datas={{ index: 2 }} />
      <RoomMaterialInput datas={{ index: 3 }} />
    </>
  );
};

export default NewQuote;
