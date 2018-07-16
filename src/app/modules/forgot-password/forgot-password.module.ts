import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { UserVerificationComponent } from 'app/modules/forgot-password/components/user-verification/user-verification.component';
import { OTPVerificationComponent } from '../forgot-password/components/otp-verification/components/otp-verification.component';
import { NgbdOTPVerificationModalComponent } from '../forgot-password/components/otp-verification/components/otp-verification-modal/otp-verification-modal.component';
import { HomeModule } from '../home/home.module';
import { ForgotPasswordService } from './services/forgot-password.service';
@NgModule({
  imports: [
    ReactiveFormsModule,
    BrowserModule,
    HomeModule
  ],
  declarations: [
    UserVerificationComponent,
    OTPVerificationComponent,
    NgbdOTPVerificationModalComponent
  ],
  entryComponents: [NgbdOTPVerificationModalComponent],
  exports: [
    UserVerificationComponent,
    OTPVerificationComponent
  ],
  providers: [
    ForgotPasswordService
  ]
})
export class ForgotPasswordModule { }
