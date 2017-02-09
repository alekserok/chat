require('dotenv').config();
var fs = require("fs");
var app = require('express')();
var express = require('express');
var path = require('path');
var randomstring = require("randomstring");
var server = require('http').Server(app);
var socketioJwt = require('socketio-jwt');
var io = require("socket.io")(server);
var redis = require('redis').createClient(); //creates a new client

app.use(express.static(path.join(__dirname, 'public')));

var users = {};

redis.on("error", function (err) {
    writeLog(err);
});

io.use(socketioJwt.authorize({
    secret: process.env.SECRET,
    handshake: true
}));

io.on('connection', function (socket) {
    
    console.log('user ' + socket.decoded_token.id + ' connected');
    users[socket.decoded_token.id] = socket.id;

    socket.on('get-history', function (id) {
        // configure last messages amount
        redis.lrange(socket.decoded_token.id + ':' + id, 0, -1, function (err, obj) {
            if (err) writeLog(err);
            socket.emit('history', obj)
        })
    });

    socket.on('message', function (mes) {
        saveMessage(mes)
    });

    function saveMessage(mes) {
        redis.rpush([socket.decoded_token.id + ':' + mes.to, JSON.stringify(mes)]);
        redis.rpush([mes.to + ':' + socket.decoded_token.id, JSON.stringify(mes)]);
        socket.to(users[mes.to]).emit('new-message', mes);
    }

    socket.on('send-file', function(id, avatar, name, buffer) {
        
        var fileName = '/uploads/' + randomstring.generate(7) + name;

        fs.open(__dirname + '/public' + fileName, 'a', 0755, function(err, fd) {
            if (err) {
                writeLog(err);
                throw err;
            }

            fs.write(fd, buffer, null, 'Binary', function(err, written, buff) {
                fs.close(fd, function() {
                    var message = {
                        to: id,
                        from: socket.decoded_token.id,
                        messageText: '',
                        avatar: avatar,
                        created: new Date().getTime(),
                        file: fileName
                    };
                    saveMessage(message);
                    socket.emit('file-uploaded', message)
                });
            })
        });

    });
});

server.listen(process.env.PORT, function () {
    writeLog('listening on http://localhost:' + process.env.PORT);
});

function writeLog(mes) {
    console.log(mes);
    fs.appendFile('log.txt', new Date() + ' :: ' + JSON.stringify(mes) + '\n', function (err) {
        if (err) throw err;
    });
}