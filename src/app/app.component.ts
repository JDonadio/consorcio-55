import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { SharingService } from 'src/services/sharing.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public isLoggedIn: boolean;
  public appPages = [
    {
      title: 'Inicio',
      url: '/home',
      icon: 'home'
    },
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private authService: AuthService,
    private sharingService: SharingService,
  ) {
    this.sharingService.currentUser.subscribe(user => {
      this.isLoggedIn = user;
    });
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  checkStatus() {
    this.router.navigate(['/expiration']);
  }

  add() {
    this.router.navigate(['/add']);
  }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.authService.logout();
  }
}
