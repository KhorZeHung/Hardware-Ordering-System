import React, { useState, useEffect, useContext, useRef } from "react";
import CircularProgress from "@mui/material-next/CircularProgress";
import RoomMaterialInput, {
  calculateSubTotal,
} from "../../components/Form/Input/RoomMaterialInput";
import { APIGateway, newQuoteData } from "../../data";
import { constructInput } from "../../components/Form/FormBody";
import { getCookie } from "../../utils/cookie";
import { SnackbarContext } from "../../components/Snackbar/SnackBarProvidor";
import { useParams } from "react-router-dom";
import QuoteProjSummary from "../../components/Card/QuoteProjSummary";
import axios from "axios";

const QuoteForm = ({ datas }) => {
  const { isQuote = false, isNew = false } = datas;

  const [isLoading, setIsLoading] = useState(false);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [formInputValue, setFormInputValue] = useState({
    quote_product_lists: [
      {
        roomName: "room 1",
        productList: [],
      },
    ],
    quote_sub_total: 0.0,
    quote_discount: 0,
    quote_grand_total: 0.0,
  });
  const { quote_id } = useParams();
  const { setSnackbar } = useContext(SnackbarContext);
  const newQuoteDataCopy = useRef(newQuoteData);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsBtnLoading(true);

    const token = getCookie("token");

    await axios
      .post(APIGateway + newQuoteDataCopy.current.endPoint, formInputValue, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const { message } = res.data;
        setSnackbar({ open: true, severity: "success", message: message });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch((err) => {
        const msg =
          err.response.data.message || err.message || "Something went wrong";
        setSnackbar({ open: true, message: msg, severity: "error" });
      })
      .finally(() => {
        setIsBtnLoading(false);
      });
  };

  const formHandler = (
    e,
    name = null,
    value = null,
    index = null,
    changeSubTotalValue = 0
  ) => {
    const inputValue = value || e.target.value;
    const inputName = name || e.target.name;

    setFormInputValue((prev) => {
      const { quote_sub_total, quote_grand_total, ...rest } = prev;

      return {
        ...rest,
        [inputName]:
          Array.isArray(prev[inputName]) && index !== null
            ? prev[inputName].map((item, i) =>
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
    const numOfRooms = formInputValue.quote_product_lists.length + 1 || 1;
    const changeValue = calculateSubTotal(defaultValue);

    const productListArray = [
      ...formInputValue.quote_product_lists,
      {
        roomName: `room ${numOfRooms}`,
        productList: defaultValue,
      },
    ];
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
    if (value > formInputValue.quote_sub_total) {
      return;
    }
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

  const getQuoteListHandler = (e) => {
    e.preventDefault();

    if (!quote_id) return null;

    axios
      .get(APIGateway + "/quote/quotation-list/" + quote_id, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
        responseType: "blob",
      })
      .then((res) => {
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "quotation.pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setSnackbar({
          open: true,
          message: "Download successful",
          severity: "success",
        });
      })
      .catch((err) => {
        const message = err.response || "Something went wrong";
        setSnackbar({ open: true, message: message, severity: "error" });
      });
  };
  const needCurrentLocation = isQuote && isNew;
  useEffect(() => {
    if (needCurrentLocation) {
      setIsLoading(true);
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

              newQuoteDataCopy.current.inputLists =
                newQuoteDataCopy.current.inputLists.map((item, i) => {
                  if (item.name === "quote_address") {
                    return { ...item, defaultValue: result };
                  }
                  return { ...item };
                });
              formHandler(null, "quote_address", result);
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

  useEffect(() => {
    if (!isNew && quote_id && setSnackbar) {
      const token = getCookie("token");
      axios
        .get(APIGateway + "/quote/" + quote_id, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const { data } = res.data;
          const newValue = {
            endPoint: `/quote/edit-quote/${data.quote_id}`,
            title: "edit quote",
          };
          let newQuoteDataWithDefaultValue = {
            ...newQuoteDataCopy.current,
            ...newValue,
          };

          newQuoteDataWithDefaultValue.inputLists = newQuoteData.inputLists.map(
            (field) => {
              let returnField = field;
              if (data.hasOwnProperty(field.name)) {
                returnField = {
                  ...returnField,
                  defaultValue: data[field.name],
                };
              }
              return returnField;
            }
          );

          setFormInputValue((prev) => ({
            ...prev,
            ...data,
            quote_grand_total:
              data.quote_sub_total - (data.quote_discount || 0),
          }));
          newQuoteDataCopy.current = newQuoteDataWithDefaultValue;
        })
        .catch((err) => {
          const message =
            err.response.data.message || err.message || "Something went wrong";
          setSnackbar({ open: true, message: message, severity: "error" });
        });
    }
    return () => {};
  }, [isNew, quote_id, setSnackbar]);

  return (
    <>
      {!isLoading ? (
        <form method="post" className="formBody" style={{ width: "80%" }}>
          <p className="title">{newQuoteDataCopy.current.title}</p>
          <div className="formInputLists" style={{ marginBottom: "3rem" }}>
            {constructInput(newQuoteDataCopy.current.inputLists, formHandler)}
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
            {quote_id && (
              <button className="center" onClick={getQuoteListHandler}>
                <span
                  className="material-symbols-outlined"
                  style={{ paddingRight: "0.5rem", fontSize: "1rem" }}>
                  picture_as_pdf
                </span>
                create pdf
              </button>
            )}
            <button className="center" type="submit" onClick={submitHandler}>
              {isBtnLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{ paddingRight: "0.5rem", fontSize: "1rem" }}>
                    file_save
                  </span>
                  save quote
                </>
              )}
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

export default QuoteForm;
