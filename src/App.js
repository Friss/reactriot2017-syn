import React, { Component } from 'react';
import './App.css';
import EmailApp from './EmailApp';
import Login from './Login';
import debounce from 'lodash/debounce';

var CLIENT_ID = '126491382444-n5o52948rnv5js3sadpkgtc1ivq7hcvv.apps.googleusercontent.com';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
var SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

function getEmail(messageId) {
  return window.gapi.client.gmail.users.messages.get({
    'userId': 'me',
    'id': messageId,
    format: 'metadata'
  });
}

function parseEmail({id, result}) {
  var message = {
    id,
    labels: result.labelIds,
    from: '',
    to: '',
    subject: '',
    date: '',
    snippet: result.snippet
  };

  result.payload.headers.forEach((header) => {
    switch (header.name) {
      case "From": {
        message.from = header.value
        break;
      }
      case "Date": {
        message.date = header.value;
        break;
      }
      case "To": {
        message.to = header.value;
        break;
      }
      case "Subject": {
        message.subject = header.value;
        break;
      }
      default: {
        break;
      }
    }
  })
  return message;
}

function parseMessages(messagesMap) {
  var messages = [];
  for (var id in messagesMap) {
    messages.push(parseEmail(messagesMap[id]))
  }
  return messages
}

function getBody(message) {
  var encodedBody = '';
  if(typeof message.parts === 'undefined')
  {
    encodedBody = message.body.data;
  }
  else
  {
    encodedBody = getHTMLPart(message.parts);
  }
  encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
  return decodeURIComponent(escape(window.atob(encodedBody)));
}

function getHTMLPart(arr) {
  for(var x = 0; x <= arr.length; x++)
  {
    if(typeof arr[x].parts === 'undefined')
    {
      if(arr[x].mimeType === 'text/html')
      {
        return arr[x].body.data;
      }
    }
    else
    {
      return getHTMLPart(arr[x].parts);
    }
  }
  return '';
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      checkedSignIn: false,
      isSignedIn: false,
      labels: [],
      emails: [],
      selectedLabel: 'INBOX',
      selectedEmail: null,
      hasFetched: false,
      profile: {
        name: '',
        email: '',
        imageUrl: '',
      }
    }

    this.initClient = this.initClient.bind(this);
    this.updateSigninStatus = this.updateSigninStatus.bind(this);
    this.handleAuthClick = this.handleAuthClick.bind(this);
    this.handleSignoutClick = this.handleSignoutClick.bind(this);
    this.handleEmailSelect = this.handleEmailSelect.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleLabelSelect = this.handleLabelSelect.bind(this);
    this.getEmailMetaData = this.getEmailMetaData.bind(this);
    this.deboucedGetEmails = debounce(this.getEmails, 250);
  }

  componentDidMount() {
    window.gapi.load('client:auth2', this.initClient);
  }

  initClient() {
    window.gapi.client.init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES
    }).then(() => {
      window.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);
      this.updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
    });
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  updateSigninStatus(isSignedIn) {
    this.setState({isSignedIn, checkedSignIn: true})
    if (isSignedIn) {
      const googleUser = window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();

      const profile = {
        name: googleUser.getName(),
        email: googleUser.getEmail(),
        imageUrl: googleUser.getImageUrl()
      }

      this.setState({profile})

      this.getLabels();
      this.getEmails('me', '', this.state.selectedLabel, this.getEmailMetaData)
    }
  }

  getEmailMetaData(results) {
    if (results.length === 1 && results[0] === undefined) {
      this.setState({emails: [], hasFetched: true})
    }

    var batch = window.gapi.client.newBatch();
    results.forEach((email) => {
      if (!email) {
        return;
      }
      batch.add(getEmail(email.id), {'id': email.id});
    });

    batch.execute((responseMap, rawBatchResponse) => {
      this.setState({emails: parseMessages(responseMap), hasFetched: true})
    })
  }

  getLabels() {
    window.gapi.client.gmail.users.labels.list({
      'userId': 'me'
    }).then((response) => {
      var labels = response.result.labels;
      this.setState({labels})
    });
  }

  getEmails(userId, query, label, callback) {
    var getPageOfEmails = (request, result) => {
      request.execute(function(resp) {
        result = result.concat(resp.messages);
        var nextPageToken = resp.nextPageToken;
        if (nextPageToken) {
          request = window.gapi.client.gmail.users.messages.list({
            'userId': userId,
            'pageToken': nextPageToken,
            'q': query,
            labelIds: label
          });
          callback(result)
          // getPageOfEmails(request, result);
        } else {
          callback(result);
        }
      });
    };
    var initialRequest = window.gapi.client.gmail.users.messages.list({
      'userId': userId,
      'q': query,
      labelIds: label,
      maxResults: 50
    });
    getPageOfEmails(initialRequest, []);
  }

  handleLabelSelect(selectedLabel) {
    this.setState({selectedLabel});
    this.getEmails('me', '', selectedLabel, this.getEmailMetaData);
  }

  handleEmailSelect(selectedId) {
    var request = window.gapi.client.gmail.users.messages.get({
      'userId': 'me',
      'id': selectedId
    });
    request.execute((email) => {
      this.setState({ selectedEmail: {
        body: getBody(email.payload),
        details: parseEmail(email)
        }
      });
    });
  }

  handleSearch(evt) {
    const searchQuery = evt.target.value;
    this.setState({searchQuery});
    this.deboucedGetEmails('me', searchQuery, this.state.selectedLabel, this.getEmailMetaData);
  }

  /**
   *  Sign in the user upon button click.
   */
  handleAuthClick(event) {
    event.preventDefault();
    window.gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  handleSignoutClick(event) {
    window.gapi.auth2.getAuthInstance().signOut();
    this.setState({
      isSignedIn: false,
      labels: [],
      emails: [],
      selectedEmail: null,
      profile: {
        name: '',
        email: '',
        imageUrl: '',
      }
    });
  }

  renderLogin() {
    const {isSignedIn, checkedSignIn} = this.state;

    if (isSignedIn) {
      return null;
    }

    return (
      <Login handleAuth={this.handleAuthClick} checkedSignIn={checkedSignIn} />
    );
  }

  renderEmailApp() {
    const {emails, labels, profile, isSignedIn, selectedEmail, selectedLabel, hasFetched} = this.state;

    if (!isSignedIn) {
      return null;
    }

    return (
      <EmailApp
        profile={profile}
        emails={emails}
        labels={labels}
        selectedEmail={selectedEmail}
        selectedLabel={selectedLabel}
        handleLabelSelect={this.handleLabelSelect}
        handleEmailSelect={this.handleEmailSelect}
        handleSignoutClick={this.handleSignoutClick}
        handleSearch={this.handleSearch}
        hasFetched={hasFetched}
      />
    );
  }

  render() {
    return (
      <div className="App">
        {this.renderLogin()}
        {this.renderEmailApp()}
      </div>
    );
  }
}

export default App;
