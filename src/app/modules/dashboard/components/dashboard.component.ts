import { Component, Input, Compiler, OnInit } from '@angular/core';
import { APP_DASHBOARD_ANIMATIONS } from "../../shared/components/animations/app-animations";
import { LocalStorageService } from "../../shared/services/local-storage.service";
import { Router } from '@angular/router';
@Component({
  selector: 'ppr-dashboard-batch',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.css'],
  animations: APP_DASHBOARD_ANIMATIONS
})
export class DashboardComponent implements OnInit {

  public tempRoleType: string = '';//for rolename
  public openDIPIComplaintService: any;//for common service
  // public commonButtonLink: any;//for common button link

  result: Array<any>;
  tiles1: any = {
    tilesHeader: '-----',
    tilesBodyText: '------',
    tilesBodyNumber: '12',
    color: '#524735',
    buttonText: 'View Details',
    buttonLink: 'filtered'

  };

  tiles2: any = {
    tilesHeader: '-----',
    tilesBodyText: '-------',
    tilesBodyNumber: '2',
    color: '#6c6f71',
    buttonText: 'View Details',
    buttonLink: 'filtered'

  };
  tiles3: any = {
    tilesHeader: '------',
    tilesBodyText: '-------',
    tilesBodyNumber: '10',
    color: '#524735',
    buttonText: 'View Details',
    buttonLink: 'filtered'

  };

  constructor(
    private localStorageService: LocalStorageService,
    private router: Router) {
    console.log("Dashboard Batch Constructor...");
  }

  ngOnInit() {
    // this.getDataTile1();//registered complaint
    // this.getDataTile2();//closed complaint
    // this.getDataTile3();//open complaint
  }

  //for view complaint -- DI registered complaint
  private getDataTile1() {
    let tilesFilter: any = {
      sortData: '',
      orderType: '',
      filter: '',
      fileActivityId: this.localStorageService.appSettings.defaultActivityId
    };    
    if(this.tempRoleType === 'ADMN'){
      this.tiles1.tilesHeader = "User Details";
      this.tiles1.tilesBodyText = "Total User Details";
      this.tiles3.buttonLink = "user";
      //this.openDIPIComplaintService =
      // this.viewUserDataService.getUserViewDetails();
    }
    this.tiles1.wsFilter = tilesFilter; 

    this.openDIPIComplaintService
      .subscribe(res => {
        console.log("res of reg complaint for tiles1..",res);
        this.tiles1.tilesBodyNumber = res.xCount;

      },
      error => {
        if (error.status == 401) {
        }
      });
  }//end of method DI view complaint

  //for view complaint -- DI CLOSED complaint
  private getDataTile2() {
    let tilesFilter: any = {
      sortData: '',
      orderType: '',
      filter: '',
    }
    tilesFilter.filter = this.localStorageService.appSettings.activityIdFieldName +" = " 
                         + this.localStorageService.appSettings.closeComplaintActivityId;
    tilesFilter.fileActivityId = this.localStorageService.appSettings.closeComplaintActivityId;
    
    this.tiles2.wsFilter = tilesFilter;
    if (this.tempRoleType === 'ADMN') {
      
    }else{
      console.log("dashboard parameter for close complaint : ", tilesFilter);      
      // this.openDIPIComplaintService
      //   .subscribe(res => {
      //     console.log("res of close complaint for tiles2..",res);
      //     this.tiles2.tilesBodyNumber = res.xCount;
      //   },
      //   error => {
      //     if (error.status == 401) {
      //     }
      //   });
      }
  }//end of method DI view complaint

  //for view complaint -- DI open complaint
  private getDataTile3() {
    let tilesFilter: any = {
      sortData: '',
      orderType: '',
      filter: '',
      fileActivityId: this.localStorageService.appSettings.defaultActivityId
    }  
    tilesFilter.filter = this.localStorageService.appSettings.activityIdFieldName +" >= " 
                        + this.localStorageService.appSettings.complaintRegistrationActivityId
                        + " AND "+ this.localStorageService.appSettings.activityIdFieldName +" < "
                         + this.localStorageService.appSettings.closeComplaintActivityId;

    tilesFilter.fileActivityId = this.localStorageService.appSettings.pendingComplaintActivityId;
    // role name checking
   if (this.tempRoleType === 'ADMN') {
      this.tiles3.tilesHeader = "Role Details";
      this.tiles3.tilesBodyText = "Total Role Details";
      this.tiles3.buttonLink = "role";
      // this.openDIPIComplaintService =
      // this.viewRoleDataService.getRoleViewDetails();
    }     
      this.tiles3.wsFilter = tilesFilter;

      console.log("dashboard parameter for pending complaint: ", tilesFilter);
      // this.openDIPIComplaintService
      //   .subscribe(res => {
      //     console.log("res of open complaint by tiles3..",res);
      //     this.tiles3.tilesBodyNumber = res.xCount;
      //   },
      //   error => {
      //     if (error.status == 401) {
      //     }
      //   });
    
  }//end of method DI view complaint



}//end of class
