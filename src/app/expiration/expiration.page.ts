import { Component, OnInit, NgZone } from '@angular/core';
import { MessagesService } from 'src/services/messages.service';
import { SharingService } from 'src/services/sharing.service';
import { Router } from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'app-expiration',
  templateUrl: './expiration.page.html',
  styleUrls: ['./expiration.page.scss'],
})
export class ExpirationPage implements OnInit {
  public filteredClients: any;
  private clients: any;

  constructor(
    private sharingService: SharingService,
    private messagesService: MessagesService,
    private router: Router,
    private zone: NgZone,
  ) {
    this.filteredClients = [];
  }

  ngOnInit() {
    this.sharingService.currentClients.subscribe(clients => {
      if (_.isEmpty(clients)) return;

      this.zone.run(() => {
        this.clients = clients;
        console.log('clients:', clients);
      });
    });
  }

  public checkExpirationContractDates() {
    this.messagesService.showLoading({ msg: 'Calculando vencimientos...' });
    this.filteredClients = [];

    let renters = _.filter(_.cloneDeep(this.clients), c => !c.isOwner);
    console.log('renters', renters);

    let expirationDates = _.map(renters, r => { 
      return { 
        key: r.key, 
        date: new Date(r.dateContractTo.substr(0, 10)).getTime()
      } 
    });
    
    let _today = new Date().toISOString();
    let today = new Date(_today).getTime();

    let dayFormater = 1000 * 60 * 60 * 24; // miliseconds to -> seconds -> minutes -> hours -> days
    let res = _.map(expirationDates, d => {
      let diff = Math.ceil((d.date - today) / dayFormater);

      if (diff <= 90) return {
        key: d.key,
        result: diff
      }
    });

    setTimeout(() => {
      this.filteredClients = _.filter(this.clients, c => _.map(res, 'key').includes(c.key));
      console.log('this.filteredClients', this.filteredClients)
      this.messagesService.dismissLoading();
    }, 1000);
  }

  public openDetails(obj: any) {
    obj.type == 'client' ? this.sharingService.setClient(obj) : this.sharingService.setConsortium(obj);
    this.router.navigate(['details']);
  }
}
