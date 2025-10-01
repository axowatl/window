// import { JSFrame } from 'jsframe.js';

const jsFrame = new JSFrame();
const frame = jsFrame.create({
    title: 'Window',
    left: 20, top: 20, width: 320, height: 220,
    movable: false,//Enable to be moved by mouse
    resizable: false,//Enable to be resized by mouse
    html: '<div id="my_element" style="padding:10px;font-size:12px;color:darkgray;">Contents of window</div>'
});
