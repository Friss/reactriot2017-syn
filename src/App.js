import React, { Component } from 'react';
import './App.css';
import moment from 'moment';
import logo from "./logo.svg";

// Client ID and API key from the Developer Console
var CLIENT_ID = '126491382444-n5o52948rnv5js3sadpkgtc1ivq7hcvv.apps.googleusercontent.com';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

function getMessage(messageId) {
  return window.gapi.client.gmail.users.messages.get({
    'userId': 'me',
    'id': messageId,
    format: 'metadata'
  });
}

function parseMessage({id, result}) {
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
    messages.push(parseMessage(messagesMap[id]))
  }
  return messages
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      isSignedIn: false,
      labels: [],
      messages: [],
      selectedId: null,
      selectedMessage: null,
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
      // Listen for sign-in state changes.
      window.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

      // Handle the initial sign-in state.
      this.updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
    });
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  updateSigninStatus(isSignedIn) {
    this.setState({isSignedIn})
    if (isSignedIn) {
      const googleUser = window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();

      const profile = {
        name: googleUser.getName(),
        email: googleUser.getEmail(),
        imageUrl: googleUser.getImageUrl()
      }

      this.setState({profile})

      this.listLabels();
      this.listMessages('me', '', (results) => {
        var batch = window.gapi.client.newBatch();
        results.forEach((message) => {
          batch.add(getMessage(message.id), {'id': message.id});
        })

        batch.execute((responseMap, rawBatchResponse) => {
          console.log("responseMap", responseMap)
          this.setState({messages: parseMessages(responseMap)})
        })
      })
    }
  }

  listLabels() {
    window.gapi.client.gmail.users.labels.list({
      'userId': 'me'
    }).then((response) => {
      var labels = response.result.labels;
      this.setState({labels})
    });
  }

  listMessages(userId, query, callback) {
    var getPageOfMessages = (request, result) => {
      request.execute(function(resp) {
        result = result.concat(resp.messages);
        var nextPageToken = resp.nextPageToken;
        if (nextPageToken) {
          request = window.gapi.client.gmail.users.messages.list({
            'userId': userId,
            'pageToken': nextPageToken,
            'q': query
          });
          callback(result)
          // getPageOfMessages(request, result);
        } else {
          callback(result);
        }
      });
    };
    var initialRequest = window.gapi.client.gmail.users.messages.list({
      'userId': userId,
      'q': query
    });
    getPageOfMessages(initialRequest, []);
  }

  handleMessageClick(selectedId) {
    this.setState({selectedId});
  }

  /**
   *  Sign in the user upon button click.
   */
  handleAuthClick(event) {
    window.gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  handleSignoutClick(event) {
    window.gapi.auth2.getAuthInstance().signOut();
  }

  render() {
    return (
      <div className="App">
        <div className="row main-grid">
          <div className="col-md-2">
            <div className="d-flex flex-column column-section">
              <div className="column-header">
                <button className="btn btn-info btn-lg rounded-0 w-100">Compose</button>
              </div>
              <div className="column-content">
                <ul className="list-group">
                  {this.state.labels.map((label) => {
                    return (
                      <li className="list-group-item" key={label.id}>
                        {label.name}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="column-footer border border-left-0 border-bottom-0 pt-2 pb-2 pl-2 pr-2">
                <div className="media">
                  <img className="d-flex mr-2 rounded-circle box-shadow" width="64" src={this.state.profile.imageUrl} alt="Generic placeholder image" />
                  <div className="media-body">
                    <p className="mb-0">{this.state.profile.name}</p>
                    <p>{this.state.profile.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex flex-column column-section">
              <div className="column-header">
                <div className="input-group form-group-with-border mb-0 pb-2 pt-2 pl-2 pr-2" data-background-color="orange">
                  <input type="text" className="form-control" placeholder="Search" />
                  <span className="input-group-addon">
                    <i className="now-ui-icons ui-1_zoom-bold" />
                  </span>
                </div>
              </div>
              <div className="column-content">
                {this.state.messages.map((message) => {
                  return (
                    <div key={message.id} className="email-entry" onClick={this.handleMessageClick.bind(this, message.id)}>
                      <p className="mb-0"><small>{message.from}</small></p>
                      <div className="mb-2 d-flex justify-content-between">
                        <span>{message.subject}</span>
                        <span>{moment(message.date).calendar()}</span>
                      </div>
                      <p className="mb-0">{message.snippet}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            {this.state.selectedId}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
