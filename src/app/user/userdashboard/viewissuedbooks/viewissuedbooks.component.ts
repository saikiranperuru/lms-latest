import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import 'datatables.net-bs4'
import { HttpClient } from '@angular/common/http';
import { UserdashboardComponent } from '../userdashboard.component';
import { LoginService } from 'src/app/login.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js'
import 'sweetalert2/src/sweetalert2.scss'

@Component({
  selector: 'app-viewissuedbooks',
  templateUrl: './viewissuedbooks.component.html',
  styleUrls: ['./viewissuedbooks.component.css']
})
export class ViewissuedbooksComponent implements OnInit {
  userbissueObj:any;
  userpissueObj:any;
  username:string;
  viewusertemp1:boolean=false;
  viewusertemp2:boolean=false;
  constructor(private router:Router,private hc:HttpClient,private us:UserdashboardComponent,private ls:LoginService) { }

  ngOnInit() {
    this.username=this.us.username;
    this.hc.get(`user/viewissuedbooks/${this.us.userObj["userid"]}`).subscribe((objOfres:object)=>{
      if(objOfres["message"]=="Please relogin to continue...")
      {
        Swal.fire(
          'Session timed Out!',
          'please relogin to continue.',
          'success'
        )
      //  console.log("yes");
        this.ls.userLoginStatus=false;
        this.ls.doLogout();
        this.router.navigate(['../../']);
        
      }
      else
      {
      this.userbissueObj=objOfres["data"];
      this.viewusertemp1 = true;
     console.log("this is userbissue obj",this.userbissueObj);
     $(function() {
      $(document).ready(function() {
        $('#userbissueexample').DataTable();
      });
    }); 
  }
});

this.hc.get(`user/viewissuedprojects/${this.us.userObj["userid"]}`).subscribe((objOfres:object)=>{
  if(objOfres["message"]=="Please relogin to continue...")
  {
    Swal.fire(
      'Session timed Out!',
      'please relogin to continue.',
      'success'
    )
  //  console.log("yes");
    this.ls.userLoginStatus=false;
    this.ls.doLogout();
    this.router.navigate(['../../']);
    
  }
  else
  {
  this.userpissueObj=objOfres["data"];
  this.viewusertemp2 = true;
 $(function() {
  $(document).ready(function() {
    $('#userpissueexample').DataTable();
  });
}); 
}
});

  }
 
}
