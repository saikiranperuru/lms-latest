import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserdashboardComponent } from './userdashboard/userdashboard.component';
import { UserupdatedetailsComponent } from './userdashboard/userupdatedetails/userupdatedetails.component';
import { UserchangepasswordComponent } from './userdashboard/userchangepassword/userchangepassword.component';
import { SubmitbookrequestComponent } from './userdashboard/submitbookrequest/submitbookrequest.component';
import { ViewissuedbooksComponent } from './userdashboard/viewissuedbooks/viewissuedbooks.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { UserdashComponent } from './userdashboard/userdash/userdash.component';
import { ViewbooksComponent } from './userdashboard/viewbooks/viewbooks.component';
import { ViewprojectsComponent } from './userdashboard/viewprojects/viewprojects.component';
import { MatIconModule } from '@angular/material';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    UserdashboardComponent, 
    UserupdatedetailsComponent, 
    UserchangepasswordComponent, 
    SubmitbookrequestComponent, 
    ViewissuedbooksComponent, 
    UserdashComponent, 
    ViewbooksComponent, ViewprojectsComponent],
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    UserRoutingModule,
  ]
})
export class UserModule { }
