import { Component, OnInit, ViewChild } from '@angular/core';
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

  ngOnInit() {}

  public addConsortium() {
    let opts = {
      name: this.consortiumForm.get('name').value,
      address: this.consortiumForm.get('address').value,
      type: 'consortium'
    }

    this.messagesService.showLoading({ msg: 'Agregando consorcio...' });
    this.firebaseService.createObject('clients', opts)
      .then(() => {
        this.onSuccess({ msg: `Consorcio "${opts.name}" agregado correctamente!` });
        this.consortiumForm.patchValue({ name: '', address: '' });
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
