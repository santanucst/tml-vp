import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';//to get route param
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';//new add for forkjoin
import { DatePipe } from '@angular/common';
// import { ToastService } from "../../../home/services/toast-service";
import { ROUTE_PATHS } from '../../../router/router-paths';
import { AddUserDataService } from "app/modules/user/services/add-user-data.service";
import { LocalStorageService } from "../../../shared/services/local-storage.service";
import { UserModel } from "../../../shared/models/user-model";
import { NgbdModalComponent } from '../../../widget/modal/components/modal-component';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ispl-user-view-details',
  templateUrl: 'user-view-details.component.html',
  styleUrls: ['user-view-details.component.css']
})
export class ViewUserDetailsComponent implements OnInit {

  private currentDate: string;//taking current date to store current date

  public title: string = '';//to store title
  public userFormGroup: FormGroup;//taking fromgroup to build form
  public roleDet: any = {};//to store the role details dropdown values
  public codeDet: any[] = [];//to store the value of code
  public userId: string = '';//to store the userId from route param
  public validUptoDate: string;//taking var to store valid date


  //to store the maxlength for localstorage
  // public userIdLength: number = this.localStorageService.dbSettings.userId;
  // public employeeNameLength: number = this.localStorageService.dbSettings.employeeName;
  // public employeeMobileNoLength: number = this.localStorageService.dbSettings.employeeMobileNo;
  // public employeeEmailIdLength: number = this.localStorageService.dbSettings.employeeEmailId;


  //for error msg
  public errMsgShowFlag: boolean = false;//to show the error msg div
  public errorMsg: string;//to store the error msg

  //busySpinner to load spinner
  public busySpinner: any = {
    submitBusy: false,//for submit spinner
    busy: true
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private addUserDataService: AddUserDataService,
    private localStorageService: LocalStorageService,
    private modalService: NgbModal,//modal
    private datePipe: DatePipe
    // private toastService: ToastService
  ) {

  }//end of constructor

  ngOnInit(): void {
    this.buildForm();
    this.getRouteParam();//calling the method to get route param
    this.getSelectValues();//calling the method to get all data for all dropdown
    this.getSystemDate();//method to get system date
    this.selectedUserId(this.userId);//method to get user details by user id
    this.title = 'View User';//set the title according to the userId
  }//end of ngOnInit

  //to build form
  private buildForm(): void {
    this.userFormGroup = this.formBuilder.group({
      'userType': [''
      ],//for add
      'code': [''
      ],
      'role': [''
      ],
      'validUptoDate': [''
      ],
    });
  }//end of build form

  //method to get route param
  private getRouteParam() {
    let routeSubscription: Subscription;
    routeSubscription = this.activatedroute.params.subscribe(params => {
      this.userId = params.userId ? params.userId : '';
    });
  }//end of method to get route param

  //method to get system date
  private getSystemDate(){
    //formatting the current date
    let date = new Date();
    this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    this.validUptoDate = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd');
    this.userFormGroup.controls["validUptoDate"].setValue(this.validUptoDate);
  }//end of method

  //onOpenModal for opening modal from modalService
  private onOpenModal(addModifyUserId) {
    const modalRef = this.modalService.open(NgbdModalComponent);
    modalRef.componentInstance.modalTitle = 'Information';

    modalRef.componentInstance.modalMessage =
      this.userId ?
        "User Id " + addModifyUserId + " updated successfully."
        : "User Id " + addModifyUserId + " created successfully.";
  }//end of method onOpenModal

  //to load the spinner
  private updateBusySpinner() {
    if (this.busySpinner.submitBusy) {
      this.busySpinner.busy = true;
    } else if (this.busySpinner.submitBusy == false) {
      this.busySpinner.busy = false;
    }//end of else if
  }//end of busy spinner method

  //web service call to get some details on page loading time
  private getSelectValues() {
    this.busySpinner.submitBusy = true;
        this.updateBusySpinner();
    //forkjoin
    let userDetData: any[] = [];
    userDetData.push(this.addUserDataService.getSelectRoleDetVal());
    // userDetData.push(this.addUserDataService.getSelectValDepartmentDet());
    // userDetData.push(this.addUserDataService.getSelectValDesignationDet());
    // userDetData.push(this.addUserDataService.getSelectValPlantTypeDet());

    Observable.forkJoin(userDetData).
      subscribe(res => {
        console.log("res array: ", res);
        this.roleDet = res[0];
        console.log(" roleDet", this.roleDet.details);
        // this.departmentVal = res[1];
        // this.designationVal = res[2];
        // this.plantTypeVal = res[3];
        this.busySpinner.submitBusy = false;
        this.updateBusySpinner();
      },
        err => {
          console.log(err);
          this.busySpinner.submitBusy = false;
        this.updateBusySpinner();
        });
  }//end of service call method

  //method to show the selected user id details
  private selectedUserId(userId) {
    console.log("selected userId : " + this.userId);
    if (this.userId) {
      console.log("userId for modify: ", this.userId);
      this.getUserDetailsByUserId(this.userId);
    }//end of if
  }//end of selectedUserId method

  //to get modify user details by userId
  private getUserDetailsByUserId(userId: string) {
    this.busySpinner.submitBusy = true;
        this.updateBusySpinner();
    this.addUserDataService.getUserDetailsByUserId(this.userId).
      subscribe(res => {
        console.log("userDetailByUserId : ", res);
        let userDetails: any = {}
        userDetails = res.details[0];
        console.log("userDetailByUserId in array format: ", userDetails);
        if (res.msgType === "Info") {
          //itrate for selected data
          let usertype: string = userDetails.userType;
          usertype = usertype.substring(0,1);
          this.onChangeUserType(usertype);//calling the method to get code details
          this.userFormGroup.controls["userType"].setValue(usertype);//set user type for modify user
          if(userDetails.code){
            this.userFormGroup.controls["code"].setValue(userDetails.code);
          }
          this.userFormGroup.controls["role"].setValue(userDetails.roleId);
          this.validUptoDate = this.datePipe.transform(userDetails.validUpto, 'yyyy-MM-dd');
          this.userFormGroup.controls["validUptoDate"].setValue(this.validUptoDate);
         } else {
          // show error msg on html page
          this.errMsgShowFlag = true;
          this.errorMsg = "Unable to load data!";
        }//end of else 
        this.busySpinner.submitBusy = false;//to stop spinner
        this.updateBusySpinner();//calling the method to stop spinner

      },
        err => {
          console.log(err);
          // show error msg on html page
          this.errMsgShowFlag = true;
          this.errorMsg = "Unable to load data!";
          this.busySpinner.submitBusy = false;//to stop spinner
          this.updateBusySpinner();//calling the method to stop spinner
        });
  }//end of method getUserDetailsByUserId

  //method onChange of UserType field
  public onChangeUserType(userTypeVal: string) {
    // console.log("userTypeVal:: ", userTypeVal);
    this.userFormGroup.controls["code"].setValue('');//set blank to formcontrol value
    let mode: string = this.userId ? "EDIT" : "ADD";
    if(userTypeVal){//checking if userType val has some value
      //service call to get code val
      this.addUserDataService.getCodeVal(userTypeVal, mode)
        .subscribe(res => {
          console.log("res:: ", res);
          if (res.msgType === "Info") {
            this.codeDet = res.details;
          } else {
            this.errMsgShowFlag = true;//to show the error msg div
            this.errorMsg = "No data found!";//msg
            this.codeDet = [];//set blank array to hide the field
          }
        },
        err => {
          console.log("err of code service call::", err);
          this.errMsgShowFlag = true;//to show the error msg div
          this.errorMsg = "No data found!"
          this.codeDet = [];//set blank array to hide the field
        });
    }else{
      this.codeDet = [];//set blank array to hide the field
    }//end of else
  }//end of method


  //submit add user data
  public userSubmit(): void {
    console.log("user Details value", this.userFormGroup.value);
    let user: any = {};
    user.userId = this.localStorageService.user.userId;
    // this.userId ? this.userId : this.localStorageService.user.userId;
    user.userType = this.userFormGroup.value.userType;
    user.code = this.userFormGroup.value.code;
    user.roleId = this.userFormGroup.value.role;
    user.validUpto = this.userFormGroup.value.validUptoDate;

    // user.isNew = this.userId ?   this.userFormGroup.value.newlyRegistered : '';
    console.log("User Details for add/modify: ", user);
    this.busySpinner.submitBusy = true;
    this.updateBusySpinner();

    let methodOfServiceCall: any;//for add or modify service call
    //checking add or modify user
    methodOfServiceCall =
      this.userId ?
        this.addUserDataService.userModifyDetailsSubmit(user)
        : this.addUserDataService.userCreateSubmit(user);

    methodOfServiceCall.
      subscribe(res => {
        console.log("Add/Modify User Success Response: ", res);
        let addModifyUserId = res.value;
        this.busySpinner.submitBusy = false;
        this.updateBusySpinner();
        if (res.msgType === "Info") {
          //calling the onOpenModal method to open the modal and passing the complaint reference no to it
          this.onOpenModal(addModifyUserId);
          this.router.navigate([ROUTE_PATHS.RouteHome]);
        } else {
          this.errMsgShowFlag = true;//to show the error msg div
          this.errorMsg = res.msg;
          // "Netowrk/Server Problem. Please try again.";
        }
      },
        err => {
          this.busySpinner.submitBusy = false;
          this.updateBusySpinner();
          this.errMsgShowFlag = true;//to show the error msg div
          if (err.status == 401) {
            this.errorMsg = "Invalid User Credentials";
          } else {
            this.errorMsg = "Netowrk/Server Problem";
          }
        });
  }//end of method userSubmit

  // start method of deleteResErrorMsgOnClick
  public deleteResErrorMsgOnClick(resMsgType) {
    this.errMsgShowFlag = false;//to hide the error msg div
  }//method to delete error msg

  //on cancel button click
  public onCancel(): void {
    // Not authenticated
    this.router.navigate([ROUTE_PATHS.RouteHome]);
  }//end of cancel
}
