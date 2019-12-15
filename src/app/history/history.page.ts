import { Component, OnInit } from '@angular/core';
import { SharingService } from 'src/services/sharing.service';
import * as _ from 'lodash';

const MONTHS = {
  '01': 'Enero',
  '02': 'Febrero',
  '03': 'Marzo',
  '04': 'Abril',
  '05': 'Mayo',
  '06': 'Junio',
  '07': 'Julio',
  '08': 'Agosto',
  '09': 'Septiembre',
  '10': 'Octubre',
  '11': 'Noviemebre',
  '12': 'Diciembre',
};

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
  public totalCommons: any;
  public totalCommonsArray: any;
  public totalExtras: any;
  public totalExtrasArray: any;
  public byMonths: any;
  public months: any;
  public superTotal: number;
  private sub: any;

  constructor(
    private sharingService: SharingService,
  ) {
    this.now = new Date();
    this.monthCounter = this.now.getMonth();
    this.client = null;
    this.totalCommons = {};
    this.totalExtras = {};
    this.byMonths = [];
    this.totalCommonsArray = [];
    this.totalExtrasArray = [];
    this.superTotal = 0;
    this.months = MONTHS;
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
    // let months = this.client.payments && this.client.payments[this.selectedDate.getFullYear()];
    // console.log('months:', months)
    // console.log('months keys:', _.keys(months))
    
    _.each(_.keys(this.months), month => {
      console.log('Processing month: ' + month);
      let payments = this.client.payments && this.client.payments[this.selectedDate.getFullYear()] 
        && this.client.payments[this.selectedDate.getFullYear()][month];
      let commons = _.cloneDeep(payments) || [];
      delete commons.extras;

      console.log('commons before:', commons)
      _.each(_.keys(commons), ck => this.totalCommons[ck] = Number((this.totalCommons[ck] || 0)) + Number(commons[ck]));
      console.log('this.totalCommons', this.totalCommons);
      
      if (_.isEmpty(commons)) commons = [0];
      else commons = _.values(commons);
      console.log('commons:', commons)

      let _extras = payments && payments.extras || [];
      console.log('extras before:', _extras)
      _.each(_extras, e => this.totalExtras[e.details] = Number((this.totalExtras[e.details] || 0)) + Number(e.amount));
      console.log('this.totalExtras', this.totalExtras);

      let extras = payments && payments.extras ? _.map(payments.extras, 'amount') : [0];
      console.log('extras:', extras)
      
      let total = _.concat(commons, extras);
      console.log('total:', total)
      let balance = _.sumBy(Array.from(_.values(total), v => Number(v)));
      console.log('balance:', balance)
      
      this.byMonths.push({
        key: month,
        name: this.months[month],
        commons: _.sumBy(Array.from(_.values(commons), v => Number(v))),
        extras: _.sumBy(Array.from(_.values(extras), v => Number(v))),
        balance
      });

      this.superTotal += balance;
    });
    
    this.byMonths = _.orderBy(this.byMonths, ['key'], ['desc']);
    _.each(_.keys(this.totalCommons), tck => this.totalCommonsArray.push({ name: tck, amount: this.totalCommons[tck] }));
    _.each(_.keys(this.totalExtras), tek => this.totalExtrasArray.push({ name: tek, amount: this.totalExtras[tek] }));
    console.log('this.totalCommonsArray:', this.totalCommonsArray)
    console.log('this.totalExtrasArray:', this.totalExtrasArray)
    console.log('this.byMonths:', this.byMonths)
    console.log('this.superTotal:', this.superTotal)
  }
}
