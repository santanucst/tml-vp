import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { LocalStorageService } from "app/modules/shared/services/local-storage.service";
import { Router, ActivatedRoute } from '@angular/router';
// import { Subscription } from 'rxjs/Subscription';//to get route param
import { DatePipe } from '@angular/common';
import { ROUTE_PATHS } from 'app/modules/router/router-paths';
import { PurchaseInvoiceItemViewDataService } from "app/modules/purchase-order/services/purchase-invoice-item-view-data.services";
import { SessionErrorService } from "../../../shared/services/session-error.service";
import { PurchaseOrderInteractionService } from "../../services/purchase-order-interaction.service";

@Component({
  selector: 'ispl-purchase-order-details-view',
  templateUrl: 'purchase-order-details-view.component.html',
  styleUrls: ['purchase-order-details-view.component.css']
})
export class PurchaseOrderDetailsViewComponent implements OnInit {

  //taking var to change date format
  private fromDT: string;
  private toDT: string;
  private currentDate: string;//for sysdate
  private poDateQuery: string = "";//taking var to store inv query
  private usertype: string = this.localStorageService.user.userType;
  private poUserTypeCheckBoolean: Boolean = false;//taking var to check user type once

  public poViewDetails: any = {}//to show the complaint det in html page
  public podetailsViewHeader: any = {};//to show header in html page
  public poNo: string;//for modify complaint id
  public facetedDataDetails: any[] = [];//to show faceted data in html

  // for checking fromDate and toDate error
  public fromDateErr: boolean = false;
  public toDateErr: boolean = false;
  public switchCheckboxVal: Boolean = false;//to store switch checkbox value
  public switchInputCheck: Boolean = false;//to check uncheck switch button
  //for sorting and orderType activity id parameters
  public sortSelection: any = {
    sortData: '',
    orderType: '',
    facetedArray: [],
    prevFilter: '',
    filter: '',
    callingFromFacet: ''
  };
  //takin arr for selectedData
  public selectedData: any[] = [];
  public searchFormGroup: FormGroup;
  //checkbox
  public checkAll: boolean = false;
  public otherCheck: boolean = false;

  //taking var for filter
  public filterOption: string = '';
  //taking var for previous filter
  public previousFilter: string = '';
  //taking any array for faceted
  public facetedArray: any[] = [];
  //for error msg
  public errMsgShowFlag: boolean = false;//to show the error msg div
  public errorMsg: string;//to store the error msg
  //for busy spinner
  public busySpinner: any = {
    gridBusy: true,
    facetedNavBusy: true,
    busy: true
  };
  public title: string = "Purchase Order View";
  public poDetailsFormGroup: FormGroup;//taking formgroup type var

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedroute: ActivatedRoute,//route parameter
    private localStorageService: LocalStorageService,
    private purchaseInvoiceItemViewDataService: PurchaseInvoiceItemViewDataService,
    private sessionErrorService: SessionErrorService,
    private purchaseOrderInteractionService: PurchaseOrderInteractionService,
    private datePipe: DatePipe//for date
  ) {
    console.log(" Class");
    // this.gridSearch = new FormControl('');
    this.searchFormGroup = this.formBuilder.group({
      'gridSearch': ''
    });
  }//end of constructor

  ngOnInit(): void {
    console.log("OnInit PurchaseOrderViewComponent Class");
    this.buildForm();//calling the method to create formcontrol
    this.getSystemDate();//calling the method to get system date
    this.busySpinner.busy = false;
    this.setFilterToSortSelectionObjByUserType();//to set filter to sort selection obj according to userType
    this.poDetViewWSCall();//get po details web service call
  }//end of onInit

  //to load the spinner
  private updateBusySpinner() {
    if (this.busySpinner.gridBusy) {
      this.busySpinner.busy = true;
    } else if (this.busySpinner.gridBusy == false) {
      this.busySpinner.busy = false;
    }//end of else if
  }//end of busy spinner method

  //a method named buildform for creating the invoiceDetailsFormGroup and its formControl
  private buildForm(): void {
    this.poDetailsFormGroup = this.formBuilder.group({
      'fromDate': [''
      ],
      'toDate': [''
      ]
    });
  }//end of method buildForm

  //method to get system date
  private getSystemDate() {
    //formatting the current date
    let date = new Date();
    this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    this.poDetailsFormGroup.controls["fromDate"].setValue(this.currentDate);
    this.poDetailsFormGroup.controls["toDate"].setValue(this.currentDate);
  }//end of method

  //method to set sort selection filter according to usertype
  private setFilterToSortSelectionObjByUserType() {
    // let filterObj: any = {};
    if (this.usertype === "V") {
      this.sortSelection.filter =
        this.localStorageService.appSettings.dbFields.vendorName + "= '"
        + this.localStorageService.user.name + "' AND "
        + this.localStorageService.appSettings.dbFields.vendorGstin + "= '"
        + this.localStorageService.user.vendorGstin + "'";

      //set calling from facet to the sort selection filter
      this.sortSelection.callingFromFacet = this.localStorageService.appSettings.dbFields.vendorName;

      this.sortSelection.prevFilter =
        "'" + this.localStorageService.user.code + "';'"
        + this.localStorageService.user.vendorGstin + "'";

      let localFacetedArr: any[] = [];
      localFacetedArr.push({ facetedGrp: this.localStorageService.appSettings.dbFields.vendorGstin, facetedData: this.localStorageService.user.vendorGstin });
      localFacetedArr.push({ facetedGrp: this.localStorageService.appSettings.dbFields.vendorName, facetedData: this.localStorageService.user.name });
      this.facetedArray = localFacetedArr;
    } else if (this.usertype === "E") {
      this.sortSelection.filter = "";
    }//end of else if
    this.poUserTypeCheckBoolean = true;//set true 

  }//end of method

  //method to get po details by web service
  private poDetViewWSCall() {
    this.busySpinner.gridBusy = true;
    this.updateBusySpinner();//to load spinner
    let filter: string = "";//taking var to 
    if (this.filterOption) {
      filter = this.filterOption;
      if(this.poDateQuery){        
        this.sortSelection.filter = filter +" AND "+this.poDateQuery;
      }else{
        this.sortSelection.filter = filter;
      }
    }else{
      if(this.poDateQuery){        
        this.sortSelection.filter = this.poDateQuery;
      }else{
        if (this.usertype === "V") {
          this.sortSelection.filter =
            this.localStorageService.appSettings.dbFields.vendorName + "= '"
            + this.localStorageService.user.name + "' AND "
            + this.localStorageService.appSettings.dbFields.vendorGstin + "= '"
            + this.localStorageService.user.vendorGstin + "'";
        }else if(this.usertype === "E") {
          this.sortSelection.filter = "";
        }//end of else if
      }//end of else podate query check
    }//end of else

    this.sortSelection.facetedArray = this.facetedArray;//set faceted array to jsonbody
    this.purchaseInvoiceItemViewDataService.getPODetViewWithFacet(this.sortSelection).
      subscribe(res => {
        console.log("po View Details : ", res);
        this.podetailsViewHeader = res.header;
        //checking msg type is info or not
        if (res.msgType === "Info") {
          this.poViewDetails = res;
          let facetedDetailsObj = res.nav;
          this.facetedDataDetails = facetedDetailsObj.facetedNav;
          this.sortSelection.prevFilter = facetedDetailsObj.prevFilter;
        } else {
          this.poViewDetails = {};
          this.facetedDataDetails = [];
          // show error msg on html page
          this.errMsgShowFlag = true;
          this.errorMsg = res.msg;

        }
        this.busySpinner.gridBusy = false;
        this.updateBusySpinner();
      },
        err => {
          console.log(err);
          this.sessionErrorService.routeToLander(err._body);
          this.poViewDetails = {};
          this.facetedDataDetails = [];
          // show error msg on html page
          this.errMsgShowFlag = true;
          this.errorMsg = err.msg;
          this.busySpinner.gridBusy = false;
          this.updateBusySpinner();
        });
  }//end of method

  //creating a method for getting the value of heading and sorting all data accordin to ordertype
  public onClickForSortSelection(val) {
    console.log("clicked value : " + val);
    if (this.sortSelection.sortData == val) {
      this.sortSelection.orderType = "DESC";
    } else {
      this.sortSelection.orderType = "ASC";
    }
    this.sortSelection.sortData = val;
    console.log("sortSelection : ", this.sortSelection);
    this.poDetViewWSCall();
    this.selectedData = [];//removing the array 
  }//end of onclick method

  
  //method to get filter value
  public onClickFilter(header: string, checkedValue: string, checkedBoolean: Boolean) {
    this.selectedData = [];//removing the array 
    console.log("checkedHeader: ", header);
    console.log("checkedValue: ", checkedValue);
    console.log("checkedBoolean: ", checkedBoolean);
    //checking the length of selectedData by clicking on checkbox
    if (this.facetedArray.length == 0) {
      //push complaintDetail obj to selectedData array
      this.facetedArray.push({ facetedGrp: header, facetedData: checkedValue });
      console.log("Purchase Order Details view facetedArray : ", this.facetedArray);
    } else {
      let indexCount: number = 0;
      let removeFlag: boolean = false;
      for (let selectedData of this.facetedArray) {
        if (selectedData.facetedData == checkedValue) {
          this.facetedArray.splice(indexCount, 1);
          removeFlag = true;
          break;
        }//end of if
        indexCount++;
      }//end of for
      console.log("Purchase Order Details view facetedArray data after deleting: ", this.facetedArray);
      if (!removeFlag) {
        this.facetedArray.push({ facetedGrp: header, facetedData: checkedValue });
      }//end of if
      console.log("Purchase Order Details view facetedArray after pushing: ", this.facetedArray);
    }//end of else

    // let facetQuery: string = '';//for faceted query
    console.log("facetedArray: ", this.facetedArray);
    if (this.facetedArray && this.facetedArray.length > 0) {
      let facetTree: any = {};
      for (let facetNode of this.facetedArray) {
        let facetQuery: string = '';
        if (facetTree[facetNode.facetedGrp]) {
          facetQuery += facetTree[facetNode.facetedGrp] + ' OR ';
          facetQuery += facetNode.facetedGrp + '=' + '\'' + facetNode.facetedData + '\'';
        } else {
          facetQuery = facetNode.facetedGrp + '=' + '\'' + facetNode.facetedData + '\'';
        }
        facetTree[facetNode.facetedGrp] = facetQuery;
      }
      let facetQryString: string = '';
      if (facetTree) {
        for (let facetNodeIndex in facetTree) {
          facetQryString ? facetQryString += ' AND ' : null;
          facetQryString += facetTree[facetNodeIndex];
        }
      }
      console.log('facetTree: ', facetTree);
      console.log('facetQuery: ', facetQryString);
      this.filterOption = facetQryString;
      //end of if arr length check
    } else {
      this.filterOption = '';
    }
    console.log("facetQuery for filter : ", this.filterOption);
    //check the checkboolean is true or false then set the header to the obj
    if (checkedBoolean == true) {
      this.sortSelection.callingFromFacet = '';
    } else if (checkedBoolean == false) {
      this.sortSelection.callingFromFacet = header;
    }
    console.log("this.sortselection after filteration....", this.sortSelection);
    this.busySpinner.gridBusy = true;//busy spinner
    this.busySpinner.facetedNavBusy = true;//busy spinner
    this.updateBusySpinner();
    this.poDetViewWSCall();//view grid data and faceted data
  } //end of method to get filter value
  
  //method to create query with date field
  public onClickDatesButton(fromDate, toDate,switchBtnCheckedVal) {//MMM-dd-yyyy  

    // console.log("clicked checked value of switch button::::", switchBtnCheckedVal);
    // this.switchCheckboxVal = !this.switchCheckboxVal;
    console.log("this.switchCheckboxVal:::::", this.switchCheckboxVal);
    let frmDT: string = "";
    let toDT: string = "";
    this.fromDT = fromDate;
    this.toDT = toDate;
    if (fromDate) {
      frmDT = this.datePipe.transform(fromDate, 'dd-MMM-yyyy');
    }
    if (toDate) {
      toDT = this.datePipe.transform(toDate, 'dd-MMM-yyyy');
    }
    console.log("fromDate::", this.fromDT + " toDate::", this.toDT);
    let poDTQuery: string = "";
    if (this.switchCheckboxVal) {
      //checking if switchcheckbox is true or false the build the query
      if (fromDate && toDate) {
        //set query according to dates
        poDTQuery =
        this.localStorageService.appSettings.dbFields.poDate + " BETWEEN '" +
          frmDT + " 00:00:00' AND '" + toDT + " 23:59:59'";
        // this.fromDT + " 00:00:01' AND '" + this.toDT + " 23:59:59'";
        
        this.poDateQuery = poDTQuery;
        console.log("po Date Query:: ", this.poDateQuery);
        // this.invDateFlag = true;//set the flag true to set the invoice dates to the service filter
      }
    } else {
      console.log("else part of switchcheckbox is false..this.switchCheckboxVal:::::", this.switchCheckboxVal);
      this.poDateQuery = "";
      // this.invDateFlag = false;//set the flag false
    }//end of switchcheckbox check       
    this.poDetViewWSCall();//calling the method to get data
  }//end of method

  //method for Complaint Logged On and Compliant Reference Date validation 
  public compareTwoDates(controlName: string, fromDateval: string, toDateval: string) {
    this.fromDateErr = false;
    this.toDateErr = false;
    console.log("fromDateval::", fromDateval + " toDateval:::", toDateval);
    fromDateval = this.datePipe.transform(fromDateval, 'yyyy-MM-dd');
    toDateval = this.datePipe.transform(toDateval, 'yyyy-MM-dd');
    console.log("transformed --->> fromDateval::", fromDateval + " toDateval:::", toDateval);
    if (fromDateval && toDateval) {
      if (controlName === 'fromDate') {
        if ((new Date(fromDateval) > new Date(toDateval))) {
          console.log("fromDate Date error.")
          this.fromDateErr = true;
          this.toDateErr = false;
        }//end of if
      } else if (controlName === 'toDate') {
        if ((new Date(toDateval) < new Date(fromDateval))) {
          console.log("toDate Date error.")
          this.toDateErr = true;
          this.fromDateErr = false;
        }//end of if
      }//end of else if

    }//end of date value check
  }//end of method
  
  //method to get switch button value 
  public onClickSwitchButton(switchBtnCheckedVal) {
    console.log("clicked checked value of switch button::::", switchBtnCheckedVal);
    this.switchCheckboxVal = !this.switchCheckboxVal;
    console.log("this.switchCheckboxVal:::::", this.switchCheckboxVal);
  }//end of method
  
  // start method of deleteResErrorMsgOnClick
  public deleteResErrorMsgOnClick(resMsgType) {
    this.errMsgShowFlag = false;//to hide the error msg div
  }//method to delete error msg

  //method to open invoice details page by clicking on po number
  public onClickPONumber(poNumber: string, poStatus: string) {
    console.log("selected PoNumber::::", poNumber);
    console.log("selected poStatus::::", poStatus);
    let poStatusFilterObj: any = {};
    this.selectedData = [];//removing the array 
    //set the obj element to an object and send it through service
    poStatusFilterObj.filter = this.sortSelection.filter;//this.filterOption;
    poStatusFilterObj.prevFilter = this.sortSelection.prevFilter;
    poStatusFilterObj.facetedArray = this.sortSelection.facetedArray;
    poStatusFilterObj.callingFromFacet = this.sortSelection.callingFromFacet;
    if(this.poDateQuery){
      let dateQuery = " AND "+ this.poDateQuery;
      poStatusFilterObj.poDateQuery = dateQuery;
    }else{
      poStatusFilterObj.poDateQuery = "";
    }
    if(this.filterOption){
      let filterOptnQuery: string =  " AND "+ this.filterOption;
      poStatusFilterObj.pofilteroptionquery = filterOptnQuery;
    }else{
      poStatusFilterObj.pofilteroptionquery = "";
    }
    poStatusFilterObj.comingFrom = "poview";

    // console.log("poStatusFilterObj::::", poStatusFilterObj);
    this.purchaseOrderInteractionService.poWSFilter = poStatusFilterObj;
    console.log("this.purchaseOrderInteractionService.powsfilter::::", this.purchaseOrderInteractionService.poWSFilter);
    console.log("poStatusWithFilterStr in po view details class::::", poStatus);
  
    // Not authenticated
    this.router.navigate([ROUTE_PATHS.RouteInvoiceDetView, poNumber, poStatus]);
  }//end of method


  
}//end of class
