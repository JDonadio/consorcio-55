import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    private storage: AngularFireStorage,
  ) { }

  ngOnInit() {}

  public async uploadFiles(clientFolderName: string, files: any) {
    let response = [];

    for (let f of files) {
      let result = await this.doUpload(clientFolderName, f);
      response.push(result);
    };

    return response;
  }

  private doUpload(folder: string, f: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let path = `${folder}/${f.name}`;
      let ref = this.storage.ref(path);
      this.storage.upload(path, f)
        .then(() => {
          ref.getDownloadURL().toPromise()
            .then(url => resolve(url))
            .catch(err => { 
              console.log('Error trying to get the download URL', err);
              resolve('');
            })
        })
        .catch(err => {
          console.log('Error trying to upload file', err);
          resolve('');
        })
    })
  }
}
