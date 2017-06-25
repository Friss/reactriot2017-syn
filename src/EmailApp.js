import React, {Component} from 'react';
import Label from './Label';
import Column from './Column';
import EmailListing from './EmailListing';
import Profile from './Profile';
import Frame from './Frame';
import gravatar from 'gravatarjs';
import moment from 'moment';

export default class EmailApp extends Component {
  constructor() {
    super();

    this.renderLabel = this.renderLabel.bind(this);
    this.renderEmailListing = this.renderEmailListing.bind(this);
  }
  renderLabel(label) {
    const {selectedLabel, handleLabelSelect} = this.props;

    return (
      <Label key={label.id} label={label} active={label.id === selectedLabel} handleLabelSelect={handleLabelSelect.bind(null, label.id)} />
    );
  }

  renderUserProfile() {
    const {profile, handleSignoutClick} = this.props;

    return (
      <Profile
        width="64"
        imageUrl={profile.imageUrl}
        alt={profile.name}
      >
        <p className="mb-0">{profile.name}</p>
        <p>{profile.email}</p>
        <a className="link" onClick={handleSignoutClick}>Sign out</a>
      </Profile>
    );
  }

  renderSearchBar() {
    return (
      <div className="input-group form-group-with-border mb-0 pb-2 pt-2 pl-2 pr-2" data-background-color="orange">
        <input type="text" className="form-control" placeholder="Search" onChange={this.props.handleSearch} />
        <span className="input-group-addon">
          <i className="now-ui-icons ui-1_zoom-bold" />
        </span>
      </div>
    );
  }

  renderEmailListing(email) {
    const {handleEmailSelect, selectedEmail} = this.props;

    const active = selectedEmail && email.id === selectedEmail.details.id;

    return (
      <EmailListing
        active={active}
        key={email.id}
        email={email}
        handleEmailClick={handleEmailSelect.bind(null, email.id)}
      />
    );
  }

  renderNoResults() {
    const {emails, hasFetched} = this.props;

    if (emails.length > 0) {
      return null;
    }

    if (!hasFetched) {
      return (
        <h1 className="text-center mt-4">
          <i className="now-ui-icons loader_refresh spin" />
        </h1>
      );
    }

    return (
      <p className="mt-4 text-center">No results</p>
    );
  }

  renderEmailDetails() {
    const {selectedEmail} = this.props;

    if (!selectedEmail) {
      return null;
    }

    let emailAddress = selectedEmail.details.from;

    if (emailAddress.indexOf('<') > -1) {
      emailAddress = emailAddress.split('<')[1].split('>')[0];
    }

    return (
      <Profile
        width="75"
        imageUrl={gravatar(emailAddress, {size: 75, rating: 'x', backup: 'retro', secure: true})}
        alt={emailAddress}
      >
        <h3 className="mb-0">
          {selectedEmail.details.subject}
        </h3>
        <p className="mb-0">
          {selectedEmail.details.from}
        </p>
        <p className="mb-0">
          <small>
            {moment(selectedEmail.details.date).calendar()}
          </small>
        </p>
      </Profile>
    );
  }

  renderEmail() {
    const {selectedEmail} = this.props;

    if (!selectedEmail) {
      return null;
    }

    return (
      <Frame>
        <div dangerouslySetInnerHTML={{__html: selectedEmail.body}} />
      </Frame>
    );
  }

  renderReply() {
    const {selectedEmail} = this.props;

    if (!selectedEmail) {
      return null;
    }

    return (
      <textarea
        className="form-control"
        placeholder="Reply..."
        rows="3"
      />
    );
  }

  render() {
    const {labels, emails, selectedEmail} = this.props;

    const secondColumn = selectedEmail ? 'col-md-4' : 'col-md-10';

    return (
      <div className="row main-grid">
        <div className="col-md-2">
          <Column
            columnClasses="border border-left-0 border-bottom-0 border-top-0"
            header={<button className="btn btn-info btn-lg rounded-0 w-100">Compose</button>}
            footer={this.renderUserProfile()}
            footerClasses="border border-left-0 border-right-0 border-bottom-0 pt-2 pb-2 pl-2 pr-2"
          >
            <ul className="list-group rounded-0 border-right-0">
              {labels.filter((label) => label.labelListVisibility === "labelShow").map(this.renderLabel)}
            </ul>
          </Column>
        </div>
        <div className={secondColumn}>
          <Column
            header={this.renderSearchBar()}
            columnClasses="border border-left-0 border-bottom-0 border-top-0"
          >
            {emails.map(this.renderEmailListing)}
            {this.renderNoResults()}
          </Column>
        </div>
        <div className="col-md-6">
          <Column
            header={this.renderEmailDetails()}
            headerClasses="pt-4 pb-4 pl-2"
            footer={this.renderReply()}
            footerClasses="pt-2 pl-4 pr-4"
          >
            {this.renderEmail()}
          </Column>
        </div>
      </div>
    );
  }
}
