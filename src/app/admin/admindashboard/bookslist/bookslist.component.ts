import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import 'datatables.net-bs4';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import {ExcelServiceService} from 'src/app/excel-service.service';
import { LoginService } from 'src/app/login.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js'
import 'sweetalert2/src/sweetalert2.scss';

@Component({
  selector: 'app-bookslist',
  templateUrl: './bookslist.component.html',
  styleUrls: ['./bookslist.component.css']
})
export class BookslistComponent implements OnInit {
  bookObj:any;
  temp: boolean=false; 
  uploadcheck:boolean=false;
  filename:string="";
  name = 'This is XLSX TO JSON CONVERTER';
  willDownload = false;
  jsonData = null;
  j;
  constructor(private hc:HttpClient,private excelService:ExcelServiceService,private ls:LoginService,private router:Router) { }

  ngOnInit() {
    this.hc.get('/admin/admindashboard/bookslist').subscribe((res)=>{
      if(res["message"]=="Please relogin to continue...")
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
      this.bookObj=res["data"];
      this.temp = true; 
      $(function() {
        $(document).ready(function() {
          $('#booksexample').DataTable();
        });
      });
    }
    })
  }
  exportAsXLSX():void {
    this.excelService.exportAsExcelFile(this.bookObj, 'bookslist');
  }
  onFileChange(ev) {
    let workBook = null;
    this.uploadcheck=true;
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
  uploadbookstodb()
  {
    if(this.uploadcheck==true)
    {
      for(let i=0;i<this.jsonData[this.j].length;i++)
      {
        this.jsonData[this.j][i].ids=[];
      this.jsonData[this.j][i].count=0;
      delete this.jsonData[this.j][i].total;
      }
      
      console.log(this.jsonData[this.j]);
      this.hc.post('admin/uploadbookdetails',this.jsonData[this.j]).subscribe((objOfres:object)=>{
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
          title: 'Uploaded!',
          text: "book details uploaded succesfully",
        });
        this.router.navigate(['admindashboard/dashboard']);
      }
         
        }); 
    }
  }




}