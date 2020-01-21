import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  
import { CapitalizePipe } from '../pipes/capitalize/capitalize.pipe';
import { PesosPipe } from '../pipes/currency/pesos.pipe';
import { ClientFormComponent } from './client-form/client-form.component';
import { ConsortiumFormComponent } from './consortium-form/consortium-form.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
  ],
  declarations: [
    CapitalizePipe,
    PesosPipe,
    ClientFormComponent,
    ConsortiumFormComponent,
  ],
  exports: [
    CapitalizePipe,
    PesosPipe,
    ClientFormComponent,
    ConsortiumFormComponent,
  ],
  entryComponents: [
  ],
  providers: [
  ]
})
export class SharedModule {}