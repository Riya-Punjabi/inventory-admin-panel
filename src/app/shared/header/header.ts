import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  imports: [ButtonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class Header {

  profile: any;
  constructor(private router: Router) { }

  ngOnInit() {
    const storedProfile = localStorage.getItem('profile');
    if (storedProfile) {
      this.profile = JSON.parse(storedProfile);
    }
  }

  logout() {
    localStorage.removeItem('profile');
    localStorage.removeItem('authToken');

    this.router.navigate(['/login']);
  }
}
