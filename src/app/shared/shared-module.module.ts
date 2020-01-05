import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  
import { CapitalizePipe } from '../pipes/capitalize/capitalize.pipe';
import { PesosPipe } from '../pipes/currency/pesos.pipe';

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
  ],
  exports: [
    CapitalizePipe,
    PesosPipe,
  ],
  entryComponents: [
  ],
  providers: [
  ]
})
export class SharedModule {}