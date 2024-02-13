import express, { urlencoded } from "express";
import methodOverride from "method-override";
import ejs from "ejs";
import fs from "fs";
import bodyParser from "body-parser";
import { dirname } from "path";

import path from "path";

import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let tit_list=[];
var newBlog="";
var del_flag=false;
const app= express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const port=3000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.use((req, res, next) => {
    console.log('Method:', req.method);
    next();
});
app.get("/",(req,res)=>{
    //tit_list=[];
    newBlog="";
    res.render("index.ejs");
})

app.get("/seePost",(req,res)=>{
    res.render("seeBlogs.ejs",{ title_list: tit_list});
});

app.post("/post",(req,res)=>{
    res.render("createNew.ejs");
})

app.post("/seePost",(req,res,next)=>{
    if (req.body._method === "PATCH") {
        return next();  // Skip to the next middleware
    }
    if (req.body._method === "DELETE") {
        return next();  // Skip to the next middleware
    }
    newBlog=req.body["title"];
    var flag= false;
    for(var i=0;i<tit_list.length;i++){
        if(tit_list[i]===newBlog){
            flag=true;
        }
    }
    if(flag===false){
        tit_list.push(newBlog);
    }
    
    var data1= req.body["newBlogPost"];
    const fileN = path.join(__dirname, "posts", `${newBlog}.txt`);
    // console.log(fileN);
    
    fs.writeFile(fileN,data1, (err) => {
        if (err) throw err;
        console.log(`The data to append was appended to file ${newBlog}!`);
    });
    // fs.readFile(fileN,"utf8",(err,data)=>{
    //     if(err) throw err;
    //     console.log(data);
    // })
    
    
    
    res.render("seeBlogs.ejs", { title_list: tit_list});

 
});

app.patch("/seePost",(req,res)=>{
    var title=req.body["title"];
    var prev_tit= req.body["prevTitle"];
    const data1=req.body["newBlogPost"];
    if(title != prev_tit){
        for(var i=0;i<tit_list.length;i++){
            if(tit_list[i]===prev_tit){
                tit_list[i]=title;
            }
        }
        const pfileN = __dirname + "/posts/" + prev_tit + ".txt";
        const nfileN = __dirname + "/posts/" + title + ".txt";

        fs.rename(
            pfileN,nfileN,() => {
                console.log("\nFile Renamed!\n");
            });
    }
    
        const fileN = __dirname + "/posts/" + title + ".txt";
        fs.writeFile(fileN,data1, (err) => {
            if (err) throw err;
            console.log(`The data to append was updated to file ${title}!`);
            res.render("seeBlogs.ejs", { title_list: tit_list });
        });
    

});

// Add this route to your existing code
app.get("/posts/:title", (req, res) => {
    const title = req.params.title;
    const filePath = __dirname + "/posts/" + title + ".txt";
    
    // Read the content of the blog post file and render it in a template
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.status(404).send("Blog post not found");
        } else {
            res.render("blogPost.ejs", { title, content: data });
        }
    });
});




app.post("/update/:title", (req, res,next) => {
    // Use method-override to handle DELETE request
    if (req.body._method === "PATCH") {
        return next();  // Skip to the next middleware
    }

    // Your existing code for handling POST requests
    res.send("Invalid request for updating.");
});

app.patch("/update/:title",(req,res)=>{
    const title = req.params.title;
    const fileN = __dirname + "/posts/" + title + ".txt";
    console.log('Updating file:', fileN);
    fs.readFile(fileN, "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.status(404).send("Blog post not found");
        } else {
            res.render("updateBlog.ejs", { title, content: data });
        }
    });

 
});

app.use((req, res, next) => {
    console.log('Method:', req.method);
    next();
});




app.delete("/seePost", (req, res) => {
    const title = req.body["tit"];
    const fileN = __dirname + "/posts/" + title + ".txt";

    console.log('Deleting file:', fileN);  // Add this line for debugging

    fs.unlink(fileN, function (err) {
        if (err) {
            console.error(err);
            res.status(500).send("Error deleting the blog post file");
        } else {
            console.log('File deleted successfully');

            // Remove the deleted title from the tit_list array
            tit_list = tit_list.filter(blogTitle => blogTitle !== title);

            // Render the template after the file is deleted and the array is updated
            if(tit_list.length===0){
                res.render("seeBlogs.ejs",{ title_list: tit_list});
            }
            else{
                res.render("seeBlogs.ejs", { title_list: tit_list});

            }
        }
    });
});

