import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, TooltipModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login {

  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router, private messageSevice: MessageService) {

    this.loginForm = this.fb.group({
      viplcode: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      loginas: [0]

    });
  }

  login() {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.api.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        console.log(res);
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('profile', JSON.stringify(res));
        this.messageSevice.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: 'Welcome back!',
          life: 2000
        });

        this.router.navigate(['admin/dashboard']);
      },
      error: (err) => {
        console.log(err);
        this.messageSevice.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: err?.error?.message || 'Invalid credentials',
          life: 2000
        });
      }
    });

  }
}
