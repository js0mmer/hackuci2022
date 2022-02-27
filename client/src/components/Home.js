import React from "react";

class Home extends React.Component {
  render() {
    return (
      <div className="home">
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

        <main>
          <h2>
            A picture is worth a<br />
            <img
              id="playlistGirl"
              src="/images/Playlist-amico.png"
              alt="person listening to music"
              width={400}
              height="auto"
            />
            thousand songs
          </h2>
          <h3>Turn an image into a personal playlist</h3>
          <a href="/login">Login</a>
        </main>
      </div>
    );
  }
}

export default Home;
