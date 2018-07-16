import { Injectable, EventEmitter } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { ROUTE_PATHS } from "app/modules/router/router-paths";
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';


@Injectable()
export class SessionErrorService {
    constructor(private router: Router) {
    }
    
    //start method of routeToLander
    routeToLander(msgBody: any) {
        let errBody: any = {};
        errBody = JSON.parse(msgBody);
        console.log(errBody);
        console.log(errBody.msgType);
        if (errBody.msgType === "SessionError" || errBody.msgType === "Error") {
            this.router.navigate([ROUTE_PATHS.RouteLander]);
        }//end of of
    }//end of the method

}
