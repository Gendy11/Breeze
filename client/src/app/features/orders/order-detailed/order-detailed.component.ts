import { Component, inject, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Order } from '../../../shared/models/order';
import { MatIcon } from '@angular/material/icon';
import { OrderStatusComponent } from '../../../shared/components/order-status/order-status.component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AddressPipe } from "../../../shared/pipes/address-pipe";
import { PaymentPipe } from "../../../shared/pipes/payment-pipe";
import { AccountService } from '../../../core/services/account.service';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-order-detailed',
  imports: [
    MatIcon,
    OrderStatusComponent,
    DatePipe,
    CurrencyPipe,
    AddressPipe,
    PaymentPipe,
    RouterLink
],
  templateUrl: './order-detailed.component.html',
  styleUrl: './order-detailed.component.scss'
})
export class OrderDetailedComponent implements OnInit {
  private orderService = inject(OrderService);
  private activatedRoute = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private adminService = inject(AdminService)
  private router = inject(Router)
  order?:Order;
  /** Soft backgrounds for item thumbnails, matching the shop cards. */
  tints = ['#e8f1ff', '#e6f7f4', '#f3eefe', '#fdf3e7'];
  buttonText = this.accountService.isAdmin() ? 'Return to admin' : 'Return to orders';

  ngOnInit(): void {
    this.loadOrder();
  }
  
  onReturnClick(){
    this.accountService.isAdmin() ? this.router.navigateByUrl('/admin') : this.router.navigateByUrl('/orders');
  }
  loadOrder(){
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    console.log(id);
    if(!id) return;

    const loadOrderData = this.accountService.isAdmin()? this.adminService.getOrder(+id) : this.orderService.getOrderDetailed(+id);
    loadOrderData.subscribe({
      next: order => {
        this.order = order;
        console.log(this.order);
      } 
    })
  }
}
