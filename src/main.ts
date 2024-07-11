import 'zone.js/dist/zone';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { BatailleNavaleModule } from './bataille-navale/bataille-navale.module';

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule, BatailleNavaleModule],
  template: `
    <h1>Bataille navale</h1>
    <app-game></app-game>
  `,
})
export class App {
  
}

bootstrapApplication(App);
