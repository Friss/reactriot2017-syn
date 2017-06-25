import React from 'react';
import backgroundImage from './img/header.jpg';

export default function Login({handleAuth, checkedSignIn}) {

  let content = (
    <div className="content">
      <button className="btn btn-primary btn-lg" onClick={handleAuth}>
        Login with Google
      </button>
    </div>

  );

  if (!checkedSignIn) {
    content = (<h1><i className="now-ui-icons loader_refresh spin" /></h1>);
  }

  return (
    <div className="page-header" data-filter-color="orange">
      <div className="page-header-image" style={{backgroundImage: `url(${backgroundImage})`}} />
      <div className="container">
        <div className="col-md-4 content-center">
          <div className="card card-login card-plain">
            <form className="form" method="" action="">
              <div className="header header-primary text-center">
                <div className="logo-container">
                  <span className="logo">SyN Mail</span>
                </div>
              </div>
              {content}
              <div className="footer text-center">
                <a href="https://groups.google.com/forum/#!forum/risky-access-by-unreviewed-apps" rel="noopener noreferrer" className="link" target="_blank">
                  You need to join this Google Group to sign in.
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
      <footer className="footer">
        <div className="container">
          <nav>
            <ul>
              <li>
                <a href="https://github.com/facebookincubator/create-react-app" rel="noopener noreferrer" target="_blank">
                  Create React App
                </a>
              </li>
              <li>
                <a href="http://demos.creative-tim.com/now-ui-kit/index.html#" rel="noopener noreferrer" target="_blank">
                  Now UI Kit
                </a>
              </li>
            </ul>
          </nav>
          <div className="copyright">
            © 2017, Created by <a href="https://friss.me" rel="noopener noreferrer" target="_blank">Zachary Friss</a> for <a href="https://reactriot.com" rel="noopener noreferrer" target="_blank">ReactRiot</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
