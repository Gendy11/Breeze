import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ShopService } from '../../core/services/shop.service';
import { Pagination } from '../../shared/models/pagination';
import { Product } from '../../shared/models/product';
import { ShopParams } from '../../shared/models/shopParams';
import { ProductItemComponent } from './product-item/product-item.component';

@Component({
  selector: 'app-shop',
  imports: [ProductItemComponent, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, MatPaginator, FormsModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  shopService = inject(ShopService);
  private destroyRef = inject(DestroyRef);
  private searchTerms = new Subject<string>();

  products = signal<Pagination<Product> | null>(null);
  loading = signal(true);
  shopParams = new ShopParams();

  sortOptions = [
    { name: 'Alphabetical', value: 'name', icon: 'sort_by_alpha' },
    { name: 'Price: Low to High', value: 'priceAsc', icon: 'trending_up' },
    { name: 'Price: High to Low', value: 'priceDesc', icon: 'trending_down' },
  ];
  pageSizeOptions = [5, 10, 15, 20];

  /** Bumped whenever filters change, so templates re-read the (mutable) shopParams. */
  private filterVersion = signal(0);

  activeSortName = computed(() => {
    this.filterVersion();
    return this.sortOptions.find(s => s.value === this.shopParams.sort)?.name ?? 'Sort';
  });

  hasActiveFilters = computed(() => {
    this.filterVersion();
    const p = this.shopParams;
    return p.brands.length > 0 || p.types.length > 0 || !!p.search;
  });

  readonly skeletons = Array.from({ length: 10 }, (_, i) => i);

  ngOnInit(): void {
    this.shopService.getTypes();
    this.shopService.getBrands();
    this.getProducts();

    // Live search: wait until the user pauses typing.
    this.searchTerms.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.applyChanges());
  }

  getProducts() {
    this.loading.set(true);
    this.shopService.getProducts(this.shopParams).subscribe({
      next: response => {
        this.products.set(response);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Resets to page 1 and reloads after any filter/sort/search change. */
  private applyChanges() {
    this.shopParams.pageNumber = 1;
    this.filterVersion.update(v => v + 1);
    this.getProducts();
  }

  onSearchInput(term: string) {
    this.searchTerms.next(term.trim());
  }

  onSearchSubmit() {
    this.applyChanges();
  }

  clearSearch() {
    this.shopParams.search = '';
    this.searchTerms.next('');
    this.applyChanges();
  }

  isBrandSelected(brand: string) {
    return this.shopParams.brands.includes(brand);
  }

  isTypeSelected(type: string) {
    return this.shopParams.types.includes(type);
  }

  toggleBrand(brand: string) {
    this.shopParams.brands = this.toggle(this.shopParams.brands, brand);
    this.applyChanges();
  }

  toggleType(type: string) {
    this.shopParams.types = this.toggle(this.shopParams.types, type);
    this.applyChanges();
  }

  setSort(value: string) {
    if (this.shopParams.sort === value) return;
    this.shopParams.sort = value;
    this.applyChanges();
  }

  resetFilters() {
    const pageSize = this.shopParams.pageSize;
    this.shopParams = new ShopParams();
    this.shopParams.pageSize = pageSize;
    this.searchTerms.next('');
    this.applyChanges();
  }

  handlePageEvent(event: PageEvent) {
    this.shopParams.pageNumber = event.pageIndex + 1;
    this.shopParams.pageSize = event.pageSize;
    this.getProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter(v => v !== value) : [...list, value];
  }
}
