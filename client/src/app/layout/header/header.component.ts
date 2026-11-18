import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { BusyService } from '../../core/services/busy.service';
import {MatProgressBar} from '@angular/material/progress-bar'
import { CartService } from '../../core/services/cart.service';
import {MatBadgeModule} from '@angular/material/badge';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { IsAdminDirective } from '../../shared/directives/is-admin';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIconModule,
    RouterLink,
    MatProgressBar,
    RouterLinkActive,
    MatBadgeModule,
    MatMenuTrigger,
    MatMenu,
    MatDivider,
    MatMenuItem,
    IsAdminDirective
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  accountService = inject(AccountService)
  busyService = inject(BusyService)
  cartService = inject(CartService)
  private router = inject(Router)

  /** Current URL, used to highlight the mobile dock's Account tab on any /account/* page. */
  url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );


  logout(){
    this.accountService.logout().subscribe({
      next:()=>{
        this.accountService.currentUser.set(null);
        this.router.navigateByUrl('/');
      }
    })
  }
}
