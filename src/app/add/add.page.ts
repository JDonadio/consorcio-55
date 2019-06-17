import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FirebaseService } from 'src/services/firebase.service';
import { SharingService } from 'src/services/sharing.service';
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

  constructor(
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService,
    private messagesService: MessagesService,
  ) {
    this.clientForm = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['client', Validators.required],
      owner: [true, Validators.required],
      address: ['', Validators.required],
      contractURL: ['http://dirección/google-drive/contrato.doc', Validators.required], // File URL
      dateContractFrom: ['', Validators.required],
      dateContractTo: ['', Validators.required],
    });
    this.currentYear = new Date().getFullYear();
  }
  
  ngOnInit() {}

  addContract() {}

  addClient() {
    console.log(this.clientForm.value);
    let opts = {
      name: this.clientForm.get('name').value,
      type: this.clientForm.get('type').value,
      owner: this.clientForm.get('owner').value,
      address: this.clientForm.get('address').value,
      contractURL: this.clientForm.get('contractURL').value,
      dateContractFrom: this.clientForm.get('dateContractFrom').value,
      dateContractTo: this.clientForm.get('dateContractTo').value,
    }
    this.messagesService.showLoading({ msg: 'Agregando cliente...' });
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
}
