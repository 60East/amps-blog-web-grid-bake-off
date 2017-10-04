import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DataTableModule  } from 'primeng/primeng';

import { AmpsService } from './app.amps.service';
import { AppComponent }  from './app.component';
import { TableViewComponent } from './app.table.component';

@NgModule({
    providers: [AmpsService],
    imports: [BrowserModule, DataTableModule],
    declarations: [AppComponent, TableViewComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }
