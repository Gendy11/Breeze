import { Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

type Tone = 'pending' | 'info' | 'success' | 'danger' | 'muted';

/** Maps backend OrderStatus values to a colour tone and icon. */
const STATUS: Record<string, { tone: Tone; icon: string }> = {
  Pending: { tone: 'pending', icon: 'schedule' },
  Accepted: { tone: 'info', icon: 'thumb_up' },
  PaymentReceived: { tone: 'success', icon: 'check_circle' },
  Rejected: { tone: 'danger', icon: 'cancel' },
  PaymentFailed: { tone: 'danger', icon: 'error' },
  PaymentMismatch: { tone: 'danger', icon: 'report' },
  Refunded: { tone: 'muted', icon: 'undo' },
};

@Component({
  selector: 'app-order-status',
  imports: [MatIcon],
  template: `
    <span class="status" [attr.data-tone]="meta().tone">
      <mat-icon>{{ meta().icon }}</mat-icon>{{ label() }}
    </span>
  `,
  styles: `
    :host { display: inline-flex; }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.75rem 0.3rem 0.55rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
    }
    mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    [data-tone='pending'] { background: #fff7ed; color: #c2410c; }
    [data-tone='info']    { background: #eef5ff; color: #1d4ed8; }
    [data-tone='success'] { background: #ecfdf3; color: #15803d; }
    [data-tone='danger']  { background: #fef2f2; color: #b91c1c; }
    [data-tone='muted']   { background: #f1f5f9; color: #475569; }
  `
})
export class OrderStatusComponent {
  status = input.required<string>();

  meta = computed(() => STATUS[this.status()] ?? { tone: 'muted' as Tone, icon: 'info' });

  /** "PaymentReceived" -> "Payment received" */
  label = computed(() => {
    const words = this.status().replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    return words.charAt(0).toUpperCase() + words.slice(1);
  });
}
