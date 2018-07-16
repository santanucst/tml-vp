import { Injectable } from '@angular/core';

@Injectable()
export class PurchaseOrderInteractionService {

    private _wsFilter: any;//for all filter
    private _invoiceWSFilter: any;//to store invoice ws filter
    private _poWSFilter: any;//to store po ws filter

    public get wsFilter(): any {
        return this._wsFilter;
    }
    public set wsFilter(wsFilter: any) {
        this._wsFilter = wsFilter;
    }
    public get invoiceWSFilter(): any {
        return this._invoiceWSFilter;
    }
    public set invoiceWSFilter(invoiceWSFilter: any) {
        this._invoiceWSFilter = invoiceWSFilter;
    }
    public get poWSFilter(): any {
        return this._poWSFilter;
    }
    public set poWSFilter(poWSFilter: any) {
        this._poWSFilter = poWSFilter;
    }

}