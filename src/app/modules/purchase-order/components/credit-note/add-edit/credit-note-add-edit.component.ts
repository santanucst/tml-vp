import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
// import { ToastService } from "../../../../home/services/toast-service";
import { Subscription } from 'rxjs/Subscription';//to get route param
import { Router, ActivatedRoute } from '@angular/router';
import { ROUTE_PATHS } from '../../../../router/router-paths';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { LocalStorageService } from "../../../../shared/services/local-storage.service";
import { NgbdModalComponent } from '../../../../widget/modal/components/modal-component';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdItemNoModalComponent } from '../../item-no-modal/item-no-modal.component';
import { CreditNoteAddEditDataService } from "../../../services/credit-note-add-edit-data.service";
import { ItemNoEmitService } from "../../../services/item-no-emit.service";
import { ItemDetailsService } from "../../../services/item-details.service";
import { DatePipe } from '@angular/common';
import { SessionErrorService } from "../../../../shared/services/session-error.service";

@Component({
  selector: 'ispl-credit-note-add-edit-form',
  templateUrl: 'credit-note-add-edit.component.html',
  styleUrls: ['credit-note-add-edit.component.css']
})

export class CreditNoteAddEditComponent implements OnInit {
  public title: string = "Credit Note";
  public invoiceAddEditFormGroup: FormGroup;
  public vendorName: string = "";//to store vendor name
  public vendorGstInNo: string = "";//to store vendor gst in no
  public companyGstinNo: string = this.localStorageService.appSettings.companyGstin;//to store company gst in no
  public vendorBoolean: boolean = false;
  public userType: string = "";//to store userType
  public code: string = "";//to store code
  public selectedPONo: string = "";//to store route param
  public invoiceNo: string = "";//to store invoiceNo
  public invoiceDate: string = "";//to store invoice date
  public poDate: string = "";//to store po date
  public poType: string = "";//to store poType
  public poUnit: string = "";//to store poUnit
  public orderQty: string = "";//to store poUnit
  public headName: string = "";//to store headName
  // public vendorCode: string;//to store selected vendor code from route param
  // form data for file upload
  private formData: FormData = new FormData();
  private fileData: FormData;
  private tempDescDropDownVal: any[] = []; //to store selected  desc for other docs temporary 
  public descDropDownVal: any[] = []; //to store  desc for other docs 
  public poNoDropDownVal: any[] = []; //to store  poNo 
  public invoiceNoDropDownVal: any[] = []; //to store  invoiceNo
  public checkedItemArr: any[] = [];//to get the selected items from modal
  public fileList: FileList;
  public itemsHeader: any = {}; // to store the item header
  private totalInvoiceAmount: number = 0;//to store total invoice amount
  private totalCgstAmount: number = 0;//to store total cgst amount
  private totalSgstAmount: number = 0;//to store total sgst amount
  private totalIgstAmount: number = 0;//to store total igst amount
  //for item qty error, cgst error, igst error
  public itemValueError: boolean = false;
  public itemQtyCgstIgstError: boolean = true;
  public invoiceFileErrFlag: boolean = false;//to show the invoice file err div
  public otherDocFileErrFlag: boolean = false;//to show the other file err div
  public fileErrMsg: string = "";//to show the file err msg 
  public invoiceFilesArr: any[] = [];//to store the invoice file url and name 
  public otherFilesArr: any[] = [];//to store the other docs file url and name 
  public invoiceNoLength: number = this.localStorageService.dbSettings.invoiceNumber;
  public itemNameLength: number = this.localStorageService.dbSettings.itemDesc;
  public creditNoteDateError: boolean = false;
  public creditNoteDateErrorDesc: string = "";
  public submitError: boolean = false;
  public submitErrorMsg: string = "";
  public invoiceFileSubmitError: boolean = false;
  public invoiceFileSubmitErrorMsg: string = "";
  public otherFileSubmitError: boolean = false;
  public otherFileSubmitErrorMsg: string = "";
  public vendorCodeError: boolean = false;
  public vendorCodeErrorDesc: string = "";
  @ViewChild('otherDocs') //to refresh the file name for other docs field from html
  public otherDocs: any;//taking variable to refresh the file name for other docs field from html
  @ViewChild('invoiceDoc')//to refresh the file name for invoice docs field from html
  public invoiceDoc: any;//taking variable to refresh the file name for invoice docs field from html
  public itemValueErrFlag: boolean = false;//to itemValue err flag
  //busySpinner 
  public busySpinner: any = {
    fileuploadBusy: false,
    selectedBusy: false,
    submitBusy: false,//for submit spinner
    busy: false
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private localStorageService: LocalStorageService,
    private creditNoteAddEditDataService: CreditNoteAddEditDataService,
    private itemNoEmitService: ItemNoEmitService,
    private itemDetailsService: ItemDetailsService,
    private datePipe: DatePipe,
    private sessionErrorService: SessionErrorService,
    private router: Router
  ) {

  }//end of constructor

  ngOnInit(): void {
    this.buildForm();
    this.getRouteParam();//to get route param
    this.getSelectedDescValWs();//calling method to get desc for other doc from webservice
    this.getUserType();//get user type from localstorage 
    this.getModalResultEventEmitter();
    this.getvendorNameFromModlResult();//get vendor name by modal result
    // this.vendorName = this.itemDetailsService.vendorName;
    console.log(" Gst number:::::::::::::::", this.localStorageService.appSettings.companyGstin);
    this.poNoDropDownVal = [
      { key: '', value: '-- Select --' }
    ];
    this.invoiceNoDropDownVal = [
      { value: '', key: '-- Select --' }
    ];
  }//end of onInit

  private buildForm(): void {
    this.invoiceAddEditFormGroup = this.formBuilder.group({
      'poNo': [''
        , [
          Validators.required,
        ]
      ],
      'invoiceNo': [''
        , [
          Validators.required,
        ]
      ],
      'headName': [''
      ],
      'creditNoteNumber': [''
        , [
          Validators.required,
        ]
      ],
      'creditNoteDate': [''
        , [
          Validators.required,
        ]
      ],
      'creditNoteAmount': [''
        // , [
        //   Validators.required,
        // ]
      ],
      'totalIgst': [''
        // , [
        //   Validators.required,
        // ]
      ],
      'otherDocDesc': [''
      ],
      'itemDesc': [''
      ]
    });
  }//end of build form


  //method to get route param
  private getRouteParam() {
    let routeSubscription: Subscription;
    routeSubscription = this.activatedroute.params.subscribe(params => {
      this.code = params.vendorCode ? params.vendorCode : '';
    });
    console.log("vendorCode for Invoice Add/edit: ", this.code);
  }//end of method to get route param

  //start method to get usertype from local storage
  private getUserType() {
    console.log(" getUserType method called");
    this.userType = this.localStorageService.user.userType;
    if (this.userType === 'V') {
      this.code = this.localStorageService.user.code;
      this.vendorName = this.localStorageService.user.name;
      this.vendorGstInNo = this.localStorageService.user.vendorGstin;
      this.vendorBoolean = true;
      this.getPONosWs(this.code);
    } else if (this.userType === 'E') {
      if (this.code) {
        this.getPONosWs(this.code);
        this.vendorBoolean = true;
      }//end of if
    }//end of else if
  }//end of the method

  //start method of getPONosWs to get po nos fom webservice
  private getPONosWs(code: string) {
    this.busySpinner.selectedBusy = true;
    this.updateBusySpinner();
    this.creditNoteAddEditDataService.getPONosVal(code).
      subscribe(res => {
        console.log(" po nos========>>>>>>>>>>", res);
        this.poNoDropDownVal = res.details;
        this.busySpinner.selectedBusy = false;
        this.updateBusySpinner();
      },
      err => {
        console.log("pono err:", err);
        this.sessionErrorService.routeToLander(err._body);
        this.busySpinner.selectedBusy = false;
        this.updateBusySpinner();
      });
  }//end of the method getPONosWs

  //method to get vendor name by modal result
  private getvendorNameFromModlResult() {
    if (this.userType === 'E') {
      this.vendorName = this.itemDetailsService.vendorName;
      this.vendorGstInNo = this.itemDetailsService.vendorGstin;
    }
  }//end of method

  //method of submit modify allocate complaint
  private onFileUploadWS(paramValue: string) {
    // console.log("userId for fileUpload on invoice add edit component : ", this.lo);    
    this.formData.append('userId', this.localStorageService.user.userId);
    // this.formData.append('Authorization', 'bearer ' + this.localStorageService.user.accessToken);
    //method to add or update preli
    if (this.fileData != undefined) {
      for (let i: number = 0; i < this.fileList.length; i++) {
        console.log(" file upload", this.fileData.get('files' + i.toString()));
        //   if (this.fileData.get('files' + i.toString()) != null) {
        this.formData.append('files', this.fileData.get('files' + i.toString()));
        //   }//end of if
      }//end of for
    }//end of if fileData is !undefined
    let formDataObj: any = {};
    formDataObj = this.formData;
    // this.busySpinner.submitBusy = true;

    this.busySpinner.fileuploadBusy = true;
    this.updateBusySpinner();
    this.creditNoteAddEditDataService.fileUpload(formDataObj, paramValue).
      subscribe(res => {
        console.log("file upload Response: ", res);
        //     this.busySpinner.submitBusy = false;
        //     this.updateBusySpinner();
        //     this.resErrorType = res.msgType;
        if (res.msgType === "Info") {
          this.invoiceFileSubmitError = false;
          this.otherFileSubmitError = false;
          if (paramValue === 'CR_NOTE') {
            this.invoiceFilesArr.push({ fileUrl: res.value, fileName: res.valueSub });
            console.log("invoiceFilesArr ====>>>>>>>>>>>>>>>>>>>", this.invoiceFilesArr);
          } else {
            this.otherFilesArr.push({ fileUrl: res.value, fileName: res.valueSub, docName: paramValue });
            this.rearrangeDescDropDownVal("remove");
            this.getDescValueFromArr();
          }//end of else

        }  else if(res.msgType === "Error"){
          if(paramValue === 'CR_NOTE'){
            this.invoiceFileSubmitError = true;
            this.invoiceFileSubmitErrorMsg = res.msg;
          }else{
            this.otherFileSubmitError = true;
            this.otherFileSubmitErrorMsg = res.msg;
          }//end od else
          
        }//end of else if
        this.formData = new FormData();//new instance create of formdata
        this.busySpinner.fileuploadBusy = false;
        this.updateBusySpinner();
      },
      err => {
        console.log("file upload Response: ", err);
        //     if (err.status == 401) {
        //       this.resErrorMsg = "Sorry! Unable to save data. Please try again.";
        //     } else {
        //       this.resErrorMsg = "Netowrk/Server Problem";
        //     }
        this.formData = new FormData();//new instance create of formdata
        this.busySpinner.fileuploadBusy = false;
        this.updateBusySpinner();
      });
  } //end of method submit modify capa actn pi

  private fileDeleteWs(paramValue: string, fileName: string) {
    let fileDetails: any = {};
    console.log(" this.otherFilesArr========== ",this.otherFilesArr);
    fileDetails.userId = this.localStorageService.user.userId;
    fileDetails.fileName = fileName;
    this.creditNoteAddEditDataService.fileDelete(fileDetails, paramValue).
      subscribe(res => {
        console.log("delete files res ", res);
        if (res.msgType === "Info") {
          if (paramValue === 'CR_NOTE') {
            this.invoiceFilesArr = [];//to remove files from invoice array
          } else if (paramValue === 'others') {
            let indexCount: number = 0;
            let removeFlag: boolean = false;
            for (let othrFileArr of this.otherFilesArr) {
              if (othrFileArr.fileName === res.value) {
                console.log(" file name==>>>>>>>>>>>>>", othrFileArr.fileName);
                this.rearrangeDescDropDownVal("insert", othrFileArr.docName);
                this.otherFilesArr.splice(indexCount, 1);
                removeFlag = true;
                break;
              }//end of if
              indexCount++;
            }//end of for
            console.log(" items of otherFilesArr array ", this.otherFilesArr);
          }//end of else
        }//end of if
      },
      err => {
        console.log(err);
        this.sessionErrorService.routeToLander(err._body);
        // this.busySpinner.compRefDetBusy = false;//busy spinner
        // this.updateBusySpinner();//method for busy spinner
      });
  }

  //method to get desc for other doc from webservice
  private getSelectedDescValWs() {
    this.creditNoteAddEditDataService.getSelectedDescVal().
      subscribe(res => {
        console.log("get the desc dropdown ", res);
        if (res.msgType === "Info") {
          this.descDropDownVal = res.details;
          for (let desc of this.descDropDownVal) {
            if (desc.key === "") {
              this.invoiceAddEditFormGroup.controls["otherDocDesc"].setValue(desc.key);//to set zeroth value selected
            }//end of if
          }//end of for
        }//end of if
      },
      err => {
        console.log(err);
        this.sessionErrorService.routeToLander(err._body);
        // this.busySpinner.compRefDetBusy = false;//busy spinner
        // this.updateBusySpinner();//method for busy spinner
      });
  }

   //start medthod onVenderCodeKeyUp to check the vendor code
   public onVenderCodeKeyUp(vendorCode: string){
    if(!vendorCode){
      this.vendorCodeError = false;
      this.vendorCodeErrorDesc = "";
    }else if(vendorCode === '"'   || vendorCode === "'"  || vendorCode.indexOf("'") === (vendorCode.length - 1) || vendorCode.indexOf('"') === (vendorCode.length - 1)){
      this.vendorCodeError = true;
      this.vendorCodeErrorDesc = "Vendor Code can't contain single quotes or double quotes";
    }else{
      this.vendorCodeError = false;
      this.vendorCodeErrorDesc = "";
    }//end of else
  }//end of the method onVenderCodeKeyUp

  //to refresh the file name field
  public resetFileInput(paramValue: string) {
    if (paramValue === 'CR_NOTE') {
      //calling the service method to upload file
      this.onFileUploadWS(paramValue);
      // console.log(this.invoiceDoc.nativeElement.files);
      this.invoiceDoc.nativeElement.value = "";
    } else if (paramValue === 'others') {
      paramValue = this.invoiceAddEditFormGroup.value.otherDocDesc;
      this.onFileUploadWS(paramValue);
      // this.rearrangeDescDropDownVal("remove");
      // this.getDescValueFromArr();
      // console.log(this.otherDocs.nativeElement.files);
      this.otherDocs.nativeElement.value = "";
    }//end of else
  }//end of the method reset

  //method to push desc value to the others file array
  private getDescValueFromArr() {
    this.otherFilesArr.forEach(othrfile => {
      this.tempDescDropDownVal.forEach(tmpDesc => {
        if (tmpDesc.key === othrfile.docName) {
          othrfile.fileDescVal = tmpDesc.value;
        }
      });
      console.log("othrfile==>>> ", othrfile);
    });
    console.log(" updated other file array ", this.otherFilesArr);
  }//end of method

  //method to rearrange drop down val
  private rearrangeDescDropDownVal(descRemoveInsertParam: string, descParam?: string) {
    let indexCount: number = 0;
    let removeFlag: boolean = false;
    if (descRemoveInsertParam === 'remove') {
      let otherDescKey: string = this.invoiceAddEditFormGroup.value.otherDocDesc;
      for (let desc of this.descDropDownVal) {
        if (desc.key === otherDescKey) {
          this.tempDescDropDownVal.push({ key: desc.key, value: desc.value });// storing the selected desc temporay
          this.descDropDownVal.splice(indexCount, 1);// removing the selected desc from desc drop down
          removeFlag = true;
          break;
        }
        indexCount++;
      }//end of for
    } else if (descRemoveInsertParam === 'insert') {
      for (let tempDesc of this.tempDescDropDownVal) {
        if (tempDesc.key === descParam) {
          this.descDropDownVal.push(tempDesc);// storing the selected desc temporay
          this.tempDescDropDownVal.splice(indexCount, 1);// removing the selected desc from desc drop down
          removeFlag = true;
          break;
        }
        indexCount++;
      }//end of for
    }
    //to set zeroth value selected
    for (let desc of this.descDropDownVal) {
      if (desc.key === "") {
        this.invoiceAddEditFormGroup.controls["otherDocDesc"].setValue(desc.key);//to set zeroth value selected
      }//end of if
    }//end of for
  }

  //method to refesh the grid after closing the modal
  private getModalResultEventEmitter() {
    this.itemNoEmitService.getModalResultEventEmitter().
      subscribe(selectedItemDetailsRes => {
        console.log(" eventEmitter res : ", selectedItemDetailsRes);
        if (this.checkedItemArr.length == 0) {
          for (let selectedDetRes of selectedItemDetailsRes) {
            this.checkedItemArr.push(selectedDetRes);
          }//end of for
        } else {
          for (let selectedDetRes of selectedItemDetailsRes) {
            this.getDistinctItmsGrid(selectedDetRes);
          }//end of for 
        }//end of else
        this.getGstPercentage();
        this.getItemQtyTaxRateItemName();
        // if (this.selectedItemDetails.length > 0) {
        //   this.setCustInforOnEventEmit(this.selectedItemDetails);
        // }
      },
      err => {
        console.log(err)
      });
  }//end of event emiiter result

  //start meyhod to get gst percentage
  private getGstPercentage() {
    console.log(" getGstPercentage method called ");
    for (let chkItm of this.checkedItemArr) {
      if (chkItm.taxRate != 0) {
        this.onKeyupToGenerateCgstIgstSgst(chkItm.taxRate, chkItm.itemCode, chkItm.itemName, chkItm.lineItemNo, chkItm.itemNo);
      }//end of if
    }//end of for
  }//end of the method


  //start method to check itemqty,taxRate is greater than zero or not and item name is empty or not
  private getItemQtyTaxRateItemName(checkedItmParam?: any) {
    for (let chkItm of this.checkedItemArr) {
      if ((chkItm.itemQuantity === 0 || chkItm.itemQuantity < 0) || (chkItm.taxRate === 0 || chkItm.taxRate < 0) || !chkItm.itemName || (chkItm.itemValue === 0 || chkItm.itemValue < 0)) {
        if (this.poType === "NB" && checkedItmParam) {
          if (checkedItmParam.itemCode === chkItm.itemCode) {
            if (chkItm.itemQuantity === 0) {
              chkItm.uiInpErrFlag = true;
              if (!chkItm.uiInpErrDesc) {
                chkItm.uiInpErrDesc = '';
              }//end of if
            } else if (chkItm.taxRate === 0) {
              if (!chkItm.uiTaxtRateErrFlag) {
                chkItm.uiTaxtRateErrFlag = true;
                if (!chkItm.uiTaxtRateErrDesc) {
                  chkItm.uiTaxtRateErrDesc = '';
                }//end of if
              }//end of if
            } else if (!chkItm.itemName) {
              if (!chkItm.uiItemNameErrFlag || chkItm.uiItemNameErrFlag === undefined) {
                chkItm.uiItemNameErrFlag = true;
                if (!chkItm.uiItemNameErrDesc) {
                  chkItm.uiItemNameErrDesc = '';
                }//end of if
              }//end of if
            }//end of else if
            this.itemQtyCgstIgstError = true;
            break;
          } else {
            this.itemQtyCgstIgstError = false;
          }//end of else
        } else if (this.poType === "FO" && checkedItmParam) {

          if (checkedItmParam.itemName === chkItm.itemName && checkedItmParam.lineItemNo === chkItm.lineItemNo && checkedItmParam.itemNo === chkItm.itemNo) {
            if (checkedItmParam.poUnit === 'JOB' && checkedItmParam.orderQty === 1) {
              chkItm.itemQuantity = checkedItmParam.orderQty;
              chkItm.uiInpErrFlag = false;
              if (chkItm.itemValue === 0) {
                chkItm.uiItemValueErrFlag = true;
                this.itemValueErrFlag = true;
                if (!chkItm.uiItemValueErrDesc) {
                  chkItm.uiItemValueErrDesc = '';
                }//end of if
              }//end of if
            }//end of if
            if (chkItm.itemQuantity === 0) {
              chkItm.uiInpErrFlag = true;
              if (!chkItm.uiInpErrDesc) {
                chkItm.uiInpErrDesc = '';
              }//end of if
              // if(!chkItm.itemName){
              //   if(!chkItm.uiItemNameErrFlag || chkItm.uiItemNameErrFlag === undefined){
              //     chkItm.uiItemNameErrFlag = true;
              //     if(!chkItm.uiItemNameErrDesc){
              //       chkItm.uiItemNameErrDesc = '';
              //     }//end of if
              //   }//end of if
              // }//end of if
            } else if (chkItm.taxRate === 0) {
              if (!chkItm.uiTaxtRateErrFlag) {
                chkItm.uiTaxtRateErrFlag = true;
                if (!chkItm.uiTaxtRateErrDesc) {
                  chkItm.uiTaxtRateErrDesc = '';
                }//end of if
              }//end of if
            } else if (!chkItm.itemName) {
              if (!chkItm.uiItemNameErrFlag || chkItm.uiItemNameErrFlag === undefined) {
                chkItm.uiItemNameErrFlag = true;
                if (!chkItm.uiItemNameErrDesc) {
                  chkItm.uiItemNameErrDesc = '';
                }//end of if
              }//end of if
            }//end of else if
            this.itemQtyCgstIgstError = true;
            break;
          } else {
            this.itemQtyCgstIgstError = false;
          }//end of else
        } else if (!checkedItmParam) {
          if (chkItm.itemQuantity === 0) {
            chkItm.uiInpErrFlag = true;
            if (!chkItm.uiInpErrDesc) {
              chkItm.uiInpErrDesc = '';
            }//end of if
            if (!chkItm.itemName) {
              if (!chkItm.uiItemNameErrFlag || chkItm.uiItemNameErrFlag === undefined) {
                chkItm.uiItemNameErrFlag = true;
                if (!chkItm.uiItemNameErrDesc) {
                  chkItm.uiItemNameErrDesc = '';
                }//end of if
              }//end of if
            }//end of if
          } else if (chkItm.taxRate === 0) {
            if (!chkItm.uiTaxtRateErrFlag) {
              chkItm.uiTaxtRateErrFlag = true;
              if (!chkItm.uiTaxtRateErrDesc) {
                chkItm.uiTaxtRateErrDesc = '';
              }//end of if
            }//end of if
          } else if (!chkItm.itemName) {
            if (!chkItm.uiItemNameErrFlag || chkItm.uiItemNameErrFlag === undefined) {
              chkItm.uiItemNameErrFlag = true;
              if (!chkItm.uiItemNameErrDesc) {
                chkItm.uiItemNameErrDesc = '';
              }//end of if
            }//end of if
          }//end of else if
          this.itemQtyCgstIgstError = true;
          break;
        } else {
          this.itemQtyCgstIgstError = false;
        }//end of else
      } else {
        this.itemQtyCgstIgstError = false;
      }
    }//end of for
  }//end of the method



  //start method getDistinctItmsGrid to insert distinct items details into the item details grid
  private getDistinctItmsGrid(selectedDetRes: any) {
    let prevKey: string = "";
    let lastKey: string = "";

    let prevKeyItemName: string = "";
    let lastKeyItemName: string = "";

    let prevKeyLineItemNo: string = "";
    let lastKeyLineItemNo: string = "";

    let prevKeyItemNo: string = "";
    let lastKeyItemNo: string = "";


    console.log("selectedDetRes::::::", selectedDetRes);
    this.poType = selectedDetRes.poType;
    for (let checkedItm of this.checkedItemArr) {
      if (this.poType === "FO") {

        if (selectedDetRes.itemName === checkedItm.itemName && selectedDetRes.lineItemNo === checkedItm.lineItemNo && selectedDetRes.itemNo === checkedItm.itemNo) {
          console.log("item name, line item  no and item no are matched..");
          break;
        } else if (selectedDetRes.itemName != checkedItm.itemName || selectedDetRes.lineItemNo != checkedItm.lineItemNo || selectedDetRes.itemNo != checkedItm.itemNo) {
          prevKeyItemName = checkedItm.itemName;
          lastKeyItemName = this.checkedItemArr[this.checkedItemArr.length - 1].itemName;
          prevKeyLineItemNo = checkedItm.lineItemNo;
          lastKeyLineItemNo = this.checkedItemArr[this.checkedItemArr.length - 1].lineItemNo;
          prevKeyItemNo = checkedItm.itemNo;
          lastKeyItemNo = this.checkedItemArr[this.checkedItemArr.length - 1].itemNo;

          if (
            (prevKeyItemName != selectedDetRes.itemName && lastKeyItemName === prevKeyItemName)
            || (prevKeyLineItemNo != selectedDetRes.lineItemNo && lastKeyLineItemNo === prevKeyLineItemNo)
            || (prevKeyItemNo != selectedDetRes.itemNo && lastKeyItemNo === prevKeyItemNo)
          ) {
            this.checkedItemArr.push(selectedDetRes);
            console.log("checkedItemArr of selectedDetRes.itemCode != checkedItm.itemCode condition:::", this.checkedItemArr);
            break;
          }//end of if
        }//end of else if
      } else if (this.poType === "NB") {
        if (selectedDetRes.itemCode === checkedItm.itemCode) {
          console.log("item code is matched..");
          break;
        } else if (selectedDetRes.itemCode != checkedItm.itemCode) {
          prevKey = checkedItm.itemCode;
          lastKey = this.checkedItemArr[this.checkedItemArr.length - 1].itemCode;
          if (prevKey != selectedDetRes.itemCode && lastKey === prevKey) {
            this.checkedItemArr.push(selectedDetRes);
            console.log("checkedItemArr of selectedDetRes.itemCode != checkedItm.itemCode condition:::", this.checkedItemArr);
            break;
          }//end of if
        }//end of else if
      }
    }//end of for
  }//end of the method

  //start method getItemDetailsws to get all item details according to the pono and vendor code
  private getItemDetailsWS(poNo: string) {
    this.creditNoteAddEditDataService.getItemDetVal(this.code, poNo).
      subscribe(res => {
        // this.itemDetails = res.details;
        this.itemsHeader = res.header;
        this.poDate = res.details[0].poDate;
        this.poDate = this.datePipe.transform(this.poDate, 'yyyy-MM-dd');
        this.poType = res.details[0].poType;
        this.poUnit = res.details[0].poUnit;
        this.orderQty = res.details[0].orderQty;
        console.log(" poType ===========>>>>>>>>>>>>>>", this.poType);
        console.log(" poUnit ===========>>>>>>>>>>>>>>", this.poUnit);
        console.log(" orderQty ===========>>>>>>>>>>>>>>", this.orderQty);
        this.headName = res.details[0].headName;
        console.log(" headName ===========>>>>>>>>>>>>>>", this.headName);
        console.log(" itemsHeader ===", this.itemsHeader);
      },
      err => {
        console.log(" err ===", err);
        this.sessionErrorService.routeToLander(err._body);
      });
  }//end of method

  //method to get vendor details by vendor code
  private getVendorDetValWS(vendorCode: string) {
    console.log(" vendorCode", vendorCode);
    this.creditNoteAddEditDataService.getVendorDetVal('', vendorCode).
      subscribe(res => {
        console.log(" get vendor details ", res);
        if (res.msgType === 'Info') {
          this.vendorCodeError = false;
          let resDet = res.details[0];
          this.vendorGstInNo = resDet.vendorGstin;
          this.code = resDet.vendorCode;
          this.vendorName = resDet.vendorName;
          this.getPONosWs(this.code);//calling the pono method to get po nos by vendor code
          this.vendorBoolean = true;
        }else if(res.msgType === 'Error'){
          this.vendorCodeError = true;
          this.vendorCodeErrorDesc = "Invalid vendor code";
        }//end of else if
      },
      err => {
        console.log(" err vendor details ", err);
        this.sessionErrorService.routeToLander(err._body);
      });
  }//end of service call method

  //onOpenModal for opening modal from modalService
  private onOpenModal(invoiceTransactionNo: string) {
    const modalRef = this.modalService.open(NgbdModalComponent);
    modalRef.componentInstance.modalTitle = 'Information';
    modalRef.componentInstance.modalMessage =
      //   this.complaintReferenceNo ?
      //     "Complaint Reference Number(DI) " + complaintRefNo + " updated successfully."
      "Credit Note San ID " + invoiceTransactionNo + " created successfully.";
  }
  //end of method onOpenModal

  //start method of getInvoiceNoWs to get po nos fom webservice
  private getInvoiceNoWs(code: string, poNo: string) {
    this.busySpinner.selectedBusy = true;
    this.updateBusySpinner();
    this.creditNoteAddEditDataService.getInvoiceNosVal(code, poNo).
      subscribe(res => {
        console.log(" invoice nos========>>>>>>>>>>", res);
        this.invoiceNoDropDownVal = res.details;
        for (let invNo of this.invoiceNoDropDownVal) {
          if (invNo.key === "") {
            this.invoiceAddEditFormGroup.controls["invoiceNo"].setValue(invNo.key);
            invNo.key = "-- Select --"
          }
        }
        this.busySpinner.selectedBusy = false;
        this.updateBusySpinner();
      },
      err => {
        console.log("invoice err:", err);
        this.sessionErrorService.routeToLander(err._body);
        this.busySpinner.selectedBusy = false;
        this.updateBusySpinner();
      });
  }//end of the method getInvoiceNoWs



  //onOpenModal for opening modal from modalService
  public onVenderCodeSearch(vendorCode: string) {
    if (vendorCode) {
      vendorCode = vendorCode.toUpperCase();
      this.getVendorDetValWS(vendorCode);
    } else {
      this.router.navigate([ROUTE_PATHS.RouteVendorCodeSearch, "creditNote"]);
    }//end of else
  }
  //end of method onOpenModal

  // start method of onVendorCodeChange
  public onVendorCodeChange() {
    this.router.navigate([ROUTE_PATHS.RouteVendorCodeSearch, "creditNote"]);
  }//end of the method

  // start method onChangeInvoiceDate
  onChangeInvoiceDate(creditNoteDateParam: string){
    let creditNoteDate: string = creditNoteDateParam;
    this.creditNoteDateError = false;
    this.creditNoteDateErrorDesc = "";
    //formatting the current date
    let date = new Date();
    creditNoteDate = this.datePipe.transform(creditNoteDate, 'yyyy-MM-dd');
    this.invoiceDate = this.datePipe.transform(this.invoiceDate, 'yyyy-MM-dd');
    if(creditNoteDate < this.invoiceDate){
      this.creditNoteDateError = true;
      this.creditNoteDateErrorDesc = "Credit Note Date can't be less than Invoice Date";
    }
  }//end of the method onChangeInvoiceDate

  //on click cancel
  public onCancel(): void {
    // Not authenticated
    this.router.navigate([ROUTE_PATHS.RouteHome]);
  }//end of onCancel click

  //method to open modal by clicking on add items
  public onAddItemOpenModal() {
    console.log(" method called");
    this.itemQtyCgstIgstError = true;
    this.itemDetailsService.selectedItemDetails = this.checkedItemArr;
    const modalRef = this.modalService.open(NgbdItemNoModalComponent);
    modalRef.componentInstance.vendorCode = this.code;
    modalRef.componentInstance.poNo = this.invoiceAddEditFormGroup.value.poNo;
    modalRef.componentInstance.poType = this.poType;
    modalRef.componentInstance.headName = this.headName;
  }//end of the method

  //to get the file name from html 
  // public fileChangeForOtherDocs(event) {
  //   //this.reset();
  // }//end of the method to get the file name from html 

  //file upload event  
  public fileChange(event, fileTypeParam: string) {
    let flag: boolean = true;
    this.fileData = new FormData();
    this.fileList = event.target.files;
    if (this.fileList.length > 0) {
      for (let i: number = 0; i < this.fileList.length; i++) {
        let file: File = this.fileList[i];
        //check file is valid
        if (!this.validateFile(file.name)) {
          if (fileTypeParam === "CR_NOTE") {
            this.invoiceFileErrFlag = true;
          } else if (fileTypeParam === "otherDocs") {
            this.otherDocFileErrFlag = true;
          }
          this.fileErrMsg = "Selected file format is not supported.Only supports .jpeg,.jpg,.png,.bmp,.pdf this file type.";
          flag = false;
        }
        if (flag) {
          if (fileTypeParam === "CR_NOTE") {
            this.invoiceFileErrFlag = false;
          } else if (fileTypeParam === "otherDocs") {
            this.otherDocFileErrFlag = false;
          }
          this.fileData.append('files' + i.toString(), file, file.name);
        }
      }//end of for
    }//end of if
  }//end of filechange method

  //to delete files
  public deleteFiles(paramValue: string, fileName: string) {
    this.formData = new FormData();//to clear the formdata
    if (confirm("Are you sure to delete " + fileName + " ?")) {
      this.fileDeleteWs(paramValue, fileName);
      // console.log("Implement delete functionality here");
    }//end of if
    if(paramValue === "invoice"){
      this.invoiceAddEditFormGroup.reset();
      this.checkedItemArr = [];
      this.selectedPONo = "";
    }
  }//end of method

  //method to remove items from the array by clicking on cross button
  public onCloseItem(checkItmDet: any) {
    let indexCount: number = 0;
    for (let chckedItm of this.checkedItemArr) {
      if (this.poType === "NB") {
        if (checkItmDet.itemCode === chckedItm.itemCode) {
          this.checkedItemArr.splice(indexCount, 1);
          break;
        }//end of if
      } else if (this.poType === "FO") {
        if (checkItmDet.itemName === chckedItm.itemName && checkItmDet.lineItemNo === chckedItm.lineItemNo && checkItmDet.itemNo === chckedItm.itemNo) {
          this.checkedItemArr.splice(indexCount, 1);
          break;
        }//end of if
      }//end of else if
      indexCount++;
    }//end of for
    this.generateTotalInvoiceDeatilsAmount();//to generate total invoice details amount
    this.getItemQtyTaxRateItemName();
    this.complaintQtyCgstSgstErrorCorrection();
  }//end of method

  //method to get items header according to pono
  public onChangePONo(poNo: string) {
    this.selectedPONo = poNo;
    this.checkedItemArr = [];
    this.totalInvoiceAmount = 0;
    this.totalCgstAmount = 0;
    this.totalSgstAmount = 0;
    this.totalIgstAmount = 0;
    this.itemDetailsService.selectedItemDetails = [];
    console.log(" selectedPONo ", this.selectedPONo);
    this.getInvoiceNoWs(this.code, poNo);
    this.getItemDetailsWS(this.selectedPONo);
  }//end of method

  //method to get items header according to pono
  public onChangeInvoiceNo(args, invoiceDate: string) {
    this.invoiceNo = args.target.options[args.target.selectedIndex].text;
    this.invoiceDate = invoiceDate;
    console.log(" invoiceNo ", this.invoiceNo);
    console.log(" invoiceDate ", this.invoiceDate);
    if (this.invoiceNo != "-- Select --") {
      this.invoiceDate = this.datePipe.transform(invoiceDate, 'yyyy-MM-dd');
    }
    for (let invNo of this.invoiceNoDropDownVal) {
      if (this.invoiceNo === "-- Select --" && invNo.key === "-- Select --") {
        this.invoiceAddEditFormGroup.controls["invoiceNo"].setValue("");
        invNo.key = "-- Select --";
        invNo.value = "";
        break;
      }
    }
    console.log(" this.invoiceNoDropDownVal ", this.invoiceNoDropDownVal);
    this.checkedItemArr = [];
    this.totalInvoiceAmount = 0;
    this.totalCgstAmount = 0;
    this.totalSgstAmount = 0;
    this.totalIgstAmount = 0;
  }//end of method

  //method to check item value
  onKeyupItemValue(itemValueParam: string, checkdItemParam: any) {
    let flag: boolean = false;
    console.log("itemQuantityParam===>", itemValueParam);
    // let cmpQtyErr : boolean = false;
    for (let checkedItm of this.checkedItemArr) {
      if (checkedItm.itemName === checkdItemParam.itemName && checkedItm.lineItemNo === checkdItemParam.lineItemNo && checkedItm.itemNo === checkdItemParam.itemNo) {
        let balanceAmount: number = parseFloat(checkdItemParam.balanceAmount);
        let itemValue: number = parseFloat(itemValueParam);
        if (itemValue > balanceAmount) {
          checkedItm.uiItemValueErrFlag = true;
          this.getItemQtyTaxRateItemName(checkedItm);
          this.complaintQtyCgstSgstErrorCorrection();
          checkedItm.uiItemValueErrDesc = 'Item Value can’t be greater than Balance Amount.';
          this.itemValueErrFlag = true;
          break;
        } else if (isNaN(itemValue) || itemValue == 0) {
          checkedItm.uiItemValueErrFlag = true;
          this.getItemQtyTaxRateItemName(checkedItm);
          this.complaintQtyCgstSgstErrorCorrection();
          checkedItm.uiItemValueErrDesc = 'Item Value can’t be empty or zero.';
          this.itemValueErrFlag = true;
          break;
        } else if (itemValue < 0) {
          checkedItm.uiItemValueErrFlag = true;
          this.getItemQtyTaxRateItemName(checkedItm);
          this.complaintQtyCgstSgstErrorCorrection();
          checkedItm.uiItemValueErrDesc = 'Item Value can’t be less than zero.';
          this.itemValueErrFlag = true;
          break;
        } else if (itemValue <= balanceAmount) {
          flag = true;
          checkedItm.uiItemValueErrFlag = false;
          checkedItm.uiItemValueErrDesc = '';
          checkedItm.itemValue = itemValueParam;
          this.onKeyupToGenerateCgstIgstSgstForItemValue(checkedItm.taxRate, checkedItm);
          this.generateTotalInvoiceDeatilsAmount();
          this.getItemQtyTaxRateItemName(checkedItm);
          this.complaintQtyCgstSgstErrorCorrection();
          break;
        }//end of else if
      }//end of if
      if (flag) {//flag === true
        console.log(" flag ", flag);
        break;
      }//end of if
    }//end of for
  }//end of the method


  //method to check item quantity
  onKeyupComplaintQty(itemQuantityParam: string, checkdItemParam: any) {

    if (this.poType === "NB") {
      let flag: boolean = false;
      console.log("itemQuantityParam===>", itemQuantityParam);
      // let cmpQtyErr : boolean = false;
      for (let checkedItm of this.checkedItemArr) {
        if (checkedItm.itemCode === checkdItemParam.itemCode) {
          let itemQuantity: number = parseFloat(itemQuantityParam);
          let balanceQuantity: number = parseFloat(checkdItemParam.balanceQty);
          let balanceAmount: number = parseFloat(checkdItemParam.balanceAmount);
          if (itemQuantity > balanceQuantity) {

            checkedItm.uiInpErrFlag = true;
            checkedItm.uiInpErrDesc = 'Item Quantity can’t be greater than Balance Quantity.';
            // checkedItm.itemValue = 0;
            let itemPrice: number = parseFloat(checkdItemParam.netPrice);
            checkedItm.itemValue = itemPrice * itemQuantity;
            let itemValue: number = parseFloat(checkdItemParam.itemValue);
            checkedItm.itemCgst = 0;
            checkedItm.itemSgst = 0;
            checkedItm.itemIgst = 0;
            checkedItm.itemAmount = 0;
            if (itemValue > balanceAmount) {
              checkedItm.itemValue = 0;
              checkedItm.uiInpErrFlag = true;
              this.complaintQtyCgstSgstErrorCorrection();
              checkedItm.uiItmBalErrDesc = 'Item Value can’t be greater than Balance Amount.';
              this.itemValueErrFlag = true;
            } else if (itemValue < balanceAmount) {
              checkedItm.uiInpErrFlag = false;
              this.itemValueErrFlag = false;
              checkedItm.uiItmBalErrDesc = '';
              this.onKeyupToGenerateCgstIgstSgst(checkedItm.taxRate, checkedItm.itemCode, checkedItm.itemName, checkedItm.lineItemNo, checkedItm.itemNo);
              this.generateTotalInvoiceDeatilsAmount();
            }
            this.generateTotalInvoiceDeatilsAmount();
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();

            break;
          } else if (isNaN(itemQuantity) || itemQuantity == 0) {

            checkedItm.uiInpErrFlag = true;
            checkedItm.uiInpErrDesc = 'Item Quantity can’t be empty or zero';
            this.itemValueErrFlag = false;
            checkedItm.itemValue = 0;
            this.complaintQtyCgstSgstErrorCorrection();
            let itemPrice: number = parseFloat(checkdItemParam.netPrice);
            checkedItm.itemValue = itemPrice * itemQuantity;
            this.onKeyupToGenerateCgstIgstSgst(checkedItm.taxRate, checkedItm.itemCode, checkedItm.itemName, checkedItm.lineItemNo, checkedItm.itemNo);
            this.generateTotalInvoiceDeatilsAmount();
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();

          } else if (itemQuantity < 0) {

            checkedItm.uiInpErrFlag = true;
            this.itemValueErrFlag = false;
            checkedItm.uiInpErrDesc = 'Item Quantity can’t be less than or equal to zero';
            checkedItm.itemValue = 0;
            checkedItm.itemQuantity = 0;
            itemQuantity = 0;
            let itemPrice: number = parseFloat(checkdItemParam.netPrice);
            checkedItm.itemValue = itemPrice * itemQuantity;
            this.onKeyupToGenerateCgstIgstSgst(checkedItm.taxRate, checkedItm.itemCode, checkedItm.itemName, checkedItm.lineItemNo, checkedItm.itemNo);
            this.generateTotalInvoiceDeatilsAmount();
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();

          } else {
            flag = true;
            checkedItm.uiInpErrFlag = false;
            checkedItm.uiInpErrDesc = '';
            if (checkedItm.itemName === " " || checkedItm.itemName === "") {
              checkedItm.uiItemNameErrFlag = "";
            } else if (checkedItm.itemName) {
              checkedItm.uiItemNameErrFlag = false;
            }
            //generating itemValue
            checkedItm.itemQuantity = itemQuantityParam;
            let itemPrice: number = parseFloat(checkdItemParam.netPrice);
            checkedItm.itemValue = itemPrice * itemQuantity;
            this.onKeyupToGenerateCgstIgstSgst(checkedItm.taxRate, checkedItm.itemCode, checkedItm.itemName, checkedItm.lineItemNo, checkedItm.itemNo);
            this.generateTotalInvoiceDeatilsAmount();
            // this.generateItemAmount(itemCode, checkedItm.itemValue, checkedItm.itemIgst);
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();
            break;
          }//end of else
        }//end of if
        if (flag) {//flag === true
          console.log(" flag ", flag);
          break;
        }//end of if 

      }//end of for   
      console.log(" checkedItemArr===>>>> ", this.checkedItemArr);
    } else if (this.poType === "FO") {
      let flag: boolean = false;
      console.log("itemQuantityParam===>", itemQuantityParam);
      // let cmpQtyErr : boolean = false;
      for (let checkedItm of this.checkedItemArr) {
        if (checkedItm.itemName === checkdItemParam.itemName && checkedItm.lineItemNo === checkdItemParam.lineItemNo && checkedItm.itemNo === checkdItemParam.itemNo) {
          let itemQuantity: number = parseFloat(itemQuantityParam);
          let balanceQuantity: number = parseFloat(checkdItemParam.balanceQty);
          let balanceAmount: number = parseFloat(checkdItemParam.balanceAmount);
          let itemValue: number = parseFloat(checkdItemParam.itemValue);
          if (this.poUnit === "JOB") {
            let orderQty: number = parseFloat(checkdItemParam.orderQty);
            console.log(" orderQty ====", orderQty);
            //if orderqty greater than 1
            if (orderQty > 1) {
              if (itemQuantity > balanceQuantity) {
                let itemPrice: number = parseFloat(checkdItemParam.netPrice);
                checkedItm.itemValue = itemPrice * itemQuantity;
                checkedItm.uiInpErrFlag = true;
                checkedItm.uiInpErrDesc = 'Item Quantity can’t be greater than Balance Quantity.';
                if (itemValue > balanceAmount) {
                  console.log(" itemValue > balanceAmount.", itemValue > balanceAmount);
                  checkedItm.uiInpErrFlag = true;
                  this.itemValueError = true;
                  checkedItm.itemValue = 0;
                  checkedItm.uiBalAmoutErrDesc = 'Item Value can’t be greater than Balance Amount.';
                } else if (itemValue < balanceAmount) {
                  console.log(" itemValue < balanceAmount.", itemValue < balanceAmount);
                  //checkedItm.uiInpErrFlag = false;
                  this.itemValueError = false;
                  checkedItm.uiBalAmoutErrDesc = '';
                }
                this.complaintQtyCgstSgstErrorCorrection();
                this.generateTotalInvoiceDeatilsAmount();

                break;
              } else if (isNaN(itemQuantity) || itemQuantity == 0) {

                checkedItm.uiInpErrFlag = true;
                checkedItm.uiInpErrDesc = 'Item Quantity can’t be empty or zero';
                checkedItm.itemValue = 0;
                this.complaintQtyCgstSgstErrorCorrection();
                let itemPrice: number = parseFloat(checkdItemParam.netPrice);
                checkedItm.itemValue = itemPrice * itemQuantity;
                this.onKeyupToGenerateCgstIgstSgst(checkedItm.taxRate, checkedItm.itemCode, checkedItm.itemName, checkedItm.lineItemNo, checkedItm.itemNo);
                this.generateTotalInvoiceDeatilsAmount();
                this.getItemQtyTaxRateItemName(checkedItm);
                this.complaintQtyCgstSgstErrorCorrection();


              } else if (itemQuantity < 0) {

                checkedItm.uiInpErrFlag = true;
                checkedItm.uiInpErrDesc = 'Item Quantity can’t be less than or equal to zero';
                checkedItm.itemValue = 0;
                this.complaintQtyCgstSgstErrorCorrection();
                let itemPrice: number = parseFloat(checkdItemParam.netPrice);
                itemQuantity = 0;
                checkedItm.itemValue = itemPrice * itemQuantity;
                this.onKeyupToGenerateCgstIgstSgst(checkedItm.taxRate, checkedItm.itemCode, checkedItm.itemName, checkedItm.lineItemNo, checkedItm.itemNo);
                this.generateTotalInvoiceDeatilsAmount();
                this.getItemQtyTaxRateItemName(checkedItm);
                this.complaintQtyCgstSgstErrorCorrection();


              } else {
                console.log(" complain qty as per required");
                flag = true;
                checkedItm.uiInpErrFlag = false;
                checkedItm.uiInpErrDesc = '';
                if (checkedItm.itemName === " " || checkedItm.itemName === "") {
                  checkedItm.uiItemNameErrFlag = "";
                } else if (checkedItm.itemName) {
                  checkedItm.uiItemNameErrFlag = false;
                }
                //generating itemValue
                console.log(" generating itemValue");
                checkedItm.itemQuantity = itemQuantityParam;
                console.log(" itemQuantityParam ", itemQuantityParam);
                let itemPrice: number = parseFloat(checkdItemParam.netPrice);
                console.log(" itemPrice ", itemPrice);
                checkedItm.itemValue = itemPrice * itemQuantity;
                console.log(" checkedItm.itemValue ", checkedItm.itemValue);
                this.onKeyupToGenerateCgstIgstSgst(checkedItm.taxRate, checkedItm.itemCode, checkedItm.itemName, checkedItm.lineItemNo, checkedItm.itemNo);
                this.generateTotalInvoiceDeatilsAmount();
                // this.generateItemAmount(itemCode, checkedItm.itemValue, checkedItm.itemIgst);
                this.getItemQtyTaxRateItemName(checkedItm);
                this.complaintQtyCgstSgstErrorCorrection();
                break;
              }//end of else
            }//end of if of order quantity
            if (flag) {//flag === true
              console.log(" flag ", flag);
              break;
            }//end of if 
          } else if (this.poUnit != "JOB") {
            if (itemQuantity > balanceQuantity) {
              let itemPrice: number = parseFloat(checkdItemParam.netPrice);
              checkedItm.itemValue = itemPrice * itemQuantity;
              checkedItm.uiInpErrFlag = true;
              checkedItm.uiInpErrDesc = 'Item Quantity can’t be greater than Balance Quantity.';
              if (itemValue > balanceAmount) {
                console.log(" itemValue > balanceAmount.", itemValue > balanceAmount);
                checkedItm.uiInpErrFlag = true;
                this.itemValueError = true;
                checkedItm.itemValue = 0;
                checkedItm.uiBalAmoutErrDesc = 'Item Value can’t be greater than Balance Amount.';
              } else if (itemValue < balanceAmount) {
                console.log(" itemValue < balanceAmount.", itemValue < balanceAmount);
                //checkedItm.uiInpErrFlag = false;
                this.itemValueError = false;
                checkedItm.uiBalAmoutErrDesc = '';
              }
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();

              break;
            } else if (isNaN(itemQuantity) || itemQuantity == 0) {

              checkedItm.uiInpErrFlag = true;
              checkedItm.uiInpErrDesc = 'Item Quantity can’t be empty or zero';
              checkedItm.itemValue = 0;
              this.complaintQtyCgstSgstErrorCorrection();
              let itemPrice: number = parseFloat(checkdItemParam.netPrice);
              checkedItm.itemValue = itemPrice * itemQuantity;
              this.onKeyupToGenerateCgstIgstSgst(checkedItm.taxRate, checkedItm.itemCode, checkedItm.itemName, checkedItm.lineItemNo, checkedItm.itemNo);
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();


            } else if (itemQuantity < 0) {

              checkedItm.uiInpErrFlag = true;
              checkedItm.uiInpErrDesc = 'Item Quantity can’t be less than or equal to zero';
              checkedItm.itemValue = 0;
              this.complaintQtyCgstSgstErrorCorrection();
              let itemPrice: number = parseFloat(checkdItemParam.netPrice);
              itemQuantity = 0;
              checkedItm.itemValue = itemPrice * itemQuantity;
              this.onKeyupToGenerateCgstIgstSgst(checkedItm.taxRate, checkedItm.itemCode, checkedItm.itemName, checkedItm.lineItemNo, checkedItm.itemNo);
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();


            } else {
              console.log(" complain qty as per required");
              flag = true;
              checkedItm.uiInpErrFlag = false;
              checkedItm.uiInpErrDesc = '';
              if (checkedItm.itemName === " " || checkedItm.itemName === "") {
                checkedItm.uiItemNameErrFlag = "";
              } else if (checkedItm.itemName) {
                checkedItm.uiItemNameErrFlag = false;
              }
              //generating itemValue
              console.log(" generating itemValue");
              checkedItm.itemQuantity = itemQuantityParam;
              console.log(" itemQuantityParam ", itemQuantityParam);
              let itemPrice: number = parseFloat(checkdItemParam.netPrice);
              console.log(" itemPrice ", itemPrice);
              checkedItm.itemValue = itemPrice * itemQuantity;
              console.log(" checkedItm.itemValue ", checkedItm.itemValue);
              this.onKeyupToGenerateCgstIgstSgst(checkedItm.taxRate, checkedItm.itemCode, checkedItm.itemName, checkedItm.lineItemNo, checkedItm.itemNo);
              this.generateTotalInvoiceDeatilsAmount();
              // this.generateItemAmount(itemCode, checkedItm.itemValue, checkedItm.itemIgst);
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();
              break;
            }//end of else
            if (flag) {//flag === true
              console.log(" flag ", flag);
              break;
            }//end of if 
          }
        }//end of for   
        console.log(" checkedItemArr===>>>> ", this.checkedItemArr);
      }
    }
  }
  //end of the method 


  //start method of complaintQtyErrorCorrection
  private complaintQtyCgstSgstErrorCorrection() {
    for (let checkedItm of this.checkedItemArr) {
      let orderQtyNum: number = parseInt(this.orderQty);
      if (checkedItm.uiInpErrFlag || checkedItm.uiTaxtRateErrFlag || checkedItm.uiItemNameErrFlag || (this.poType === 'FO' && this.poUnit === 'JOB' && orderQtyNum === 1 && checkedItm.uiItemValueErrFlag)) {
        // if (this.poType === 'FO' && this.poUnit === 'JOB' && orderQtyNum === 1) {
        //   if (checkedItm.uiItemValueErrFlag) {
        //     this.itemQtyCgstIgstError = true;
        //   }
        // } else {
        this.itemQtyCgstIgstError = true;
        // }
        break;
      } else if ((checkedItm.uiInpErrFlag === false || checkedItm.uiInpErrFlag === undefined) && (checkedItm.uiTaxtRateErrFlag === false || checkedItm.uiTaxtRateErrFlag === undefined) && (checkedItm.uiItemNameErrFlag === false || checkedItm.uiItemNameErrFlag === undefined) && (this.poType === 'FO' && this.poUnit === 'JOB' && orderQtyNum === 1 && checkedItm.uiItemValueErrFlag)) {
        // if (this.poType === 'FO' && this.poUnit === 'JOB' && orderQtyNum === 1) {
        //   if (checkedItm.uiItemValueErrFlag === false || checkedItm.uiItemValueErrFlag === undefined) {
        //     this.itemQtyCgstIgstError = false;
        //   }
        // } else {
        this.itemQtyCgstIgstError = false;
        // }
      }
      // if (checkedItm.uiInpErrFlag == true || checkedItm.uiInpErrFlag == undefined ) {
      //     this.itemQtyCgstIgstError = true;
      //   } else if (checkedItm.uiInpErrFlag == false) {
      //     this.itemQtyCgstIgstError = false;
      //   }
      // else if(checkedItm.uiCgstErrFlag == true || checkedItm.uiCgstErrFlag == undefined ){
      //   this.cgstError = true;
      // }else if(checkedItm.uiCgstErrFlag == false){
      //   this.cgstError = false;
      // }else if(checkedItm.uiSgstErrFlag == true || checkedItm.uiSgstErrFlag == undefined ){
      //   this.sgstError = true;
      // }else if(checkedItm.uiSgstErrFlag == false){
      //   this.sgstError = false;
      // }
    }//end of for
  }//end of the method complaintQtyErrorCorrection   



  //to load the spinner
  private updateBusySpinner() {
    if (this.busySpinner.selectedBusy || this.busySpinner.submitBusy || this.busySpinner.fileuploadBusy) {
      this.busySpinner.busy = true;
    } else if (this.busySpinner.selectedBusy == false && this.busySpinner.submitBusy == false && this.busySpinner.fileuploadBusy == false) {
      this.busySpinner.busy = false;
    }//end of else if
  }//end of busy spinner method

  // start method to validate file extension
  private validateFile(name: String) {
    let ext: string = name.substring(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() == 'png' || ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg' || ext.toLowerCase() == 'bmp' || ext.toLowerCase() == 'pdf') {
      return true;
    }//end of if
    else {
      return false;
    }//end of else
  }//end of the method

  //start method of onKeyupToGenerateCgstIgstSgstForItemValue
  public onKeyupToGenerateCgstIgstSgstForItemValue(taxRateParam: string, checkItmParam: any) {
    console.log(" substring ", this.companyGstinNo.substring(0, 2));
    for (let checkedItm of this.checkedItemArr) {
      if (checkedItm.itemName === checkItmParam.itemName && checkedItm.lineItemNo === checkItmParam.lineItemNo && checkedItm.itemNo === checkItmParam.itemNo) {
        // if(this.companyGstinNo.substring(0,2) === this.vendorGstInNo.substring(0,2)){
        let taxtRate: number = 0;
        taxtRate = parseFloat(taxRateParam);
        if (isNaN(taxtRate) || taxtRate == 0) {
          checkedItm.uiTaxtRateErrFlag = true;
          checkedItm.taxRate = 0;
          taxtRate = 0;
          checkedItm.uiTaxtRateErrDesc = 'Tax rate can’t be empty or zero.';
          this.complaintQtyCgstSgstErrorCorrection();
          let totalGST: number = (parseFloat(checkedItm.itemValue) * taxtRate) / 100;
          let companyGstinNoSubStr: string = this.companyGstinNo.substring(0, 2);
          let vendorGstInNoSubStr: string = this.vendorGstInNo.substring(0, 2);
          if (companyGstinNoSubStr === vendorGstInNoSubStr) {
            checkedItm.itemCgst = totalGST / 2;
            checkedItm.itemSgst = totalGST / 2;
            checkedItm.itemAmount = parseFloat(checkedItm.itemValue) + checkedItm.itemCgst + checkedItm.itemSgst;
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();
            break;
          } else {
            checkedItm.itemIgst = totalGST;
            checkedItm.itemAmount = parseFloat(checkedItm.itemValue) + checkedItm.itemIgst;
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();
            break;
          }
        } else if (taxtRate < 0) {
          checkedItm.taxRate = 0;
          taxtRate = 0;
          checkedItm.uiTaxtRateErrFlag = true;
          checkedItm.itemCgst = 0;
          checkedItm.itemIgst = 0;
          checkedItm.itemSgst = 0;
          checkedItm.uiTaxtRateErrDesc = 'CGST can’t be less than or equal to zero.';
          this.complaintQtyCgstSgstErrorCorrection();
          let totalGST: number = (parseFloat(checkedItm.itemValue) * taxtRate) / 100;
          let companyGstinNoSubStr: string = this.companyGstinNo.substring(0, 2);
          let vendorGstInNoSubStr: string = this.vendorGstInNo.substring(0, 2);
          if (companyGstinNoSubStr === vendorGstInNoSubStr) {
            checkedItm.itemCgst = totalGST / 2;
            checkedItm.itemSgst = totalGST / 2;
            checkedItm.itemAmount = parseFloat(checkedItm.itemValue) + checkedItm.itemCgst + checkedItm.itemSgst;
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();
            break;
          } else {
            checkedItm.itemIgst = totalGST;
            checkedItm.itemAmount = parseFloat(checkedItm.itemValue) + checkedItm.itemIgst;
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();
            break;
          }
        } else {
          // checkedItm.itemCgst = itemCgst;
          checkedItm.taxRate = taxtRate;
          checkedItm.uiTaxtRateErrFlag = false;
          if (checkedItm.itemName === " " || checkedItm.itemName === "") {
            checkedItm.uiItemNameErrFlag = "";
          } else if (checkedItm.itemName) {
            checkedItm.uiItemNameErrFlag = false;
          }
          this.complaintQtyCgstSgstErrorCorrection();
          let totalGST: number = (parseFloat(checkedItm.itemValue) * taxtRate) / 100;
          let companyGstinNoSubStr: string = this.companyGstinNo.substring(0, 2);
          let vendorGstInNoSubStr: string = this.vendorGstInNo.substring(0, 2);
          if (companyGstinNoSubStr === vendorGstInNoSubStr) {
            checkedItm.itemCgst = totalGST / 2;
            checkedItm.itemSgst = totalGST / 2;
            checkedItm.itemAmount = parseFloat(checkedItm.itemValue) + checkedItm.itemCgst + checkedItm.itemSgst;
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();
            break;
          } else {
            checkedItm.itemIgst = totalGST;
            checkedItm.itemAmount = parseFloat(checkedItm.itemValue) + checkedItm.itemIgst;
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();
            break;
          }//end of else
        }//end of else
      }//end of if
    }//end of for
  }//end of the method


  //start method of onKeyupToGenerateCgstIgstSgst
  public onKeyupToGenerateCgstIgstSgst(taxtRateParam: string, itemCodeParam: string, itemNameParam: string, lineItemNoParam: string, itemNoParam: string) {
    this.companyGstinNo = this.localStorageService.appSettings.companyGstin;
    console.log(" companyGstin =======", this.companyGstinNo);
    if (this.poType === "NB") {
      console.log(" substring ", this.companyGstinNo.substring(0, 2));
      for (let checkedItm of this.checkedItemArr) {
        if (checkedItm.itemCode === itemCodeParam) {
          // if(this.companyGstinNo.substring(0,2) === this.vendorGstInNo.substring(0,2)){
          let taxtRate: number = 0;
          taxtRate = parseFloat(taxtRateParam);
          if (isNaN(taxtRate) || taxtRate == 0) {
            checkedItm.uiTaxtRateErrFlag = true;
            checkedItm.taxRate = 0;
            taxtRate = 0;
            checkedItm.uiTaxtRateErrDesc = 'Tax rate can’t be empty or zero.';
            this.complaintQtyCgstSgstErrorCorrection();
            let totalGST: number = (checkedItm.itemValue * taxtRate) / 100;
            let companyGstinNoSubStr: string = this.companyGstinNo.substring(0, 2);
            let vendorGstInNoSubStr: string = this.vendorGstInNo.substring(0, 2);
            if (companyGstinNoSubStr === vendorGstInNoSubStr) {
              checkedItm.itemCgst = totalGST / 2;
              checkedItm.itemSgst = totalGST / 2;
              checkedItm.itemAmount = checkedItm.itemValue + checkedItm.itemCgst + checkedItm.itemSgst;
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();
              break;
            } else {
              checkedItm.itemIgst = totalGST;
              checkedItm.itemAmount = checkedItm.itemValue + checkedItm.itemIgst;
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();
              break;
            }
            // this.cgstError = true;
          } else if (taxtRate < 0) {
            checkedItm.taxRate = 0;
            taxtRate = 0;
            checkedItm.uiTaxtRateErrFlag = true;
            checkedItm.itemCgst = 0;
            checkedItm.itemIgst = 0;
            checkedItm.itemSgst = 0;
            checkedItm.uiTaxtRateErrDesc = 'CGST can’t be less than or equal to zero.';
            this.complaintQtyCgstSgstErrorCorrection();
            let totalGST: number = (checkedItm.itemValue * taxtRate) / 100;
            let companyGstinNoSubStr: string = this.companyGstinNo.substring(0, 2);
            let vendorGstInNoSubStr: string = this.vendorGstInNo.substring(0, 2);
            if (companyGstinNoSubStr === vendorGstInNoSubStr) {
              checkedItm.itemCgst = totalGST / 2;
              checkedItm.itemSgst = totalGST / 2;
              checkedItm.itemAmount = checkedItm.itemValue + checkedItm.itemCgst + checkedItm.itemSgst;
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();
              break;
            } else {
              checkedItm.itemIgst = totalGST;
              checkedItm.itemAmount = checkedItm.itemValue + checkedItm.itemIgst;
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();
              break;
            }
          } else {
            // checkedItm.itemCgst = itemCgst;
            checkedItm.taxRate = taxtRateParam;
            checkedItm.uiTaxtRateErrFlag = false;
            checkedItm.uiTaxtRateErrDesc = '';
            if (checkedItm.itemName === " " || checkedItm.itemName === "") {
              checkedItm.uiItemNameErrFlag = "";
            } else if (checkedItm.itemName) {
              checkedItm.uiItemNameErrFlag = false;
            }
            this.complaintQtyCgstSgstErrorCorrection();
            let totalGST: number = (checkedItm.itemValue * taxtRate) / 100;
            let companyGstinNoSubStr: string = this.companyGstinNo.substring(0, 2);
            let vendorGstInNoSubStr: string = this.vendorGstInNo.substring(0, 2);
            if (companyGstinNoSubStr === vendorGstInNoSubStr) {
              checkedItm.itemCgst = totalGST / 2;
              checkedItm.itemSgst = totalGST / 2;
              checkedItm.itemAmount = checkedItm.itemValue + checkedItm.itemCgst + checkedItm.itemSgst;
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();
              break;
            } else {
              checkedItm.itemIgst = totalGST;
              checkedItm.itemAmount = checkedItm.itemValue + checkedItm.itemIgst;
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();
              break;
            }
          }
          //     //this.cgstError = false;
          //     // this.complaintQtyCgstSgstErrorCorrection();
          //     // checkedItm.itemSgst = 0;
          // if (checkedItm.itemCgst && checkedItm.itemSgst) {
          //   checkedItm.itemIgst = (checkedItm.itemCgst + checkedItm.itemSgst);
          //   console.log(" checkedItm.itemIgst ", checkedItm.itemIgst);
          //   // this.generateItemAmount(itemCodeParam, checkedItm.itemValue, checkedItm.itemIgst);//to generate item amount
          // }

        }//end of if
      }//end of for        
    } else if (this.poType === "FO") {
      console.log(" substring ", this.companyGstinNo.substring(0, 2));
      for (let checkedItm of this.checkedItemArr) {
        if (checkedItm.itemName === itemNameParam && checkedItm.lineItemNo === lineItemNoParam && checkedItm.itemNo === itemNoParam) {
          // if(this.companyGstinNo.substring(0,2) === this.vendorGstInNo.substring(0,2)){
          let taxtRate: number = 0;
          taxtRate = parseFloat(taxtRateParam);
          if (isNaN(taxtRate) || taxtRate == 0) {
            checkedItm.uiTaxtRateErrFlag = true;
            checkedItm.taxRate = 0;
            taxtRate = 0;
            checkedItm.uiTaxtRateErrDesc = 'Tax rate can’t be empty or zero.';
            this.complaintQtyCgstSgstErrorCorrection();
            let totalGST: number = (checkedItm.itemValue * taxtRate) / 100;
            let companyGstinNoSubStr: string = this.companyGstinNo.substring(0, 2);
            let vendorGstInNoSubStr: string = this.vendorGstInNo.substring(0, 2);
            if (companyGstinNoSubStr === vendorGstInNoSubStr) {
              checkedItm.itemCgst = totalGST / 2;
              checkedItm.itemSgst = totalGST / 2;
              checkedItm.itemAmount = checkedItm.itemValue + checkedItm.itemCgst + checkedItm.itemSgst;
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();
              break;
            } else {
              checkedItm.itemIgst = totalGST;
              checkedItm.itemAmount = checkedItm.itemValue + checkedItm.itemIgst;
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();
              break;
            }
          } else if (taxtRate < 0) {
            checkedItm.taxRate = 0;
            taxtRate = 0;
            checkedItm.uiTaxtRateErrFlag = true;
            checkedItm.itemCgst = 0;
            checkedItm.itemIgst = 0;
            checkedItm.itemSgst = 0;
            checkedItm.uiTaxtRateErrDesc = 'CGST can’t be less than or equal to zero.';
            this.complaintQtyCgstSgstErrorCorrection();
            let totalGST: number = (checkedItm.itemValue * taxtRate) / 100;
            let companyGstinNoSubStr: string = this.companyGstinNo.substring(0, 2);
            let vendorGstInNoSubStr: string = this.vendorGstInNo.substring(0, 2);
            if (companyGstinNoSubStr === vendorGstInNoSubStr) {
              checkedItm.itemCgst = totalGST / 2;
              checkedItm.itemSgst = totalGST / 2;
              checkedItm.itemAmount = checkedItm.itemValue + checkedItm.itemCgst + checkedItm.itemSgst;
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();
              break;
            } else {
              checkedItm.itemIgst = totalGST;
              checkedItm.itemAmount = checkedItm.itemValue + checkedItm.itemIgst;
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();
              break;
            }
          } else {
            // checkedItm.itemCgst = itemCgst;
            checkedItm.taxRate = taxtRateParam;
            checkedItm.uiTaxtRateErrFlag = false;
            if (checkedItm.itemName === " " || checkedItm.itemName === "") {
              checkedItm.uiItemNameErrFlag = "";
            } else if (checkedItm.itemName) {
              checkedItm.uiItemNameErrFlag = false;
            }
            this.complaintQtyCgstSgstErrorCorrection();
            let totalGST: number = (checkedItm.itemValue * taxtRate) / 100;
            let companyGstinNoSubStr: string = this.companyGstinNo.substring(0, 2);
            let vendorGstInNoSubStr: string = this.vendorGstInNo.substring(0, 2);
            if (companyGstinNoSubStr === vendorGstInNoSubStr) {
              checkedItm.itemCgst = totalGST / 2;
              checkedItm.itemSgst = totalGST / 2;
              checkedItm.itemAmount = checkedItm.itemValue + checkedItm.itemCgst + checkedItm.itemSgst;
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();
              break;
            } else {
              checkedItm.itemIgst = totalGST;
              checkedItm.itemAmount = checkedItm.itemValue + checkedItm.itemIgst;
              this.generateTotalInvoiceDeatilsAmount();
              this.getItemQtyTaxRateItemName(checkedItm);
              this.complaintQtyCgstSgstErrorCorrection();
              break;
            }
          }
          //     //this.cgstError = false;
          //     // this.complaintQtyCgstSgstErrorCorrection();
          //     // checkedItm.itemSgst = 0;
          // if (checkedItm.itemCgst && checkedItm.itemSgst) {
          //   checkedItm.itemIgst = (checkedItm.itemCgst + checkedItm.itemSgst);
          //   console.log(" checkedItm.itemIgst ", checkedItm.itemIgst);
          //   // this.generateItemAmount(itemCodeParam, checkedItm.itemValue, checkedItm.itemIgst);//to generate item amount
          // }

        }//end of if
      }//end of for
    }//end else if
  }//end method of onKeyupToGenerateCgstIgstSgst

  // start method of onKeyupToGenerateIgst to generate IGST amount
  // public onKeyupToGenerateIgst(itemCgstParam: string, itemCodeParam: string, itemSgstParam: string, gstType: string) {
  //   for (let checkedItm of this.checkedItemArr) {
  //     if (checkedItm.itemCode === itemCodeParam) {
  //       let itemCgst: number = 0;
  //       let itemSgst: number = 0;
  //       if (gstType === 'cgst') {
  //         itemCgst = parseFloat(itemCgstParam);
  //         console.log("  itemCgst ", itemCgst);
  //         console.log(" checkedItm.itemSgst ", checkedItm.itemSgst);
  //         if(isNaN(itemCgst) || itemCgst == 0){
  //           checkedItm.uiCgstErrFlag = true;
  //           checkedItm.uiCgstErrDesc = 'CGST can’t be empty or zero.';
  //           this.complaintQtyCgstSgstErrorCorrection();
  //           //this.cgstError = true;
  //         }else{
  //           checkedItm.itemCgst = itemCgst;
  //           checkedItm.uiCgstErrFlag = false;
  //           //this.cgstError = false;
  //           this.complaintQtyCgstSgstErrorCorrection();
  //           // checkedItm.itemSgst = 0;
  //         }
  //       } else if (gstType === 'sgst') {
  //         itemSgst = parseFloat(itemSgstParam);
  //         if(isNaN(itemSgst) || itemSgst == 0){
  //           checkedItm.uiSgstErrFlag = true;
  //           checkedItm.uiSgstErrDesc = 'SGST can’t be empty or zero.';
  //           this.complaintQtyCgstSgstErrorCorrection();
  //           //this.sgstError = true;
  //         }else{
  //           checkedItm.itemSgst = itemSgst;
  //           //this.sgstError = false;
  //           checkedItm.uiSgstErrFlag = false;
  //           this.complaintQtyCgstSgstErrorCorrection();
  //         }
  //         console.log("  itemSgst ", itemSgst);
  //         console.log(" checkedItm.itemCgst ", checkedItm.itemCgst);
  //         // checkedItm.itemCgst = 0;
  //       }
  //       if (checkedItm.itemCgst && checkedItm.itemSgst) {
  //         checkedItm.itemIgst = (checkedItm.itemCgst + checkedItm.itemSgst);
  //         console.log(" checkedItm.itemIgst ", checkedItm.itemIgst);
  //         this.generateItemAmount(itemCodeParam, checkedItm.itemValue, checkedItm.itemIgst);//to generate item amount
  //       }
  //       break;
  //     }//end of if
  //   }//end of for
  // }//end of method

  // method to generate Item Amount
  private generateItemAmount(itemCodeParam: string, itemValueParam: string, itemIgstParam: string) {
    for (let checkedItm of this.checkedItemArr) {
      if (checkedItm.itemCode === itemCodeParam) {
        let itemValue: number = parseFloat(itemValueParam);
        let itemIgst: number = parseFloat(itemIgstParam);
        if (itemValue && itemIgst) {
          checkedItm.itemAmount = itemValue + itemIgst;
        }//end of if
      }//end of if
    }//end of for
    this.generateTotalInvoiceDeatilsAmount(); //to generate total invoice  details amount
  }//end of the method

  //to generate total invoice  details amount
  generateTotalInvoiceDeatilsAmount() {
    this.totalInvoiceAmount = 0;
    this.totalCgstAmount = 0;
    this.totalSgstAmount = 0;
    this.totalIgstAmount = 0;
    for (let checkedItm of this.checkedItemArr) {
      // if (checkedItm.itemValue || ((checkedItm.itemCgst && checkedItm.itemSgst) || checkedItm.itemIgst)) {
      this.totalInvoiceAmount = this.totalInvoiceAmount + parseFloat(checkedItm.itemValue);
      this.totalCgstAmount = this.totalCgstAmount + checkedItm.itemCgst;
      this.totalSgstAmount = this.totalSgstAmount + checkedItm.itemSgst;
      this.totalIgstAmount = this.totalIgstAmount + checkedItm.itemIgst;
      // } else {
      //   this.totalInvoiceAmount = 0;
      //   this.totalCgstAmount = 0;
      //   this.totalSgstAmount = 0;
      //   this.totalIgstAmount = 0;
      //   break;
      // }//end of else
    }//end of for
    // checking the length of the array is zero and set all total amount to zero
    if (this.checkedItemArr.length === 0) {
      this.totalInvoiceAmount = 0;
      this.totalCgstAmount = 0;
      this.totalSgstAmount = 0;
      this.totalIgstAmount = 0;
    }//end of if
  }//end of the method

  //method to transaction submit-- invoice add
  public invoiceAddSubmit() {
    //for loop to change the item price value
    for (let itm of this.checkedItemArr) {
      itm.itemPrice = itm.netPrice;
      itm.itemQuantity = parseFloat(itm.itemQuantity);
    }//end of for
    let invoiceTranDet: any = {};
    console.log(" this.creditNoteFilesArr[0].fileName; ", this.invoiceFilesArr[0].fileName);
    invoiceTranDet.drCrNoteFileName = this.invoiceFilesArr[0].fileName;
    invoiceTranDet.vendorCode = this.code;
    invoiceTranDet.transactionType = "Credit";
    invoiceTranDet.poNumber = this.invoiceAddEditFormGroup.value.poNo;
    invoiceTranDet.invoiceNumber = this.invoiceNo;
    invoiceTranDet.drCrNoteNumber = this.invoiceAddEditFormGroup.value.creditNoteNumber;
    invoiceTranDet.drCrNoteDate = this.invoiceAddEditFormGroup.value.creditNoteDate;
    invoiceTranDet.drCrNoteAmount = this.totalInvoiceAmount;
    invoiceTranDet.totalCgst = this.totalCgstAmount;
    invoiceTranDet.totalSgst = this.totalSgstAmount;
    invoiceTranDet.totalIgst = this.totalIgstAmount;
    invoiceTranDet.userId = this.localStorageService.user.userId;
    let items: any[] = this.checkedItemArr;
    invoiceTranDet.items = items;
    let files: any[] = this.otherFilesArr;
    invoiceTranDet.files = files;
    console.log("invoiceTranDet ====>>>>>> ", invoiceTranDet);
    this.busySpinner.submitBusy = true;
    this.updateBusySpinner();
    this.creditNoteAddEditDataService.transactionAddSubmit(invoiceTranDet).
      subscribe(res => {
        console.log(" res of invoice add", res);
        this.busySpinner.submitBusy = false;//to stop the busy spinner
        this.updateBusySpinner();
        if (res.msgType === "Info") {
          console.log(" success");
          this.onOpenModal(res.value);
          this.submitError = false;
          this.router.navigate([ROUTE_PATHS.RouteHome]);//route to home
        }else if(res.msgType === "Error"){
          this.submitError = true;
          this.submitErrorMsg = res.msg;
          console.log("  this.submitErrorMsg =============", this.submitErrorMsg);
        }//end of else if
      },
      err => {
        console.log("invoiceTran submit error::", err);
        this.sessionErrorService.routeToLander(err._body);
        this.busySpinner.submitBusy = false;//to stop the busy spinner
        this.updateBusySpinner();
      });
  }//end of method

  //start method of onItemNameKeyup
  public onItemNameKeyup(itemNameParam: string, itemCodeParam: string, lineItemNoParam: string, itemNoParam: string) {
    if (this.poType === "NB") {
      for (let checkedItm of this.checkedItemArr) {
        if (checkedItm.itemCode === itemCodeParam) {
          if (itemNameParam === "" || itemNameParam === " ") {
            checkedItm.uiItemNameErrFlag = true;
            checkedItm.uiItemNameErrDesc = 'Item name can’t be empty.';
            checkedItm.itemName = "";
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();
            // this.cgstError = true;
          } else {
            checkedItm.itemName = itemNameParam;
            checkedItm.uiItemNameErrFlag = false;
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();
          }//end of else
        }//end of if
      }//end of for
    } else if (this.poType === "FO") {
      for (let checkedItm of this.checkedItemArr) {
        if (checkedItm.lineItemNo === lineItemNoParam && checkedItm.itemNo === itemNoParam) {
          if (itemNameParam === "" || itemNameParam === " ") {
            checkedItm.uiItemNameErrFlag = true;
            checkedItm.uiItemNameErrDesc = 'Item name can’t be empty.';
            checkedItm.itemName = "";
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();
            // this.cgstError = true;
          } else {
            checkedItm.itemName = itemNameParam;
            checkedItm.uiItemNameErrFlag = false;
            this.getItemQtyTaxRateItemName(checkedItm);
            this.complaintQtyCgstSgstErrorCorrection();
          }//end of else
        }//end of if
      }//end of for
    }//end of else if potype === FO
  }//end of the method onItemNameKeyup

   // start method deleteResErrorMsgOnClick to remove the error messege
   public deleteResErrorMsgOnClick(errorParam: string){
    if(errorParam === 'invoice'){
      this.invoiceFileSubmitError = false;
    }else if(errorParam === 'other'){
      this.otherFileSubmitError = false;
    }else if(errorParam === 'submit'){
      this.submitError = false;
    }//end of else if
  }//end of the method

}//end of class
