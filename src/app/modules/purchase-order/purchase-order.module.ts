import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from "@angular/common";
import { DatePipe } from '@angular/common';
import { SharedModule } from "app/modules/shared/shared.module";
import { BusySpinnerModule } from "app/modules/widget/busy-spinner/busy-spinner.module";
import { NgbdItemNoModalComponent } from '../purchase-order/components/item-no-modal/item-no-modal.component';
import { InvoiceAddEditComponent } from "../purchase-order/components/invoice/add-edit/invoice-add-edit.component";
import { CreditNoteAddEditComponent } from "../purchase-order/components/credit-note/add-edit/credit-note-add-edit.component";
import { InvoiceAddEditDataService } from "../purchase-order/services/invoice-add-edit-data.service";
import { VendorCodeSearchComponent } from "../purchase-order/components/vendor-code-search/vendor-code-search.component";
import { ItemNoEmitService } from "../purchase-order/services/item-no-emit.service";
import { ItemDetailsService } from "../purchase-order/services/item-details.service";
import { CreditNoteAddEditDataService } from "../purchase-order/services/credit-note-add-edit-data.service";
import { PurchaseOrderInteractionService } from "./services/purchase-order-interaction.service";
import { PurchaseOrderDetailsViewComponent } from "../purchase-order/components/view/purchase-order-details-view.component";
import { InvoiceDetailsViewComponent } from "../purchase-order/components/invoice/view/invoice-details-view.component";
import { InvoiceItemDetailsViewComponent } from "../purchase-order/components/invoice/item-details-view/invoice-item-details-view.component";
import { PurchaseInvoiceItemViewDataService } from "../purchase-order/services/purchase-invoice-item-view-data.services";
import { CreditNoteDetailsViewComponent } from "./components/credit-note/view/credit-note-details-view.component";
import { CreditNoteItemDetailsViewComponent } from "./components/credit-note/item-details-view/credit-note-item-details-view.component";

@NgModule({
  imports:      [
    ReactiveFormsModule,
    CommonModule,
    BrowserModule,
    SharedModule,
    BusySpinnerModule//for busy spinner
  ],
  declarations: [
    InvoiceAddEditComponent,
    NgbdItemNoModalComponent,
    VendorCodeSearchComponent,
    CreditNoteAddEditComponent,
    PurchaseOrderDetailsViewComponent,//total po view
    InvoiceDetailsViewComponent,//invoice details view
    InvoiceItemDetailsViewComponent,//invoice item detials view
    CreditNoteDetailsViewComponent,//credit note details view
    CreditNoteItemDetailsViewComponent//credit note item details view

  ],
  exports: [
    InvoiceAddEditComponent,
    VendorCodeSearchComponent,
    CreditNoteAddEditComponent,
    PurchaseOrderDetailsViewComponent,//total po view
    InvoiceDetailsViewComponent,//invoice details view
    InvoiceItemDetailsViewComponent,//invoice item detials view
    CreditNoteDetailsViewComponent,//credit note details view
    CreditNoteItemDetailsViewComponent//credit note item details view
  ],
  entryComponents: [
    NgbdItemNoModalComponent
  ],
  providers: [
    InvoiceAddEditDataService,
    CreditNoteAddEditDataService,
    ItemNoEmitService,
    DatePipe,
    ItemDetailsService,
    PurchaseInvoiceItemViewDataService,
    PurchaseOrderInteractionService
  ]
})
export class PurchaseOrderModule { }
