import React, { Component } from 'react';
import axios from 'axios';
import '../styles/Chatbot.css'; // Import the CSS file

class Chatbot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      options: [],
      response: '',
    };
  }

  handleInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  handleAddOption = (event) => {
    event.preventDefault();
    this.setState((prevState) => ({
      options: [...prevState.options, prevState.input],
      input: '',
    }));
  };

  handleGenerate = (event) => {
    event.preventDefault();
    axios.post('http://localhost:8000/api/generate', { options: this.state.options })
      .then((res) => this.setState({ response: res.data.response }))
      .catch((err) => console.log(err));
  };

  render() {
    return (
      <div className="chatbot-container">
        <form className="form-container" onSubmit={this.handleAddOption}>
          <input type="text" value={this.state.input} onChange={this.handleInputChange} />
          <button type="submit">Add Option</button>
        </form>
        <ul className="option-list">
          {this.state.options.map((option, index) => (
            <li key={index}>{option}</li>
          ))}
        </ul>
        <form onSubmit={this.handleGenerate}>
          <button className='button' type="submit">Generate Response</button>
        </form>
        <pre className="response">{this.state.response}</pre> {/* Use the pre tag to preserve newlines */}
        {console.log(this.state.response)}
      </div>
    );
  }
}

export default Chatbot;
