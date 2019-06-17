import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

  transform(value: any, capitalizeAll?: boolean): any {
    if (!value || value == '') return null;

    if (capitalizeAll) {
      let words = value.toLowerCase().split(' ');
      let result: any = [];
      words.forEach(w => result = [...result, w.charAt(0).toUpperCase() + w.slice(1)]);
      return result.join(' ');
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }

}
