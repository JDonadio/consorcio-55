import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ExpirationService {

  constructor() { }

  public checkExpirationContractDates(clients: any): Promise<any> {
    if (_.isEmpty(clients)) return;

    return new Promise((resolve, reject) => {
      let renters = _.filter(_.cloneDeep(clients), c => !c.isOwner);

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
        let filteredClients = _.compact(_.map(clients, c => {
          if (_.map(res, 'key').includes(c.key)) return { ...c, expiration: _.find(res, r => r.key == c.key) }
        }));

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
        // let sim5 = _.cloneDeep(filteredClients[0]);
        // sim5.expiration.diff = 100;
        // sim5.expiration.class = '';
        // filteredClients = filteredClients.concat(sim1, sim2, sim3, sim4, sim5);

        let checkedClients = _.compact(filteredClients);
        return resolve(checkedClients);
      }, 1000);
    });
  }

  public processExpirationContractDates(clients: any) {
    if (_.isEmpty(clients)) return;

    let renters = _.filter(clients, c => !c.isOwner);

    let _today = new Date().toISOString();
    let today = new Date(_today).getTime();
    let dayFormater = 1000 * 60 * 60 * 24; // miliseconds to -> seconds -> minutes -> hours -> days

    _.each(renters, r => {
      r.date = new Date(r.dateContractTo.substr(0, 10)).getTime();
      r.diff = Math.ceil((r.date - today) / dayFormater);

      if (r.diff <= 90) {
        if (r.diff <= 0) r.class = 'expired';
        if (r.diff > 0 && r.diff <= 30) r.class = 'danger';
        if (r.diff > 30 && r.diff <= 60) r.class = 'alert';
        if (r.diff > 60 && r.diff <= 90) r.class = 'warning';
      } else r.class = '';
    })

    console.log('### ', clients)
  };
}
