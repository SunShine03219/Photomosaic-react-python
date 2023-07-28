import React, { useEffect, useState } from "react";

import ErrorMessage from "./ErrorMessage";
import ImagePreview from "./ImagePreview";
import Spinner from "./Spinner";

import {
  MAX_NUMBER_OF_FILES_TO_UPLOAD,
  MIN_NUMBER_OF_FILES_TO_UPLOAD,
} from "../settings";

function GrabFromInternet({ incrementStep, setDirname }) {
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [count, setCount] = useState(0);

  const validate_upload = () => {
    let err = "";
    let validate_upload = true;
    if (images.length < MIN_NUMBER_OF_FILES_TO_UPLOAD) {
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

  // useEffect(() => {
  //   socket.on("disconnect", () => {
  //     setLoading(false);

  //     setError("Connection to server lost :( Please Try again");
  //     setTimeout(() => setError(""), 3000);
  //   });
  // }, [socket]);

  const loadImages = async () => {
    if (searchText === "") {
      setError("Search cannot empty");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const data = new FormData();

    data.append("searchText", searchText);
    data.append("count", count);

    setLoading(true);

    const res = await fetch("/api/search", {
      method: "POST",
      body: data,
    });

    const search_data = await res.json();

    const newImages = [...search_data.search_results, ...images];

    // console.log(newImages);
    setImages(newImages);

    if (search_data.search_results > 0) setCount((prevCount) => prevCount + 1);

    setLoading(false);
  };

  const upload = async () => {
    if (!validate_upload()) return;

    setLoading(true);

    const data = new FormData();

    data.append("image_urls", images.join(" "));

    const _res = await fetch("/api/grab", {
      method: "POST",
      body: data,
    });

    const res = await _res.json();

    setLoading(false);

    const { abort, dirname } = res;

    if (abort) {
      setError("Error in server :( Please Try again");
      setTimeout(() => setError(""), 3000);
    } else {
      setImages([]);
      setSearchText("");
      setCount(0);
      setError("");
      setDirname(dirname);
      sessionStorage.setItem("dirname", dirname);
      incrementStep();
    }
  };

  // const upload = () => {
  //   if (!validate_upload()) return;

  //   setLoading(true);

  //   socket.emit("download_images", images.join(" "), ({ abort, dirname }) => {
  //     setLoading(false);

  //     if (abort) {
  //       setError("Error in server :( Please Try again");
  //       setTimeout(() => setError(""), 3000);
  //     } else {
  //       setImages([]);
  //       setSearchText("");
  //       setCount(0);
  //       setError("");
  //       setDirname(dirname);
  //       sessionStorage.setItem("dirname", dirname);
  //       incrementStep();
  //     }
  //   });
  // };

  const onChange = (e) => setSearchText(e.target.value);

  if (loading) return <Spinner />;

  return (
    <div className="tab-pane fade active show" id="grabFromInternet">
      <h6>
        Grab the smaller image set from the internet. Make sure you select
        atleast 30 images. The top 50 images will be used for making the mosaic.
        Try to pic images with different color distributions for more better
        results. NOTE: The quality of the generated mosaic will largely depend
        on smaller image set and the target image. You might have to try a few
        times before you can get it right :)
      </h6>

      <div className="form-group mt-5">
        <div className="input-group mb-5">
          <input
            className="form-control form-control-lg"
            type="text"
            placeholder="Search the internet Eg: Jemma Simmons"
            id="inputLarge"
            value={searchText}
            onChange={onChange}
            readOnly={images.length > 0}
          />
          {images.length === 0 && (
            <div className="input-group-append">
              <button
                onClick={loadImages}
                className="input-group-text btn-primary"
              >
                Search
              </button>
            </div>
          )}
        </div>

        {images.length > 0 && (
          <>
            <button
              type="button"
              onClick={upload}
              className="btn btn-primary btn-lg btn-block"
            >
              Grab
            </button>
            <button
              type="button"
              onClick={loadImages}
              className="btn btn-primary btn-lg btn-block mb-5"
            >
              Load More
            </button>

            <h4 className="mt-2">
              Number of images selected : {Math.min(50, images.length)}
            </h4>
          </>
        )}
        <ErrorMessage className="mb-2 mt-1" error={error} />

        <ImagePreview imageUrls={images} setFiles={setImages} files={images} />
      </div>
    </div>
  );
}

export default GrabFromInternet;
