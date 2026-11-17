const n=value=>Number(value).toLocaleString('es-AR',{maximumFractionDigits:1})
function lines(ctx,text,x,y,max,lineHeight,size,color='#edf7ff',limit=3){ctx.font=`700 ${size}px -apple-system, sans-serif`;ctx.fillStyle=color;const words=String(text).split(' ');let line='',row=0;for(const word of words){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>max&&line){ctx.fillText(line,x,y+row*lineHeight,max);line=word;row++;if(row===limit-1)break;}else line=next;}if(row<limit)ctx.fillText(line,x,y+row*lineHeight,max);return y+(row+1)*lineHeight}
export function drawMoment(canvas,data,photo){
 canvas.width=1080;canvas.height=1920;const c=canvas.getContext('2d');c.fillStyle='#0a1728';c.fillRect(0,0,1080,1920)
 if(photo){const scale=Math.max(1080/photo.width,1920/photo.height);c.drawImage(photo,(1080-photo.width*scale)/2,(1920-photo.height*scale)/2,photo.width*scale,photo.height*scale);c.fillStyle='#051222bf';c.fillRect(0,0,1080,1920)}
 c.strokeStyle='#5ddfd0';c.lineWidth=3;c.strokeRect(60,60,960,1800)
 c.font='700 48px sans-serif';c.fillStyle='#8af3df';c.fillText('fitsync.',104,158)
 c.font='600 25px sans-serif';c.fillStyle='#b3c8dc';c.fillText(data.eyebrow.toUpperCase(),104,280,870)
 lines(c,data.title,104,420,870,90,82)
 c.fillStyle='#8af3df';c.font='700 210px sans-serif';c.fillText(data.value,95,910,880)
 lines(c,data.unit,104,990,850,48,37,'#c7dbe8',2)
 c.strokeStyle='#536c80';c.lineWidth=1;c.beginPath();c.moveTo(104,1110);c.lineTo(976,1110);c.stroke()
 let y=1220;for(const detail of data.details||[])y=lines(c,detail,104,y,850,57,35,'#d5e5f1',2)+44
 c.font='500 27px sans-serif';c.fillStyle='#9db9cf';c.fillText('TU FUERZA, EN DATOS.',104,1770)
}
