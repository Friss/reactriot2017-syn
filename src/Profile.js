import React from 'react';

export default function Profile({width, imageUrl, alt, children}) {
  return (
    <div className="media">
      <img className="d-flex mr-2 rounded-circle" width={width} src={imageUrl} alt={alt} />
      <div className="media-body align-self-center">
        {children}
      </div>
    </div>
  );
}
