import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireDatabase } from 'angularfire2/database';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SharingService {

  private user = new BehaviorSubject<any>(null);
  currentUser = this.user.asObservable();

  private client = new BehaviorSubject<any>(null);
  currentClient = this.client.asObservable();

  private clients = new BehaviorSubject<any>(null);
  currentClients = this.clients.asObservable();

  private consortium = new BehaviorSubject<any>(null);
  currentConsortium = this.consortium.asObservable();

  private consortiums = new BehaviorSubject<any>(null);
  currentConsortiums = this.consortiums.asObservable();

  constructor(
    private db: AngularFireDatabase
  ) {
    let localUser = JSON.parse(localStorage.getItem('user'));
    this.user.next(localUser);

    var clientsRef = this.db.database.ref('clients');
    clientsRef.on('value', (snap: any) => {
      let clients = [];
      snap.forEach(data => { clients.push({ key: data.key, ...data.val() }) });
      this.setClients(clients);
    });

    var consortiumsRef = this.db.database.ref('consortiums');
    consortiumsRef.on('value', (snap: any) => {
      let consortiums = [];
      snap.forEach(data => { consortiums.push({ key: data.key, ...data.val() }) });
      this.setConsortiums(consortiums);
    });
  }
  
  setUser(user: any) {
    this.user.next(user);
  }
  
  setClient(client: any) {
    this.client.next(client);
  }
  
  setClients(clients: any) {
    this.clients.next(clients);
  }

  setConsortium(consortium: any) {
    this.consortium.next(consortium);
  }

  setConsortiums(consortiums: any) {
    this.consortiums.next(consortiums);
  }
}
