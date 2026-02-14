import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrderParams } from '../../shared/models/orderParams';
import { Pagination } from '../../shared/models/pagination';
import { Order, OrderToCreate } from '../../shared/models/order';
import { Product, ProductToCreate } from '../../shared/models/product';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getOrders(orderParams: OrderParams){
    let params = new HttpParams();
    if(orderParams.filter && orderParams.filter !== 'all'){
      params = params.append('status', orderParams.filter);
    }
    params = params.append('pageIndex', orderParams.pageNumber);
    params = params.append('pageSize', orderParams.pageSize);
    return this.http.get<Pagination<Order>>(this.baseUrl + 'admin/orders', {params});
  }
  getOrder(id: number){
    return this.http.get<Order>(this.baseUrl + 'admin/orders/' + id);
  }
  refundOrder(id: number){
    return this.http.post<Order>(this.baseUrl + 'admin/orders/refund/' + id, {});  
  }


  addProduct(productToCreate: ProductToCreate){
    return this.http.post<Product>(this.baseUrl + 'products', productToCreate);
  }
  updateProduct(id: number, productToUpdate: ProductToCreate){
    return this.http.put(this.baseUrl + 'products/' + id, productToUpdate);
  }
  deleteProduct(id: number){
      return this.http.delete(this.baseUrl + 'products/' + id);
  }
}
