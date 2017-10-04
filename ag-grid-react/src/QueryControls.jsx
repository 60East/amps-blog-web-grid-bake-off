import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class QueryControls extends Component {
    constructor(props) {
        super(props);

        this.state = {
            topic: '',
            messageType: '',
            filter: '',
            topN: '',
            orderBy: '',

            // Errors
            errorLabel: ''
        }
    }

    componentDidMount() {
        this.props.onInit(this);
    }

    didFinish(error) {
        // Hide loading image
        document.getElementById('loading-image').style.display = 'none';

        if (error) {
            this.setState({errorLabel: error.message.toTitleCase()});
        }
    }

    handleFormInput(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleQueryRequest() {
        // show loading image
        document.getElementById('loading-image').style.display = 'inline-block';
        this.setState({errorLabel: ''});

        this.props.onQuery(this.state);
    }

    render() {
        return (
            <div>
                <div className="frame">
                    <table>
                        <tbody>
                            <tr>
                                <td className="right"><label>Topic *: </label></td>
                                <td>
                                    <select 
                                        value={this.state.messageType} 
                                        name="messageType"
                                        onChange={this.handleFormInput.bind(this)}
                                    >
                                        <option value="json">JSON</option>
                                        <option value="nvfix">NVFIX</option>
                                    </select>

                                    <input 
                                        type="text" 
                                        name="topic"
                                        value={this.state.topic} 
                                        onChange={this.handleFormInput.bind(this)}
                                    />
                                </td>

                                <td className="right"><label>Filter: </label></td>
                                <td>
                                    <input 
                                        type="text" 
                                        name="filter"
                                        value={this.state.filter} 
                                        onChange={this.handleFormInput.bind(this)}
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td className="right"><label>Top N: </label></td>
                                <td>
                                    <input 
                                        type="text" 
                                        name="topN"
                                        value={this.state.topN} 
                                        onChange={this.handleFormInput.bind(this)}
                                    />
                                </td>

                                <td className="right"><label>Order By: </label></td>
                                <td>
                                    <input 
                                        type="text" 
                                        name="orderBy"
                                        value={this.state.orderBy} 
                                        onChange={this.handleFormInput.bind(this)}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <br />

                    <button onClick={this.handleQueryRequest.bind(this)}>Query and Subscribe</button>
                    <img id="loading-image" src="/assets/img/loading.gif" width="20" height="20" hidden />
                </div>

                <div id="error-label">{this.state.errorLabel}</div>
            </div>
        )
    }
};


QueryControls.propTypes = {
    onInit: PropTypes.func.isRequired,
    onQuery: PropTypes.func.isRequired
}

