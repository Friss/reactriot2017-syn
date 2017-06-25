import React, {Component} from 'react';
import ReactDOM from 'react-dom';

class Frame extends Component {
  componentDidMount() {
    this.renderFrameContents();
  }

  componentDidUpdate() {
    this.renderFrameContents();
  }

  componentWillUnmount() {
    const content = ReactDOM.findDOMNode(this).contentDocument;
    if (content) {
      ReactDOM.unmountComponentAtNode(content.body);
    }
  }

  renderFrameContents() {
    const doc = ReactDOM.findDOMNode(this).contentDocument;

    if (!doc.body.childNodes.length) {
      const base = document.createElement("base");
      base.target = "_blank";
      doc.body.appendChild(base);

      const root = document.createElement("div");
      doc.body.appendChild(root);
      doc.body.style.margin = '0';
    }

    if(doc && doc.readyState === 'complete') {
      const contents = (
        <div>
          {this.props.children}
        </div>
      );

      ReactDOM.render(contents, doc.body.childNodes[0]);
    } else {
      setTimeout(this.renderFrameContents, 0);
    }
  }

  render() {
    const {children, ...rest} = this.props;

    return <iframe title="email" className="email-frame" {...rest} />
  }
}

export default Frame;
