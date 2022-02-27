import React from 'react';
import { useSearchParams } from 'react-router-dom';

function Upload() {
  let [searchParams] = useSearchParams();
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

      fetch('http://localhost:8080/upload', request)
        .then(response => console.log(response.text()))
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