import { Component } from '@angular/core';

@Component({
    selector: 'my-app',
    template: `
        <h1>{{ title }}</h1>
        <amps-table>Loading...</amps-table>
    `,
})
export class AppComponent {
    title: string = 'AMPS SOW Table Demo';
}

