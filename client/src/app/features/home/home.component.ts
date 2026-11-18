import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ShopService } from '../../core/services/shop.service';
import { ShopParams } from '../../shared/models/shopParams';
import { Product } from '../../shared/models/product';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatIcon, CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  shopService = inject(ShopService);

  products = signal<Product[]>([]);
  loading = signal(true);

  /** The product shown on the hero podium. */
  heroProduct = computed(() => this.products()[0]);

  /** Soft card tints, cycled across the featured grid. */
  tints = ['#e8f1ff', '#e6f7f4', '#f3eefe', '#fdf3e7'];

  steps = [
    { icon: 'travel_explore', title: 'Discover', text: 'Browse curated fragrances from the world’s most loved houses.' },
    { icon: 'shopping_bag', title: 'Add to cart', text: 'Pick your favourites and check out securely in seconds.' },
    { icon: 'local_shipping', title: 'Delivered', text: 'Your new signature scent arrives at your door, ready to wear.' },
  ];

  ngOnInit(): void {
    this.shopService.getBrands();

    const params = new ShopParams();
    params.pageSize = 4;
    this.shopService.getProducts(params).subscribe({
      next: res => {
        this.products.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
