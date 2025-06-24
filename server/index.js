import {WebSocketServer,WebSocket} from 'ws';
import { generateFromUserInput } from './gemini.js'; 
import http from 'http';

const server = http.createServer();
const wss = new WebSocketServer({ server });

const server2=new WebSocket("ws://localhost:7000")




const JobId=new Map()
wss.on('connection', (socket) => {


  console.log('Client connected server1');

        socket.send('👋 Welcome to Gemini chat!');

  setTimeout(() => {
    socket.send('Ask me anything...');

    //connecting another socket web server

    
  }, 1300);

    server2.on('open', () => {
        console.log('Client connected from server 2');
        
    })
  
  socket.on('message', async (message) => {

    const userMessage = message.toString(); 

    //------------------------if user sends email----------------

    if(userMessage.startsWith("@email")) {

      const parts = userMessage.split(" ");
      const job_id=Date.now().toString()
      JobId.set(job_id,socket)

     const payload={
        type:"email",
        toEmail:parts[1],
        message:parts.slice(2).join(" ").toString(),
        job_id
      }
      console.log('payload',payload)

      server2.send(JSON.stringify(payload))
      //call server 2 and send email


      server2.on('message', (msgBuffer) => {
        const data = JSON.parse(msgBuffer.toString());

        if (data.type === 'job_result') {
          const clientSocket = JobId.get(data.job_id);

          if (clientSocket) {
            clientSocket.send(`📨 [Server2] ${data.message}`);
            JobId.delete(data.job_id); // cleanup
          }
        }
      });

      console.log('email sent to server 2 ',payload)
      return
      

      




  
      
    }
    console.log('Received:', userMessage);

    //--------------if user asks to generate image-----------------------------

    if(userMessage.includes('image')) {
      socket.send('Generating image...');
      const response = await generateFromUserInput(userMessage); // Gemini response
      // socket.send(response);

      const duplex = createWebSocketStream(ws, { encoding: 'utf8' });

duplex.on('error', console.error);

duplex.pipe(process.stdout);
process.stdin.pipe(duplex);
      return;
    }



    //--------------ends chat-------------------------------

    if(userMessage.includes('bye' )) {
      socket.send('Goodbye!');
      socket.close();
      return;
    }

    try {
      const response = await generateFromUserInput(userMessage); // Gemini response
      socket.send(response);
    } catch (err) {
      console.error('Gemini error:', err);
      socket.send('Something went wrong ');
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(8000, () => {
  console.log('Server started on ws://localhost:8000');
});
