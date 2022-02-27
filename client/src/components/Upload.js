import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Upload() {
  let [searchParams] = useSearchParams();
  let navigate = useNavigate();
  let state = decodeURIComponent(searchParams.get("state"));

  const handleUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];
      const form = new FormData();
      form.append('image', img);
      form.append('state', encodeURIComponent(state))

      const request = {
        method: 'POST',
        body: form
      };

      fetch('/upload', request)
        .then(response => {
          response.json().then(result => {
            navigate(`/result?id=${result['id']}`);
          });
        })
    }
  }

  return (
    <div>
      <h1>hi</h1>
      <input type="file" name="image" onChange={handleUpload} />
    </div>
  );
}

export default Upload;