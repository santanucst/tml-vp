import { Component, NgModule, Output, EventEmitter, ViewContainerRef, OnInit, AfterViewInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, Routes } from '@angular/router';
import { ToastrConfig, ToastrService } from "ngx-toastr";
import { ROUTE_PATHS } from '../../router/router-paths';
import { ToastService } from "../services/toast-service";
import { LocalStorageService } from "../../shared/services/local-storage.service";
import { UserModel } from "../../shared/models/user-model"; 
import { MenuWsMapModel } from "../models/menu-ws-map.model";


@Component({
    selector: 'ispl-home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.css']

})
export class HomeComponent implements OnInit, AfterViewInit {

  public tempRoleMenu: string = '';
  public loggedInUser: UserModel;
  public pageNavigation: any; 
  public menuIcons:any;
  public navMenuList:any;
  public tempRoleType: string = '';//for change plant type menu

  constructor(
    private router: Router,
    private toastrService: ToastrService,
    private toastrConfig: ToastrConfig,
    private toastService: ToastService,
    private localStorageService: LocalStorageService) {

    this.tempRoleMenu = this.localStorageService.user.roleName;
    this.loggedInUser = this.localStorageService.user;

    toastrConfig.positionClass = 'toast-bottom-center';
    toastrConfig.tapToDismiss = true;
    toastService.toastElementRef = toastrService;
  }

  ngOnInit() {
    // this.toastrService.success('You have successfully logged in!', 'Congratulation!');
    console.log("home component..........................................");
    this.setMenu();
  }//end of onInit

  ngAfterViewInit(){
  }

  private setMenu() {
    console.log("set menu method/////////////////////");
    this.pageNavigation = new MenuWsMapModel().userMenu;
    this.menuIcons = new MenuWsMapModel().userMenuIcons;
    this.navMenuList = this.localStorageService.appSettings.getMenuDetails;
    console.log("App Menu Response in home component::::" ,this.navMenuList);
  }

  logout() {
    console.log("Log out");
  }

}
