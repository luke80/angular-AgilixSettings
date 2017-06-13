import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './services/auth.service'

@Component({
  template: `
    <div *ngIf="!authService.currentUser">
      <h1>Please login to access this tool</h1>
      <button md-raised-button class="app-sidebar-button" [routerLink]="['/login']">
        <md-icon class="example-icon">verified_user</md-icon>
        Login            
      </button>
    </div>
    <div *ngIf="authService.currentUser">
      <h1>Welcome {{authService.currentUser?.firstName}}</h1>
    </div>
  `
})

export class WelcomeComponent implements OnInit {
  constructor(private authService:AuthService, private router: Router) {

  }

  ngOnInit() {

  }

  openLogin() {

  }
}