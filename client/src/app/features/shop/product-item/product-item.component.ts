import { Component, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { Product } from '../../../shared/models/product';
import { CartService } from '../../../core/services/cart.service';

const TINTS = ['#e8f1ff', '#e6f7f4', '#f3eefe', '#fdf3e7'];

@Component({
  selector: 'app-product-item',
  imports: [CurrencyPipe, MatIcon, RouterLink],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss'
})
export class ProductItemComponent {
  product = input<Product>();
  cartService = inject(CartService);

  /** Brief "Added" feedback after clicking the button. */
  justAdded = signal(false);
  private addedTimer?: ReturnType<typeof setTimeout>;

  /** Stable soft background per product. */
  tint = computed(() => TINTS[(this.product()?.id ?? 0) % TINTS.length]);

  quantityInCart = computed(() => {
    const p = this.product();
    const cart = this.cartService.cart();
    if (!p) return 0;
    const item = cart?.items.find(i => i.productId === p.id);
    return item?.quantity ?? 0;
  });

  add(p: Product) {
    this.cartService.addItemToCart(p);
    this.justAdded.set(true);
    clearTimeout(this.addedTimer);
    this.addedTimer = setTimeout(() => this.justAdded.set(false), 1400);
  }
}
