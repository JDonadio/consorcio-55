import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

import localeEsAr from '@angular/common/locales/es-AR';
import { TokenInterceptor } from 'src/services/token-interceptor';

const firebaseConfig = {
  apiKey: "AIzaSyCLYOiEOeR4uMAtL6VhjpA542t87dmXDxE",
  authDomain: "consorcio-55.firebaseapp.com",
  databaseURL: "https://consorcio-55.firebaseio.com",
  projectId: "consorcio-55",
  storageBucket: "consorcio-55.appspot.com",
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
    AngularFirestoreModule,
    AngularFireStorageModule,
    HttpClientModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'es-Ar' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    AngularFireDatabase
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
