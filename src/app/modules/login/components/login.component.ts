import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginModel } from '../models/login-model';
import { UserValidators } from '../models/user-validator';
import { Subscription } from 'rxjs/Subscription';//to get route param
import { LoginService } from '../services/login.service';
import { ROUTE_PATHS } from '../../router/router-paths';
import { LocalStorageService } from "../../shared/services/local-storage.service";
import { UserModel } from "../../shared/models/user-model";
import { AppSettingsModel } from "../../shared/models/app-settings-model";
import { DBSettingsModel } from "../../shared/models/db-settings-model";
@Component({
  selector: 'ispl-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit {

  public title: string = "Vendor Portal";
  public loginForm: FormGroup;
  public loginError: string = '';
  public userType: string = "";
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedroute: ActivatedRoute,
    private loginService: LoginService,
    private localStorageService: LocalStorageService) {

  }

  ngOnInit(): void {
    this.buildForm();
    this.getRouteParam();
  }

  private buildForm(): void {
    this.loginForm = this.formBuilder.group({
      'username': [''
        , [
          Validators.required,
        ]
      ],
      'password': [''
        , [
          Validators.required,
        ]
      ]
    });

  }

  //method to get route param
  private getRouteParam() {
    let routeSubscription: Subscription;
    routeSubscription = this.activatedroute.params.subscribe(params => {
      this.userType = params.userType ? params.userType : '';
    });
    console.log(" userType::::::::::",this.userType);
  }//end of method to get route param


  private loginSubmit(): void {
    console.log("login click");
    let user: any = {};

    user.userId = this.loginForm.value.username;
    user.password = this.loginForm.value.password;
    this.loginService.authenticate(user, this.userType.toUpperCase()).
        subscribe(res => {
          console.log("Login Success Response: ",res);
          if(res.msgType === "Info"){           
            this.setLoginDetailsToLocalstorageService(res);//calling the method to set login response to localstorage  
            this.router.navigate([ROUTE_PATHS.RouteHome]);               
          }else{
            this.loginError = res.msg;
            // "Netowrk/Server Problem";
          }
        },
        err => {
          if (err.status == 401) {
            this.loginError = "Invalid User Credentials";
          } else {
            this.loginError = "Netowrk/Server Problem";
          }
        });       
  }//end of method login service

  //new add to add login details in localstorage services
  public setLoginDetailsToLocalstorageService(resDetails: any){
    console.log("in setLoginDetailsToLocalstorageService method...");
    let userModel: UserModel  = new UserModel();
    userModel.accessToken = resDetails.accessToken;
    userModel.userId = this.loginForm.value.username;  
    userModel.userType = resDetails.userDetails.userType; 
    userModel.code = resDetails.userDetails.code; 
    userModel.name = resDetails.userDetails.name;  
    userModel.vendorGstin = resDetails.userDetails.vendorGstin;                   
    this.localStorageService.user = userModel;

    //set appsettings details from login response to localstorage
    let appSettingsModel: AppSettingsModel = new AppSettingsModel();    
    appSettingsModel.menuDetails = resDetails.userDetails.menuDetails;//set menu details
    appSettingsModel.companyGstin = resDetails.appSettingsDetails.companyGstin;//to get the companyGstin
    appSettingsModel.useForValue1 = resDetails.appSettingsDetails.useForValue1;//to get the useForValue1
    appSettingsModel.useForValue2 = resDetails.appSettingsDetails.useForValue2;//to get the useForValue2
    appSettingsModel.useFor = resDetails.appSettingsDetails.useFor;//to store useFor array
    appSettingsModel.dbFields = resDetails.appSettingsDetails.dbFields;//to store db field name 
    this.localStorageService.appSettings = appSettingsModel;
    
    //set the dbsettings details to dbsettings model
    let dbSettingsModel: DBSettingsModel = new DBSettingsModel();
    dbSettingsModel.drcrnoteNumber = resDetails.dbSettingsDetails.drcrnoteNumber;
    dbSettingsModel.invoiceNumber = resDetails.dbSettingsDetails.invoiceNumber;
    dbSettingsModel.itemDesc = resDetails.dbSettingsDetails.itemDesc;
    this.localStorageService.dbSettings = dbSettingsModel;
  }//end of method to set login response to localstorage 

  //method for forgot password route
  public forgotPassword(){
    console.log(" forgotPassword method called");
    this.router.navigate([ROUTE_PATHS.RouteForgotPassword]);
  }//end of the method forgotpassword

}//end of class
