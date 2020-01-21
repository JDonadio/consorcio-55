import { Component, OnInit, NgZone } from '@angular/core';
import { SharingService } from 'src/services/sharing.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public searchText: string;
  public activeFilter: any;
  public filteredObjects: any;
  private allObjects: any;
  private consortiums: any;
  private clients: any;
  
  constructor(
    private zone: NgZone,
    private sharingService: SharingService,
    private alertCtrl: AlertController,
    private router: Router,
  ) {
    this.searchText = '';
    this.activeFilter = null;
    this.filteredObjects = [];
    this.allObjects = [];
    this.consortiums = [];
    this.clients = [];
    this.sharingService.currentClients.subscribe(clients => {
      this.zone.run(() => {
        this.clients = clients || [];
        console.log('clients:', clients)
        this.updateObjects();
      });
    });
    this.sharingService.currentConsortiums.subscribe(consortiums => {
      this.zone.run(() => {
        this.consortiums = consortiums || [];
        console.log('consortiums:', consortiums)
        this.updateObjects();
      });
    });
  }
  
  ngOnInit() {
    this.sharingService.setClient(null);
    this.sharingService.setConsortium(null);
  }

  public openDetails(obj: any) {
    obj.type == 'client' ? this.sharingService.setClient(obj) : this.sharingService.setConsortium(obj);
    this.router.navigate(['details']);
  }

  private updateObjects() {
    this.zone.run(() => {
      this.allObjects = this.consortiums.concat(this.clients);
      this.filteredObjects = _.clone(this.allObjects);
      console.log('this.filteredObjects:', this.filteredObjects)
    });
  }

  public searchClient() {
    if (this.searchText == '' || !this.searchText) {
      this.filteredObjects = _.clone(this.allObjects);
      return;
    }

    let byName = _.filter(this.allObjects, c => { return c.name.toLowerCase().includes(this.searchText.toLowerCase()) });
    let byAddress = _.filter(this.allObjects, c => { return c.address.toLowerCase().includes(this.searchText.toLowerCase()) });
    let byType = _.filter(this.allObjects, c => { return c.type.toLowerCase().includes(this.searchText.toLowerCase()) });
    let byOwner = _.filter(this.allObjects, c => { return c.isOwner });
    let byRenter = _.filter(this.allObjects, c => { return !c.isOwner });

    if (!_.isEmpty(byName)) this.filteredObjects = _.clone(byName);
    else if (!_.isEmpty(byAddress)) this.filteredObjects = _.clone(byAddress);
    else if (!_.isEmpty(byType)) this.filteredObjects = _.clone(byType);
    else if (!_.isEmpty(byOwner)) this.filteredObjects = _.clone(byOwner);
    else if (!_.isEmpty(byRenter)) this.filteredObjects = _.clone(byRenter);
    else this.filteredObjects = [];
  }

  public async showFilter() {
    let opts: any = [
      {
        name: 'client',
        type: 'radio',
        label: 'Clientes',
        value: 'client',
        checked: this.activeFilter == 'client'
      },
      {
        name: 'consortium',
        type: 'radio',
        label: 'Consorcio',
        value: 'consortium',
        checked: this.activeFilter == 'consortium'
      },
      {
        name: 'owner',
        type: 'radio',
        label: 'Propietarios',
        value: 'owner',
        checked: this.activeFilter == 'owner'
      },
      {
        name: 'renter',
        type: 'radio',
        label: 'Inquilinos',
        value: 'renter',
        checked: this.activeFilter == 'renter'
      }
    ];
    opts.unshift({ type: 'radio', label: 'Borrar filtro', value: 'none' });
    const alert = await this.alertCtrl.create({
      header: 'Filtrar por:',
      inputs: opts,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Ok',
          handler: (data) => {
            if (data == 'none') this.clearFilter();
            else this.applyFilter(data);
          }}
      ],
      backdropDismiss: false,
      keyboardClose: false
    });

    await alert.present();
  }

  private applyFilter(filter: string) {
    if (filter == 'client') {
      this.filteredObjects = _.clone(this.clients);
      this.activeFilter = filter;
    }
    else if (filter == 'consortium') {
      this.filteredObjects = _.clone(this.consortiums);
      this.activeFilter = filter;
    }
    else if (filter == 'owner') {
      this.filteredObjects = _.filter(this.clients, c => { return c.isOwner });
      this.activeFilter = filter;
    }
    else if (filter == 'renter') {
      this.filteredObjects = _.filter(this.clients, c => { return c.type == 'client' && !c.isOwner });
      this.activeFilter = filter;
    }
    else {
      this.filteredObjects = [];
      this.activeFilter = null;
    }
  }
  
  private clearFilter() {
    this.updateObjects();
    this.activeFilter = null;
  }
}
