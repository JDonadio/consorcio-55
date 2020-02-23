import { Component, OnInit, NgZone, ViewChild, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
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
  @Input() editMode: boolean;
  @Input() data: any;
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
  private files: Array<File>;

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
      edet: [''],
      gasnor: [''],
      cisi: [''],
      dgr: [''],
      owner: [''],
      consortiums: ['', Validators.required],
      // dateContractFrom: [''],
      // dateContractTo: [''],
      // contractURLs: [''],
    });
    this.clients = [];
    this.consortiums = [];
    this.owners = [];
    this.noOwners = [];
    this.selectedConsortiums = [];
    this.selectedOwner = [];
    this.isOwner = true;
    this.currentYear = new Date().getFullYear();
    this.files = [];
  }
  
  ngOnInit() {
    console.log('this.editMode', this.editMode)
    console.log('this.data', this.data)

    if (this.data) this.setForm();

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

  private setForm() {
    this.changeOwnership(this.data.isOwner);
    this.clientForm.patchValue({ isOwner: this.data.isOwner });
    this.clientForm.patchValue({ name: this.data.name });
    this.clientForm.patchValue({ lastName: this.data.lastName });
    this.clientForm.patchValue({ address: this.data.address });
    this.clientForm.patchValue({ number: this.data.number });
    this.clientForm.patchValue({ floor: this.data.floor });
    this.clientForm.patchValue({ apartment: this.data.apartment });
    this.clientForm.patchValue({ cellphone: this.data.cellphone });
    this.clientForm.patchValue({ edet: this.data.edet });
    this.clientForm.patchValue({ gasnor: this.data.gasnor });
    this.clientForm.patchValue({ cisi: this.data.cisi });
    this.clientForm.patchValue({ dgr: this.data.dgr });
    this.clientForm.patchValue({ type: this.data.type });
    this.clientForm.patchValue({ owner: null });
    this.clientForm.patchValue({ consortiums: null });
    // this.clientForm.patchValue({ dateContractFrom: this.data.dateContractFrom });
    // this.clientForm.patchValue({ dateContractTo: this.data.dateContractTo });
    // this.clientForm.patchValue({ contractURLs: null });
  }

  public changeOwnership(isOwner: boolean) {
    this.isOwner = isOwner;
    this.clientForm.patchValue({ isOwner });

    if (isOwner) {
      // this.clientForm.get('dateContractFrom').setValidators(null);
      // this.clientForm.get('dateContractTo').setValidators(null);
      // this.clientForm.get('contractURLs').setValidators(null);
      this.clientForm.get('owner').setValidators(null);
    } else {
      // this.clientForm.get('dateContractFrom').setValidators([Validators.required]);
      // this.clientForm.get('dateContractTo').setValidators([Validators.required]);
      // this.clientForm.get('contractURLs').setValidators([Validators.required]);
      this.clientForm.get('owner').setValidators([Validators.required]);
    }
    // this.clientForm.get('dateContractFrom').updateValueAndValidity();
    // this.clientForm.get('dateContractTo').updateValueAndValidity();
    // this.clientForm.get('contractURLs').updateValueAndValidity();
    this.clientForm.get('owner').updateValueAndValidity();
  }

  public selectedFile(file: any, index: number) {
    console.log('file', file[0])
    if (_.isEmpty(file)) return;
    this.files[index] = file;
    console.log('Selected files: ', _.compact(this.files));

    let obj = {};
    obj['contractURL_' + index] = file[0].name;
    this.clientForm.patchValue(obj);
  }
  
  public async addClient() {
    console.log(this.clientForm);
    let msg = { msg: (this.editMode ? 'Modificando' : 'Agregando') + ' cliente...' };
    this.messagesService.showLoading(msg);

    let name = this.clientForm.get('name').value;
    let lastName = this.clientForm.get('lastName').value;
    let clientFolderName = `${lastName}-${name}`;
    let downloadURLs = [];

    if (!this.isOwner) {
      downloadURLs = await this.firestoreService.uploadFiles(clientFolderName, this.files);
      console.log('downloadURLs', downloadURLs)
    }

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
      edet: this.clientForm.get('edet').value,
      gasnor: this.clientForm.get('gasnor').value,
      cisi: this.clientForm.get('cisi').value,
      dgr: this.clientForm.get('dgr').value,
      dateContractFrom: this.clientForm.get('dateContractFrom').value,
      dateContractTo: this.clientForm.get('dateContractTo').value,
      owner: !this.isOwner && this.selectedOwner ? this.selectedOwner : null,
      consortiums: this.selectedConsortiums[0] ? this.selectedConsortiums : null,
      contractURL: downloadURLs,
    }

    if (this.editMode) {
      this.firebaseService.updateObject(`clients/${this.data.key}`, opts)
        .then(() => {
          this.onSuccess({ msg: `Cliente ${opts.name} modificado correctamente!` });
          setTimeout(() => { this.name.setFocus() }, 1000);
        })
        .catch(err => {
          this.onError({ msg: 'Ha ocurrido un error. ', err });
        });
    }
    else {
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
  }

  private resetForm() {
    this.clientForm.patchValue({ name: '' });
    this.clientForm.patchValue({ lastName: '' });
    this.clientForm.patchValue({ address: '' });
    this.clientForm.patchValue({ number: '' });
    this.clientForm.patchValue({ floor: '' });
    this.clientForm.patchValue({ apartment: '' });
    this.clientForm.patchValue({ cellphone: '' });
    this.clientForm.patchValue({ edet: '' });
    this.clientForm.patchValue({ gasnor: '' });
    this.clientForm.patchValue({ cisi: '' });
    this.clientForm.patchValue({ dgr: '' });
    this.clientForm.patchValue({ type: 'client' });
    // this.clientForm.patchValue({ dateContractFrom: '' });
    // this.clientForm.patchValue({ dateContractTo: '' });
    // this.clientForm.patchValue({ contractURLs: '' });
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
    let previousSelectedConsortiums = _.clone(this.selectedConsortiums);

    _.each(previousSelectedConsortiums, (c, index) => {
      this.clientForm.removeControl('dateContractFrom_' + index);
      this.clientForm.removeControl('dateContractTo_' + index);
      this.clientForm.removeControl('contractURL_' + index);
    });

    this.selectedConsortiums = event.target.value;
    this.clientForm.patchValue({ consortiums: this.selectedConsortiums });
    
    _.each(this.selectedConsortiums, (c, index) => {
      this.clientForm.addControl('dateContractFrom_' + index, new FormControl('', Validators.required));
      this.clientForm.addControl('dateContractTo_' + index, new FormControl('', Validators.required));
      this.clientForm.addControl('contractURL_' + index, new FormControl('', Validators.required));

      let objFrom = {};
      let objTo = {};
      let objURL = {};
      objFrom['dateContractFrom_' + index] = '';
      objTo['dateContractTo_' + index] = '';
      objURL['contractURL_' + index] = '';

      this.clientForm.patchValue(objFrom);
      this.clientForm.patchValue(objTo);
      this.clientForm.patchValue(objURL);
    });
    this.clientForm.updateValueAndValidity();
    console.log(this.clientForm)
  }

  public selectOwners(event) {
    this.selectedOwner = event.target.value;
    this.clientForm.patchValue({ owner: this.selectedOwner });
  }
}
