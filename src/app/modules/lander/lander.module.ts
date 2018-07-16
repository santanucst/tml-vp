import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginModule } from 'app/modules/login/login.module';
import { HomeModule } from '../home/home.module';
import { LanderComponent } from "./components/lander.component";


@NgModule({
  imports: [
    ReactiveFormsModule,
    BrowserModule,
    HomeModule,
    LoginModule
  ],
  declarations: [
    LanderComponent
  ],
  
  exports: [
    LanderComponent
  ],
  providers: [
 
  ]
})
export class LanderModule { }
