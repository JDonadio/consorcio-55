import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ExpirationPage } from './expiration.page';
import { SharedModule } from '../shared/shared-module.module';

const routes: Routes = [
  {
    path: '',
    component: ExpirationPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ExpirationPage]
})
export class ExpirationPageModule {}
