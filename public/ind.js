
const socket=io()

let name="\0";
let textarea=document.querySelector("#textarea");
let messageArea=document.querySelector(".message-area");
let button=document.querySelector("#button");
do{
    name=prompt("enter your name");
}while(!name)

button.addEventListener("click",sendMessage); 
textarea.addEventListener("keyup",function(event){

    

    if((event.key==='Enter')&&(!(event.shiftKey)))
    {
        sendMessage();
    }
})
function sendMessage()
{
    let msg={
        user:name,
        message:textarea.value.trim()
    }
    //append now
    appendMessage(msg,"outgoing");
    textarea.value=""
    scrollToBottom();

    //send to server
    socket.emit("message",msg);

}
function appendMessage(msg,type)
{
    let mainDiv=document.createElement('div');
    let className=type;
    mainDiv.classList.add(className,"message");

    let markup= `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
    
    `
    mainDiv.innerHTML=markup
    messageArea.appendChild(mainDiv);
}

//receiving messaages
socket.on('message',function(msg){
    appendMessage(msg,"incoming");
    scrollToBottom();
})

function scrollToBottom()
{
    messageArea.scrollTop = messageArea.scrollHeight
}
