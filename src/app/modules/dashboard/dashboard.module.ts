import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
// import { ComplaintRegisterModule } from "../complain/complain.module";
import { DashboardComponent } from "app/modules/dashboard/components/dashboard.component";
import { TilesModule } from "../widget/Tiles/tiles.module";
import { TilesInteractionService } from "../dashboard/services/tiles-interaction.service";



@NgModule({
  imports: [
    ReactiveFormsModule,
    BrowserModule,
    TilesModule
  ],
  declarations: [
    DashboardComponent
  ],
  exports: [
    DashboardComponent
  ],
  providers: [
    TilesInteractionService
  ]
})
export class DashboardModule { }
