import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CartService } from '../../core/services/cart.service';
import { CartItemComponent } from './cart-item/cart-item.component';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';

@Component({
  selector: 'app-cart',
  imports: [CartItemComponent, OrderSummaryComponent, RouterLink, MatIcon],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  cartService = inject(CartService);

  items = computed(() => this.cartService.cart()?.items ?? []);
  count = computed(() => this.cartService.itemCount() ?? 0);

  /** Same soft tints as the shop cards, so a product keeps its colour. */
  tints = ['#e8f1ff', '#e6f7f4', '#f3eefe', '#fdf3e7'];
}
