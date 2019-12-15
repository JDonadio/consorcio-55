import { Component, OnInit } from '@angular/core';
import { SharingService } from 'src/services/sharing.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {

  public client: any;
  public monthCounter: number;
  public now: Date;
  public selectedDate: Date;
  public selectedDateStr: string;
  public years: any;
  private sub: any;

  constructor(
    private sharingService: SharingService,
  ) {
    this.now = new Date();
    this.monthCounter = this.now.getMonth();
    this.client = null;
  }

  ngOnInit() {
    this.selectedDate = new Date();
    this.selectedDateStr = this.selectedDate.toLocaleDateString('es-AR', { year: 'numeric', month: 'short' });

    this.sub = this.sharingService.currentClient.subscribe(client => {
      console.log(client.payments);
      this.client = client;
      this.processPayments();
    });
  }

  ionViewWillLeave() {
    console.log('Leaving the view')
    this.sub.unsubscribe();
  }

  public getPreviousMonthInformation() {
    this.monthCounter--;
    this.selectedDate.setMonth(this.monthCounter);
    if (this.monthCounter == -1) this.monthCounter = 11;
    this.selectedDateStr = this.selectedDate.toLocaleDateString('es-AR', { year: 'numeric', month: 'short' });
    this.processPayments();
  }

  public getNextMonthInformation() {
    this.monthCounter++;
    this.selectedDate.setMonth(this.monthCounter);
    if (this.monthCounter == 12) this.monthCounter = 0;
    this.selectedDateStr = this.selectedDate.toLocaleDateString('es-AR', { year: 'numeric', month: 'short' });
    this.processPayments();
  }

  private processPayments() {
    let months = this.client.payments && this.client.payments[this.selectedDate.getFullYear()];
    console.log('months:', months)
    console.log('months keys:', _.keys(months))
    let superTotal = 0;
    _.each(_.keys(months), month => {
      console.log('Processing month: ' + month);
      let payments = this.client.payments && this.client.payments[this.selectedDate.getFullYear()] 
        && this.client.payments[this.selectedDate.getFullYear()][month];
      let commons = _.cloneDeep(payments) || [];
      delete commons.extras;
      if (_.isEmpty(commons)) commons = [0];
      else commons = _.values(commons);
      console.log('commons:', commons)
      let extras = payments && payments.extras ? _.map(payments.extras, 'amount') : [0];
      console.log('extras:', extras)
      let total = _.concat(commons, extras);
      console.log('total:', total)
      let balance = _.sumBy(Array.from(_.values(total), v => Number(v)));
      console.log('balance:', balance)
      superTotal += balance;
    });
    console.log('superTotal:', superTotal)
  }
}
