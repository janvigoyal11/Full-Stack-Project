var express=require("express");
var fileuploader=require("express-fileupload");
var mysql=require("mysql2");
var nodemailer = require('nodemailer');
var config=require("./config.json");

var app=express();

//----------------- MYSQL-------------------------
var dbConfig={
    host:"127.0.0.1",
    user:"root",
    password:"MycollegeDBMS",
    database:"proJect",
    dateStrings: true
  }
  var dbRef=mysql.createConnection(dbConfig);
  dbRef.connect(function(err){
    if(err==null)
    console.log("Connection established successfully!");
    else
    console.log(err);
  })

  //----------------NODEMAILER-----------------------------------
// var transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//      user: config.email,
//      pass: config.pass
//   }
// })
  //--------------------------------------------------------------

app.listen(1997,function(){
    console.log("Project server begun!!");
})

app.use(express.static("project"));
app.use(express.static("public"));
app.use(fileuploader());
app.use(express.urlencoded(true));

app.get("/",function(req,resp){
resp.sendFile(process.cwd()+"/project/index.html");
})

app.get("/dash-admin",function(req,resp)
{
    resp.sendFile(process.cwd()+"/project/dash-admin.html");
})

//-----------------------  INDEX  ----------------------------------------

app.get("/chk-email",function(req,resp){
dbRef.query("select * from sign where email=?",[req.query.kuchEmail],function(err,resultTable)
    {
          if(err==null)
          {
            var r=/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
            if(req.query.kuchEmail=="")
             resp.send("Plz Fill Email ID!");
            else if(resultTable.length==1)
              resp.send("Email ID is already Taken...");
            else{
              if(r.test(req.query.kuchEmail)==true)
              resp.send("Correct Format :)");
              else
              resp.send("Incorrect Format!");
            }
            }
              else
            resp.send(err);
    })
 })

 app.get("/chk-pwd",function(req,resp){
  dbRef.query("select * from sign where password=?",[req.query.kuchPwd],function(err,resultTable)
      {
            if(err==null)
            {
              var r=/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
              if(req.query.kuchPwd=="")
              resp.send("Plz Fill Password!");
              else if(r.test(req.query.kuchPwd)==true)
                resp.send("Correct Format :)");
              else
                resp.send("Incorrect Format!");
              }
                else
              resp.send(err);
      })
 })

app.get("/chk-submit",function(req,resp){
dbRef.query("insert into sign values(?,?,?,current_date(),1)",[req.query.kuchemail,req.query.kuchpwd,req.query.kuchtype],function(err){
  if(err==null){
    if(req.query.kuchemail=="" || req.query.kuchpwd=="" || req.query.kuchtype=="")
      resp.send("Please Enter all the details");
    else
      resp.send("Record added successfully!");
  }
  else
  resp.send(err);
})
})

app.get("/chk-login", function(req, resp) {
  dbRef.query("SELECT status,type FROM sign WHERE email=? AND password=?", [req.query.kuemail, req.query.kupwd], function(err, resultTable) {
    if(err==null)
      {
        if(req.query.kuemail=="")
        resp.send("email");
        else if(req.query.kupwd=="")
        resp.send("pass");
      else if(resultTable.length==1){
          if(resultTable[0].status==1)
            resp.send("Correct:) Type: "+resultTable[0].type);
          else
            resp.send("Blocked user");
          }
      else
        resp.send("Invalid Email ID/Password");
    }
    else
      resp.send(err.toString());
  });
});

//----------------------DONOR  PROFILE   --------------------------------------

app.post("/signup",function(req,resp){
var fileName="nopic.jpg";
  if(req.files!=null)
    {
      fileName=req.files.ppic.name;
      var path=process.cwd()+"/public/uploads/"+fileName;
      req.files.ppic.mv(path);
    }

    var email=req.body.txtEmail;
    var name=req.body.name;
    var contact=req.body.contact;
    var ad=req.body.txtAdd;
    var ad2=req.body.txtAdd2;
    var city=req.body.city;
    var state=req.body.state;
    var pincode=req.body.pincode;
    var dob=req.body.dob;
    var gender=req.body.gender;
    var id=req.body.id;
    var beg=req.body.am;
    var end=req.body.pm;

dbRef.query("insert into user values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[email,name,contact,ad,ad2,city,state,pincode,dob,gender,id,fileName,beg,end],function(err){
    if(err==null){
    resp.sendFile(__dirname+"/project/dash-donor.html");
    // resp.send("Record inserted successfully in the table!!!!");
    }
    else
    resp.send(err);
})

//---- to send mail----------

// let details = {
//   from: config.email,
//   to: email,
//   subject: "Profile successfully registered!",
//   text: "Hii",
//   attachments: {
//      filname: 'A pic',
//      path: "black.png"
//   }
// }

// transporter.sendMail(details,(err)=> {
//   if(err==null)
//   console.log("mail sent!");
//   else
//   console.log(err);
// })

})

app.post("/del-profile",function(req,resp){
    var email=req.body.txtEmail;
    dbRef.query("delete from user where Email=?",[email],function(err,result){
        if(err==null){
            if(result.affectedRows==1){
              resp.sendFile(__dirname+"/project/dash-donor.html");
            // console.log("Deleted Successsfullyyy !!");
            }
            else
            resp.send("Invalid email id....");
        }
        else
        resp.send(err);
    })
})

app.post("/update-profile",function(req,resp){
  var email=req.body.txtEmail;
  if(email=="")
  resp.send("Please enter your Email to update!!");

  var fileName="nopic.jpg";
  if(req.files!=null)
    {
      fileName=req.files.ppic.name;
      var path=process.cwd()+"/public/uploads/"+fileName;
      req.files.ppic.mv(path);
    }
    else{
      fileName=req.body.hid;
    }

  var name=req.body.name;
    var contact=req.body.contact;
    var ad=req.body.txtAdd;
    var ad2=req.body.txtAdd2;
    var city=req.body.city;
    var state=req.body.state;
    var pincode=req.body.pincode;
    var dob=req.body.dob;
    var gender=req.body.gender;
    var id=req.body.id;
    var beg=req.body.am;
    var end=req.body.pm;
  dbRef.query("update user set Name=?, Contact_Number=?, Address=?,Address2=?,City=?,State=?,PinCode=?,DOB=?,Gender=?,ID_Proof=?,Proof_display=?,beg=?,end=? where Email=?",[name,contact,ad,ad2,city,state,pincode,dob,gender,id,fileName,beg,end,email],function(err,result){
    if(err==null)
    {
      if(result.affectedRows==1){
      resp.sendFile(__dirname+"/project/dash-donor.html");
      // resp.send("Record updated successfully!!");
      }
    else
    resp.send("Email ID does not exist!");
    }
    else
    resp.send(err);
  })
})

app.get("/get-json-record",function(req,resp){
  dbRef.query("select * from user where Email=?",[req.query.kuchEmail],function(err,resultTableJSON){
    if(err==null){
      resp.send(resultTableJSON);
    }
    else
    resp.send(err);
  })
})


//----------------------- Avail MED ----------------------------------------
app.get("/chk-avail",function(req,resp){
  dbRef.query("insert into ameds(email,med_name,exp,packing,qty) values(?,?,?,?,?)",[req.query.kuchemail,req.query.kuchmed,req.query.kuchexp,req.query.kuchpack,req.query.kuchqty],function(err){
    if(err==null)
    resp.send("Record added successfully!");
    else
    resp.send(err);
  })

})

//----------------------  Settings (Password update) ---------------------------
app.get("/updt",function(req,resp){
dbRef.query("update sign set password=? where email=? and password=?",[req.query.kuchnp,req.query.kuchemail,req.query.kuchcp],function(err,result){
  if(err==null){
    if(result.affectedRows==1){
      if(req.query.kuchcp != req.query.kuchnp){
        if(req.query.kuchnp==req.query.kuchncp)
          resp.send("Password updated!");
        else
          resp.send("New and confirm password does not match!");
      }
      else
      resp.send("Current and New Passwords should be different!!");
    }
    else
    resp.send("Invalid Email ID/ Current Password");
  }
  else
  resp.send(err);
})
})

//---------------------  Recepient Profile -------------------------------
app.post("/sign",function(req,resp){
  var fileName="nopic.jpg";
    if(req.files!=null)
      {
        fileName=req.files.ppic.name;
        var path=process.cwd()+"/public/uploads/"+fileName;
        req.files.ppic.mv(path);
      }
  
      var email=req.body.txtEmail;
      var name=req.body.name;
      var contact=req.body.contact;
      var dob=req.body.dob;
      var gender=req.body.gender;
      var ad=req.body.txtAdd;
      var city=req.body.city;
      var state=req.body.state;
      var id=req.body.id;
  
  dbRef.query("insert into rece values(?,?,?,?,?,?,?,?,?,?)",[email,name,contact,dob,gender,ad,city,state,id,fileName],function(err){
      if(err==null){
        resp.sendFile(__dirname+"/project/dash-rece.html");
        // resp.send("Record inserted successfully in the table!!!!");
      }
      else
      resp.send(err);
  })
  
  //---- to send mail----------
  
  // let details = {
  //   from: config.email,
  //   to: email,
  //   subject: "Profile successfully registered!",
  //   text: "Hii",
  //   attachments: {
  //      filname: 'A pic',
  //      path: "black.png"
  //   }
  // }
  
  // transporter.sendMail(details,(err)=> {
  //   if(err==null)
  //   console.log("mail sent!");
  //   else
  //   console.log(err);
  // })
  
  })

  app.post("/upd",function(req,resp){
    var email=req.body.txtEmail;
    if(email=="")
    resp.send("Please enter your Email to update!!");
  
    var fileName="nopic.jpg";
    if(req.files!=null)
      {
        fileName=req.files.ppic.name;
        var path=process.cwd()+"/public/uploads/"+fileName;
        req.files.ppic.mv(path);
      }
      else{
        fileName=req.body.hid;
      }
  
    var name=req.body.name;
      var contact=req.body.contact;
      var dob=req.body.dob;
      var gender=req.body.gender;
      var ad=req.body.txtAdd;
      var city=req.body.city;
      var state=req.body.state;
      var id=req.body.id;
    dbRef.query("update rece set Name=?,Contact_Number=?,DOB=?,Gender=?,Address=?,City=?,State=?,ID_Proof=?,Proof_display=? where Email=?",[name,contact,dob,gender,ad,city,state,id,fileName,email],function(err,result){
      if(err==null)
      {
        if(result.affectedRows==1){
          resp.sendFile(__dirname+"/project/dash-rece.html");
          // resp.send("Record updated successfully!!");
        }
      else
      resp.send("Email ID does not exist!");
      }
      else
      resp.send(err);
    })
  })

  app.post("/del",function(req,resp){
    var email=req.body.txtEmail;
    dbRef.query("delete from rece where Email=?",[email],function(err,result){
        if(err==null){
            if(result.affectedRows==1){
              resp.sendFile(__dirname+"/project/dash-rece.html");
            // resp.send("Deleted Successsfullyyy !!");
            }
            else
            resp.send("Invalid email id....");
        }
        else
        resp.send(err);
    })
})

app.get("/get-json",function(req,resp){
  dbRef.query("select * from rece where Email=?",[req.query.kuchEmail],function(err,resultTableJSON){
    if(err==null){
      resp.send(resultTableJSON);
    }
    else
    resp.send(err);
  })
})

app.get("/disable",function(req,resp){
  dbRef.query("select Email from rece where Email=?",[req.query.kuchEmail],function(err,resultTable){
    if(err==null){
      if(resultTable.length==1)
        resp.send("update");
      else
        resp.send("signup");
    }
    else
    resp.send(err);
  })
})

//-----------------  Admin All Records ------------------------------
app.get("/get-records",function(req,resp){
dbRef.query("select * from sign",function(err,resultTable){
  if(err==null)
    resp.send(resultTable);
  else
    resp.send(err);
})
})

app.get("/ang-blk",function(req,resp){
  dbRef.query("update sign set status=0 where email=?",[req.query.kuchEmail],function(err,result){
    if(err==null){
      if(result.affectedRows==1)
      resp.send("Blocked User!!");
      else
      resp.send("Invalid ID");
    }
    else
    resp.send(err);
  })
})

app.get("/ang-res",function(req,resp){
  dbRef.query("update sign set status=1 where email=?",[req.query.kuchEmail],function(err,result){
    if(err==null){
      if(result.affectedRows==1)
      resp.send("Revoked Block on the User!!");
      else
      resp.send("Invalid ID");
    }
    else
    resp.send(err);
  })
})

app.get("/ang-del",function(req,resp){
  dbRef.query("delete from sign where email=?",[req.query.kuchEmail],function(err,result){
    if(err==null){
      if(result.affectedRows==1)
      resp.send("Account Deleted!!");
      else
      resp.send("Invalid ID");
    }
    else
    resp.send(err);
  })
})

//-----------------User Donor Records ------------------------------
app.get("/get-donor-records",function(req,resp){
  dbRef.query("select * from user",function(err,resultTable){
    if(err==null)
      resp.send(resultTable);
    else
      resp.send(err);
  })
  })

//----------------- User Rece Records ------------------------------
app.get("/get-rece-records",function(req,resp){
  dbRef.query("select * from rece",function(err,resultTable){
    if(err==null)
      resp.send(resultTable);
    else
      resp.send(err);
  })
  })

// ---------------- Med Manager ----------------------------------
app.get("/grecords",function(req,resp){
 dbRef.query("select * from ameds where email=?",[req.query.kuchEmail],function(err,resultTable){
  if(err==null)
    resp.send(resultTable);
  else
    resp.send(err);
 })
})

app.get("/del-records",function(req,resp){
  dbRef.query("delete from ameds where srno=?",[req.query.kuchsr],function(err,resultTable){
   if(err==null)
     resp.send(resultTable);
   else
     resp.send(err);
 })
})

//---------------- Meds Finder -----------------------------------
app.get("/fetch-city",function(req,resp){
  dbRef.query("select distinct City from user",function(err,resultTable){
  if(err==null)
    resp.send(resultTable);
  else
    resp.send(err);
  })
})

app.get("/fetch-med",function(req,resp){
  dbRef.query("select distinct med_name from ameds",function(err,resultTable)
  {
  if(err==null)
    resp.send(resultTable);
  else
    resp.send(err);
  })
})

app.get("/fetch-donors",function(req,resp)
{
  // console.log(req.query);
  var med=req.query.medKuch;
  var city=req.query.cityKuch;

  var query="select USER.*,ameds.* from USER inner join ameds on USER.Email=ameds.email where ameds.med_name=? and USER.City=?";
  dbRef.query(query,[med,city],function(err,resultTable)
  {
    // console.log(resultTable+"      "+err);
  if(err==null)
    resp.send(resultTable);
  else
    resp.send(err);
  })
})