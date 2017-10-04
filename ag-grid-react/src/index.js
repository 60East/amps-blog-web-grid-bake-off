'use strict';

import React from 'react';
import {render} from 'react-dom';

// pull in the ag-grid styles we're interested in
import 'ag-grid-root/dist/styles/ag-grid.css';
import 'ag-grid-root/dist/styles/theme-fresh.css';

// only necessary if you're using ag-Grid-Enterprise features
// import "ag-grid-enterprise";

// Simple title() function for strings
String.prototype.toTitleCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// our application
import AMPSGrid from './AMPSGrid';

document.addEventListener('DOMContentLoaded', () => {
    render(<AMPSGrid/>, document.querySelector('#app'));
});

