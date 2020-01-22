import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SharingService } from 'src/services/sharing.service';
// import { Chart } from "chart.js";
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
  @ViewChild('balanceCanvas') balanceCanvas: ElementRef;

  public client: any;
  public yearCounter: number;
  public now: Date;
  public selectedDate: Date;
  public selectedDateStr: string;
  public totalCommons: any;
  public totalCommonsAmount: number;
  public totalCommonsArray: any;
  public totalExtras: any;
  public totalExtrasAmount: number;
  public totalExtrasArray: any;
  public byMonths: any;
  public months: any;
  public superTotal: number;
  public chart: any;
  private sub: any;

  constructor(
    private sharingService: SharingService,
  ) {
    this.now = new Date();
    this.yearCounter = this.now.getFullYear();
    this.client = null;
    this.totalCommons = {};
    this.totalExtras = {};
    this.totalCommonsAmount = 0;
    this.totalExtrasAmount = 0;
    this.byMonths = [];
    this.totalCommonsArray = [];
    this.totalExtrasArray = [];
    this.superTotal = 0;
    this.months = MONTHS;
    this.chart = null;
  }

  ngOnInit() {
    this.selectedDate = new Date();
    this.selectedDateStr = this.selectedDate.toLocaleDateString('es-AR', { year: 'numeric', month: 'short' });

    this.sub = this.sharingService.currentClient.subscribe(client => {
      if (_.isEmpty(client)) return;
      
      console.log(client.payments);
      this.client = client;
      this.processPayments();
    });
  }

  ionViewWillLeave() {
    this.sub.unsubscribe();
  }

  public getPreviousYearInformation() {
    this.yearCounter--;
    this.selectedDate.setFullYear(this.yearCounter);
    this.resetValues();
    this.processPayments();
  }

  public getNextYearInformation() {
    this.yearCounter++;
    this.selectedDate.setFullYear(this.yearCounter);
    this.resetValues();
    this.processPayments();
  }

  private resetValues() {
    this.totalCommons = {};
    this.totalExtras = {};
    this.totalCommonsAmount = 0;
    this.totalExtrasAmount = 0;
    this.byMonths = [];
    this.totalCommonsArray = [];
    this.totalExtrasArray = [];
    this.superTotal = 0;
  }

  private processPayments() {
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
    this.totalCommonsAmount = _.sumBy(Array.from(_.values(_.map(this.totalCommonsArray, 'amount')), v => Number(v)));
    this.totalExtrasAmount = _.sumBy(Array.from(_.values(_.map(this.totalExtrasArray, 'amount')), v => Number(v)));
    console.log('this.totalCommonsArray:', this.totalCommonsArray)
    console.log('this.totalExtrasArray:', this.totalExtrasArray)
    console.log('this.totalCommonsAmount:', this.totalCommonsAmount)
    console.log('this.totalExtrasAmount:', this.totalExtrasAmount)
    console.log('this.byMonths:', this.byMonths)
    console.log('this.superTotal:', this.superTotal)

    // this.drawChart();
  }

  // private drawChart() {
  //   let commons = _.sumBy(Array.from(_.values(_.map(this.totalCommonsArray, 'amount')), v => Number(v)));
  //   let extras = _.sumBy(Array.from(_.values(_.map(this.totalExtrasArray, 'amount')), v => Number(v)));
  //   let y = [commons, extras, this.superTotal];
  //   let x = ['Gastos comunes', 'Gastos extras', 'Total anual'];

  //   // If a chart is already drew, clean chart object it before re-draw it
  //   if (this.chart) {
  //     this.chart.destroy();
  //     this.chart = null;
  //   }

  //   this.chart = new Chart(this.balanceCanvas.nativeElement, {
  //     type: "doughnut",
  //     data: {
  //       labels: x,
  //       datasets: [
  //         {
  //           data: y,
  //           backgroundColor: [
  //             "rgba(255, 99, 132, 0.65)",
  //             "rgba(54, 162, 235, 0.65)",
  //             "rgba(255, 206, 86, 0.65)",
  //           ],
  //           hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
  //         }
  //       ]
  //     }
  //   });
  // }
}
