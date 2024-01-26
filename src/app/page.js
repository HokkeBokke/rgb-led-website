'use client'
import { server, socket } from "@/components/socket";
import { useState } from "react";

const hexStrToRGB = (hexstr) => {
  hexstr = hexstr.substr(1);
  let red = hexstr.substr(0, 2);
  let green = hexstr.substr(2, 2);
  let blue = hexstr.substr(4, 2);

  return { r: parseInt(red, 16),
           g: parseInt(green, 16),
           b: parseInt(blue, 16) }
}

const RGBToHSL = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0;
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
};

const HSLToRGB = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
};

export default function ControlLights() {
  const [color, setColor] = useState(server.color);
  const [powerOn, setPowerOn] = useState(server.power);
  const [brightness, setBrightness] = useState(server.brightness);

  socket.on('lights on', (powerStatus) => {
    setPowerOn(Boolean(powerStatus));
  });
  socket.on('current color', (color) => {
    setColor(color);
  });
  socket.on('brightness', (value) => { 
    setBrightness(Math.round(value/(255/100)))
  });

  function togglePower(ev) {
    socket.emit('toggle power');
  }

  function reportColor(ev) 
  {
    socket.emit('rgb value', ev.target.value);
  }

  function reportBrightness(ev) {
    socket.emit('brightness value', ev.target.value);
  }

  function hueChange(ev) {
    let hue = ev.target.value;
    let final = "#";
    let arr = HSLToRGB(hue, 100, 50);
    arr.forEach((num) => {
      let toAdd = num.toString(16);
      if (toAdd.length < 2) final += '0';
      final += toAdd;
    })
    socket.emit('rgb value', final);
  }

  let rgb = hexStrToRGB(color);
  let hue = RGBToHSL(rgb.r, rgb.g, rgb.b)[0];
  let buttonClass = powerOn ? "bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded" : "bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"

  return (
    <div className="flex flex-col items-center m-5 space-y-5">
      <input type="color" value={color} onChange={reportColor} />
      <div className="w-full sm:w-1/2 block">
        <label htmlFor="hue-slider">Hue:</label>
        <input id="hue-slider" type="range" min={0} max={360} className="h-2 appearance-none outline-none rounded-lg w-full" style={{background: "linear-gradient(to right, rgb(255,0,0), rgb(255,255,0), rgb(0,255,0),rgb(0,255,255),rgb(0,0,255),rgb(255,0,255),rgb(255,0,0))"}} onChange={hueChange} value={hue} />
      </div>
      <div className="w-full sm:w-1/2 block">
        <label htmlFor="brightness-slider">Brightness:</label>
        <span className="float-end">{brightness}%</span>
        <input id="brigtness-slider" className="h-2 appearance-none outline-none rounded-lg w-full" style={{background: `linear-gradient(to right, rgb(0,0,0), rgb(${rgb.r},${rgb.g},${rgb.b}))`}} type="range" min={0} max={100} onChange={reportBrightness} value={brightness} />
      </div>
      <input className={buttonClass} type="button" value={"Toggle power"} onClick={togglePower} />
    </div>
  );
}
