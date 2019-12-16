import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseService } from 'src/services/firebase.service';
import { MessagesService } from 'src/services/messages.service';
import { DropboxService } from 'src/services/dropbox.service';
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
    private dropboxService: DropboxService,
  ) {
    this.clientForm = this.formBuilder.group({
      isOwner: [true],
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      type: ['client'],
      dateContractFrom: [''],
      dateContractTo: [''],
      owner: [''],
      consortiums: ['', Validators.required],
      contractURL: ['', Validators.required],
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
        console.log('clients:', this.clients)
        console.log('consortiums:', this.consortiums)
        this.owners = _.filter(this.clients, c => c.isOwner);
        this.noOwners = _.filter(this.clients, c => !c.isOwner);
      })
    });
  }

  public changeOwnership(isOwner: boolean) {
    this.isOwner = isOwner;
    this.clientForm.patchValue({ isOwner });

    if (isOwner) {
      this.clientForm.get('dateContractFrom').setValidators(null);
      this.clientForm.get('dateContractFrom').updateValueAndValidity();
      this.clientForm.get('dateContractTo').setValidators(null);
      this.clientForm.get('dateContractTo').updateValueAndValidity();
      this.clientForm.get('contractURL').setValidators(null);
      this.clientForm.get('contractURL').updateValueAndValidity();
      this.clientForm.get('owner').setValidators(null);
      this.clientForm.get('owner').updateValueAndValidity();
    } else {
      this.clientForm.get('dateContractFrom').setValidators([Validators.required]);
      this.clientForm.get('dateContractFrom').updateValueAndValidity();
      this.clientForm.get('dateContractTo').setValidators([Validators.required]);
      this.clientForm.get('contractURL').updateValueAndValidity();
      this.clientForm.get('contractURL').setValidators([Validators.required]);
      this.clientForm.get('dateContractTo').updateValueAndValidity();
      this.clientForm.get('owner').setValidators([Validators.required]);
      this.clientForm.get('owner').updateValueAndValidity();
    }
  }

  public selectedFile(files: FileList) {
    this.file = files[0];
    this.clientForm.patchValue({ contractURL: this.file.name });
    console.log('this.file:', this.file);
  }

  private uploadFile(folderName): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.dropboxService.uploadFile(this.file, folderName).subscribe(
        success => {
          console.log('File uploaded !!!');
          resolve(true);
        },
        error => {
          console.log('Error at file upload', error);
          resolve(false);
        }
      );
    });
  }
  
  public async addClient() {
    this.messagesService.showLoading({ msg: 'Agregando cliente...' });

    let name = this.clientForm.get('name').value;
    let lastName = this.clientForm.get('lastName').value;
    let folderName = `${lastName}-${name}`;
    let result = await this.uploadFile(folderName);
    console.log('result:', result);

    let composedContractUrl = `https://www.dropbox.com/home/chiclana/${folderName}?preview=${this.file.name}`;
    console.log('composedContractUrl:', composedContractUrl);

    let opts = {
      name,
      lastName,
      type: 'client',
      isOwner: this.isOwner,
      address: this.clientForm.get('address').value,
      dateContractFrom: this.clientForm.get('dateContractFrom').value,
      dateContractTo: this.clientForm.get('dateContractTo').value,
      owner: this.selectedOwner ? this.selectedOwner : null,
      consortiums: this.selectedConsortiums[0] ? this.selectedConsortiums : null,
      contractURL: this.clientForm.get('contractURL').value, // has to be different
    }
    this.firebaseService.createObject('clients', opts)
      .then(() => {
        this.onSuccess({ msg: `Cliente ${opts.name} agregado correctamente!` });
        this.clientForm.patchValue({ name: '' });
        setTimeout(() => { this.name.setFocus() }, 1000);
      })
      .catch(err => {
        this.onError({ msg: 'Ha ocurrido un error. ', err });
      });
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
