import { Component, Input, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTE_PATHS } from '../../../router/router-paths';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";
import { Observable } from 'rxjs/Rx';
import { LocalStorageService } from "../../../shared/services/local-storage.service";
import { InvoiceAddEditDataService } from "../../services/invoice-add-edit-data.service";
import { ItemNoEmitService } from "../../services/item-no-emit.service";
import { ItemDetailsService } from "../../services/item-details.service";
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SessionErrorService } from "../../../shared/services/session-error.service";
// import { AppUrlsConst, WebServiceConst } from "../../../../app-config';

@Component({
  selector: 'item-no-modal-component',
  templateUrl: 'item-no-modal.component.html',
  styleUrls: ['item-no-modal.component.css']
})
export class NgbdItemNoModalComponent {
  @Input() modalTitle: string = "Message";
  @Input() vendorCode: string;
  @Input() poNo: string = "";
  @Input() poType: string = "";
  @Input() headName: string = "";

  public itemDetails: any[] = [];
  public itemsHeader: any = {}; // to store the item header
  public searchFormGroup: FormGroup;
  //checkbox
  public checkAll: boolean = false;

  //Array for selected Item
  public checkedItemArr: any[] = [];
  //public selectedItemDetails: any[] = [];
  constructor(public activeModal: NgbActiveModal,
    private http: Http, private el: ElementRef,
    private router: Router,
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private invoiceAddEditDataService: InvoiceAddEditDataService,
    private itemDetailsService: ItemDetailsService,
    private sessionErrorService: SessionErrorService,
    private itemNoEmitService: ItemNoEmitService
  ) {
    // this.gridSearch = new FormControl('');
    this.searchFormGroup = this.formBuilder.group({
      'gridSearch': ''
    });
  }

  ngOnInit(): void {
    console.log(" vendorCode ", this.vendorCode);
    this.getItemDetailsWS();
    console.log(" this.checkedItemArr ", this.checkedItemArr);
  }//end of onInit

  //start method getItemDetailsws to get all item details according to the pono and vendor code
  getItemDetailsWS() {
    this.invoiceAddEditDataService.getItemDetVal(this.vendorCode, this.poNo).
      subscribe(res => {
        this.itemDetails = res.details;
        this.itemsHeader = res.header;
        console.log(" res ===", res);
        if (res.msgType === 'Info') {
          this.getSelectedItemsGrid();
        }
      },
      err => {
        console.log(" err ===", err);
        this.sessionErrorService.routeToLander(err._body);
      });
  }//end of method

  //start method for setting checkbox checked or unchecked 1.11.17
  private getSelectedItemsGrid() {
    console.log(" getSelectedItemsGrid called");
    for (let allItmGrid of this.itemDetails) {
      this.getCheckedFlag(allItmGrid);
    }//end of for
  }//end of the method

  // start method getCheckedFlag to check the selected item row from add invoice page
  private getCheckedFlag(allItmGrid: any) {
    let selectedItemsGrid: any[] = [];
    for(let selItmDet of  this.itemDetailsService.selectedItemDetails) {
      selectedItemsGrid.push(selItmDet);
    }
    console.log("selectedItemsGrid ==> ", selectedItemsGrid);
    for (let selItmGrid of selectedItemsGrid) {
      if (this.poType === "FO") {
        if (selItmGrid.itemName === allItmGrid.itemName && selItmGrid.lineItemNo === allItmGrid.lineItemNo && selItmGrid.itemNo === allItmGrid.itemNo) {
          allItmGrid.uiCheckItmFlag = true;
          this.checkedItemArr.push(selItmGrid);
          break;
        } else if (selItmGrid.itemName != allItmGrid.itemName && selItmGrid.lineItemNo != allItmGrid.lineItemNo && selItmGrid.itemNo != allItmGrid.itemNo) {
          allItmGrid.uiCheckItmFlag = false;
        }//else if 
      } else if (this.poType === "NB") {
        if (selItmGrid.itemCode === allItmGrid.itemCode) {
          allItmGrid.uiCheckItmFlag = true;
          this.checkedItemArr.push(selItmGrid);
          break;
        } else if (selItmGrid.itemCode != allItmGrid.itemCode) {
          allItmGrid.uiCheckItmFlag = false;
        }//else if 
      }
    }//end of for
    console.log(" this.itemDetails ", this.itemDetails);
    if (this.itemDetails.length === selectedItemsGrid.length) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
  }//end of the method

  //method for clicking single checkbox
  public onCheckboxClick(itmDetParam: any) {
    console.log(" itmDetParam", itmDetParam);
    console.log(" this.itemDetails ", this.itemDetails);
    if (this.checkedItemArr.length === 0) {
      console.log("this.itemDetails:::::::", this.itemDetails);
      // for (let items of this.itemDetails) {
      for (let itmDet of this.itemDetails) {
        console.log(" itmDet ===", itmDet);
        if (this.poType === "FO") {
          if (itmDetParam.itemName === itmDet.itemName && itmDetParam.lineItemNo === itmDet.lineItemNo && itmDetParam.itemNo === itmDet.itemNo) {
            this.checkedItemArr.push(itmDet);
            console.log(" this.checkedItemArr ", this.checkedItemArr);
          }
        } else if (this.poType === "NB") {
          if (itmDetParam.itemCode === itmDet.itemCode) {
            this.checkedItemArr.push(itmDet);
            console.log(" this.checkedItemArr ", this.checkedItemArr);
          }//end of if
        }
      }//end of for
    } else {
      let indexCount: number = 0;
      let removeFlag: boolean = false;
      for (let checkedItm of this.checkedItemArr) {
        if (this.poType === "FO") {
          if (itmDetParam.itemName === checkedItm.itemName && itmDetParam.lineItemNo === checkedItm.lineItemNo && itmDetParam.itemNo === checkedItm.itemNo) {
            this.checkedItemArr.splice(indexCount, 1);
            console.log(" this.checkedItemArr ", this.checkedItemArr);
            checkedItm.uiCheckItmFlag = false;
            itmDetParam.uiCheckItmFlag = false;
            removeFlag = true;
            break;
          }
        } else if (this.poType === "NB") {
          if (checkedItm.itemCode == itmDetParam.itemCode) {
            this.checkedItemArr.splice(indexCount, 1);
            console.log(" this.checkedItemArr ", this.checkedItemArr);
            checkedItm.uiCheckItmFlag = false;
            itmDetParam.uiCheckItmFlag = false;
            removeFlag = true;
            break;
          }//end of if
        }
        indexCount++;
      }//end of for
      if (!removeFlag) {
        for (let itmDet of this.itemDetails) {
          if (this.poType === "FO") {
            if (itmDetParam.itemName === itmDet.itemName && itmDetParam.lineItemNo === itmDet.lineItemNo && itmDetParam.itemNo === itmDet.itemNo) {
              this.checkedItemArr.push(itmDet);
              console.log(" this.checkedItemArr ", this.checkedItemArr);
            }
          } else if (this.poType === "NB") {
            if (itmDetParam.itemCode == itmDet.itemCode) {
              this.checkedItemArr.push(itmDet);
              console.log(" this.checkedItemArr ", this.checkedItemArr);
            }//end of if
          }
        }//end of for
      }//end of if
    }//end of else
    console.log(" this.itemDetails ", this.itemDetails);

    if (this.checkedItemArr.length === this.itemDetails.length) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
  }//end of onCheckboxClick method

  //start method chooseItem to pass the item details through evnt emitter
  public chooseItem() {
    console.log(" selectedItemDetails ===>", this.checkedItemArr);
    //passing the itemsHeader through eventemitter
    this.itemNoEmitService.emitItemsHeader(this.itemsHeader);
    //passing items details grid row through eventemitter
    this.itemNoEmitService.emitModalResult(this.checkedItemArr);
    this.onClickOk();
  }//end of the method of chooseItem

  public onClickOk() {
    //this.router.navigate([ROUTE_PATHS.RouteLogin]);
    this.activeModal.close('Close click');
  }

  //creating a method to check selectAll checkbox
  public selectAllCheck() {
    this.checkAll = !this.checkAll;
    //this.checkedItemArr = (this.checkAll) ? this.itemDetails : [];
    if (this.checkAll) {
        this.checkedItemArr = [];
        for (let itmDet of this.itemDetails) {
          this.checkedItemArr.push(itmDet);
        }//end of for
        this.itemDetails = []; 
        for(let chckedItm of this.checkedItemArr){
          this.itemDetails.push(chckedItm);
        }
      console.log(" this.itemDetails ", this.itemDetails);
    }else {
      this.checkedItemArr = [];
    }//end of else
    console.log("checkedItemArr on selectAllCheck method : ", this.checkedItemArr);
    for (let itmDet of this.itemDetails) {
      if (this.checkAll == true) {
        itmDet.uiCheckItmFlag = true;
      } else {
        itmDet.uiCheckItmFlag = false;
      }
    }
    console.log("  this.itemDetails======= ", this.itemDetails);
  }//end of selectAllCheck method
}