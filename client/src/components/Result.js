import React from 'react';


import { useSearchParams } from 'react-router-dom';

function Result() {
  let [searchParams] = useSearchParams();
  let id = decodeURIComponent(searchParams.get('id'));

  return (
      <div>
          <iframe style={{ borderRadius: '12px' }} title='Playlist' src={`https://open.spotify.com/embed/playlist/${id}?utm_source=generator`} width="100%" height="380" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
      </div>
  );
}

export default Result;