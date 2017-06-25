import React from 'react';

export default function Label({label, active, handleLabelSelect}) {
  const extraProps = {};

  if (active) {
    extraProps['data-background-color'] = "orange"
  }

  return (
    <li {...extraProps} className="list-group-item rounded-0 border-right-0" onClick={handleLabelSelect}>
      {label.name}
    </li>
  );
}
