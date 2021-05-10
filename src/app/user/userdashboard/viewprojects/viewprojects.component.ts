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
  selector: 'app-viewprojects',
  templateUrl: './viewprojects.component.html',
  styleUrls: ['./viewprojects.component.css']
})
export class ViewprojectsComponent implements OnInit {
  projObj:any;
  username:string;
  viewusertemp:boolean=false;
  constructor(private router:Router,private hc:HttpClient,private us:UserdashboardComponent,private ls:LoginService) { }

  ngOnInit() {
    this.hc.get('admin/viewprojects').subscribe((objOfres:object)=>{
      if(objOfres["message"]=="Please relogin to continue...")
    {
      Swal.fire(
        'Session timed Out!',
        'please relogin to continue.',
        'success'
      )
    //  console.log("yes");
      this.ls.adminLoginStatus=false;
      this.ls.doLogout();
      this.router.navigate(['../../']);
      
    }
    else{
      
      this.projObj=objOfres["data"];
      this.viewusertemp = true;
     $(function() {
      $(document).ready(function() {
        $('#projexample').DataTable();
      });
    }); 
  }
});
  }

}
