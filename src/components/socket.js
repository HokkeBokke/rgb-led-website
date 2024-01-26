import { io } from 'socket.io-client';
export const socket = io('http://raspberrypi:3000');
export const server = { power: true, color: "#ff0000", brightness: 100 };

socket.on('connect', () => console.log("Connected"));
socket.on('lights on', (powerStatus) => {
  server.power = powerStatus;
});
socket.on('current color', (color) => {
  server.color = color;
});
socket.on('brightness', (value) => { 
  server.brightness = Math.round(value/(255/100));
});