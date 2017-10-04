// app.module.ts 
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgGridModule } from 'ag-grid-angular/main';
import { AmpsService } from './app.amps.service';
import { AMPSGrid } from './app.amps.grid.component';
import { QueryControls } from './app.query.controls.component';

enableProdMode();

@NgModule({
    providers: [AmpsService],
    imports: [
        BrowserModule,
        FormsModule,
        AgGridModule.withComponents([])
    ],
    declarations: [AMPSGrid, QueryControls],
    bootstrap: [AMPSGrid]
})
export class AppModule {}
