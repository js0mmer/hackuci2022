import React from "react";

import { useSearchParams } from "react-router-dom";

function Result() {
  let [searchParams] = useSearchParams();
  let id = decodeURIComponent(searchParams.get("id"));

  return (
    <div className="playlist">
      <header>
        <h1 id="title">
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

      <main className="container">
        <div className="row">
          <div className="col-md-6">
            <h2>
              Based on your image,
              <br />
              here is a playlist made
              <br />
              just for you
            </h2>
          </div>
          <div className="col-md-6">
            <iframe
              style={{ borderRadius: "12px" }}
              title="Playlist"
              src={`https://open.spotify.com/embed/playlist/${id}?utm_source=generator`}
              width="93.5%"
              height={380}
              frameBorder={0}
              allowFullScreen={false}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            ></iframe>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Result;
