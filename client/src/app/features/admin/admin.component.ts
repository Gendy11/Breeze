import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { Order } from '../../shared/models/order';
import { AdminService } from '../../core/services/admin.service';
import { OrderParams } from '../../shared/models/orderParams';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatLabel, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../core/services/dialog.service';
import { ShopService } from '../../core/services/shop.service';
import { ShopParams } from '../../shared/models/shopParams';
import { Product } from '../../shared/models/product';
import { Pagination } from '../../shared/models/pagination';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-admin',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatIcon,
    MatButton,
    MatSelectModule,
    DatePipe,
    CurrencyPipe,
    MatLabel,
    MatTooltipModule,
    MatTabsModule,
    RouterLink
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  displayedOrderColumns: string[] = ['id', 'buyerEmail', 'orderDate', 'total', 'status', 'action'];
  displayedProductColumns: string[] = ['id', 'name', 'price','type','brand','quantityInStock', 'action'];
  dataSourceOrders = new MatTableDataSource<Order>();
  dataSourceProducts = new MatTableDataSource<Product>();
  private adminService = inject(AdminService);
  private dialogService = inject(DialogService);
  private shopService = inject(ShopService);
  private snack = inject(SnackbarService);
  orderParams = new OrderParams();
  shopParams = new ShopParams();
  
  totalOrders = 0;
  totalProducts = 0;

  statusOptions = ['All', 'PaymentReceived', 'PaymentMismatch', 'Refunded', 'Pending','Accepted'];

  ngOnInit(): void {
    this.loadOrders();
    this.loadProducts()
  }


  loadOrders(){
    this.adminService.getOrders(this.orderParams).subscribe({
      next: (response) => {
        if(response.data){
          this.dataSourceOrders.data = response.data;
          this.totalOrders = response.count;
        }
      }
    });
  }
  loadProducts() {
    this.shopService.getProducts(this.shopParams).subscribe({
      next: response => {
        this.totalProducts = response.count;
        this.dataSourceProducts.data = response.data;
      },
      error: error => console.log(error),
    })
  }

  onOrderPageChange(event: PageEvent){
    this.orderParams.pageNumber = event.pageIndex + 1;
    this.orderParams.pageSize = event.pageSize;
    this.loadOrders();
  }

  onProductPageChange(event: PageEvent){
    this.shopParams.pageNumber = event.pageIndex + 1;
    this.shopParams.pageSize = event.pageSize;
    this.loadProducts();
  }

  onFilterSelect(event: MatSelectChange){
    this.orderParams.filter = event.value;
    this.orderParams.pageNumber = 1;
    this.loadOrders();
  }
  async openOrderConfirmDialog(id: number){
    const confirmed = await this.dialogService.confirm('Confirm Refund', `Are you sure you want to refund order ${id}?`);
    if(confirmed){
      this.refundOrder(id);
    }
  }
  async openProductConfirmDialog(id: number){
    const confirmed = await this.dialogService.confirm('Confirm Delete', `Are you sure you want to delete product ${id}?`);
    if(confirmed){
      this.deleteProduct(id);
    }
  }

  refundOrder(id: number){
    this.adminService.refundOrder(id).subscribe({
      next: order =>{
        this.dataSourceOrders.data = this.dataSourceOrders.data.map(o => o.id == id ? order : o);
        this.loadProducts();
        this.snack.success('Order refunded successfully');
      }
    })
  }
  deleteProduct(id: number){
    this.adminService.deleteProduct(id).subscribe({
      next: () => {
        this.dataSourceProducts.data = this.dataSourceProducts.data.filter(p => p.id != id);
        this.totalProducts--;
        this.snack.success('Product deleted successfully');
      }
    })
  }
}
