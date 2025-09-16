import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../shared/models/product';
import { ShopService } from '../../core/services/shop.service';
import { ProductItemComponent } from "./product-item/product-item.component";
import { MatDialog } from '@angular/material/dialog';
import { FilterDialogComponent } from './filter-dialog/filter-dialog.component';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-shop',
  imports: [ProductItemComponent, MatButton,MatCard,MatIcon],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  products:Product[]=[];
  selectedBrands : string[]=[];
  selectedTypes : string[]=[];
  private dialogService = inject(MatDialog);
  constructor(private shopService:ShopService){
  }
  ngOnInit(): void {
    this.initializeShop();

  }
  initializeShop(){
    this.shopService.getTypes();
    this.shopService.getBrands();
    this.shopService.getProducts().subscribe({
      next:response=>{
        this.products=response.data
        console.log(this.products);
      },
      error: error => console.log(error),
    })
  }
  openFiltersDialog(){
    const dialogRef = this.dialogService.open(FilterDialogComponent, {
      minWidth:'500px',
      data:{
        selectedBrands:this.selectedBrands,
        selectedTypes:this.selectedTypes
      }
    });
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.selectedBrands = result.selectedBrands;
          this.selectedTypes = result.selectedTypes;
          this.shopService.getProducts(this.selectedBrands,this.selectedTypes).subscribe({
            next:response=>{
              this.products=response.data
              console.log(this.products);
            },
            error: error => console.log(error),
          });
        }
      }
    });
  }
}
