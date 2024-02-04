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
    const newFilesArrays = Array.from(e.target.files);
    setFiles(newFilesArrays);
    formHandler(e, newFilesArrays);
  };

  const removeFileHanlder = (index) => {
    const newFilesArray = [...files];
    newFilesArray.splice(index, 1);
    setFiles(newFilesArray);
    formHandler(newFilesArray, name);
  };

  return (
    <>
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
                      onClick={() => removeFileHanlder({ index })}
                      value="&#x2716;"
                      className="fileList"
                    />
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default InputFile;
