//create mini express appliatio to handle admin requests
const exp=require("express")
var bcrypt=require("bcrypt")
const adminApp=exp.Router();

adminApp.use(exp.json())
//import dbo from db.js
const dbo=require('../db');
dbo.initDb();


const jwt=require("jsonwebtoken")


const verifyToken=require("../middlewares/verifyToken");

adminApp.get('/admindashboard/notifydelays',verifyToken,(req,res)=>{
    var issueCollectionObj=dbo.getDb().issuecollectionobj;
    issueCollectionObj.find().toArray( (err,userObjFromDB)=>{
        if(err)
        {
            console.log("error");
        }
        else{
            var obj=[];
            let date_ob = new Date();
                    
            let date = ("0" + date_ob.getDate()).slice(-2);
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            let year = date_ob.getFullYear();
            currentdate=year + "-" + month + "-" + date;
            for(let i=0;i<userObjFromDB.length;i++)
            {
                const _MS_PER_DAY = 1000 * 60 * 60 * 24;
                const a = new Date(userObjFromDB[i].dateofissue);
                const b = new Date(currentdate);
                const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
                const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
                userObjFromDB[i].days=(Math.floor((utc2 - utc1) / _MS_PER_DAY));
                if(userObjFromDB[i].days>=15)
                obj.push(userObjFromDB[i]);
           
            }
            console.log(obj);
           
            res.send({message:"successful",data:obj});
        }
    });
})

adminApp.get('/admindashboard/manageusers/viewusers',verifyToken,(req,res)=>{
    var userCollectionObj=dbo.getDb().usercollectionobj;
    userCollectionObj.find().toArray( (err,userObjFromDB)=>{
        if(err)
        {
            console.log("error");
        }
        else
        {
            res.send({message:"all recs of users",data:userObjFromDB});
        }
    })
});

adminApp.get('/admindashboard/bookslist',verifyToken,(req,res)=>{
    var bookCollectionObj=dbo.getDb().bookcollectionobj;
    bookCollectionObj.find().toArray((err,bookObjFromDB)=>{
        if(err)
        {
            console.log("error");
        }
        else
        {
            for(let i=0;i<bookObjFromDB.length;i++)
            {
                bookObjFromDB[i].total=(bookObjFromDB[i].ids).length;
                delete bookObjFromDB[i].ids;
                delete bookObjFromDB[i]._id;

            }
            console.log(bookObjFromDB);
            res.send({message:"successfully retrieved documents",data:bookObjFromDB});
        }
    })

})

adminApp.get('/admindashboard/circulation/issuefindbook/:bookid',verifyToken,(req,res)=>{
    var bookCollectionObj=dbo.getDb().bookcollectionobj;
    //console.log("in adminapi bookid",req.params.bookid);
    bookCollectionObj.findOne({ISBNnumber:req.params.bookid},(err,bookObjFromDB)=>{
        if(err)
        {
            console.log("error");
        }
        else if (bookObjFromDB!=null)
        { //console.log(bookObjFromDB);
            res.send({message:"all recs of users",data:bookObjFromDB});
        }
        else{
            res.send({message:"enter the book details again"});
        }
    })
});
adminApp.get('/admindashboard/circulation/issuefinduser/:userid',verifyToken,(req,res)=>{
    var userCollectionObj=dbo.getDb().usercollectionobj;
   userCollectionObj.findOne({userid:req.params.userid},(err,userObjFromDB)=>{
    if(err)
    {
        console.log("error");
    }
    else if(userObjFromDB!=null)
    {  
        res.send({message:"user rec",data:userObjFromDB});
    }
    else{
        res.send({message:"enter the user details again"});
    }
});

   
});
adminApp.get('/finduser/:userid',(req,res)=>{
    var userCollectionObj=dbo.getDb().usercollectionobj;
   userCollectionObj.findOne({userid:req.params.userid},(err,userObjFromDB)=>{
    if(err)
    {
        console.log("error");
    }
    else if(userObjFromDB!=null)
    {  
        res.send({message:"user rec",data:userObjFromDB});
    }
    else{
        res.send({message:"enter the user details again"});
    }
});

   
});

adminApp.get('/admindashboard/circulation/returnfindbid/:bid',verifyToken,(req,res)=>{
    var issueCollectionObj=dbo.getDb().issuecollectionobj;
    //console.log("in adminapi bid",req.params.bid);
    issueCollectionObj.findOne({bid:req.params.bid},(err,issueObjFromDB)=>{
        if(err)
        {
            console.log("error");
        }
        else if(issueObjFromDB!=null)
        {// console.log(issueObjFromDB);
            res.send({message:"issue rec",data:issueObjFromDB});
        }
        else{
            res.send({message:"enter the book details again"});
        }
    })
});

adminApp.post('/issue',verifyToken,(req,res)=>{
    var bookCollectionObj=dbo.getDb().bookcollectionobj;
    var issueCollectionObj=dbo.getDb().issuecollectionobj;
    var userCollectionObj=dbo.getDb().usercollectionobj;
    console.log(req.body);
    console.log(req.params);
       bookCollectionObj.findOne({ISBNnumber:req.body.ISBNnumber},(err,bookObjFromDB)=>
       {
            if(err)
            {
                console.log('error in issue',err);
            }
            else if(bookObjFromDB!=null)
            {
                userCollectionObj.findOne({userid:req.body.userid},(err,userObjFromDB)=>{
                if(err)
                {
                    console.log("error");
                }
                else if(userObjFromDB!=null)
                { 
                    var f=0;
                    for(var i=0;i<(bookObjFromDB.ids).length;i++)
                    {
                        if(bookObjFromDB.ids[i].bid==req.body.bid && bookObjFromDB.ids[i].status==false)
                        {
                            f=1;
                            break;
                        }
                    }
                    if(f==1)
                    {
                     console.log("hello",req.body);
                     bookCollectionObj.updateOne({ISBNnumber:req.body.ISBNnumber,"ids.bid":req.body.bid},{$set:{"ids.$.status":true}});
                     bookCollectionObj.updateOne({ISBNnumber:req.body.ISBNnumber},{$inc:{"count":-1}});
                     issueCollectionObj.findOne({bid:req.body.bid},req.body,(err,isbobj)=>{
                        if(err){
                            console.log("error");
                        }
                        else if(isbobj!=null){
                            res.send({message:"book already issued"});
                        }
                        else{
                     issueCollectionObj.insertOne(req.body,(err,success)=>{
                         if(err)
                         {
                             console.log('error');;
                         }
                         else{
                             res.send({message:"book issued"});
                         }
                     });} });
                 }
                 else{
                    res.send({message:"book is not available to issue"});
                    }

                }
                else{
                    f=0;
                    res.send({message:"enter the user details again"}); }
            });
            }
        else{
            
            res.send({message:"enter the book details again"});
        }
    })
});
adminApp.post('/return',verifyToken,(req,res)=>{
    var issueCollectionObj=dbo.getDb().issuecollectionobj;
    var returnCollectionObj=dbo.getDb().returncollectionobj;
    var bookCollectionObj=dbo.getDb().bookcollectionobj;
   //console.log(req.body);
    //console.log(req.params);
    issueCollectionObj.findOne({bid:req.body.bid},(err,issueObjFromDB)=>{
       
       // console.log(issueObjFromDB);
        if(err)
        {
            console.log('error in issue',err);
        }
        else if(issueObjFromDB!=null)
        {
            bookCollectionObj.updateOne({ISBNnumber:issueObjFromDB.ISBNnumber,"ids.bid":req.body.bid},{$set:{"ids.$.status":false}});
            bookCollectionObj.updateOne({ISBNnumber:issueObjFromDB.ISBNnumber},{$inc:{"count":1}});
            issueCollectionObj.deleteOne( { bid:req.body.bid },(err,delobj)=>{
                if(err)
                {
                    console.log('error in deleting from issue table',err);
                }
                else
                {
                    //console.log("got");
                
                    let date_ob = new Date();
                    
                    let date = ("0" + date_ob.getDate()).slice(-2);
                    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                    let year = date_ob.getFullYear();
                    returndate=year + "-" + month + "-" + date;
                    //console.log(date_ob);
                    var bookobj= JSON.parse(JSON.stringify(issueObjFromDB));

                    bookobj.returndate=returndate;
                    delete bookobj._id;

                   // console.log(bookobj);
                    returnCollectionObj.insertOne(bookobj,(err,success)=>{
                        if(err)
                        {
                            console.log('error');;
                        }
                        else{
                            res.send({message:"bookreturned successfully"});
                        }
                    });
                }
            })  
        }
        else
        {
            
            res.send({message:"book is not issued yet to return"});
        }
    });
});

adminApp.post('/bookregister',verifyToken,(req,res)=>{
    var bookCollectionObj=dbo.getDb().bookcollectionobj;
    bookCollectionObj.findOne({ISBNnumber:req.body.ISBNnumber},(err,bookObjFromDB)=>{
        if(err)
        {
            console.log('error in register',err);
        }
        else if(bookObjFromDB!=null){
            res.send({message:"book already exists"});
        }
        else{
            bookCollectionObj.insertOne(req.body,(err,success)=>{
                if(err)
                {
                    console.log("error");
                }
                else{
                    res.send({message:"book registered succsessfully"});
                }
            })
        }
    });
});


adminApp.post('/bookadd',verifyToken,(req,res)=>{
    var bookCollectionObj=dbo.getDb().bookcollectionobj;
    bookCollectionObj.findOne({ISBNnumber:req.body.ISBNnumber},(err,bookObjFromDB)=>{
        if(err)
        {
            console.log('error in register',err);
        }
        else if(bookObjFromDB!=null)
        {
            var len=(req.body.ids).length;
            for(let i=0;i<len;i++)
            {
                bookObjFromDB.ids.push(req.body.ids[i]);
               
            }
            bookObjFromDB.count=bookObjFromDB.count+req.body.count;
            bookCollectionObj.save(bookObjFromDB);
           //console.log(bookObjFromDB);
            res.send({message:"book added to existed isbc"});
        }
        else{
            res.send({message:"book doesnot exists!"});
           
        }
    

    })
});
adminApp.put('/edituser',verifyToken,(req,res)=>{
    var userCollectionObj=dbo.getDb().usercollectionobj;
    userCollectionObj.findOne({userid:req.body.userid},(err,obj)=>{
        if(err)
        {
            console.log("error");
        }
        else if(obj!=null)
        {
            userCollectionObj.updateOne(
                { userid : req.body.userid },
                { $set: { "userid" : req.body.userid, "email" : req.body.email , "username" : req.body.username ,"contactno" : req.body.contactno ,"secques":req.body.secques,"secans":req.body.secans} },(err,succ)=>{
                    if(err)
                    {
                        res.send({message:"error in updation"});
                    }
                    else{
                        res.send({message:"user details updated"});
                    }
                });
        }
        else{
            res.send({message:"user not found"});
        }
    });

});          

adminApp.delete('/deleteuser/:userid',verifyToken,(req,res)=>{
    var userCollectionObj=dbo.getDb().usercollectionobj;
    var issueCollectionObj=dbo.getDb().issuecollectionobj;
    userCollectionObj.findOne({userid:req.params.userid},(err,obj)=>{
        if(err)
        {
            console.log("error");
        }
        else if(obj!=null)
        { 
            issueCollectionObj.findOne({userid:req.params.userid},(err,issueObjFromDB)=>{
                if(err)
                {
                    console.log("error");
                }
                else if(issueObjFromDB!=null)
                {
                    res.send({message:"Return/Delete the books Issued to User"});
                }
                else{
                    userCollectionObj.deleteOne(({"userid":req.params.userid}),(err,delobj)=>{
                        if(err)
                        {
                            res.send({message:"error in deletion"}); 
                        }
                        else
                        {
                            res.send({message:"user deleted"}); 
                        }
                    });
                }
            })
        }
        else{
            res.send({message:"user not found"});
        }
    });
});

adminApp.delete('/deletebook/:bookno',verifyToken,(req,res)=>{
    var bookCollectionObj=dbo.getDb().bookcollectionobj;
    var issueCollectionObj=dbo.getDb().issuecollectionobj;
    bookCollectionObj.findOne({ISBNnumber:req.params.bookno},(err,obj)=>{
        if(err)
        {
            console.log("error");
        }
        else if(obj!=null)
        {
            bookCollectionObj.deleteOne(({"ISBNnumber":req.params.bookno}),(err,delobj)=>{
                if(err)
                {
                    res.send({message:"error in deletion"}); 
                }
                else
                {
                    res.send({message:"book deleted"}); 
                }
            });
            issueCollectionObj.deleteMany({ ISBNnumber:req.params.bookno } ,(err,succ)=>{if(err) console.log(err);});

        }
        else{
            res.send({message:"book not found"});
        }
    });
});


adminApp.put('/editbook',verifyToken,(req,res)=>{
    var bookCollectionObj=dbo.getDb().bookcollectionobj;
    bookCollectionObj.findOne({ISBNnumber:req.body.ISBNnumber},(err,obj)=>{
        if(err)
        {
            console.log("error");
        }
        else if(obj!=null)
        {
            bookCollectionObj.updateOne({ISBNnumber:req.body.ISBNnumber},{$inc:{"count":-1}});
            bookCollectionObj.updateOne(
                { ISBNnumber : req.body.ISBNnumber },
                { $set: { "bookname" : req.body.bookname , "Author" : req.body.Author ,"publisher" : req.body.publisher} },(err,succ)=>{
                    if(err)
                    {
                        res.send({message:"error in updation"});
                    }
                    else{
                        res.send({message:"book details updated"});
                    }
                });
        }
        else{
            res.send({message:"book not found"});
        }
    });

});          
adminApp.put('/editbno',verifyToken,(req,res)=>{
    var bookCollectionObj=dbo.getDb().bookcollectionobj;
    var issueCollectionObj=dbo.getDb().issuecollectionobj;
    var returnCollectionObj=dbo.getDb().returncollectionobj;
    bookCollectionObj.findOne({ISBNnumber:req.body.ISBNnumber},(err,obj)=>{
        if(err)
        {
            console.log("error");
        }
        else if(obj!=null)
        {
            bookCollectionObj.updateOne(
                { ISBNnumber : req.body.ISBNnumber },
                { $set: { "ISBNnumber" : req.body.ISBNnumber1} },(err,succ)=>{
                    if(err)
                    {
                        res.send({message:"error in updation"});
                    }
                    else{
                        res.send({message:"book details updated"});
                    }
                });
                issueCollectionObj.updateMany({ ISBNnumber : req.body.ISBNnumber },{ $set: { "ISBNnumber" : req.body.ISBNnumber1} },(err,succ)=>{if(err) console.log(err);});
                returnCollectionObj.updateMany({ ISBNnumber : req.body.ISBNnumber },{ $set: { "ISBNnumber" : req.body.ISBNnumber1} },(err,succ)=>{if(err) console.log(err);});
        }
        else{
            res.send({message:"book not found"});
        }
    });

});          
adminApp.put('/editbid',verifyToken,(req,res)=>{
    var bookCollectionObj=dbo.getDb().bookcollectionobj;
    var issueCollectionObj=dbo.getDb().issuecollectionobj;
    var returnCollectionObj=dbo.getDb().returncollectionobj;
    bookCollectionObj.findOne({ISBNnumber:req.body.ISBNnumber},(err,obj)=>{
        if(err)
        {
            console.log("error");
        }
        else if(obj!=null)
        {
            bookCollectionObj.updateOne(
                { ISBNnumber : req.body.ISBNnumber, "ids.bid" : req.body.bookid },{ $set: { "ids.$.bid" : req.body.bookid1 } },(err,succ)=>{
                    console.log("in edit",succ);
                    if(err)
                    {
                        res.send({message:"error in updation"});
                    }
                    else if (succ.modifiedCount==0){res.send({message:"Book Id not found"});}
                    else{
                        res.send({message:"book details updated"});
                    }
                });
                issueCollectionObj.updateMany({ bid : req.body.bookid },{ $set: { "bid" : req.body.bookid1} },(err,succ)=>{if(err) console.log(err);});
                returnCollectionObj.updateMany({ bid : req.body.bookid },{ $set: { "bid" : req.body.bookid1} },(err,succ)=>{if(err) console.log(err);});
        }
        else{
            res.send({message:"book not found"});
        }
    });

});      

adminApp.put('/edituid',verifyToken,(req,res)=>{
    var userCollectionObj=dbo.getDb().usercollectionobj;
    var issueCollectionObj=dbo.getDb().issuecollectionobj;
    var returnCollectionObj=dbo.getDb().returncollectionobj;
    var bookrequestsCollectionObj=dbo.getDb().bookrequestscollectionobj; 
    userCollectionObj.findOne({userid:req.body.userid},(err,obj)=>{
        if(err)
        {
            console.log("error");
        }
        else if(obj!=null)
        {
            userCollectionObj.updateOne( { userid : req.body.userid },
                { $set: { "userid" : req.body.userid1} },(err,succ)=>{
                    if(err)
                    {
                        res.send({message:"error in updation"});
                    }
                    else{
                        res.send({message:"user details updated"});
                    }
                });
                issueCollectionObj.updateMany({ userid : req.body.userid },{ $set: { "userid" : req.body.userid1} },(err,succ)=>{if(err) console.log(err);});
                returnCollectionObj.updateMany({ userid : req.body.userid },{ $set: { "userid" : req.body.userid1} },(err,succ)=>{if(err) console.log(err);});
                bookrequestsCollectionObj.updateMany({ userid : req.body.userid },{ $set: { "userid" : req.body.userid1} },(err,succ)=>{if(err) console.log(err);});
        }
        else{
            res.send({message:"user not found"});
        }
    });

});          

adminApp.put('/deletebookid',verifyToken,(req,res)=>{
    var issueCollectionObj=dbo.getDb().issuecollectionobj;
    console.log("in admin api:",req.body.ISBNnumber,req.body.bookid);
    var bookCollectionObj=dbo.getDb().bookcollectionobj;
    bookCollectionObj.findOne({ISBNnumber:req.body.ISBNnumber},(err,obj)=>{
        if(err)
        {
            console.log("error");
        }
        else if(obj!=null)
        {
            bookCollectionObj.updateOne(
                { ISBNnumber : req.body.ISBNnumber },
                {"$pull":{"ids":{"bid":req.body.bookid} } },(err,succ)=>{
                if(err)
                {
                    console.log(err);
                    res.send({message:"error in deletion"}); 
                }
                else if (succ.modifiedCount==0){res.send({message:"Book Id not found"});}
                else
                {
                    bookCollectionObj.updateOne({ISBNnumber:req.body.ISBNnumber},{$inc:{"count":-1}});
                    res.send({message:"book deleted"}); 
                }
            });
            issueCollectionObj.deleteOne({ bid : req.body.bookid } ,(err,succ)=>{if(err) console.log(err);});
        }
        else{
            res.send({message:"book not found"});
        }
    });
});

adminApp.get('/getissuedetails',verifyToken,(req,res)=>{
    var issueCollectionObj=dbo.getDb().issuecollectionobj;
    var bookCollectionObj=dbo.getDb().bookcollectionobj;
    var userCollectionObj=dbo.getDb().usercollectionobj;
    issueCollectionObj.find({}).toArray( (err,issuedetailsObjFromDB)=>{
        if(err)
        {
            console.log("error");
        }
        else
        {
            var issuedetailsObjFromDB= JSON.parse(JSON.stringify(issuedetailsObjFromDB));
            var obj=[];
            var bool=false;
            if(issuedetailsObjFromDB.length>0){
            for(let i=0;i<issuedetailsObjFromDB.length;i++)
            {
                userCollectionObj.findOne({userid:issuedetailsObjFromDB[i].userid},(err,userObjFromDb)=>{
                    if(err)
                    {
                        console.log("error");
                    }
                    else if(userObjFromDb==null){issuedetailsObjFromDB[i].username=null;}
                    else{
                   
                        issuedetailsObjFromDB[i].username=userObjFromDb.username;
                    }
                });
                bookCollectionObj.findOne({ISBNnumber:issuedetailsObjFromDB[i].ISBNnumber},(err,bookObjFromDb)=>{
                    if(err)
                    {
                        console.log("error");
                    }
                    else if(bookObjFromDb==null){
                        issuedetailsObjFromDB[i].bookname=null;
                        issuedetailsObjFromDB[i].Author=null;
                        if(i==issuedetailsObjFromDB.length-1)
                        {
                        res.send({message:"all recs",data:issuedetailsObjFromDB});
                        }  
                    }
                    else{
                   
                        issuedetailsObjFromDB[i].bookname=bookObjFromDb.bookname;
                        issuedetailsObjFromDB[i].Author=bookObjFromDb.Author;
                        if(i==issuedetailsObjFromDB.length-1)
                        {
                        res.send({message:"Records found",data:issuedetailsObjFromDB});
                        }  
                    }
                });
            }}
            else{
                res.send({message:"Records not found",data:issuedetailsObjFromDB});
            }
        }
    })
});

adminApp.get('/getissuereturndetails',verifyToken,(req,res)=>{
    var returnCollectionObj=dbo.getDb().returncollectionobj;
    returnCollectionObj.find({}).toArray( (err,returndetailsObjFromDB)=>{
        if(err)
        {
            console.log(err);
        }
        else if(returndetailsObjFromDB==null)
        {
            res.send({message:"Records not Found"});
            
        }
        else
        {
            for(var i=0;i<returndetailsObjFromDB.length;i++)
            {
                delete returndetailsObjFromDB[i]._id;
            }
            res.send({message:"Records found",data:returndetailsObjFromDB});
        }
    })
});

adminApp.post('/login',(req,res)=>{
    res.send({message:"admin login works"})
});
adminApp.post('/userRegister',verifyToken,(req,res)=>{
    var userCollectionObj=dbo.getDb().usercollectionobj;
    userCollectionObj.findOne({userid:req.body.userid},(err,userObjFromDB)=>{
        if(err)
        {
            console.log('error in register',err)
        }
        else if(userObjFromDB!=null)
        {
            res.send({message:'userid already existed'});
        }
        else
        {   
            //hash password
            var hashedPassword=bcrypt.hashSync(req.body.password,7);
            req.body.password=hashedPassword;
            userCollectionObj.insertOne(req.body,(err,success)=>{
                if(err)
                {
                    console.log('error');
                }
                else
                {
                    res.send({message:'register successfully'});
                }
            })
        }
    })
});

adminApp.post('/verifysecuritykey/:adminid',verifyToken,(req,res)=>{
    console.log(req.params.adminid);
    var adminCollectionObj=dbo.getDb().admincollectionobj;
    adminCollectionObj.findOne({adminid:req.params.adminid},(err,Obj)=>{
        console.log(Obj);
        if(err)
        {
            console.log("error");
        }
        else
        {
            bcrypt.compare(req.body.securitykey,Obj.securitykey,(err,result)=>{
                if(err)
                {
                    console.log("err in securitykey compare",err);
                }
                else if(result==false)
                {
                    res.send({message:'reenter security key'});
                }
                else{
                    res.send({message:'security key successfully verified'});
                }
                
            });
        }
        
    })

})

adminApp.post('/changeusername/:adminid',verifyToken,(req,res)=>{
    var adminCollectionObj=dbo.getDb().admincollectionobj;
    adminCollectionObj.findOne({adminid:req.params.adminid},(err,obj)=>{
        if(err)
        {
            console.log("error");
        }
        else{
           
          //  console.log(req.body.changedusername);
          
    
            adminCollectionObj.updateOne(
                { adminid : req.params.adminid },
                { $set: { "username" : req.body.changedusername} },(err,succ)=>{
                    if(err)
                    {
                        console.log("error in changes updation");
                    }
                    else{
                        res.send({message:"username successfully updated"});
                    }
                }
             );
        }
    })

})


adminApp.post('/changepassword/:adminid',verifyToken,(req,res)=>{
    var adminCollectionObj=dbo.getDb().admincollectionobj;
    adminCollectionObj.findOne({adminid:req.params.adminid},(err,obj)=>{
        if(err)
        {
            console.log("error");
        }
        else{
            var hashedPassword=bcrypt.hashSync(req.body.password,7);
            req.body.password=hashedPassword;
          //  console.log(req.body.changedusername);
          
    
            adminCollectionObj.updateOne(
                { adminid : req.params.adminid },
                { $set: { "password" : req.body.password} },(err,succ)=>{
                    if(err)
                    {
                        console.log("error in changes updation");
                    }
                    else{
                        res.send({message:"password successfully updated"});
                    }
                }
             );
        }
    })

})

adminApp.get('/displaybookrequests',verifyToken,(req,res)=>{
    var bookrequestsCollectionObj=dbo.getDb().bookrequestscollectionobj; 
    bookrequestsCollectionObj.find().toArray( (err,bookrequestsObjFromDB)=>{
        if(err)
        {
            console.log("error in book requests retrieval",err);
        }
        else{
            console.log("vamshi",bookrequestsObjFromDB);
            res.send({message:"requests retrieved successfully",data:bookrequestsObjFromDB});
        }

    });
})
/**************************** */

adminApp.get('/findprojid/:projid',verifyToken,(req,res)=>{
    var projCollectionObj=dbo.getDb().projcollectionobj;
    //console.log("in adminapi bookid",req.params.bookid);
    projCollectionObj.findOne({projid:req.params.projid},(err,projObjFromDB)=>{
        if(err)
        {
            console.log("error");
        }
        else if (projObjFromDB!=null)
        { //console.log(bookObjFromDB);
            res.send({message:"all recs of projects",data:projObjFromDB});
        }
        else{
            res.send({message:"enter the project details again"});
        }
    })
});

adminApp.post('/addproj',verifyToken,(req,res)=>{
    var projCollectionObj=dbo.getDb().projcollectionobj;
    projCollectionObj.findOne({projid:req.body.projid},(err,projObjFromDB)=>{
        if(err)
        {
            console.log('error in register',err);
        }
        else if(projObjFromDB!=null){
            res.send({message:"project already exists"});
        }
        else{
            projCollectionObj.insertOne(req.body,(err,success)=>{
                if(err)
                {
                    console.log("error");
                }
                else{
                    res.send({message:"project registered succsessfully"});
                }
            })
        }
    });
});

adminApp.put('/editproj',verifyToken,(req,res)=>{
    var projCollectionObj=dbo.getDb().projcollectionobj;
    projCollectionObj.findOne({projid:req.body.projid},(err,obj)=>{
        if(err)
        {
            console.log("error");
        }
        else if(obj!=null)
        {
            projCollectionObj.updateOne(
                { projid : req.body.projid },
                { $set: { "title" : req.body.title , "batch" : req.body.batch ,"category" : req.body.category} },(err,succ)=>{
                    if(err)
                    {
                        res.send({message:"error in updation"});
                    }
                    else{
                        res.send({message:"project details updated"});
                    }
                });
        }
        else{
            res.send({message:"project not found"});
        }
    });

});      
adminApp.put('/editpid',verifyToken,(req,res)=>{
    var projCollectionObj=dbo.getDb().projcollectionobj;
    var projissueCollectionObj=dbo.getDb().projissuecollectionobj;
    var projreturnCollectionObj=dbo.getDb().projreturncollectionobj;
    projCollectionObj.findOne({projid:req.body.projid},(err,obj)=>{
        if(err)
        {
            console.log("error");
        }
        else if(obj!=null)
        {
            projCollectionObj.updateOne(
                { projid : req.body.projid },
                { $set: { "projid" : req.body.projid1} },(err,succ)=>{
                    if(err)
                    {
                        res.send({message:"error in updation"});
                    }
                    else{
                        res.send({message:"project details updated"});
                    }
                });
                projissueCollectionObj.updateMany({ projid : req.body.projid },{ $set: { "projid" : req.body.projid1} },(err,succ)=>{if(err) console.log(err);});
                projreturnCollectionObj.updateMany({ projid : req.body.projid },{ $set: { "projid" : req.body.projid1} },(err,succ)=>{if(err) console.log(err);});
        }
        else{
            res.send({message:"project not found"});
        }
    });

});          


adminApp.delete('/deleteproj/:projid',verifyToken,(req,res)=>{
    var projCollectionObj=dbo.getDb().projcollectionobj;
    var projissueCollectionObj=dbo.getDb().projissuecollectionobj;
    projCollectionObj.findOne({projid:req.params.projid},(err,obj)=>{
        if(err)
        {
            console.log("error");
        }
        else if(obj!=null)
        {
           projCollectionObj.deleteOne(({"projid":req.params.projid}),(err,delobj)=>{
                if(err)
                {
                    res.send({message:"error in deletion"}); 
                }
                else
                {
                    res.send({message:"project deleted"}); 
                }
            });
            projissueCollectionObj.deleteOne({ projid:req.params.projid } ,(err,succ)=>{if(err) console.log(err);});

        }
        else{
            res.send({message:"project not found"});
        }
    });
});

adminApp.get('/viewprojects',verifyToken,(req,res)=>{
    var projCollectionObj=dbo.getDb().projcollectionobj;
    projCollectionObj.find().toArray( (err,projObjFromDB)=>{
        if(err)
        {
            console.log("error");
        }
        else
        {
            res.send({message:"all recs of projects",data:projObjFromDB});
        }
    })
});

adminApp.get('/getprojissuedetails',verifyToken,(req,res)=>{
    var projissueCollectionObj=dbo.getDb().projissuecollectionobj;
    var projCollectionObj=dbo.getDb().projcollectionobj;
    var userCollectionObj=dbo.getDb().usercollectionobj;
    projissueCollectionObj.find({}).toArray( (err,projissuedetailsObjFromDB)=>{
        if(err)
        {
            console.log(err);
        }
        else if(projissuedetailsObjFromDB==null)
        {res.send({message:"Records not Found"});}
        else
        {
            var projissuedetailsObjFromDB= JSON.parse(JSON.stringify(projissuedetailsObjFromDB));
            if(projissuedetailsObjFromDB.length>0){
            for(let i=0;i<projissuedetailsObjFromDB.length;i++)
            {
                userCollectionObj.findOne({userid:projissuedetailsObjFromDB[i].userid},(err,userObjFromDb)=>{
                    if(err)
                    {
                        console.log("error");
                    }
                    else if(userObjFromDb==null){projissuedetailsObjFromDB[i].username=null;}
                    else{
                   
                        projissuedetailsObjFromDB[i].username=userObjFromDb.username;
                    }
                });
                projCollectionObj.findOne({projid:projissuedetailsObjFromDB[i].projid},(err,projObjFromDb)=>{
                    if(err)
                    {
                        console.log("error");
                    }
                    else if(projObjFromDb==null){
                        projissuedetailsObjFromDB[i].title=null;
                        projissuedetailsObjFromDB[i].batch=null;
                        projissuedetailsObjFromDB[i].category=null;
                        if(i==projissuedetailsObjFromDB.length-1)
                        {
                        res.send({message:"all recs",data:projissuedetailsObjFromDB});
                        }  
                    }
                    else{
                   
                        projissuedetailsObjFromDB[i].title=projObjFromDb.title;
                        projissuedetailsObjFromDB[i].batch=projObjFromDb.batch;
                        projissuedetailsObjFromDB[i].category=projObjFromDb.category;
                        if(i==projissuedetailsObjFromDB.length-1)
                        {
                        res.send({message:"Records found",data:projissuedetailsObjFromDB});
                        }  
                    }
                });
            }}
            else{res.send({message:"Records not found",data:projissuedetailsObjFromDB}); }
        }
    });
});

adminApp.get('/getprojissuereturndetails',verifyToken,(req,res)=>{
    var projreturnCollectionObj=dbo.getDb().projreturncollectionobj;
    projreturnCollectionObj.find({}).toArray( (err,projreturndetailsObjFromDB)=>{
        if(err)
        {
            console.log(err);
        }
        else if(projreturndetailsObjFromDB==null)
        {
            res.send({message:"Records not Found"});
            
        }
        else
        {
            res.send({message:"Records found",data:projreturndetailsObjFromDB});
        }
    })
});


adminApp.post('/projissue',verifyToken,(req,res)=>{
    var projCollectionObj=dbo.getDb().projcollectionobj;
    var projissueCollectionObj=dbo.getDb().projissuecollectionobj;
    var userCollectionObj=dbo.getDb().usercollectionobj;
    //console.log(req.body);
    //console.log(req.params);
       projCollectionObj.findOne({projid:req.body.projid},(err,projObjFromDB)=>
       {
            if(err)
            {
                console.log('error in issue',err);
            }
            else if(projObjFromDB!=null)
            {
                userCollectionObj.findOne({userid:req.body.userid},(err,userObjFromDB)=>{
                if(err)
                {
                    console.log("error");
                }
                else if(userObjFromDB!=null)
                { 
                    if(projObjFromDB.status==false)
                    {
                        projissueCollectionObj.insertOne(req.body,(err,success)=>{
                            if(err)
                            {
                                console.log('error');;
                            }
                            else{
                                res.send({message:"project issued"});
                            }
                        });
                     projCollectionObj.updateOne({projid:req.body.projid},{$set:{"status":true}});
                
                 }
                 else{
                    res.send({message:"project is not available to issue"});
                    }

                }
                else{
                    res.send({message:"enter the user details again"}); }
            });
            }
        else{
            
            res.send({message:"enter the project details again"});
        }
    })
});
adminApp.post('/projreturn',verifyToken,(req,res)=>{
    var projissueCollectionObj=dbo.getDb().projissuecollectionobj;
    var projreturnCollectionObj=dbo.getDb().projreturncollectionobj;
    var projCollectionObj=dbo.getDb().projcollectionobj;
   //console.log(req.body);
    //console.log(req.params);
    projissueCollectionObj.findOne({projid:req.body.projid},(err,projissueObjFromDB)=>{
       
       // console.log(issueObjFromDB);
        if(err)
        {
            console.log('error in issue',err);
        }
        else if(projissueObjFromDB!=null)
        {
            
            projissueCollectionObj.deleteOne( { projid:projissueObjFromDB.projid },(err,delobj)=>{
                if(err)
                {
                    console.log('error in deleting from issue table',err);
                }
                else
                {
                    //console.log("got");
                
                    let date_ob = new Date();
                    
                    let date = ("0" + date_ob.getDate()).slice(-2);
                    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                    let year = date_ob.getFullYear();
                    returndate=year + "-" + month + "-" + date;
                    //console.log(date_ob);
                    var projobj= JSON.parse(JSON.stringify(projissueObjFromDB));

                    projobj.returndate=returndate;
                    delete projobj._id;

                   // console.log(bookobj);
                    projreturnCollectionObj.insertOne(projobj,(err,success)=>{
                        if(err)
                        {
                            console.log('error');;
                        }
                        else{
                            res.send({message:"project returned successfully"});
                        }
                    });
                }
            })  
            projCollectionObj.updateOne({projid:projissueObjFromDB.projid},{$set:{"status":false}});
        }
        else
        {
            
            res.send({message:"project is not issued yet to return"});
        }
    });
});

adminApp.get('/returnfindprojid/:projid',verifyToken,(req,res)=>{
    var projissueCollectionObj=dbo.getDb().projissuecollectionobj;
    //console.log("in adminapi bid",req.params.bid);
    projissueCollectionObj.findOne({projid:req.params.projid},(err,projissueObjFromDB)=>{
        if(err)
        {
            console.log("error");
        }
        else if(projissueObjFromDB!=null)
        { console.log(projissueObjFromDB);
            res.send({message:"issue rec",data:projissueObjFromDB});
        }
        else{
            res.send({message:"enter the project details again"});
        }
    })
});


/*************************************** */
adminApp.post('/uploadreturndetails',verifyToken,(req,res)=>{
    var returnCollectionObj=dbo.getDb().returncollectionobj;
    returnCollectionObj.insertMany(req.body,(err,succ)=>{
        if(err)
        {
            console.log("error in return log upload",err);
        }
        else{
            res.send({message:" return log upload successfull"});
        }
    })
})

adminApp.post('/uploadissuedetails',verifyToken,(req,res)=>{
    var issueCollectionObj=dbo.getDb().issuecollectionobj;
    issueCollectionObj.insertMany(req.body,(err,succ)=>{
        if(err)
        {
            console.log("error in return log upload",err);
        }
        else{
            res.send({message:"issue log upload successfull"});
        }
    })
})

adminApp.post('/uploadbookdetails',verifyToken,(req,res)=>{
    var bookCollectionObj=dbo.getDb().bookcollectionobj;
    bookCollectionObj.insertMany(req.body,(err,succ)=>{
        if(err)
        {
            console.log("error in return log upload",err);
        }
        else{
            res.send({message:"books log upload successfull"});
        }
    })
})

adminApp.post('/admindashboard/books/bookslist/uploadbooksdata',verifyToken,(req,res)=>{
    var userCollectionObj=dbo.getDb().usercollectionobj;
    userCollectionObj.insertMany(req.body,(err,succ)=>{
        if(err)
        {
            console.log("error in user log upload",err);
        }
        else{
            res.send({message:"user upload successfull"});
        }
    })

})

adminApp.post('/admindashboard/projects/projectslist/uploadprojects',verifyToken,(req,res)=>{
    var projCollectionObj=dbo.getDb().projcollectionobj;
    console.log(req.body);
    projCollectionObj.insertMany(req.body,(err,succ)=>{
        if(err)
        {
            console.log("error in project log upload",err);
        }
        else{
            res.send({message:"projects upload successfull"});
        }
    })

})

//export adminApp

module.exports=adminApp;