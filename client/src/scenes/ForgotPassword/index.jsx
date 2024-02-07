import React, { useState, useRef, useContext } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { constructInput } from "../../components/Form/FormBody";
import { forgotPasswordData, APIGateway } from "../../data";
import LoadableBtn from "../../components/Form/Button/LoadableBtn";
import axios from "axios";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";

const ForgotPassword = () => {
  const [onPages, setOnPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const emailSubmit = useRef("");
  const navigate = useNavigate();
  const { setSnackbar } = useContext(SnackbarContext);

  const forgotPasswordHandler = async (e) => {
    e.preventDefault();
    var formData = new URLSearchParams(new FormData(e.target));

    if (onPages === 1 && formData.get("user_email")) {
      emailSubmit.current = formData.get("user_email");
    } else {
      formData.append("user_email", emailSubmit.current);
    }

    setIsLoading(true);
    await axios
      .post(APIGateway + "/user/forgot-password/" + onPages, formData)
      .then((res) => {
        const message = res.data;
        setSnackbar({ open: true, message: message, severity: "success" });

        setTimeout(() => {
          if (onPages !== 3) {
            setOnPages(onPages + 1);
          } else {
            navigate("../login");
          }
        }, 2000);
      })
      .catch((err) => {
        const message = err.response.data || err.message;
        setSnackbar({ open: true, message: message, severity: "error" });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const breadcrumbsData = [
    { label: "Enter Email", key: 1, text: "Get pin" },
    {
      label: "6-Pin verification",
      key: 2,
      text: "Proceed",
    },
    { label: "Reset Password", key: 3, text: "Submit" },
  ];

  return (
    <div className="center centerFormContainer">
      <div>
        <form
          className="formBody"
          onSubmit={forgotPasswordHandler}
          key={onPages}
          style={{ minWidth: "350px" }}>
          <div className="center">
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
              mb={2}>
              {breadcrumbsData.map((data) => (
                <Typography
                  key={data.key}
                  className={`pageLink ${data.key === onPages && "onPages"}`}>
                  {data.label}
                </Typography>
              ))}
            </Breadcrumbs>
          </div>

          {constructInput(forgotPasswordData[onPages - 1], null)}
          <div className="formAction">
            <LoadableBtn
              isLoading={isLoading}
              txt={breadcrumbsData[onPages - 1].text}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
