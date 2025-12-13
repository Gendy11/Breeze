import { Component, inject, OnDestroy, OnInit, signal, Signal } from '@angular/core';
import { OrderSummaryComponent } from "../../shared/components/order-summary/order-summary.component";
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { Router, RouterLink } from "@angular/router";
import { MatAnchor, MatButton } from "@angular/material/button";
import { StripeService } from '../../core/services/stripe.service';
import { ConfirmationToken, StripeAddressElement, StripeAddressElementChangeEvent, StripePaymentElement, StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { SnackbarService } from '../../core/services/snackbar.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Address } from '../../shared/models/user';
import { first, firstValueFrom } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { CheckoutDeliveryComponent } from "./checkout-delivery/checkout-delivery.component";
import { CheckoutReviewComponent } from "./checkout-review/checkout-review.component";
import { CartService } from '../../core/services/cart.service';
import { CurrencyPipe, JsonPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderToCreate, ShippingAddress } from '../../shared/models/order';
import { OrderService } from '../../core/services/order.service';
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { SignalrService } from '../../core/services/signalr.service';

@Component({
  selector: 'app-checkout',
  imports: [
    OrderSummaryComponent,
    MatStepperModule,
    RouterLink,
    MatAnchor,
    MatButton,
    RouterLink,
    MatCheckboxModule,
    CheckoutDeliveryComponent,
    CheckoutReviewComponent,
    CurrencyPipe,
    MatProgressSpinnerModule,
    MatRadioButton,
    MatRadioGroup
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private stripeService = inject(StripeService);
  private snackBar = inject(SnackbarService);
  private accountService = inject(AccountService);
  private orderService = inject(OrderService);
  private signalrService = inject(SignalrService);
  private router = inject(Router);
  cartService = inject(CartService);
  addressElement?: StripeAddressElement;
  paymentElement?: StripePaymentElement;
  saveAddress = false;
  completionStatus = signal<{ address: boolean, card: boolean, delivery: boolean }>({
    address: false, card: false, delivery: false
  });
  confirmationToken?: ConfirmationToken;
  loading = false;



  async ngOnInit() {
    try {
      this.addressElement = await this.stripeService.createAddressElement();
      this.addressElement.mount('#address-element');
      this.addressElement.on('change', this.handleAddressChange)
      

    } catch (error: any) {
      this.snackBar.error(error.message)
    }
  }

  handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    this.completionStatus.update(state => {
      state.address = event.complete;
      return state;
    })
  }

  handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
    if (this.cartService.selectedPaymentMethod() !== 'card') return;
    this.completionStatus.update(state => {
      state.card = event.complete;
      return state;
    })
  }


  handleDeliveryChange(event: boolean) {
    this.completionStatus.update(state => {
      state.delivery = event;
      return state;
    })
  }

  async getConfirmationToken() {
    debugger;
    try {
      if (Object.values(this.completionStatus()).every(status => status === true)) {
        const result = await this.stripeService.createConfirmationToken();
        if (result.error) throw new Error(result.error.message);
        this.confirmationToken = result.confirmationToken;
        console.log(this.confirmationToken);
      }
    } catch (error: any) {
      this.snackBar.error(error.message);
    }

  }


  async onStepChange(event: StepperSelectionEvent) {
    debugger;
    if (event.selectedIndex === 1) {
      if (this.saveAddress) {
        const address = await this.getAddressFromStripeAddress() as Address;
        address && firstValueFrom(this.accountService.updateAddress(address))
      }
    }
    if (event.selectedIndex === 2) {
      await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
    }
    if (event.selectedIndex === 3) {
      await this.getConfirmationToken();
    }
  }

  async confirmOrder(stepper: MatStepper) {
    this.loading = true;
    try {
      if (this.cartService.selectedPaymentMethod() === 'cod') {
        const order = await this.createOrderModel();
        const result = await firstValueFrom(this.orderService.createOrder(order));
        debugger;
        this.signalrService.orderSignal.set(result || null);

        if (result) {
          this.orderService.orderComplete = true;
          this.cartService.deletCart();
          this.cartService.selectedDelivery.set(null);
          this.router.navigateByUrl('/checkout/success');
        }
        return;
      }
      if (this.confirmationToken) {
        const result = await this.stripeService.confirmPayment(this.confirmationToken);
        if (result.paymentIntent?.status === 'succeeded') {
          const order = await this.createOrderModel();
          const orderResult = await firstValueFrom(this.orderService.createOrder(order));
          if (orderResult) {
            this.orderService.orderComplete = true;
            this.cartService.deletCart();
            this.cartService.selectedDelivery.set(null);
            this.router.navigateByUrl('/checkout/success');
          } else {
            throw new Error('Order creation failed');
          }
        } else if (result.error) {
          throw new Error(result.error.message);
        } else {
          throw new Error('Something went wrong');
        }
      }
    } catch (error: any) {
      this.snackBar.error(error.message || 'Something went wrong');
      stepper.previous();
    } finally {
      this.loading = false;
    }
  }


  private async createOrderModel(): Promise<OrderToCreate> {
    const cart = this.cartService.cart();
    const shippingAddress = await this.getAddressFromStripeAddress() as ShippingAddress;

    if (!cart?.id || !cart?.deliveryMethodId || !shippingAddress) {
      throw new Error('Problem creating order');
    }

    // ------------------------
    // CASE 1: CASH ON DELIVERY
    // ------------------------
    if (this.cartService.selectedPaymentMethod() === 'cod') {
      return {
        cartId: cart.id,
        paymentSummary: {
          last4: 0,
          brand: 'COD',
          expMonth: 0,
          expYear: 0
        },
        deliveryMethodId: cart.deliveryMethodId,
        shippingAddress: shippingAddress,
        paymentMethod: 'COD'
      };
    }

    // ------------------------
    // CASE 2: STRIPE CARD PAYMENT
    // ------------------------
    const card = this.confirmationToken?.payment_method_preview.card;

    if (!card) {
      throw new Error('Payment information missing');
    }

    return {
      cartId: cart.id,
      paymentSummary: {
        last4: +card.last4,
        brand: card.brand,
        expMonth: card.exp_month,
        expYear: card.exp_year
      },
      deliveryMethodId: cart.deliveryMethodId,
      shippingAddress: shippingAddress,
      paymentMethod: 'Card'
    };
  }



  private async getAddressFromStripeAddress(): Promise<Address | ShippingAddress | null> {
    const result = await this.addressElement?.getValue();
    const address = result?.value.address;

    if (address) {
      return {
        name: result.value.name,
        line1: address.line1,
        line2: address.line2 || undefined,
        city: address.city,
        country: address.country,
        postalCode: address.postal_code,
        state: address.state
      }
    } else {
      return null;
    }
  }

  onSaveAddressCheckboxChange(event: MatCheckboxChange) {
    this.saveAddress = event.checked
  }


  async onPaymentMethodChange(method: 'card' | 'cod') {
    this.cartService.selectedPaymentMethod.set(method);
    debugger;

    if (method === 'cod') {
      this.completionStatus.update(s => ({ ...s, card: false }));
      this.paymentElement?.unmount();
      this.paymentElement = undefined;


    } else {
      this.paymentElement = await this.stripeService.createPaymentElement();
      this.paymentElement.mount('#payment-element')
      this.paymentElement.on('change', this.handlePaymentChange)

    }
  }


  ngOnDestroy(): void {
    this.stripeService.disposeElements();
  }

}
