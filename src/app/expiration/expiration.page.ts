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
  public now: any;
  private clients: any;

  constructor(
    private sharingService: SharingService,
    private messagesService: MessagesService,
    private router: Router,
    private zone: NgZone,
  ) {
    this.filteredClients = [];
    this.now = new Date();
  }

  ngOnInit() {
    this.sharingService.currentClients.subscribe(clients => {
      if (_.isEmpty(clients)) return;

      this.zone.run(() => {
        this.clients = clients;
        console.log('clients:', clients);
        this.checkExpirationContractDates();
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

      let resObj = {
        key: d.key,
        diff,
        class: ''
      };

      if (diff <= 90) {
        if (diff <= 0) resObj.class = 'expired';
        if (diff > 0 && diff <= 30) resObj.class = 'danger';
        if (diff > 30 && diff <= 60) resObj.class = 'alert';
        if (diff > 60 && diff <= 90) resObj.class = 'warning';
      }

      return resObj;
    });

    setTimeout(() => {
      let filteredClients = _.compact(_.map(this.clients, c => {
        if (_.map(res, 'key').includes(c.key)) return {...c, expiration: _.find(res, r => r.key == c.key)}
      }));

      console.log('filteredClients:', filteredClients)
      
      // Testing purpose
      
      // let sim1 = _.cloneDeep(filteredClients[0]);
      // sim1.expiration.diff = -10;
      // sim1.expiration.class =  'expired';
      // let sim2 = _.cloneDeep(filteredClients[0]);
      // sim2.expiration.diff = 10;
      // sim2.expiration.class = 'danger';
      // let sim3 = _.cloneDeep(filteredClients[0]);
      // sim3.expiration.diff = 40;
      // sim3.expiration.class = 'alert';
      // let sim4 = _.cloneDeep(filteredClients[0]);
      // sim4.expiration.diff = 70;
      // sim4.expiration.class = 'warning';
      // filteredClients.concat(sim1, sim2, sim3, sim4);

      this.filteredClients = _.compact(filteredClients);
      console.log('this.filteredClients', this.filteredClients)
      this.now = new Date();
      this.messagesService.dismissLoading();
    }, 1000);
  }

  public openDetails(obj: any) {
    obj.type == 'client' ? this.sharingService.setClient(obj) : this.sharingService.setConsortium(obj);
    this.router.navigate(['details']);
  }
}
