const electron = require('electron');
const {dialog} = electron.remote;
const ytdl = require('ytdl-core');
const fs = require('fs');
const filenamify = require('filenamify');

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
    let format;
    let foo;
    openBar();

    if(toVid == false){
        foo = ytdl(link, {
            filter: "audioonly",
            quality: "highestaudio"
        });
        format = '.mp3';
    }
    else if(toVid == true){
        foo = ytdl(link, {
            quality: "highest"
        });
        format = '.mp4';
    }

    downloads.push(foo);
    index = downloads.indexOf(foo);

    if(path)
        downloads[index].pipe(fs.createWriteStream(path[0]+'/'+name+format));
    else    
        downloads[index].pipe(fs.createWriteStream(name+format));
    
    downloads[index].on('response', (res) =>{
        let totalSize = res.headers['content-length'];  
        let dataTotal = 0;
        $('.placeholder').append(
            "<div id = \"toRemove"+index+"\">"
                +"<p class = \"bg-info\">"+name+":</p>"
                +"<div class=\"progress\">"
                    +"<div class=\"progress-bar progress-bar-striped progress-bar-animated\" id=\"progBar\" role=\"progressbar\" style=\"width: 0%\" aria-valuenow=\"25\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>"
                +"</div>"
                +"<br>"
            +"</div>"
        );
        
        res.on("data", (data)=> {
            let buffer = data.length;
            dataTotal += buffer;
            let percentage = dataTotal/totalSize * 100;
            $('#progBar').width(percentage + '%');
            $('#progBar').html(Math.ceil(percentage) + "%");
            
            if(percentage === 100){
                $('#toRemove'+index).remove();
                downloads.splice(index, 1);
                if(downloads.length < 2)
                    closeBar();
            }
        });
    });            
}

function openBrowserWindow(){
    path = dialog.showOpenDialogSync({properties:['openDirectory']});
}

function openBar(){
    $('#sidebar').width(250);
    //$('body').css('marginLeft', 250+'px');
}

function closeBar(){
    $('#sidebar').width(0);
    //$('body').css('marginLeft', 0+'px');
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

    $('#toVideo').click(()=>{
        if($('#toVideo').prop("checked") == true)
            toVid = true;
        else
            toVid = false;
    });

});