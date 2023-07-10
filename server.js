
const express=require("express")
const app=express()


const http=require("http").createServer(app)

const io=require("socket.io")(http)

app.use(express.static(__dirname + '/public'))

app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html");
})

io.on('connection',function(socket){
    console.log("connected");
    socket.on("message",function(msg){
        socket.broadcast.emit("message",msg);

    })
})


http.listen(process.env.PORT || 3001,function(){
    console.log("server started on 3001");
})