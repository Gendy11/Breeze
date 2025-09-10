import { Component, OnInit } from '@angular/core';
import { Product } from '../../shared/models/product';
import { ShopService } from '../../core/services/shop.service';
import { MatIcon } from '@angular/material/icon';
import {MatCard} from '@angular/material/card';

@Component({
  selector: 'app-shop',
  imports: [MatCard],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  products:Product[]=[];
  constructor(private shopService:ShopService){
  }
  ngOnInit(): void {
    console.log('inn')
    this.shopService.getProducts().subscribe({
      next:response=>{
        this.products=response.data
        console.log(this.products);
      },
      error: error => console.log(error),
    })
  }
}
