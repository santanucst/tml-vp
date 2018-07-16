import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login.component';
import { LoginService } from './services/login.service';
import { HomeModule } from '../home/home.module';
import { ForgotPasswordModule } from '../forgot-password/forgot-password.module'

@NgModule({
  imports: [
    ReactiveFormsModule,
    BrowserModule,
    ForgotPasswordModule,
    HomeModule
  ],
  declarations: [
    LoginComponent
  ],
  
  exports: [
    LoginComponent
  ],
  providers: [
    LoginService,
  ]
})
export class LoginModule { }
