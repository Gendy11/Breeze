import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product, ProductToCreate } from '../../../shared/models/product';
import { ShopService } from '../../../core/services/shop.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { TextInputComponent } from '../../../shared/components/text-input/text-input.component';
import { BusyService } from '../../../core/services/busy.service';
import { AdminService } from '../../../core/services/admin.service';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-add-edit-product',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    MatIcon,
    RouterLink,
    TextInputComponent
  ],
  templateUrl: './add-edit-product.component.html',
  styleUrl: './add-edit-product.component.scss'
})
export class AddEditProductComponent implements OnInit {
  private fb = inject(FormBuilder);
  private shopService = inject(ShopService);
  private activatedRoute = inject(ActivatedRoute);
  private adminService = inject(AdminService);  
  private router = inject(Router);
  private snack = inject(SnackbarService);
  busyService = inject(BusyService);

  product?: Product;
  productForm = this.fb.group({
    name:['',Validators.required],
    description:['',Validators.required],
    price: [null as number | null, [Validators.required,Validators.min(0)]],
    pictureUrl:['',Validators.required],
    type:['',Validators.required],
    brand:['',Validators.required],
    quantityInStock: [null as number | null, [Validators.required,Validators.min(0)]]
  });
  /** Live values for the preview card. */
  preview = toSignal(this.productForm.valueChanges, { initialValue: this.productForm.getRawValue() });

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(){
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(!id) return ;
    this.shopService.getProduct(+id).subscribe({
      next:product => {
        this.product=product;
        this.populateForm();
      },
      error:error => console.log(error)
    })
  }

  populateForm(){
    if(!this.product) return;
    this.productForm.patchValue({
      name: this.product.name,
      description: this.product.description,
      price: this.product.price,
      pictureUrl: this.product.pictureUrl,
      type: this.product.type,
      brand: this.product.brand,
      quantityInStock: this.product.quantityInStock
    });
  }

  onSubmit(){
    if (!this.productForm.valid) return;
    const value = this.productForm.getRawValue();
    if (this.product) {
      const payload: Product = {
        id: this.product.id,
        name: value.name ?? '',
        description: value.description ?? '',
        price: value.price ?? 0,
        pictureUrl: value.pictureUrl ?? '',
        type: value.type ?? '',
        brand: value.brand ?? '',
        quantityInStock: value.quantityInStock ?? 0
      };
      this.adminService.updateProduct(this.product.id, payload).subscribe({
        next: (product) => {
          this.snack.success('Product updated successfully');
           this.router.navigateByUrl('/admin');
           console.log(product);
        },
        error: (err) => {
          this.snack.error('Error updating product');
          console.log('Error updating product', err)
        }
      });
    } else {
      const payload: ProductToCreate = {
        name: value.name ?? '',
        description: value.description ?? '',
        price: value.price ?? 0,
        pictureUrl: value.pictureUrl ?? '',
        type: value.type ?? '',
        brand: value.brand ?? '',
        quantityInStock: value.quantityInStock ?? 0
      };
      this.adminService.addProduct(payload).subscribe({
        next: (product) => {
          this.snack.success('Product created successfully');
          this.router.navigateByUrl('/admin');
          console.log(product);
        },
        error: (err) => {
          this.snack.error('Error creating product');
          console.log('Error creating product', err)
        }
      });
    }
  }
}
