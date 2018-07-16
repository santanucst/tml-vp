import { Injectable } from '@angular/core';

@Injectable()
export class ItemDetailsService {
    private _selectedItemDetails: any;
    private _vendorCode: string;
    private _vendorName: string;
    private _vendorGstin: string;
    
    public get selectedItemDetails(): any {
        return this._selectedItemDetails;
    }
    public set selectedItemDetails(selectedItemDetails: any) {
        this._selectedItemDetails = selectedItemDetails;
    }

    public get vendorCode(): string {
        return this._vendorCode;
    }
    public set vendorCode(vendorCode: string) {
        this._vendorCode = vendorCode;
    }

    public get vendorName(): string {
        return this._vendorName;
    }
    public set vendorName(vendorName: string) {
        this._vendorName = vendorName;
    }

    public get vendorGstin(): string {
        return this._vendorGstin;
    }
    public set vendorGstin(vendorGstin: string) {
        this._vendorGstin = vendorGstin;
    }

}