import React, { useState } from "react";
import ErrorMessage from "./ErrorMessage";

import Spinner from "./Spinner";

import { ACCEPTED_EXTENSIONS, SOURCE_UPLOAD_SIZE_LIMIT } from "../settings";

function TileArt({ dirname, setDirname, setCurrentStep }) {
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [squareSize, setSquareSize] = useState(30);
  const [loading, setLoading] = useState(false);
  const [resByte, setResByte] = useState("");

  const getHeightAndWidthFromDataUrl = (dataURL) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          height: img.height,
          width: img.width,
        });
      };
      img.src = dataURL;
    });

  const validateInput = async () => {
    let err = "";
    const { height, width } = await getHeightAndWidthFromDataUrl(
      URL.createObjectURL(file)
    );
    if (!file) err = "Please choose a file to upload";
    else if (
      file.type.split("/")[0] !== "image" ||
      ACCEPTED_EXTENSIONS.filter((ext) => ext === file.type.split("/")[1])
        .length === 0
    )
      err = `Please select an image which is of format ${ACCEPTED_EXTENSIONS.join(
        ", "
      )}`;
    else if (file.size / 1024 / 1024 > SOURCE_UPLOAD_SIZE_LIMIT)
      err = "Please select a file less than 3mb";
    else if (height < 600 || width < 600)
      err = "Please select an image with size atleast 600x600 px";

    if (err !== "") {
      setError(err);
      setTimeout(() => setError(""), 3000);
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (await validateInput()) {
      const data = new FormData();

      data.append("file", file);
      data.append("dirname", dirname);
      data.append("squareSize", squareSize);

      const request = new XMLHttpRequest();
      request.open("POST", "/api/tile");

      request.upload.addEventListener("progress", function (e) {
        let percent_completed = (e.loaded / e.total) * 100;

        setProgress(percent_completed);
      });

      request.addEventListener("load", function (e) {
        setTimeout(() => {
          setProgress(0);
          setLoading(false);
          const res = JSON.parse(request.response);

          if (res.abort) {
            setDirname("test");
            setCurrentStep(1);
            sessionStorage.removeItem("dirname");
          } else if (res.error) {
            setError(request.response.error);
            setTimeout(() => setError(""), 3000);
          } else {
            setResByte(`data:${file.type};base64,${res.img}`);
          }
        }, 500);
      });

      setLoading(true);
      request.send(data);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const _file = e.target.files[0];
      setFileName(_file.name);
      setFile(_file);
    }
  };

  return (
    <div className="container">
      <h6 className="mt-3">
        You have 15 minutes to make a mosaic with whatever image you want. Make
        sure the image you select is atleast 600x600px big for better results.
        The allowed extensions are jpeg and png. NOTE: The quality of the
        generated mosaic will largely depend on smaller image set and the target
        image. You might have to try a few times before you can get it right :)
      </h6>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="mt-3 form-inline">
            <label htmlFor="exampleFormControlSelect1">
              <strong>Square size</strong>
            </label>
            <select
              className="form-control square-size-select m-2"
              id="exampleFormControlSelect1"
              onChange={(e) => setSquareSize(e.target.value)}
              value={squareSize}
            >
              {[...Array(11).keys()].map((num, index) => (
                <option key={index}>{20 + num}</option>
              ))}
            </select>
          </div>
          <div className="input-group mt-3">
            <div className="custom-file">
              <input
                type="file"
                className="custom-file-input"
                id="inputGroupFile04"
                aria-describedby="inputGroupFileAddon04"
                onChange={handleFileChange}
              />
              <label className="custom-file-label" htmlFor="inputGroupFile04">
                {fileName === "" ? "Choose file" : fileName}
              </label>
            </div>
            <div className="input-group-append">
              <button
                className="btn btn-secondary"
                type="button"
                id="inputGroupFileAddon04"
                onClick={handleUpload}
              >
                upload
              </button>
            </div>
          </div>
        </>
      )}

      <ErrorMessage error={error} />

      {progress > 0 && (
        <>
          <h5 className="mt-4 text-center">{`${Math.round(progress)}%`}</h5>
          <progress
            className="mt-1"
            style={{ width: "100%" }}
            max="100"
            value={Math.round(progress)}
          />
        </>
      )}

      {resByte !== "" && (
        <>
          <img
            className="mt-3"
            src={resByte}
            width="100%"
            alt="generated mosaic"
          />
          <a
            download={`tileart.${file.type.split("/")[1]}`}
            className="btn btn-primary btn-lg btn-block mt-2"
            href={resByte}
          >
            Download
          </a>
        </>
      )}
    </div>
  );
}

export default TileArt;
