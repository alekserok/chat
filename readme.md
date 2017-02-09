# simple chat with node.js socket.io redis and jwt-token authorization
## instructions

create .env file and copy .env.example to .env
run npm install
run node server.js to start server

## client js code example

```
var socket = io.connect('http://yourservername.dev:9000', {
        query: 'token=' + token //jwt token generated whith the same secret
    });

    socket.on('connect', function () {
        console.log('authenticated');

    }).on('disconnect', function () {
        console.log('disconnected');
    });

    socket.on('new-message', function (mes) {
        console.log(mes); //process new message
    });
    
    // get history from server
    socket.emit('get-history', id); // id is the person's id
    
    socket.on('history', function (mes) {
        console.log(mes); //process messages history
    });
    
    // send message to server       
    socket.emit('message', {
        to: reseiver-id, 
        from: sender-id, 
        messageText: message-text,
        avatar: avatar, 
        created: new Date().getTime()
    })
    
```
