export class DBSettingsModel{
    private _drcrnoteNumber: number;
    private _invoiceNumber: number;
    private _itemDesc: number;
    
    get drcrnoteNumber(): number{
       return this._drcrnoteNumber;
    }
    set drcrnoteNumber(drcrnoteNumber: number){
       this._drcrnoteNumber = drcrnoteNumber;
    }
    
    get invoiceNumber(): number{
        return this._invoiceNumber;
     }
    set invoiceNumber(invoiceNumber: number){
        this._invoiceNumber = invoiceNumber;
    }
     
    get itemDesc(): number{
    return this._itemDesc;
    }
    set itemDesc(itemDesc: number){
        this._itemDesc = itemDesc;
    }
}