import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FirebaseService } from 'src/services/firebase.service';
import { MessagesService } from 'src/services/messages.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-consortium-form',
  templateUrl: './consortium-form.component.html',
  styleUrls: ['./consortium-form.component.scss'],
})
export class ConsortiumFormComponent implements OnInit {
  @Input() editMode: boolean;
  @Input() data: any;
  @ViewChild('name') name: any;
  public consortiumForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService,
    private messagesService: MessagesService,
  ) {
    this.consortiumForm = this.formBuilder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  ngOnInit() {
    console.log('this.editMode', this.editMode)
    console.log('this.data', this.data)

    if (this.data) this.setForm();
  }

  private setForm() {
    this.consortiumForm.patchValue({ name: this.data.name });
    this.consortiumForm.patchValue({ address: this.data.address });
  }

  public addConsortium() {
    let msg = { msg: (this.editMode ? 'Modificando' : 'Agregando') + ' consorcio...' };
    this.messagesService.showLoading(msg);

    let opts = {
      name: this.consortiumForm.get('name').value,
      address: this.consortiumForm.get('address').value,
      type: 'consortium'
    }

    if (this.editMode) {
      this.firebaseService.updateObject(`consortiums/${this.data.key}`, opts)
        .then(() => {
          this.onSuccess({ msg: `Consorcio "${opts.name}" agregado correctamente!` });
          this.consortiumForm.patchValue({ name: '', address: '' });
          setTimeout(() => { this.name.setFocus() }, 1000);
        })
        .catch(err => {
          this.onError({ msg: 'Ha ocurrido un error. ', err });
        });
      }
      else {
        this.firebaseService.createObject('consortiums', opts)
          .then(() => {
            this.onSuccess({ msg: `Consorcio "${opts.name}" agregado correctamente!` });
            this.consortiumForm.patchValue({ name: '', address: '' });
            setTimeout(() => { this.name.setFocus() }, 1000);
          })
          .catch(err => {
            this.onError({ msg: 'Ha ocurrido un error. ', err });
          });
      }
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
