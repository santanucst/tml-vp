import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ROUTE_PATHS } from '../../../../router/router-paths';
import { LocalStorageService } from "../../../../shared/services/local-storage.service";
import { UserModel } from "../../../../shared/models/user-model";
import { AppSettingsModel } from "../../../../shared/models/app-settings-model";
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdOTPVerificationModalComponent } from './otp-verification-modal/otp-verification-modal.component';
import { ForgotPasswordService } from "../../../services/forgot-password.service";
import { Subscription } from 'rxjs/Subscription';//to get route param
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'ispl-otp-verification',
  templateUrl: 'otp-verification.component.html',
  styleUrls: ['otp-verification.component.css']
})
export class OTPVerificationComponent implements OnInit {

  public otpVerificationFormGroup: FormGroup;
  public userId: string;//to store route param

  constructor(
    private formBuilder: FormBuilder,
    private activatedroute: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private forgotPasswordService: ForgotPasswordService,
    private localStorageService: LocalStorageService) {

  }

  ngOnInit(): void {
    this.buildForm();
    this.getRouteParam();
  }

  private buildForm(): void {
     this.otpVerificationFormGroup = this.formBuilder.group({
      'userName': [''
    ],
    'otp': [''
      , [
        Validators.required,
      ]
    ]
    });

  }

  //method to get route param
  private getRouteParam(){
    let routeSubscription: Subscription;
    routeSubscription = this.activatedroute.params.subscribe(params => {
      this.userId = params.userId ? params.userId : '';
    });
    console.log("userId for otp verification: ", this.userId);
  }

  public resendOtp(){
    let user: any = {};
    user.userId = this.userId;
    user.type="RESOTP";
    this.forgotPasswordService.userVerificationForForgotPassword(user).
      subscribe(res => {
        console.log("User Verification Response: ", res);
      },
    err => {
      console.log(err);
    });
  }

  public onSubmitOTP(){
    let user: any = {};
    user.userId = this.userId;
    user.otp = this.otpVerificationFormGroup.value.otp;
    user.type = "USERIDOTP"; 
    let msgType: string = "";
    console.log(" user==>>>",user);
    this.forgotPasswordService.userVerificationForForgotPassword(user).
      subscribe(res => {
        console.log("User Verification Response: ", res);
        msgType = res.msgType;
      },
    err => {
      console.log(err);
    });
    if(msgType == 'Info'){
      const modalRef = this.modalService.open(NgbdOTPVerificationModalComponent);
    }else if(msgType == 'Error'){
      
    }
  }

  public onCancel(){
    this.router.navigate([ROUTE_PATHS.RouteLogin]);
  }
}//end of class
