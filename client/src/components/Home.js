import React from 'react';

class Home extends React.Component {
  // constructor(props) {
  //     super(props);
  // }

  componentDidMount() {
  }

  render() {
    return (
      <div>
        <h1>hello world</h1>
        <a href="http://localhost:8080/login">Login</a>
      </div>
    );
  }
}

export default Home;