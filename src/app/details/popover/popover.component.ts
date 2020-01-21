import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {

  constructor(
    private popoverController: PopoverController,
  ) { }

  ngOnInit() {}

  public edit() {
    this.popoverController.dismiss('edit')
  }

  public remove() {
    this.popoverController.dismiss('remove')
  }
}
