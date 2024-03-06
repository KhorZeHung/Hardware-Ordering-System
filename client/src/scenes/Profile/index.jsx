import React, { useEffect, useRef, useContext, useState } from "react";
import FormBody from "../../components/Form/FormBody";
import { APIGateway, profileData } from "../../data";
import { decode } from "jsonwebtoken";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import axios from "axios";
import { CircularProgress } from "@mui/material";

const Profile = () => {
  const profileFormData = useRef();
  const { setSnackbar } = useContext(SnackbarContext);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const token = getCookie("token");
    const { user_id, user_authority } = decode(token);
    const url =
      APIGateway + profileData.profileForm.getDefaultValueEndPoint + user_id;
    setIsLoading(true);
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const { data } = res.data;

        let profileDataWithDefaultValue = {
          ...profileData.profileForm,
        };

        profileDataWithDefaultValue.inputLists =
          profileDataWithDefaultValue.inputLists.map((field) => {
            let returnObj = { ...field };
            if (data.hasOwnProperty(field.name)) {
              returnObj.defaultValue = data[field.name];
            }

            if (field.name === "user_authority" && user_authority === 3) {
              returnObj.disable = true;
            }

            return returnObj;
          });

        profileFormData.current = profileDataWithDefaultValue;
      })
      .catch((err) => {
        const message = err.response.body.message || "Something went wrong";
        setSnackbar({ open: true, message: message, severity: "error" });
      })
      .finally(() => {
        setIsLoading(false);
      });
    return () => {};
  }, [setSnackbar]);
  return (
    <>
      {isLoading ? (
        <div style={{ height: "90vh", width: "100vw" }} className="center">
          <CircularProgress />
        </div>
      ) : (
        <FormBody {...profileFormData.current} />
      )}
    </>
  );
};

export default Profile;
