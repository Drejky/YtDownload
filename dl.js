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

const onResponse = (stream, name) => {
  const index = downloads.length - 1;
  const totalSize = stream.headers["content-length"];
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

  //Every time piece of data is downloaded, calculate percentage progress
  stream.on("data", (data) => {
    const buffer = data.length;
    dataTotal += buffer;
    const percentage = (dataTotal / totalSize) * 100;
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

const download = (link) => {
  const audioOptions = {
    filter: "audioonly",
    quality: "140",
  };
  ytdl.getInfo(link).then((info) => {
    //Get name for the file
    let name = $("#name").val();
    if (!$("#name").val()) name = filenamify(info.videoDetails.title);
    //Get extention for the file
    const audioExtention = ytdl.chooseFormat(
      info.formats,
      audioOptions
    ).container;

    const videoExtention = ytdl.chooseFormat(info.formats, {
      quality: "highestvideo",
      filter: (format) => format.container === "mp4" && !format.audioEncoding,
    }).container;
    console.log(videoExtention);

    //Start audio download from youtube
    const audioStream = ytdl
      .downloadFromInfo(info, audioOptions)
      .on("response", (stream) => {
        onResponse(stream, name);
      });

    //No video download
    if (toVid === false) {
      // audioStream.pipe(
      //   fs.createWriteStream(path + "/" + name + "." + audioExtention)
      // );
      ffmpeg()
        .input(audioStream)
        .toFormat("mp3")
        .on("error", (err) => {
          console.log("An error occurred: " + err.message);
        })
        .on("progress", (progress) => {
          // console.log(JSON.stringify(progress));
          console.log("Processing: " + progress.targetSize + " KB converted");
        })
        .save(path + "/" + name + ".mp3");
    }
    //Video download
    else {
      const index = downloads.length;
      audioStream
        .pipe(
          fs.createWriteStream(
            "specialSoundPlaceholder" + index + "." + audioExtention
          )
        )
        .on("finish", () => {
          const video = ytdl(link, {
            quality: "highestvideo",
            // filter: (format) =>
            //   format.container === "mp4" && !format.audioEncoding,
          });
          video.on("response", (stream) => {
            const totalSize = stream.headers["content-length"];
            let dataTotal = 0;
            $("#progBar" + index).addClass("bg-success");
            stream.on("data", (data) => {
              dataTotal += data.length;
              const percentage = (dataTotal / totalSize) * 100;
              $("#progBar" + index).width(percentage + "%");
              $("#progBar" + index).html(Math.ceil(percentage) + "%");
            });
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

    //Push the downloaded into a list of downloads
    downloads.push(audioStream);
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
  $(".massInput").val("");
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
