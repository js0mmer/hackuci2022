import React from 'react';

class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.handleUpload = this.handleUpload.bind(this);
    }

    handleUpload(event) {
        if (event.target.files && event.target.files[0]) {
            let img = event.target.files[0];
            let imgURL = URL.createObjectURL(img);
            // this.setState({
            //   image: URL.createObjectURL(img)
            // });
            const form = new FormData();
            form.append("image", img);
            // form.append("file", img);

            const request = {
                method: 'POST',
                body: form
            };

            fetch('http://localhost:8080/upload', request)
                .then(response => console.log(response.text()))
          }
    }

    render() {
        return (
            <div>
                <h1>hi</h1>
                <input type="file" name="image" onChange={this.handleUpload} />
            </div>
        );
    }
}

export default Upload;