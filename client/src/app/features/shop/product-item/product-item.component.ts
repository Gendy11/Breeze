import { Component, computed, inject, input } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { CartService } from '../../../core/services/cart.service';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-product-item',
  imports: [MatCard, MatCardContent, CurrencyPipe, MatCardActions, MatIcon, RouterLink, MatButton],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss'
})
export class ProductItemComponent {
  product = input<Product>();
  cartService = inject(CartService);
  quantityInCart = computed(() => {
    const p = this.product();
    const cart = this.cartService.cart();
    if (!p) return 0;
    const item = cart?.items.find(i => i.productId === p.id);
    return item?.quantity ?? 0;
  });
}
