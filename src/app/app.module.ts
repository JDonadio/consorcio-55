import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireDatabase } from '@angular/fire/database';

import localeEsAr from '@angular/common/locales/es-AR';

const firebaseConfig = {
  apiKey: "AIzaSyCLYOiEOeR4uMAtL6VhjpA542t87dmXDxE",
  authDomain: "consorcio-55.firebaseapp.com",
  databaseURL: "https://consorcio-55.firebaseio.com",
  projectId: "consorcio-55",
  storageBucket: "",
  messagingSenderId: "262848398815",
  appId: "1:262848398815:web:cba6e0c52ea52967"
};

registerLocaleData(localeEsAr, 'es-Ar');

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'es-Ar' },
    AngularFireDatabase
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
