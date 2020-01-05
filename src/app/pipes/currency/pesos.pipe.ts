import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'pesos'
})
export class PesosPipe extends CurrencyPipe implements PipeTransform {

  transform(value: any): any {
    if (!value || value == '') value = 0;
    
    return super.transform(value, 'ARS', 'symbol', '1.2-2');
  }

}
