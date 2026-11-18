import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ShopService } from '../../../core/services/shop.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../shared/models/product';
import { ShopParams } from '../../../shared/models/shopParams';
import { ProductItemComponent } from '../product-item/product-item.component';

@Component({
  selector: 'app-product-details',
  imports: [CurrencyPipe, MatIcon, RouterLink, ProductItemComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  private shopService = inject(ShopService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  product = signal<Product | null>(null);
  related = signal<Product[]>([]);
  loading = signal(true);
  notFound = signal(false);

  /** Quantity the user wants in their bag. */
  quantity = signal(1);

  quantityInCart = computed(() => {
    const p = this.product();
    if (!p) return 0;
    return this.cartService.cart()?.items.find(i => i.productId === p.id)?.quantity ?? 0;
  });

  stock = computed(() => this.product()?.quantityInStock ?? 0);

  /** Lowest allowed value: 0 lets the user remove an item that is already in the bag. */
  minQuantity = computed(() => (this.quantityInCart() > 0 ? 0 : 1));

  stockState = computed(() => {
    const s = this.stock();
    if (s === 0) return { tone: 'out', label: 'Sold out' };
    if (s <= 5) return { tone: 'low', label: `Only ${s} left. Order soon` };
    return { tone: 'in', label: 'In stock, ready to ship' };
  });

  action = computed(() => {
    const q = this.quantity();
    const inCart = this.quantityInCart();
    if (this.stock() === 0) return { label: 'Sold out', icon: 'block', disabled: true };
    if (inCart > 0 && q === 0) return { label: 'Remove from bag', icon: 'delete_outline', disabled: false };
    if (inCart > 0 && q === inCart) return { label: 'In your bag', icon: 'check', disabled: true };
    if (inCart > 0) return { label: 'Update bag', icon: 'sync', disabled: false };
    return { label: 'Add to bag', icon: 'shopping_bag', disabled: false };
  });

  ngOnInit(): void {
    // Re-load when navigating between products (e.g. from "You may also like").
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = Number(params.get('id'));
      if (id) this.load(id);
    });
  }

  private load(id: number) {
    this.loading.set(true);
    this.notFound.set(false);
    this.shopService.getProduct(id).subscribe({
      next: product => {
        if (!product) {
          // API answered with no product (deleted / unknown id)
          this.product.set(null);
          this.loading.set(false);
          this.notFound.set(true);
          return;
        }
        this.product.set(product);
        this.quantity.set(this.quantityInCart() || 1);
        this.loading.set(false);
        this.loadRelated(product);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      }
    });
  }

  private loadRelated(product: Product) {
    const params = new ShopParams();
    params.types = [product.type];
    params.pageSize = 5;
    this.shopService.getProducts(params).subscribe({
      next: res => this.related.set(res.data.filter(p => p.id !== product.id).slice(0, 4)),
      error: () => this.related.set([])
    });
  }

  decrement() {
    this.quantity.update(q => Math.max(this.minQuantity(), q - 1));
  }

  increment() {
    this.quantity.update(q => Math.min(this.stock(), q + 1));
  }

  updateCart() {
    const p = this.product();
    if (!p || this.action().disabled) return;

    const diff = this.quantity() - this.quantityInCart();
    if (diff > 0) {
      this.cartService.addItemToCart(p, diff);
    } else if (diff < 0) {
      this.cartService.removeItemFromCart(p.id, -diff);
      if (this.quantity() === 0) this.quantity.set(1);
    }
  }
}
