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

  private clients = new BehaviorSubject<any>(null);
  currentClients = this.clients.asObservable();

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
  }
  
  setUser(user: any) {
    this.user.next(user);
  }

  setClients(clients: any) {
    this.clients.next(clients);
  }
}
