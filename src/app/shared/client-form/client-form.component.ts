import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseService } from 'src/services/firebase.service';
import { FirestoreService } from 'src/services/firestore.service';
import { MessagesService } from 'src/services/messages.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss'],
})
export class ClientFormComponent implements OnInit {
  @ViewChild('name') name: any;
  public clientForm: FormGroup;
  public currentYear: number;
  public clients: any;
  public consortiums: any;
  public owners: any;
  public noOwners: any;
  public isOwner: boolean;
  private selectedConsortiums: any;
  private selectedOwner: any;
  private file: File;

  constructor(
    private formBuilder: FormBuilder,
    private db: AngularFireDatabase,
    private firebaseService: FirebaseService,
    private messagesService: MessagesService,
    private zone: NgZone,
    private firestoreService: FirestoreService,
  ) {
    this.clientForm = this.formBuilder.group({
      isOwner: [true],
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      number: ['', Validators.required],
      floor: [''],
      apartment: [''],
      cellphone: [''],
      type: ['client'],
      dateContractFrom: [''],
      dateContractTo: [''],
      owner: [''],
      consortiums: ['', Validators.required],
      contractURL: [''],
    });
    this.clients = [];
    this.consortiums = [];
    this.owners = [];
    this.noOwners = [];
    this.selectedConsortiums = [];
    this.selectedOwner = [];
    this.isOwner = true;
    this.currentYear = new Date().getFullYear();
    this.file = null;
  }

  ngOnInit() {
    let clientsRef = this.db.database.ref('clients');
    clientsRef.on('value', (snap: any) => {
      this.zone.run(() => {
        snap.forEach(data => { 
          if (data.val().type == 'client') this.clients.push({ key: data.key, ...data.val() });
          else this.consortiums.push({ key: data.key, ...data.val() });
        });
        this.clients = _.uniqBy(this.clients, 'key');
        console.log('clients:', this.clients)
        this.owners = _.filter(this.clients, c => c.isOwner);
        this.noOwners = _.filter(this.clients, c => !c.isOwner);
      })
    });

    let consortiumsRef = this.db.database.ref('consortiums');
    consortiumsRef.on('value', (snap: any) => {
      this.zone.run(() => {
        snap.forEach(data => {
          if (data.val().type == 'client') this.consortiums.push({ key: data.key, ...data.val() });
          else this.consortiums.push({ key: data.key, ...data.val() });
        });
        this.consortiums = _.uniqBy(this.consortiums, 'key');
        console.log('consortiums:', this.consortiums)
      })
    });
  }

  public changeOwnership(isOwner: boolean) {
    this.isOwner = isOwner;
    this.clientForm.patchValue({ isOwner });

    if (isOwner) {
      this.clientForm.get('dateContractFrom').setValidators(null);
      this.clientForm.get('dateContractTo').setValidators(null);
      this.clientForm.get('contractURL').setValidators(null);
      this.clientForm.get('owner').setValidators(null);
    } else {
      this.clientForm.get('dateContractFrom').setValidators([Validators.required]);
      this.clientForm.get('dateContractTo').setValidators([Validators.required]);
      this.clientForm.get('contractURL').setValidators([Validators.required]);
      this.clientForm.get('owner').setValidators([Validators.required]);
    }
    this.clientForm.get('dateContractFrom').updateValueAndValidity();
    this.clientForm.get('dateContractTo').updateValueAndValidity();
    this.clientForm.get('contractURL').updateValueAndValidity();
    this.clientForm.get('owner').updateValueAndValidity();
  }

  public selectedFile(files: FileList) {
    this.file = files[0];
    this.clientForm.patchValue({ contractURL: this.file.name });
    console.log('this.file:', this.file);
  }
  
  public async addClient() {
    console.log(this.clientForm);
    this.messagesService.showLoading({ msg: 'Agregando cliente...' });

    let name = this.clientForm.get('name').value;
    let lastName = this.clientForm.get('lastName').value;
    let consortium = this.selectedConsortiums.join('-');
    let folderName = `${lastName}-${name}`;
    let downloadURL = '';

    if (!this.isOwner) downloadURL = await this.firestoreService.uploadFile(consortium, folderName, this.file);
    
    let opts = {
      name,
      lastName,
      type: 'client',
      isOwner: this.isOwner,
      address: this.clientForm.get('address').value,
      number: this.clientForm.get('number').value,
      floor: this.clientForm.get('floor').value,
      apartment: this.clientForm.get('apartment').value,
      cellphone: this.clientForm.get('cellphone').value,
      dateContractFrom: this.clientForm.get('dateContractFrom').value,
      dateContractTo: this.clientForm.get('dateContractTo').value,
      owner: !this.isOwner && this.selectedOwner ? this.selectedOwner : null,
      consortiums: this.selectedConsortiums[0] ? this.selectedConsortiums : null,
      contractURL: downloadURL,
    }
    this.firebaseService.createObject('clients', opts)
      .then(() => {
        this.onSuccess({ msg: `Cliente ${opts.name} agregado correctamente!` });
        this.resetForm();
        setTimeout(() => { this.name.setFocus() }, 1000);
      })
      .catch(err => {
        this.onError({ msg: 'Ha ocurrido un error. ', err });
      });
  }

  private resetForm() {
    this.clientForm.patchValue({ name: '' });
    this.clientForm.patchValue({ lastName: '' });
    this.clientForm.patchValue({ address: '' });
    this.clientForm.patchValue({ number: '' });
    this.clientForm.patchValue({ floor: '' });
    this.clientForm.patchValue({ apartment: '' });
    this.clientForm.patchValue({ cellphone: '' });
    this.clientForm.patchValue({ type: 'client' });
    this.clientForm.patchValue({ dateContractFrom: '' });
    this.clientForm.patchValue({ dateContractTo: '' });
    this.clientForm.patchValue({ contractURL: '' });
    this.selectedOwner = null;
    this.selectedConsortiums = null;
  }

  private onSuccess(opts: any) {
    setTimeout(() => {
      this.messagesService.dismissLoading();
      this.messagesService.showToast({ msg: opts.msg });
    }, 900);
  }

  private onError(opts: any) {
    this.messagesService.dismissLoading();
    this.messagesService.showToast({ msg: opts.msg + opts.err });
  }

  public selectConsortiums(event) {
    this.selectedConsortiums = event.target.value;
    this.clientForm.patchValue({ consortiums: this.selectedConsortiums });
  }

  public selectOwners(event) {
    this.selectedOwner = event.target.value;
    this.clientForm.patchValue({ owner: this.selectedOwner });
  }
}
