import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FirebaseService } from 'src/services/firebase.service';
import { MessagesService } from 'src/services/messages.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-client-details-modal',
  templateUrl: './client-details-modal.component.html',
  styleUrls: ['./client-details-modal.component.scss'],
})
export class ClientDetailsModalComponent implements OnInit {

  public data: any;
  public clientForm: FormGroup;
  public editMode: boolean;
  public currentYear: number;
  
  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private firebaseService: FirebaseService,
    private messagesService: MessagesService,
    private formBuilder: FormBuilder,
  ) {
    this.editMode = false;
    this.currentYear = new Date().getFullYear();
  }
  
  ngOnInit() {
    this.data = _.cloneDeep(this.navParams.data);
    console.log(this.data);
    this.clientForm = this.formBuilder.group({
      name: [this.data.name, Validators.required],
      type: [this.data.type, Validators.required],
      owner: [this.data.owner, Validators.required],
      address: [this.data.address, Validators.required],
      contractURL: [this.data.contractURL, Validators.required], // File URL
      dateContractFrom: [this.data.dateContractFrom, Validators.required],
      dateContractTo: [this.data.dateContractTo, Validators.required],
    });
  }

  async askForRemove() {
    let resp = await this.messagesService.showConfirm(
      { title: 'Eliminar cliente', msg: `¿Estás seguro de eliminar a ${this.data.name.toUpperCase()}?` }
    );

    if (!resp) return;

    try {
      this.firebaseService.removeObject(`clients/${this.data.key}`);
      this.messagesService.showToast({ msg: `El cliente ${this.data.name} ha sido eliminado correctamente!` });
      this.modalCtrl.dismiss();
    } catch (err) {
      console.log(err);
      this.messagesService.showToast({ msg: 'Ha ocurrido un error. No se pudo eliminar el cliente.' });
    }
  }

  async askForEdit() {
    let resp = await this.messagesService.showConfirm(
      { title: 'Eliminar cliente', msg: `¿Estás seguro de editar a ${this.data.name.toUpperCase()}?` }
    );

    if (!resp) return;

    let opts = {
      name: this.clientForm.get('name').value,
      type: this.clientForm.get('type').value,
      owner: this.clientForm.get('owner').value,
      address: this.clientForm.get('address').value,
      contractURL: this.clientForm.get('contractURL').value,
      dateContractFrom: this.clientForm.get('dateContractFrom').value,
      dateContractTo: this.clientForm.get('dateContractTo').value,
    }

    try {
      this.firebaseService.updateObject(`clients/${this.data.key}`, opts);
      this.messagesService.showToast({ msg: `El cliente ${this.data.name} ha sido modificado correctamente!` });
      this.modalCtrl.dismiss();
    } catch (err) {
      console.log(err);
      this.messagesService.showToast({ msg: 'Ha ocurrido un error. No se pudo modificar el cliente.' });
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
