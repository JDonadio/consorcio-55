import { Component, OnInit, NgZone } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { MessagesService } from 'src/services/messages.service';
import { Router } from '@angular/router';
import { AngularFireDatabase } from 'angularfire2/database';
import { SharingService } from 'src/services/sharing.service';
import { Subscription } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from './popover/popover.component';
import * as _ from 'lodash';

const SERVICES = [
  { name: 'Alquiler', type: '' },
  { name: 'Expensas', type: '' },
  { name: 'Cochera', type: '' },
  { name: 'Luz', type: '' },
  { name: 'Gas', type: '' },
  { name: 'Agua', type: '' },
  { name: 'CISI', type: '' },
];

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  public services: any;
  public client: any;
  public clients: any;
  public consortiums: any;
  public data: any;
  public editMode: boolean;
  public currentYear: number;
  public monthCounter: number;
  public now: Date;
  public selectedDate: Date;
  public selectedDateStr: string;
  private sub: Subscription;

  constructor(
    private firebaseService: FirebaseService,
    private messagesService: MessagesService,
    private router: Router,
    private db: AngularFireDatabase,
    private sharingService: SharingService,
    private zone: NgZone,
    private popoverController: PopoverController,
  ) {
    this.services = SERVICES;
    this.currentYear = new Date().getFullYear();
    this.now = new Date();
    this.zone.run(() => {
      this.client = null;
      this.data = null;
      this.clients = [];
      this.consortiums = [];
    });
  }
  
  ngOnInit() {
    this.client = null;
    this.data = null;
    this.clients = [];
    this.consortiums = [];
    this.editMode = false;
    this.monthCounter = this.now.getMonth();
    this.selectedDate = new Date();
    this.selectedDateStr = this.selectedDate.toLocaleDateString('es-AR', { year: 'numeric', month: 'long' });
    this.sub = new Subscription();

    this.sub.add(this.sharingService.currentClients.subscribe(currentClients => {
      if (_.isEmpty(currentClients)) return;
      this.clients = currentClients;
      console.log('this.clients:', this.clients)
    }));
    this.sub.add(this.sharingService.currentConsortiums.subscribe(currentConsortiums => {
      if (_.isEmpty(currentConsortiums)) return;
      this.consortiums = currentConsortiums;
      console.log('this.consortiums:', this.consortiums)
    }));
    this.sub.add(this.sharingService.currentClient.subscribe(currentClient => {
      if (_.isEmpty(currentClient)) return;
      this.setClient(currentClient);
    }));
    this.sub.add(this.sharingService.currentConsortium.subscribe(currentConsortium => {
      if (_.isEmpty(currentConsortium)) return;
      this.setClient(currentConsortium);
    }));
  }

  ionViewWillLeave() {
    this.sub.unsubscribe();
    this.sharingService.setClient(null);
    this.sharingService.setConsortium(null);
  }

  private setClient(client: any) {
    if (client.type == 'client') {
      this.sub.add(this.db.object('clients/' + client.key).valueChanges().subscribe((clientSub: any) => {
        if (_.isEmpty(clientSub)) return;

        if (!clientSub.isOwner) {
          clientSub.ownerObj = _.find(this.clients, c => c.key == clientSub.owner);
        }
        let consortiumsObj = _.filter(this.consortiums, c => clientSub.consortiums.includes(c.key)) || [];
        clientSub.consortiumsStr = _.map(consortiumsObj, 'name').join(', ');

        clientSub = { ...clientSub, key: client.key };
        this.refreshData(clientSub);
      }));
    } 
    else {
      this.sub.add(this.db.object('consortiums/' + client.key).valueChanges().subscribe((clientSub: any) => {
        if (_.isEmpty(clientSub)) return;

        clientSub = { ...clientSub, key: client.key };
        this.refreshData(clientSub);
      }));
    }
  }

  private refreshData(client) {
    this.client = _.cloneDeep(client);
    this.data = _.cloneDeep(client);
    this.processPayments();
    console.log('this.data:', this.data);
  }

  public getPreviousMonthInformation() {
    this.monthCounter--;
    this.selectedDate.setMonth(this.monthCounter);
    if (this.monthCounter == -1) this.monthCounter = 11;
    this.selectedDateStr = this.selectedDate.toLocaleDateString('es-AR', { year: 'numeric', month: 'long' });
    this.processPayments();
  }

  public getNextMonthInformation() {
    this.monthCounter++;
    this.selectedDate.setMonth(this.monthCounter);
    if (this.monthCounter == 12) this.monthCounter = 0;
    this.selectedDateStr = this.selectedDate.toLocaleDateString('es-AR', { year: 'numeric', month: 'long' });
    this.processPayments();
  }

  public async addPayment(service: string) {
    let obj: any = {
      title: service,
      inputs: [{ name: service, type: 'number', min: 0, placeholder: '$' }]
    };

    if (service == 'extras') obj.inputs.push({ name: 'detail', type: 'text', placeholder: 'Detalle' });
    let resp = await this.messagesService.showInputConfirm(obj);
    if (_.isEmpty(resp[0])) return;

    let opts: any = {};
    if (service == 'extras') {
      if (_.isEmpty(resp[1])) return;

      let amounts = this.data.payments && this.data.payments[service] || [];
      amounts.push({ amount: resp[0], details: resp[1] });
      opts[service] = amounts;
    } else opts[service] = resp[0];

    let year = this.selectedDate.getFullYear();
    let month = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0');
    let collection = this.data.type == 'client' ? 'clients' : 'consortiums';

    try {
      await this.firebaseService.updateObject(`${collection}/${this.data.key}/payments/${year}/${month}`, opts);
      this.processPayments();
      this.messagesService.showToast({ msg: `El pago ha sido agregado correctamente!` });
    } catch (err) {
      console.log(err);
      this.messagesService.showToast({ msg: 'Ha ocurrido un error. No se pudo realizar el pago.' });
    }
  }

  public async askForRemove() {
    let type = this.data.type == 'client' ? 'Cliente' : 'Consorcio';
    let resp = await this.messagesService.showConfirm(
      { title: 'Eliminar ' + type, msg: `¿Estás seguro de eliminar a ${this.data.lastName || ''} ${this.data.name.toUpperCase()}?` }
    );

    if (!resp) return;

    try {
      this.firebaseService.removeObject(`clients/${this.data.key}`);
      this.messagesService.showToast({ msg: `El cliente ${this.data.name} ha sido eliminado correctamente!` });
      this.router.navigate(['home']);
    } catch (err) {
      console.log(err);
      this.messagesService.showToast({ msg: 'Ha ocurrido un error. No se pudo eliminar el cliente.' });
    }
  }

  public openHistory() {
    this.sharingService.setClient(this.client);
    this.router.navigate(['history']);
  }

  public async openContract() {
    if (_.isEmpty(this.client.contractURL)) return;
    window.open(this.client.contractURL);
  }

  public async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      mode: 'md',
    });
    await popover.present();
    const response = await popover.onDidDismiss();
    if (_.isEmpty(response) || _.isEmpty(response.data)) return;
    this.editMode = response.data == 'edit';
    if (response.data == 'remove') this.askForRemove();
  }

  public openOwnerDetails(owner) {
    owner.key = this.data.owner;
    this.sharingService.setClient(owner);
    this.sub.unsubscribe();
    this.ngOnInit();
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

  public cancelEditionMode() {
    this.editMode = false;
    this.setClient(this.client);
  }
}
