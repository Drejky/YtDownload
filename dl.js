const { ipcRenderer } = require("electron");
const lePath = require("path");
const ytdl = require("ytdl-core");
const fs = require("fs");
const filenamify = require("filenamify");
const ffmpegPath = lePath.join(
  __dirname,
  "\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe"
); //.replace('app.asar', 'app.asar.unpacked');
const ffmpeg = require("fluent-ffmpeg");
const os = require("os");
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = ffmpeg;

let settings = JSON.parse(fs.readFileSync(__dirname + "/settings.json"));
//First time boot check
if (settings.path === "none") {
  settings.path = `C:/users/${os.userInfo().username}/Downloads`;
  fs.writeFileSync(__dirname + "/settings.json", JSON.stringify(settings));
}
let path = settings.path;
let toVid = false;
let downloads = [];

window.$ = window.jQuery = require("jquery");
$("#currentPath").html(path);

const download = (link) => {
  const audioOptions = {
    filter: "audioonly",
    quality: "140",
  };

  ytdl.getInfo(link).then((info) => {
    //Get name for the file
    let name = $("#name").val();
    if (!$("#name").val()) name = filenamify(info.videoDetails.title);
    const index = downloads.length;

    //Get extention for the file
    const audioExtention = ytdl.chooseFormat(
      info.formats,
      audioOptions
    ).container;

    const videoExtention = ytdl.chooseFormat(info.formats, {
      quality: "highestvideo",
      filter: (format) => format.container === "mp4" && !format.audioEncoding,
    }).container;

    //Start audio download from youtube
    const audioStream = ytdl
      .downloadFromInfo(info, audioOptions)
      .on("progress", (chLen, data, total) => {
        //Every time piece of data is downloaded, calculate percentage progress
        const percentage = (data / total) * 100;
        $("#progBar" + index).width(percentage + "%");
        $("#progBar" + index).html(Math.ceil(percentage) + "%");
      });

    //Add a popup with download
    //Has to be here because there is multiple response events now
    $("#sidebar").append(
      `    <div id="toRemove${index}" class="dwCard">
        <p class="cardTitle">${name}</p>
        <div class="progress">
          <div
            class="progress-bar progress-bar-animated"
            id="progBar${index}"
            role="progressbar"
            style="width: 0%"
          >
          </div>
        </div>
      </div>`
    );

    //Push the downloaded into a list of downloads
    downloads.push(audioStream);

    //No video download
    if (toVid === false) {
      ffmpeg()
        .input(downloads[index])
        .toFormat("mp3")
        .on("error", (err) => {
          console.log("An error occurred: " + err.message);
        })
        .save(path + "/" + name + ".mp3");
    }
    //Video download
    else {
      downloads[index]
        .pipe(
          fs.createWriteStream(
            "specialSoundPlaceholder" + index + "." + audioExtention
          )
        )
        .on("finish", () => {
          const video = ytdl(link, {
            quality: "highestvideo",
          });
          video.on("progress", (chlen, data, total) => {
            $("#progBar" + index).addClass("bg-success");
            //Every time piece of data is downloaded, calculate percentage progress
            const percentage = (data / total) * 100;
            $("#progBar" + index).width(percentage + "%");
            $("#progBar" + index).html(Math.ceil(percentage) + "%");
          });
          ffmpeg()
            .input(video)
            .videoCodec("copy")
            .input("specialSoundPlaceholder" + index + "." + audioExtention)
            .audioCodec("copy")
            .save(path + "/" + name + "." + videoExtention)
            .on("error", console.error)
            .on("end", () => {
              fs.unlink(
                "specialSoundPlaceholder" + index + "." + audioExtention,
                (err) => {
                  if (err) console.error(err);
                  else {
                    $("#toRemove" + index).remove();
                    downloads.splice(index, 1);
                  }
                }
              );
            });
        });
    }
  });
};

//Listeners
$("#dl").on("click", () => {
  let link = $("#link").val();
  if (!link) {
    new Notification("Bruh", { body: "You didn't put any link in" });
    return 0;
  }
  download(link);
});

$("#browse").on("click", () => {
  ipcRenderer.send("request-path");
});

$("#dlMassButton").on("click", () => {
  let rawList = $(".massInput").val();
  let parsedList = rawList.split("\n");
  parsedList.forEach((x) => {
    download(x);
  });
});

$("#toVideo").on("click", () => {
  if ($("#toVideo").prop("checked") == true) toVid = true;
  else toVid = false;
});

$("#showMore").on("click", () => {
  if ($(".massDownload").hasClass("begone")) {
    $(".massDownload").removeClass("begone");
    $("#showMore").html("less");
  } else {
    $(".massDownload").addClass("begone");
    $("#showMore").html("more");
  }
});

ipcRenderer.on("path-selected", (event, sentPath) => {
  path = sentPath;
  $("#currentPath").html(sentPath);
  settings.path = sentPath;
  fs.writeFileSync(__dirname + "/settings.json", JSON.stringify(settings));
});
