import { Component, OnInit, NgZone } from '@angular/core';
import { MessagesService } from 'src/services/messages.service';
import { SharingService } from 'src/services/sharing.service';
import { Router } from '@angular/router';
import { ExpirationService } from 'src/services/expiration.service';
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
    private expirationService: ExpirationService,
  ) {
    this.filteredClients = [];
    this.now = new Date();
  }

  ngOnInit() {
    this.sharingService.currentClients.subscribe(clients => {
      if (_.isEmpty(clients)) return;

      this.clients = clients;
      console.log('clients:', clients);
      this.checkExpirationContractDates();
    });
  }

  public checkExpirationContractDates() {
    this.messagesService.showLoading({ msg: 'Calculando vencimientos...' });
    this.filteredClients = [];
    this.zone.run(async () => {
      await this.expirationService.processExpirationContractDates(this.clients);
      this.filteredClients = _.clone(_.filter(this.clients, c => c.class != ''));
    });
    setTimeout(() => {
      this.messagesService.dismissLoading();
    }, 1000);
  }

  public openDetails(obj: any) {
    obj.type == 'client' ? this.sharingService.setClient(obj) : this.sharingService.setConsortium(obj);
    this.router.navigate(['details']);
  }
}
