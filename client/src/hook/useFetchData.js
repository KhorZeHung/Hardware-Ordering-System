import React, { useState } from "react";
import { APIGateway } from "../data";
import axios from "axios";

const useFetchData = (apiEndpoint, formData = {}) => {
  const uploadFile = (formData) => {
    const response = axios
      .post(APIGateway.concat(apiEndpoint), formData)
      .then((res) => {
        if (response.status !== 200) {
          throw new Error("Something went wrong");
        } else {
          console.log("success");
        }
      })
      .catch((e) => console.log(e));
  };

  return;
};

export default useFetchData;
