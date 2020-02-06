const electron = require('electron');
const {dialog} = electron.remote;
const ytdl = require('ytdl-core');
const fs = require('fs');
let path;
window.$ = window.jQuery = require('jquery');

function doTheDownload(name, link){
    const foo = ytdl(link, {
        filter: "audioonly",
        quality: "highest"
    });
    
    if(path)
        foo.pipe(fs.createWriteStream(path[0]+'/'+name+'.mp3'));
    else    
        foo.pipe(fs.createWriteStream(name+'.mp3'));
    
    foo.on('response', (res) =>{
        let totalSize = res.headers['content-length'];  
        let dataTotal = 0;
        $('.placeholder').append(
            "<p id = \"nameRemove\">"+name+":</p>"
            +"<div class=\"progress\" id=\"divRemove\">"
                +"<div class=\"progress-bar progress-bar-striped progress-bar-animated\" id=\"progBar\" role=\"progressbar\" style=\"width: 0%\" aria-valuenow=\"25\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>"
            +"</div>"
            +"<br>"
        );

        res.on("data", (data)=> {
            let buffer = data.length;
            dataTotal += buffer;
            let percentage = dataTotal/totalSize * 100;
            $('#progBar').width(percentage + '%');
            $('#progBar').html(Math.ceil(percentage) + "%");
            
            if(percentage === 100){
                delete foo;
                $('#nameRemove').remove();
                $('#divRemove').remove();
                console.log(foo);
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
        doTheDownload(name, link);
    });
    
    $('#browse').click(()=>{
        openBrowserWindow();
    });
});