import React, { useRef, useState } from "react";
import "../FormBody.css";

const InputFile = ({ datas, formHandler }) => {
  const { required = true, name, label, limit = 1, disable = false } = datas;

  const fileInput = useRef();
  const [files, setFiles] = useState([]);

  const uploadFileHandler = (e) => {
    e.preventDefault();
    fileInput.current.click();
  };

  const filesHandler = (e) => {
    const newFilesArrays = [...e.target.files];
    setFiles(newFilesArrays);
    formHandler(newFilesArrays);
  };

  const removeFileHanlder = (e, index) => {
    const newFilesArray = [...files];
    newFilesArray.splice(index, 1);
    setFiles(newFilesArray);
    formHandler(newFilesArray);
  };

  return (
    <div
      style={{
        gridRow: "span 2",
        maxWidth: "100%",
      }}>
      <label htmlFor="file">{label}</label>
      <div style={{ width: "100%" }}>
        <input
          type="file"
          id={name}
          name={name}
          required={required}
          multiple={limit > 1}
          ref={fileInput}
          style={{ display: "none" }}
          onChange={filesHandler}
          disabled={disable}
        />
        <input type="button" onClick={uploadFileHandler} value={"+ add file"} />
        <div className={disable ? "filesName disable" : "filesName"}>
          <ul>
            {files.length > 0 &&
              files.map((files, index) => {
                return (
                  <li key={index}>
                    {files.name}
                    <input
                      type="button"
                      onClick={(e) => removeFileHanlder(e, index)}
                      value="&#x2716;"
                      className="fileList"
                    />
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InputFile;
