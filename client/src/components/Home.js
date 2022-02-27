import React from 'react';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
    }

    handleLogin(event) {

    }

    render() {
        return (
            <div>
                <h1>hello world</h1>
                <button onClick={this.handleLogin}>Login</button>
            </div>
        );
    }
}

export default Home;