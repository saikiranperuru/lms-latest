import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { LoginService } from './login.service';
declare var jQuery: any;
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js'
import 'sweetalert2/src/sweetalert2.scss'
import { UserobjService } from './userobj.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit{
  constructor(private router:Router,private ls:LoginService,private uos:UserobjService,private hc:HttpClient){}
  userObj:object;
  userid:string;
  enteruserid:boolean=true;
  secquestatusverify:boolean=false;
  changepasswordstatus:boolean=false;
  secques:string="";
  userLoginStatus=this.ls.userLoginStatus;
  adminLoginStatus=this.ls.adminLoginStatus;
  ngOnInit() {
    (function($) {
      "use strict"; // Start of use strict
    /*
      // Smooth scrolling using jQuery easing
      $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
          var target = $(this.hash);
          target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
          if (target.length) {
            $('html, body').animate({
              scrollTop: (target.offset().top - 72)
            }, 1000, "easeInOutExpo");
            return false; 
          }
        }
      });
    */
      // Closes responsive menu when a scroll trigger link is clicked
      $('.js-scroll-trigger').click(function() {
        $('.navbar-collapse').collapse('hide');
      });
    
      // Activate scrollspy to add active class to navbar items on scroll
      $('body').scrollspy({
        target: '#mainNav',
        offset: 75
      });
    
      // Collapse Navbar
     var navbarCollapse = function() {
       if ($("#mainNav").offset() != undefined){
     if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-scrolled");
    } else {
      $("#mainNav").removeClass("navbar-scrolled");
    }}
    };
    // Collapse now if page is not at top
      // Collapse the navbar when page is scrolled
    $(window).scroll(navbarCollapse);
    navbarCollapse();
    
    
    })(jQuery); // End of use strict
   
    setTimeout(()=>{
      this.ls.userLoginStatus=false;
      this.ls.adminLoginStatus=false;
      this.ls.doLogout();
    },0);
  }
  scrollToElement($element): void {
    $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }
  submitForm(dataObj)
  {
    this.ls.doLoginuser(dataObj).subscribe((result)=>{
     if(result["message"]=="invalid username")
     {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Username!',
        text: 'Enter Correct Username',
      });
     }
     else if(result["message"]=="invalid password")
     {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password!',
        text: 'Enter Correct Password',
      });
     }
     else
     { 
       if(result["check"]=="admin")
       {
        
        Swal.fire({
          icon: 'success',
          title: 'Login Success!',
          text: 'Admin Login Successful',
          showConfirmButton: false,
          timer: 1500
        });
        //save token in local storage of browser
        localStorage.setItem("token",result["message"]);
 
        this.ls.adminLoginStatus=true;
        this.ls.adminid=result['adminid'];
        this.ls.username=result['username'];
        //redirect to userdashboard 
        this.router.navigate(['/admindashboard']);

       }
       else{
        Swal.fire({
          icon: 'success',
          title: 'Login Success!',
          text: 'Welcome '+result['username'],
          showConfirmButton: false,
          timer: 1500
        });
        //save token in local storage of browser
        localStorage.setItem("token",result["message"]);

        this.ls.userLoginStatus=true;
        this.ls.userid=result['userid'];
        this.ls.username=result['username'];
        //redirect to userdashboard 
        this.router.navigate(['../userdashboard',result["username"]]);
       }
     }
    })
  
} 
enteruserfun(userobj){
  this.userid=userobj["userid"];
  if(this.isvalid(userobj)){
    console.log(userobj["userid"]);
    this.hc.get(`/admin/finduser/${this.userid}`).subscribe((objOfres:object)=>{
    this.userObj=objOfres["data"];
      console.log("in cp",objOfres["data"])
      if(this.userObj!=null){

         if (this.userObj["secques"]==null){
          Swal.fire({
            icon: 'error',
            text: 'Please Contact Admin!',
          });
        }
        else{
        this.enteruserid=false;
        this.secques=this.userObj["secques"];
        this.secquestatusverify=true;
        }
    
      }
      else{
        Swal.fire({
          icon: 'error',
          title: 'Invalid details!',
          text: 'Enter correct userid',
        });  }
      
      
  });
} 
else{
  Swal.fire({
    icon: 'error',
    text: 'Fill all details!',
   
  });  
}
 
}

submitsecques2(secqobj){
  if(this.isvalid(secqobj)){
  if (this.userObj["secans"]==secqobj.secans)
  {
    Swal.fire({
      icon: 'success',
      title: 'Correct!',
      text: "verification succesful",
      showConfirmButton: false,
      timer: 1500
    });
   this.changepasswordstatus=true;
   this.secquestatusverify=false;
  }
  else{
    Swal.fire({
      icon: 'error',
      text: 'Wrong Answer!',
     
    });
  }
}
else{
  Swal.fire({
    icon: 'error',
    text: 'Fill all details!',
   
  });  
}
}
submitcp(secqobj){
  if(this.isvalid(secqobj)){
  secqobj["userid"]=this.userObj["userid"];
  console.log("cp fun obj",secqobj);
  this.uos.changepasswrd(secqobj).subscribe((res)=>{

    if(res["message"]=="password successfully updated")
    {
      Swal.fire({
        icon: 'success',
        title: 'Succes!',
        text: "Password Updated",
        showConfirmButton: false,
        timer: 1500
      });
      this.enteruserid=true;
      this.secquestatusverify=false;
      this.changepasswordstatus=false;
    }
    else{
      Swal.fire({
        icon: 'error',
        text: res["message"],
       
        
      });
     
    }
  
  });}
  else{
    Swal.fire({
      icon: 'error',
      text: 'Fill all details!',
     
    });  
  }
}
isvalid(obj)
{
  var f:boolean=true;
  for (var key in obj) {
    if(obj[key]==null || obj[key].trim()==""){
      f=false;
      break;
    }  
}
return f;
}

}
