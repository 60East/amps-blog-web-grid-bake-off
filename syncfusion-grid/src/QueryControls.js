import React, { Component } from 'react';


export class QueryControls extends Component {
    handleQueryRequest() {
        if (this.props.onQuery) {
            this.props.onQuery();
        }
    }

    render() {
        return (
            <div className="frame">
                <table>
                    <tbody>
                        <tr>
                            <td className="right"><label>Topic *: </label></td>
                            <td>
                                <select 
                                    value={this.props.messageType || ''} 
                                    name="messageType"
                                    onChange={({ target }) => this.props.onChange({messageType: target.value})}
                                >
                                    <option value="json">JSON</option>
                                    <option value="nvfix">NVFIX</option>
                                </select>

                                <input 
                                    type="text" 
                                    name="topic"
                                    value={this.props.topic || ''} 
                                    onChange={({ target }) => this.props.onChange({topic: target.value})}
                                />
                            </td>

                            <td className="right"><label>Filter: </label></td>
                            <td>
                                <input 
                                    type="text" 
                                    name="filter"
                                    value={this.props.filter || ''} 
                                    onChange={({ target }) => this.props.onChange({filter: target.value})}
                                />
                            </td>
                        </tr>

                        <tr>
                            <td className="right"><label>Top N: </label></td>
                            <td>
                                <input 
                                    type="text" 
                                    name="topN"
                                    placeholder="10"
                                    value={this.props.topN || ''} 
                                    onChange={({ target }) => this.props.onChange({topN: +target.value})}
                                />
                            </td>

                            <td className="right"><label>Order By: </label></td>
                            <td>
                                <input 
                                    type="text" 
                                    name="orderBy"
                                    value={this.props.orderBy || ''} 
                                    onChange={({ target }) => this.props.onChange({orderBy: target.value})}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                <br />

                {!this.props.loading && 
                <button onClick={this.handleQueryRequest.bind(this)}>Query and Subscribe</button>}

                {this.props.loading && 
                    <img alt="loading" id="loading-image" src="/assets/img/loading.gif" width="20" height="20" />}

                {this.props.error && <div id="error-label">{this.props.error}</div>}
            </div>
        )
    }
};
