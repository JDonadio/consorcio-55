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

  private clients: any;
  public filteredClients: any;
  public searchText: string;
  public activeFilter: any;
  
  constructor(
    private zone: NgZone,
    private sharingService: SharingService,
    private alertCtrl: AlertController,
    private router: Router,
  ) {
    this.searchText = '';
    this.activeFilter = null;
    this.sharingService.currentClients.subscribe(clients => {
      this.zone.run(() => {
        this.clients = clients;
        this.filteredClients = _.clone(clients);
      });
    });
  }
  
  ngOnInit() {}

  public openClientDetails(client: any) {
    this.sharingService.setClient(client);
    this.router.navigate(['details']);
  }

  public searchClient() {
    if (this.searchText == '' || !this.searchText) {
      this.filteredClients = _.clone(this.clients);
      return;
    }

    let byName = _.filter(this.clients, c => { return c.name.toLowerCase().includes(this.searchText.toLowerCase()) });
    let byAddress = _.filter(this.clients, c => { return c.address.toLowerCase().includes(this.searchText.toLowerCase()) });
    let byType = _.filter(this.clients, c => { return c.type.toLowerCase().includes(this.searchText.toLowerCase()) });

    if (!_.isEmpty(byName)) this.filteredClients = _.clone(byName);
    else if (!_.isEmpty(byAddress)) this.filteredClients = _.clone(byAddress);
    else if (!_.isEmpty(byType)) this.filteredClients = _.clone(byType);
    else this.filteredClients = [];
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

  private applyFilter(type) {
    let byType = _.filter(this.clients, c => { return c.type == type });
    if (!_.isEmpty(byType)) {
      this.activeFilter = type;
      this.filteredClients = _.clone(byType);
    }
    else {
      this.filteredClients = [];
      this.activeFilter = null;
    } 
  }
  
  private clearFilter() {
    this.filteredClients = _.clone(this.clients);
    this.activeFilter = null;
  }
}
