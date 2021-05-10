import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import 'datatables.net-bs4';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import {ExcelServiceService} from 'src/app/excel-service.service';
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js'
import 'sweetalert2/src/sweetalert2.scss'
import { LoginService } from 'src/app/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-issuedetails',
  templateUrl: './issuedetails.component.html',
  styleUrls: ['./issuedetails.component.css']
})
export class IssuedetailsComponent implements OnInit {
name = 'This is XLSX TO JSON CONVERTER';
willDownload = false;
issueObj:any;
returnissueObj:any;
temp1:boolean=false;
temp2:boolean=false;
returncheck:boolean=false;
issuecheck:boolean=false;
jsonData=null;
j;
filename:string="";
  constructor(private hc:HttpClient,private excelService:ExcelServiceService,private ls:LoginService,private router:Router) { }

  ngOnInit() {
    this.hc.get('admin/getissuedetails').subscribe((objOfres:object)=>{
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
      this.issueObj=objOfres["data"];
      console.log(this.issueObj);
      this.temp1 = true;
      $(function() {
        $(document).ready(function() {
          $('#example1').DataTable();
        });
      }); 
    }
});
this.hc.get('admin/getissuereturndetails').subscribe((objOfres:object)=>{
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
  this.returnissueObj=objOfres["data"];
  console.log(this.returnissueObj);

  this.temp2 = true;
  $(function() {
    $(document).ready(function() {
      $('#example2').DataTable();
    });
  }); 
}
}); 
     
  } 
  exportAsXLSX1():void {
    this.excelService.exportAsExcelFile(this.issueObj, 'issuelist');
  }
  exportAsXLSX2():void {
    this.excelService.exportAsExcelFile(this.returnissueObj,'returnissuelist');
  }
  onFileChange(ev,x) {
    if(x==0)
    {
      this.issuecheck=true;
    }
    else
   { 
     this.returncheck=true;
  }
    let workBook = null;
 //   let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    this.filename=file.name;
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      this.jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
   //   const dataString = JSON.stringify(jsonData);
      for(var i in this.jsonData){
         this.j=i;
        break;

      }
      //var arr=jsonData[j];
     
      console.log(this.jsonData[this.j]);
     // document.getElementById('output').innerHTML = dataString.slice(0, 300).concat("...");
     
   //   this.hc.post('/admin/uploadbooks',jsonData[j]).subscribe((res)=>{
    //    alert(res["message"]);   
    //  });
    }
    reader.readAsBinaryString(file);
  }
  uploadreturntodb()
  { 
    if(this.returncheck==true)
    {
      for(let i=0;i<this.jsonData[this.j].length;i++)
      {
         delete this.jsonData[this.j][i]._id;
      }
    this.hc.post('admin/uploadreturndetails',this.jsonData[this.j]).subscribe((objOfres:object)=>{
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
    //  console.log("retrived");
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Data Imported',
      showConfirmButton: false,
      timer: 1500
    }); 
    this.router.navigate(['admindashboard/dashboard']);
  }
    }); 
  }
  else{
    Swal.fire({
      icon: 'error',
      text: "choose file to upload return log"
    }); 
  }
  }
  uploadissuetodb()
  {
    if(this.issuecheck==true)
    {
      for(let i=0;i<this.jsonData[this.j].length;i++)
      {
         delete this.jsonData[this.j][i]._id;
         delete this.jsonData[this.j][i].username;
         delete this.jsonData[this.j][i].bookname;
         delete this.jsonData[this.j][i].Author;
      }
    this.hc.post('admin/uploadissuedetails',this.jsonData[this.j]).subscribe((objOfres:object)=>{
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
    //  console.log("retrived");
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Data Imported',
      showConfirmButton: false,
      timer: 1500
    }); 
    this.router.navigate(['admindashboard/dashboard']);
  }
    }); 
  }
  else{
    Swal.fire({
      icon: 'error',
      text: "choose file to upload return log"
    }); 
  }
}
}
