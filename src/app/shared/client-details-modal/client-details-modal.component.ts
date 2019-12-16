import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FirebaseService } from 'src/services/firebase.service';
import { MessagesService } from 'src/services/messages.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireDatabase } from 'angularfire2/database';
import { SharingService } from 'src/services/sharing.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-client-details-modal',
  templateUrl: './client-details-modal.component.html',
  styleUrls: ['./client-details-modal.component.scss'],
})
export class ClientDetailsModalComponent implements OnInit {

  public client: any;
  public data: any;
  public clientForm: FormGroup;
  public editMode: boolean;
  public currentYear: number;
  public monthCounter: number;
  public now: Date;
  public selectedDate: Date;
  public selectedDateStr: string;
  private sub: any;
  
  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private firebaseService: FirebaseService,
    private messagesService: MessagesService,
    private formBuilder: FormBuilder,
    private router: Router,
    private db: AngularFireDatabase,
    private sharingService: SharingService,
  ) {
    this.currentYear = new Date().getFullYear();
    this.now = new Date();
    this.sub = this.db.object('clients/' + this.navParams.data.key).valueChanges().subscribe((client: any) => {
      if (_.isEmpty(client)) return;
      this.client = _.cloneDeep(client);
      this.data = _.cloneDeep(client);
      this.processPayments();
      this.setClientForm(client);
      this.sharingService.setClient(client);
    });
  }
  
  ngOnInit() {
    this.editMode = false;
    this.monthCounter = this.now.getMonth();
    this.selectedDate = new Date();
    this.selectedDateStr = this.selectedDate.toLocaleDateString('es-AR', { year: 'numeric', month: 'short' });
  }

  ionViewWillLeave() {
    this.sub.unsubscribe();
  }

  private setClientForm(client: any) {
    this.clientForm = this.formBuilder.group({
      name: [client.name, Validators.required],
      type: [client.type, Validators.required],
      owner: [client.owner, Validators.required],
      address: [client.address, Validators.required],
      contractURL: [client.contractURL, Validators.required], // File URL
      dateContractFrom: [client.dateContractFrom, Validators.required],
      dateContractTo: [client.dateContractTo, Validators.required],
    });
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

  public async addPayment(service: string, serviceKey: string) {
    let obj: any = {
      title: service,
      inputs: [{ name: service, type: 'number', min: 0, placeholder: '$' }]
    };

    if (serviceKey == 'extras' || serviceKey == 'services') obj.inputs.push({ name: 'detail', type: 'text', placeholder: 'Detalle' });
    let resp = await this.messagesService.showInputConfirm(obj);
    if (_.isEmpty(resp[0])) return;
    
    let opts: any = {};
    if (serviceKey == 'extras' || serviceKey == 'services') {
      if (_.isEmpty(resp[1])) return;

      let amounts = this.data.payments && this.data.payments[serviceKey] || [];
      amounts.push({ amount: resp[0], details: resp[1] });
      opts[serviceKey] = amounts;
    } else opts[serviceKey] = resp[0];

    let year = this.selectedDate.getFullYear();
    let month = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0');

    try {
      await this.firebaseService.updateObject(`clients/${this.navParams.data.key}/payments/${year}/${month}`, opts);
      this.processPayments();
      this.messagesService.showToast({ msg: `El pago ha sido agregado correctamente!` });
    } catch (err) {
      console.log(err);
      this.messagesService.showToast({ msg: 'Ha ocurrido un error. No se pudo realizar el pago.' });
    }
  }

  public async askForRemove() {
    let resp = await this.messagesService.showConfirm(
      { title: 'Eliminar cliente', msg: `¿Estás seguro de eliminar a ${this.data.name.toUpperCase()}?` }
    );

    if (!resp) return;

    try {
      this.firebaseService.removeObject(`clients/${this.navParams.data.key}`);
      this.messagesService.showToast({ msg: `El cliente ${this.data.name} ha sido eliminado correctamente!` });
      this.modalCtrl.dismiss();
    } catch (err) {
      console.log(err);
      this.messagesService.showToast({ msg: 'Ha ocurrido un error. No se pudo eliminar el cliente.' });
    }
  }

  public async askForEdit() {
    let resp = await this.messagesService.showConfirm(
      { title: 'Editar cliente', msg: `¿Estás seguro de editar a ${this.data.name.toUpperCase()}?` }
    );

    if (!resp) return;

    let opts = {
      name: this.clientForm.get('name').value,
      type: this.clientForm.get('type').value,
      owner: this.clientForm.get('owner').value,
      address: this.clientForm.get('address').value,
      contractURL: this.clientForm.get('contractURL').value,
      dateContractFrom: this.clientForm.get('dateContractFrom').value,
      dateContractTo: this.clientForm.get('dateContractTo').value,
    }

    try {
      this.firebaseService.updateObject(`clients/${this.navParams.data.key}`, opts);
      this.messagesService.showToast({ msg: `El cliente ${this.data.name} ha sido modificado correctamente!` });
      this.modalCtrl.dismiss();
    } catch (err) {
      console.log(err);
      this.messagesService.showToast({ msg: 'Ha ocurrido un error. No se pudo modificar el cliente.' });
    }
  }

  public close() {
    this.modalCtrl.dismiss();
  }

  public openHistory() {
    this.sharingService.setClient(this.client);
    this.router.navigate(['history']);
    this.close();
  }

  private processPayments() {
    let year = this.selectedDate.getFullYear();
    let month = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0');
    let payments = this.client.payments && this.client.payments[year] && this.client.payments[year][month];
    this.data.payments = payments;
    let commons = _.cloneDeep(payments) || [];
    delete commons.extras;
    delete commons.services;
    if (_.isEmpty(commons)) commons = [0];
    else commons = _.values(commons);
    let extras = payments && payments.extras ? _.map(payments.extras, 'amount') : [0];
    let services = payments && payments.services ? _.map(payments.services, 'amount') : [0];
    let total = _.concat(commons, _.concat(extras, services));
    this.data.balance = _.sumBy(Array.from(_.values(total), v => Number(v)));
  }
}
