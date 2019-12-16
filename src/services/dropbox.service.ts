import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class DropboxService {
  private BASE_URL: any

  constructor(
    private httpClient: HttpClient
  ) {
    this.BASE_URL = 'https://content.dropboxapi.com/2';
  }

  public getFiles() {
    return this.httpClient.post(this.BASE_URL + '/files/list_folder', {
      "path": "/chiclana",
      "recursive": false,
      "include_media_info": false,
      "include_deleted": false,
      "include_has_explicit_shared_members": false,
      "include_mounted_folders": true,
      "include_non_downloadable_files": true
    });
  }

  public uploadFile(file: File, userFolder) {
    const data = {
      "path": `/chiclana/${userFolder}/${file.name}`,
      "mode": "add",
      "autorename": true,
      "mute": false,
      "strict_conflict": false
    };

    let _headers = new HttpHeaders()
      .append('Content-Type', 'application/octet-stream')
      .append('Dropbox-API-Arg', JSON.stringify(data))

    const formData: FormData = new FormData();
    formData.append('0', file, file.name);

    return this.httpClient.post(this.BASE_URL + '/files/upload', {}, { headers: _headers });
  }
}

