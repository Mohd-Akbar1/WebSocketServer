import { WebSocketServer } from "ws";
import http from "http";

import { sendMail } from "./mail.js";

const server=http.createServer();
const wss=new WebSocketServer({server});

wss.on('connection',async(socket)=>{
    console.log('Client connected from server 1 for email');
    socket.on('message',async(message)=>{
        const info=JSON.parse(message);
        if(info.type==="email"){
            const {toEmail,message,job_id}=info
            
            await sendMail(toEmail,message);
            console.log('email sent sucessfully to',toEmail);

            socket.send(JSON.stringify({
                    type: 'job_result',
                    job_id,
                    status: 'success',
                    message:  `Email sent to ${toEmail} successfully`
            }))
        }
        
    })

    
})

server.listen(7000,()=>console.log("Server started on port 7000"));
