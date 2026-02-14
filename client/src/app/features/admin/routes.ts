import { Route } from "@angular/router";
import { AddEditProductComponent } from "./add-edit-product/add-edit-product.component";
import { AdminComponent } from "./admin.component";
import { adminGuard } from "../../core/guards/admin-guard";
import { authGuard } from "../../core/guards/auth-guard";

export const adminRoutes:Route[] = [
    { path: '', component: AdminComponent, canActivate: [authGuard, adminGuard]},
    { path: 'product', component: AddEditProductComponent, canActivate: [authGuard, adminGuard]},
    { path: 'product/:id', component: AddEditProductComponent, canActivate: [authGuard, adminGuard]}
]