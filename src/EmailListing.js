import React from 'react';
import moment from 'moment';

export default function EmailListing({email, handleEmailClick, active}) {

  const extraProps = {};

  if (active) {
    extraProps['data-background-color'] = "orange"
  }

  return (
    <div {...extraProps} key={email.id} className="email-entry" onClick={handleEmailClick}>
      <p className="mb-0">
        <small>
          {email.from}
        </small>
      </p>
      <div className="mb-2 d-flex justify-content-between">
        <span>
          {email.subject}
        </span>
        <span>
          {moment(email.date).calendar()}
        </span>
      </div>
      <p className="mb-0">
        {email.snippet}
      </p>
    </div>
  );
}
