// Angular
import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';
import '@angular/core';
import '@angular/common';

// RxJS
import 'rxjs';

// Application styles are bundled by webpack; webpack-dev-server does not serve
// the source assets directory as a static root.
import '../assets/index.css';

// ag-grid
import 'ag-grid-community/styles/ag-theme-quartz.css';

import 'ag-grid-angular';

// for ag-grid-enterprise users only 
//import 'ag-grid-enterprise/main';
