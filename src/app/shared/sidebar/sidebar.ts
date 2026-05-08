import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})

export class Sidebar {
  @Output() readonly navigate = new EventEmitter<void>();
  profileRes: any;

  ngOnInit() {
    let profile = localStorage.getItem('profile')
    if (profile) {
      this.profileRes = JSON.parse(profile);
    }

  }

}
