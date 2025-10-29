import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { AccountService } from '../../../core/services/account.service';
import { Router } from '@angular/router';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatButton,
    JsonPipe
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);

  validationErrors?:string[];

  registerForm = this.fb.group({
    firstName:[''],
    lastName:[''],
    email:[''],
    password:[''],
  });
  onSubmit(){
    this.accountService.register(this.registerForm.value).subscribe({
      next:()=>{
        this.router.navigateByUrl('/account/login');
      },
      error:errors =>{
        this.validationErrors = errors;
        
      }
    })
  }
}
