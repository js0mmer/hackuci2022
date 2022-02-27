import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function Upload() {
  let [searchParams] = useSearchParams();
  let navigate = useNavigate();
  let state = decodeURIComponent(searchParams.get("state"));

  const handleUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];
      const form = new FormData();
      form.append("image", img);
      form.append("state", encodeURIComponent(state));

      const request = {
        method: "POST",
        body: form,
      };

      fetch("/upload", request).then((response) => {
        response.json().then((result) => {
          navigate(`/result?id=${result["id"]}`);
        });
      });
    }
  };

  return (
    <div className="upload">
      <header>
        <h1 id="upload-title">
          <img
            id="logo"
            src="/images/playPicLogo.png"
            alt="camera logo"
            width={70}
            height={70}
          />
          playpic
        </h1>
      </header>

      <main>
        <h2>
          <img
            id="headphones"
            src="/images/Headphone-amico(4).png"
            alt="headphones playing music"
            width={400}
            height="auto"
          />
          Select Your Image
        </h2>
        <label className="btn" id="upload-btn">
          <input id="upload" type="file" accept=".jpg,.jpeg,.png" onChange={handleUpload} name="image" />
          Upload
        </label>
      </main>
    </div>
  );
}

export default Upload;
