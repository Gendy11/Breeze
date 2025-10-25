import { Routes } from '@angular/router';
import { ShopComponent } from './features/shop/shop.component';
import { LoginComponent } from './features/account/login/login.component';
import { RegisterComponent } from './features/account/register/register.component';
import { CartComponent } from './features/cart/cart.component';
import { ProductDetailsComponent } from './features/shop/product-details/product-details.component';

export const routes: Routes = [
  {path:'',component:ShopComponent},
  {path:'shop',component:ShopComponent},
  {path:'shop/:id', component:ProductDetailsComponent},
  {path:'cart',component:CartComponent},
  {path:'account/login',component:LoginComponent},
  {path:'account/register',component:RegisterComponent}

];
