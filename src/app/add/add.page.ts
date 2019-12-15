import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FirebaseService } from 'src/services/firebase.service';
import { MessagesService } from 'src/services/messages.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
  @ViewChild('name') name: any;

  public clientForm: FormGroup;
  public currentYear: number;
  public type: string;
  private file: File;
  private isClient: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService,
    private messagesService: MessagesService,
  ) {
    this.clientForm = this.formBuilder.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      type: ['client', Validators.required],
      owner: [true, Validators.required],
      address: ['', Validators.required],
      contractURL: ['No hay contratos seleccionados'],
      dateContractFrom: ['', Validators.required],
      dateContractTo: ['', Validators.required],
    });
    this.currentYear = new Date().getFullYear();
    this.isClient = true;
    // this.file = null;
    // const urlParams = new URLSearchParams(window.location.search);
    // const code = urlParams.get('code');
    // if (code) localStorage.setItem('token', code);
  }
  
  ngOnInit() {}

  public signIn() {
    // this.gds.signIn();
  }

  public changeType(type) {
    this.isClient = type;
  }
  
  public handleFileInput(file) {
    // if (_.isEmpty(file)) return;
    // this.clientForm.patchValue({ contractURL: file[0].name });
    // console.log(file[0]);
    // this.file = file[0];
  }

  public setType(type: string) {
    this.type = type;

    if (type == 'client') {
      this.clientForm.get('name').setValidators([Validators.required]);
      this.clientForm.get('lastName').setValidators([Validators.required]);
      this.clientForm.get('type').setValidators([Validators.required]);
      this.clientForm.get('owner').setValidators([Validators.required]);
      this.clientForm.get('address').setValidators([Validators.required]);
      this.clientForm.get('dateContractFrom').setValidators([Validators.required]);
      this.clientForm.get('dateContractTo').setValidators([Validators.required]);
    } else {
      this.clientForm.get('lastName').setValidators(null);
      this.clientForm.get('lastName').updateValueAndValidity();
      this.clientForm.get('owner').setValidators(null);
      this.clientForm.get('owner').updateValueAndValidity();
      this.clientForm.get('dateContractFrom').setValidators(null);
      this.clientForm.get('dateContractFrom').updateValueAndValidity();
      this.clientForm.get('dateContractTo').setValidators(null);
      this.clientForm.get('dateContractTo').updateValueAndValidity();
    }
  }

  public addClient() {
    let opts;

    if (this.type == 'client') {
      opts = {
        name: this.clientForm.get('name').value,
        lastName: this.clientForm.get('lastName').value,
        type: this.clientForm.get('type').value,
        owner: this.clientForm.get('owner').value,
        address: this.clientForm.get('address').value,
        contractURL: this.clientForm.get('contractURL').value,
        dateContractFrom: this.clientForm.get('dateContractFrom').value,
        dateContractTo: this.clientForm.get('dateContractTo').value,
      }
    } else {
      opts = {
        name: this.clientForm.get('name').value,
        type: this.clientForm.get('type').value,
        address: this.clientForm.get('address').value,
      }
    }
    this.messagesService.showLoading({ msg: 'Agregando cliente...' });
    this.firebaseService.createObject('clients', opts)
      .then(() => {
        this.onSuccess({ msg: `Cliente ${opts.name} agregado correctamente!` });
        this.clientForm.patchValue({ name: '' });
        // this.addContract();
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

  private addContract() {
    if (!this.file || !this.file[0]) {
      console.log('No file selected');
      return;
    }
  }
}
