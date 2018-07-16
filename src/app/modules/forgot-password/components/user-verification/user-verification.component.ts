import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ROUTE_PATHS } from '../../../router/router-paths';
import { LocalStorageService } from "../../../shared/services/local-storage.service";
import { UserModel } from "../../../shared/models/user-model";
import { AppSettingsModel } from "../../../shared/models/app-settings-model";
import { ForgotPasswordService } from "../../services/forgot-password.service";
@Component({
  selector: 'ispl-user-verification',
  templateUrl: 'user-verification.component.html',
  styleUrls: ['user-verification.component.css']
})
export class UserVerificationComponent implements OnInit {

  public userVerificationFormGroup: FormGroup;
  public userId: string = '';//to store the value of userId
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private localStorageService: LocalStorageService,
    private forgotPasswordService: ForgotPasswordService
  ) {

  }

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
     this.userVerificationFormGroup = this.formBuilder.group({
       'userName': [''
        , [
          Validators.required,
        ]
      ]
    });

  }

  public onSubmitUsername(){
    let user: any = {};
    user.userId = this.userVerificationFormGroup.value.userName;
    this.userId = this.userVerificationFormGroup.value.userName;
    user.type = "USERID"; //USERIDOTP
    this.forgotPasswordService.userVerificationForForgotPassword(user).
      subscribe(res => {
        console.log("User Verification Response: ", res);
      },
    err => {
      console.log(err);
    });
    this.router.navigate([ROUTE_PATHS.RouteOTPVerification,this.userId]);
  }

  public onCancel(){
    this.router.navigate([ROUTE_PATHS.RouteLogin]);
  }

}//end of class
