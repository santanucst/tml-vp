import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppUrlsConst, WebServiceConst } from '../../app-config';
import { LocalStorageService } from "../../shared/services/local-storage.service";

@Injectable()
export class PurchaseInvoiceItemViewDataService {

  private actionUrl: string;
  private headers: Headers;
  private userType:string;
  
  constructor(
    private http: Http,
    private localStorageService: LocalStorageService) {
      console.log("constructor of PurchaseInvoiceItemViewDataService class");
    }
    
    private configService(): Headers {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');
      headers.append('Authorization', 'bearer ' + this.localStorageService.user.accessToken);
      headers.append('userId', this.localStorageService.user.userId);
      return headers;
    }//end of configService method
    
    private setUserType(){
      let usertypeOFLocalStorage: string = this.localStorageService.user.userType;
      if(usertypeOFLocalStorage === "V") {      
        this.userType = "VENDOR";
      }else if(usertypeOFLocalStorage === "E") {
        this.userType = "EMPLOYEE";
      }
    }//end of method

  //get all po details 
  getPODetViewWithFacet(body: any) {
    this.setUserType();//to set usertype
    this.headers = this.configService();
    this.actionUrl = AppUrlsConst.PO_INVOICE_ITEM_VIEW_DETAILS_URL+ "?useFor=PO&userType="+this.userType;
      return this.http.post(this.actionUrl, body, { headers: this.headers })
      .map(this.successCallback)
      .catch(this.errorCallBack);
  }//end of method

  //get all invoice details 
  getInvoiceDetViewWithFacet(body: any) {
    this.setUserType();//to set usertype
    this.headers = this.configService();
    this.actionUrl = AppUrlsConst.PO_INVOICE_ITEM_VIEW_DETAILS_URL+ "?useFor=INVOICE&userType="+this.userType;
      return this.http.post(this.actionUrl, body, { headers: this.headers })
      .map(this.successCallback)
      .catch(this.errorCallBack);
  }//end of method

  //get all invoice-item details 
  getInvoiceItemDetViewWithFacet(body: any) {
    this.setUserType();//to set usertype
    this.headers = this.configService();
    this.actionUrl = AppUrlsConst.PO_INVOICE_ITEM_VIEW_DETAILS_URL+ "?useFor=INVOICE_DET&userType="+this.userType;
      return this.http.post(this.actionUrl, body, { headers: this.headers })
      .map(this.successCallback)
      .catch(this.errorCallBack);
  }//end of method

  //get all credit note details 
  getCreditNoteDetViewWithFacet(body: any) {
    this.setUserType();//to set usertype
    this.headers = this.configService();
    this.actionUrl = AppUrlsConst.PO_INVOICE_ITEM_VIEW_DETAILS_URL+ "?useFor=CR_NOTE&userType="+this.userType;
      return this.http.post(this.actionUrl, body, { headers: this.headers })
      .map(this.successCallback)
      .catch(this.errorCallBack);
  }//end of method

  //get all invoice-item details 
  getCreditNoteItemDetViewWithFacet(body: any) {
    this.setUserType();//to set usertype
    this.headers = this.configService();
    this.actionUrl = AppUrlsConst.PO_INVOICE_ITEM_VIEW_DETAILS_URL+ "?useFor=CR_NOTE_DET&userType="+this.userType;
      return this.http.post(this.actionUrl, body, { headers: this.headers })
      .map(this.successCallback)
      .catch(this.errorCallBack);
  }//end of method

  private successCallback(res: Response) {
    return res.json();
  }

  private errorCallBack(error: Response) {
    console.error(error);
    return Observable.throw(error);
  }

}//end of class
