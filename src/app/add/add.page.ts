import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
  public isClient: boolean;

  constructor() {
    this.isClient = true;
  }
  
  ngOnInit() {}

  public changeType(type) {
    this.isClient = type;
  }

}
