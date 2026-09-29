import { NgModule }      from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { TableModule } from 'primeng/table';

import { AmpsService } from './app.amps.service';
import { AppComponent }  from './app.component';
import { TableViewComponent } from './app.table.component';

@NgModule({
    providers: [AmpsService],
    imports: [BrowserModule, BrowserAnimationsModule, TableModule],
    declarations: [AppComponent, TableViewComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }
