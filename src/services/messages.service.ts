import { Injectable } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private loading: any;

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
  ) {
    this.loading = null;
  }

  public showConfirm(opts: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.alertCtrl.create({
        header: opts.title,
        subHeader: opts.subtitle,
        message: opts.msg,
        buttons: [
          {
            text: opts.cancelText || 'Cancelar',
            role: 'cancel',
            handler: () => { resolve(false) }
          },
          {
            text: 'Ok',
            handler: () => { resolve(true) }
          }
        ],
        backdropDismiss: false,
        keyboardClose: false
      }).then(alert => alert.present());
    });
  }

  public showInputConfirm(opts: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.alertCtrl.create({
        header: opts.title,
        subHeader: opts.subtitle,
        message: opts.msg,
        inputs: opts.inputs,
        buttons: [
          {
            text: opts.cancelText || 'Cancelar',
            role: 'cancel',
            handler: () => { resolve(false) }
          },
          {
            text: 'Ok',
            handler: (data) => { console.log(data); resolve(_.values(data)) }
          }
        ],
      }).then(alert => alert.present().then(() => {
        const firstInput: any = document.querySelector('ion-alert input');
        firstInput.focus();
        return;
      }));
    });
  }

  public async showToast(opts) {
    const toast = await this.toastCtrl.create({
      message: opts.msg,
      duration: opts.duration || 3000
    });
    toast.present();
  }

  public async showLoading(opts) {
    this.loading = await this.loadingCtrl.create({ message: opts.msg });
    this.loading.present();
  }

  public dismissLoading() {
    try {
      this.loading.dismiss();
      this.loading = null;
    } catch (error) {
      console.log('Error trying to dismiss loading', error);
    }
  }
}
