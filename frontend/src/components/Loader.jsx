import React from 'react';
import { createPortal } from 'react-dom';
import { ClipLoader } from 'react-spinners';

const Loader = ({ message, size = 30, color = "#4f46e5", loading = true }) => {
  if (!loading) return null;

  return createPortal(
    <div className="loader-container">
      <ClipLoader color={color} loading={loading} size={size} />
      {message && <p className="loader-message">{message}</p>}
    </div>,
    document.body
  );
};

export default Loader;
