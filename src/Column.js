import React from 'react';

export default function Column({header, children, footer, columnClasses, headerClasses, contentClasses, footerClasses}) {
  return (
    <div className={`d-flex flex-column column-section ${columnClasses}`}>
      <div className={`column-header ${headerClasses}`}>
        {header}
      </div>
      <div className={`column-content ${contentClasses}`}>
        {children}
      </div>
      <div className={`column-footer ${footerClasses}`}>
        {footer}
      </div>
    </div>
  );
}
