const electron = require('electron');
const lePath = require('path');
const {dialog} = electron.remote;
const ytdl = require('ytdl-core');
const fs = require('fs');
const filenamify = require('filenamify');
const ffmpegPath = (lePath.join(__dirname, '\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe' ))//.replace('app.asar', 'app.asar.unpacked');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath)


module.exports = ffmpeg;

let path;
let toVid = false;
let downloads = [];

window.$ = window.jQuery = require('jquery');

function getName(link){
    ytdl.getInfo(link, function(err, info) {
        doTheDownload(filenamify(info.title), link);
    });
}

function doTheDownload(name, link){
    let index;
    let foo;
    openBar();

    const onResponse = (stream) => {
        let totalSize = stream.headers['content-length'];  
        let dataTotal = 0;
        $('.placeholder').append(
            "<div id = \"toRemove"+index+"\">"
                +"<p style=\"color: #00abcd;\">"+name+":</p>"
                +"<div class=\"progress\">"
                    +"<div class=\"progress-bar progress-bar-striped progress-bar-animated\" id=\"progBar"+ index +"\" role=\"progressbar\" style=\"width: 0%\" aria-valuenow=\"25\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>"
                +"</div>"
                +"<br>"
            +"</div>"
        );
        
        stream.on("data", (data)=> {
            let buffer = data.length;
            dataTotal += buffer;
            let percentage = dataTotal/totalSize * 100;
            $('#progBar'+index).width(percentage + '%');
            $('#progBar'+index).html(Math.ceil(percentage) + "%");
        });
        
        if(toVid == false){
            stream.on("end", ()=>{
                $('#toRemove'+index).remove();
                downloads.splice(index, 1);
                if($('.placeholder').is(':empty'))
                    closeBar();
            });
        }
    }

    if(toVid == false){
        foo = ytdl(link, {
            filter: "audioonly",
            quality: "highestaudio"
        });
    
        downloads.push(foo);
        index = downloads.indexOf(foo);

        if(path)
            downloads[index].pipe(fs.createWriteStream(path[0]+'/'+name+'.mp3'));
        else    
            downloads[index].pipe(fs.createWriteStream(name+'.mp3'));
        
        downloads[index].on('response', onResponse); 
    }
    else{
        let finalDir
        foo = ytdl(link, {
            quality: "highestaudio",
            filter: format => format.container === 'mp4' && !format.qualityLabel
        });
    
        downloads.push(foo);
        index = downloads.indexOf(foo);

        if(path)
            finalDir = path[0] + '/' + name + '.mp4';
        else    
            finalDir = __dirname + '/' + name + '.mp4';

        downloads[index].pipe(fs.createWriteStream('specialSoundPlaceholder'+index+'.mp4'));
        downloads[index].on('response', onResponse);  
        downloads[index].on('finish', ()=>{
            const video = ytdl(link, {
                quality: "highestvideo",
                filter: format => format.container === 'mp4' && !format.audioEncoding    
            });
            video.on('response', (stream)=>{
                let totalSize = stream.headers['content-length'];  
                let dataTotal = 0;
                $('#progBar'+index).addClass("bg-success");
                stream.on("data", (data)=>{
                    let buffer = data.length;
                    dataTotal += buffer;
                    let percentage = dataTotal/totalSize * 100;
                    $('#progBar'+index).width(percentage + '%');
                    $('#progBar'+index).html(Math.ceil(percentage) + "%");
                })
            });
            ffmpeg()
                .input(video)
                .videoCodec('copy')
                .input('specialSoundPlaceholder'+index+'.mp4')
                .audioCodec('copy')
                .save(finalDir)
                .on('error', console.error)
                .on('end', ()=>{
                    fs.unlink('specialSoundPlaceholder'+index+'.mp4', err =>{
                        if(err) console.error(err);
                        else {
                            $('#toRemove'+index).remove();
                            downloads.splice(index, 1);
                            if($('.placeholder').is(':empty'))
                                closeBar(); 
                        }
                    });
                });
        });   
    }       
}



function openBar(){
    $('#sidebar').width(250);
}

function closeBar(){
    $('#sidebar').width(0);
}

$(document).ready(()=>{
    $('#dl').click(()=>{
        let name = $('#name').val();
        let link = $('#link').val();
        if(!link)
            alert("You didn't put in any links");
        
        if(!name){
            getName(link);
        }
        else
            doTheDownload(name, link);
    });
    
    $('#browse').click(()=>{
        path = dialog.showOpenDialogSync({properties:['openDirectory']});
    });
    
    $('#txtdl').click(()=>{
        let bar = dialog.showOpenDialogSync({properties:['openFile']});
        let rawList = fs.readFileSync(bar[0], "utf-8");
        let parsedList = rawList.split("\n");
        parsedList.forEach((x)=>{
            getName(x);
        });
        
    });

    $('#toVideo').click(()=>{
        if($('#toVideo').prop("checked") == true)
            toVid = true;
        else
            toVid = false;
    });

});