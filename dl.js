const electron = require('electron');
const {dialog} = electron.remote;
const ytdl = require('ytdl-core');
const fs = require('fs');
const filenamify = require('filenamify');

let path;
let downloads = [];

window.$ = window.jQuery = require('jquery');

function getName(link){
    ytdl.getInfo(link, function(err, info) {
        doTheDownload(filenamify(info.title), link);
    });
}

function doTheDownload(name, link){
    let index;
    let foo = ytdl(link, {
        filter: "audioonly",
        quality: "highest"
    });

    downloads.push(foo);
    index = downloads.indexOf(foo);
    console.log(downloads);
    console.log(index);

    if(path)
        downloads[index].pipe(fs.createWriteStream(path[0]+'/'+name+'.mp3'));
    else    
        downloads[index].pipe(fs.createWriteStream(name+'.mp3'));
    
    downloads[index].on('response', (res) =>{
        let totalSize = res.headers['content-length'];  
        let dataTotal = 0;
        $('.placeholder').append(
            "<p id = \"nameRemove"+index+"\">"+name+":</p>"
            +"<div class=\"progress\" id=\"divRemove"+index+"\">"
                +"<div class=\"progress-bar progress-bar-striped progress-bar-animated\" id=\"progBar\" role=\"progressbar\" style=\"width: 0%\" aria-valuenow=\"25\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>"
            +"</div>"
            +"<br id = \"remBr"+index+"\">"
        );
        
        res.on("data", (data)=> {
            let buffer = data.length;
            dataTotal += buffer;
            let percentage = dataTotal/totalSize * 100;
            $('#progBar').width(percentage + '%');
            $('#progBar').html(Math.ceil(percentage) + "%");
            
            if(percentage === 100){
                $('#nameRemove'+index).remove();
                $('#divRemove'+index).remove();
                $('#remBr'+index).remove();
                downloads.splice(index, 1);
            }
        });
    });            
}

function openBrowserWindow(){
    path = dialog.showOpenDialogSync({properties:['openDirectory']});
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
        openBrowserWindow();
    });
    
    $('#txtdl').click(()=>{
        let bar = dialog.showOpenDialogSync({properties:['openFile']});
        let rawList = fs.readFileSync(bar[0], "utf-8");
        let parsedList = rawList.split("\n");
        parsedList.forEach((x)=>{
            getName(x);
        });
        
    });
});