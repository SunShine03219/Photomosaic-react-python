import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import ProgressBar from "./ProgressBar";
import ErrorMessage from "./ErrorMessage";
import ImagePreview from "./ImagePreview";

import {
  ACCEPTED_EXTENSIONS,
  FILE_UPLOAD_SIZE_LIMIT,
  MAX_NUMBER_OF_FILES_TO_UPLOAD,
  MIN_NUMBER_OF_FILES_TO_UPLOAD,
} from "../settings";

function UploadMyOwn({ incrementStep, setDirname }) {
  const [files, setFiles] = useState([]);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState(0);
  const [error, setError] = useState("");

  const validate_upload = () => {
    let total_file_size = 0;
    let validate_upload = true;
    files.forEach((file) => (total_file_size += file.size / 1024 / 1024));
    let err;
    if (total_file_size > FILE_UPLOAD_SIZE_LIMIT) {
      err = `Total file size has exceeded, Max upload limit is ${FILE_UPLOAD_SIZE_LIMIT}MB`;

      validate_upload = false;
    } else if (
      files.length < MIN_NUMBER_OF_FILES_TO_UPLOAD ||
      files.length > MAX_NUMBER_OF_FILES_TO_UPLOAD
    ) {
      err = `Please make sure the number of files uploaded is between ${MIN_NUMBER_OF_FILES_TO_UPLOAD} and ${MAX_NUMBER_OF_FILES_TO_UPLOAD}`;

      validate_upload = false;
    }

    if (!validate_upload) {
      setError(err);
      setTimeout(() => setError(""), 3000);
      return false;
    }

    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate_upload()) return;

    const dirname = uuidv4();
    setShowProgressBar(true);
    for (let i = 0; i < files.length; i++) {
      const data = new FormData();
      data.append("file", files[i]);
      data.append("extension", files[i].type.split("/")[1]);
      data.append("filename", uuidv4());
      data.append("dirname", dirname);

      const res = await fetch("api/upload", {
        method: "POST",
        body: data,
      });

      const json_res = await res.json();

      if (json_res.abort) {
        const d = new FormData();
        d.append("dirname", dirname);
        await fetch("api/delete", {
          method: "POST",
          body: d,
        });
        setError("Error in server :( Please Try again");
        setTimeout(() => setError(""), 3000);
        setFiles([]);
        setFilesUploaded(0);
        break;
      }
      setFilesUploaded((prevNum) => prevNum + 1);
    }

    if (files.length > 0) {
      setDirname(dirname);
      incrementStep();
      setShowProgressBar(false);
      sessionStorage.setItem("dirname", dirname);
      setFiles([]);
      setFilesUploaded(0);
      setError("");
    }
    setShowProgressBar(false);
  };

  const onFileUploadChange = (e) => {
    const newFiles = [
      ...files,
      ...[...e.target.files].filter(
        (file) =>
          file.type.split("/")[0] === "image" &&
          ACCEPTED_EXTENSIONS.filter((ext) => ext === file.type.split("/")[1])
            .length > 0
      ),
    ];

    //  FOR TESTING
    // const newFiles = [...files, ...[...e.target.files]];
    setFiles(newFiles);
  };

  if (showProgressBar)
    return (
      <ProgressBar totalFiles={files.length} filesUploaded={filesUploaded} />
    );

  const imageUrls = files.map((file) => URL.createObjectURL(file));

  return (
    <div className="tab-pane fade" id="uploadMyOwn">
      <h6>
        Choose the smaller set of images that you want to make the mosaic from.
        Make sure that the selected image files are less than 2MB in size and
        the entire set is less than or equal to 30MB. The allowed extensions are
        jpeg and png. You can select a maximum of 50 images and a minimum of 30
        images. NOTE: The quality of the generated mosaic will largely depend on
        smaller image set and the target image. You might have to try a few
        times before you can get it right :)
      </h6>

      <ImagePreview imageUrls={imageUrls} setFiles={setFiles} files={files} />

      <form onSubmit={onSubmit}>
        <fieldset>
          <div className="form-group">
            <label htmlFor="InputFile">File input</label>
            <input
              type="file"
              className="form-control-file"
              id="InputFile"
              aria-describedby="fileHelp"
              onChange={onFileUploadChange}
              multiple
            />

            <ErrorMessage error={error} />
          </div>

          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </fieldset>
      </form>
    </div>
  );
}

export default UploadMyOwn;
