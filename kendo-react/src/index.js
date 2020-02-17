'use strict';

import React from 'react';
import {render} from 'react-dom';

// Simple title() function for strings
String.prototype.toTitleCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// our application
import AMPSGrid from './AMPSGrid';

document.addEventListener('DOMContentLoaded', () => {
    render(<AMPSGrid/>, document.querySelector('#app'));
});

