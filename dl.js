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
const { data } = require("jquery");
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = ffmpeg;

let settings = JSON.parse(fs.readFileSync("./settings.json"));
let path = settings.path;
let toVid = false;
let downloads = [];

window.$ = window.jQuery = require("jquery");
$("#currentPath").html(path);

const doTheDownload = (link) => {
  //For each download
  const onResponse = (stream, name) => {
    const index = downloads.length - 1;
    let totalSize = stream.headers["content-length"];
    let dataTotal = 0;
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

    stream.on("data", (data) => {
      let buffer = data.length;
      dataTotal += buffer;
      let percentage = (dataTotal / totalSize) * 100;
      $("#progBar" + index).width(percentage + "%");
      $("#progBar" + index).html(Math.ceil(percentage) + "%");
    });

    if (toVid == false) {
      stream.on("end", () => {
        $("#toRemove" + index).remove();
        downloads.splice(index, 1);
      });
    }
  };

  //No video download
  if (toVid === false) {
    downloads.push(
      ytdl.getInfo(link).then((info) => {
        //Get name for the file
        let name = $("#name").val();
        if (!$("#name").val()) name = filenamify(info.videoDetails.title);

        //Get extention for the file
        const extention = ytdl.chooseFormat(info.formats, {
          filter: "audioonly",
          quality: "140",
        }).container;

        //Start download from youtube and pipe it into a file
        ytdl
          .downloadFromInfo(info, {
            filter: "audioonly",
            quality: "140",
          })
          .on("response", (stream) => {
            onResponse(stream, info.videoDetails.title);
          })
          .pipe(fs.createWriteStream(path + "/" + name + "." + extention));
      })
    );
  }
  //Video
  else {
    const index = downloads.length;
    downloads.push(
      ytdl.getInfo(link).then((info) => {
        //Get name for the file
        let name = $("#name").val();
        if (!$("#name").val()) name = filenamify(info.videoDetails.title);

        ytdl
          .downloadFromInfo(info, {
            quality: "140",
            filter: (format) =>
              format.container === "mp4" && !format.qualityLabel,
          })
          .on("response", (stream) => {
            onResponse(stream, info.videoDetails.title);
          })
          .pipe(
            fs.createWriteStream("specialSoundPlaceholder" + index + ".mp4")
          )
          .on("finish", () => {
            const video = ytdl(link, {
              quality: "highestvideo",
              filter: (format) =>
                format.container === "mp4" && !format.audioEncoding,
            });
            video.on("response", (stream) => {
              let totalSize = stream.headers["content-length"];
              let dataTotal = 0;
              $("#progBar" + index).addClass("bg-success");
              stream.on("data", (data) => {
                dataTotal += data.length;
                let percentage = (dataTotal / totalSize) * 100;
                $("#progBar" + index).width(percentage + "%");
                $("#progBar" + index).html(Math.ceil(percentage) + "%");
              });
            });
            ffmpeg()
              .input(video)
              .videoCodec("copy")
              .input("specialSoundPlaceholder" + index + ".mp4")
              .audioCodec("copy")
              .save(path + "/" + name + ".mp4")
              .on("error", console.error)
              .on("end", () => {
                fs.unlink("specialSoundPlaceholder" + index + ".mp4", (err) => {
                  if (err) console.error(err);
                  else {
                    $("#toRemove" + index).remove();
                    downloads.splice(index, 1);
                  }
                });
              });
          });
      })
    );
  }
};

//Listeners
$("#dl").on("click", () => {
  let link = $("#link").val();
  if (!link) {
    new Notification("Bruh", { body: "You didn't put any link in" });
    return 0;
  }
  doTheDownload(link);
});

$("#browse").on("click", () => {
  ipcRenderer.send("request-path");
});

$("#txtdl").on("click", () => {
  let rawList = fs.readFileSync(bar[0], "utf-8");
  let parsedList = rawList.split("\n");
  parsedList.forEach((x) => {
    doTheDownload(x);
  });
});

$("#toVideo").on("click", () => {
  if ($("#toVideo").prop("checked") == true) toVid = true;
  else toVid = false;
});

ipcRenderer.on("path-selected", (event, sentPath) => {
  path = sentPath;
  $("#currentPath").html(sentPath);
  settings.path = sentPath;
  fs.writeFileSync("./settings.json", JSON.stringify(settings));
});
