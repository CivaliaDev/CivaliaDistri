const express = require('express');
const app = express();
const port = 7548;

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: port });

wss.on('connection', ws => {
  console.log('Nouvelle connexion WebSocket établie');

  ws.on('message', message => {
    if(message.toString().startsWith("@login@")){
      console.log('Connexion WebSocket établie');
    }
  });

  ws.on('close', () => {
    console.log('Connexion WebSocket fermée');
  });
});

app.listen(port, () => {
  console.log(`Serveur Express démarré sur le port ${port}`);
});