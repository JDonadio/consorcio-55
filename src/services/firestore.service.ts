import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    private storage: AngularFireStorage,
  ) { }

  ngOnInit() {}

  public uploadFile(consortium: string, folder: string, file: File): Promise<any> {
    const path = `${consortium}/${folder}/${file.name}`;
    const ref = this.storage.ref(path);

    return new Promise((resolve, reject) => {
      this.storage.upload(path, file)
        .then(() => {
          ref.getDownloadURL().toPromise()
            .then(url => { return resolve(url) })
            .catch(err => {
              console.log('Error trying to get the download URL', err);
              return resolve('');
            })
        })
        .catch(err => {
          console.log('Error trying to upload file', err);
          return resolve('');
        })
    });
  }
}
