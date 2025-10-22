import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButton } from "@angular/material/button";
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { BusyService } from '../../core/services/busy.service';
import {MatProgressBar} from '@angular/material/progress-bar'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, MatButton, RouterLink,MatProgressBar],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  accountService = inject(AccountService)
  busyService = inject(BusyService)
  private router = inject(Router)
  

  logout(){
    this.accountService.logout().subscribe({
      next:()=>{
        this.accountService.currentUser.set(null);
        this.router.navigateByUrl('/');
      }
    })
  }
}
