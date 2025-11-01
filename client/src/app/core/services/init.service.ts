import { inject, Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { forkJoin, of } from 'rxjs';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private cartService = inject(CartService)
  private accountService = inject(AccountService)
  init() {
    const cartId = localStorage.getItem('cart_id');
    const cart$ = cartId ? this.cartService.getCart(cartId) : of(null);

    const user$ = this.accountService.getuserInfo();

    // run both requests in parallel and wait for both to complete
    return forkJoin([user$, cart$]);
  }
}
