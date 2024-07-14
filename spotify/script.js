// ================Global Variables==================
let currentSong = new Audio()
let songName
let songFName
let songs
let currentFolder = "bollywood"
let albums=[]

async function getSongs(folder) {
    currentFolder = folder
    let x = await fetch(`songs/${currentFolder}/`)
    let response = await x.text()
    //  console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    //    console.log(as)
    songs = []
    for (let i = 0; i < as.length; i++) {
        let element = as[i]
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href)
            // console.log(element.href)
        }
    }

    // Add songs to the library
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";  // Clear the list before adding songs
    //store song link first part
    let songFirstPart = songs[0].split(`/${currentFolder}/`)[0];
    songFirstPart = `${songFirstPart}/${currentFolder}/`;
    // console.log(songFirstPart)
    for (const song of songs) {
        let s = song.split(`/${currentFolder}/`)[1];
        let songTitle = s.replaceAll("%20", " ").replace(".mp3", "");
        let songParts = songTitle.split("-");
        let artist = songParts[1];
        let title = songParts[0];

        // Add song to the list
        songUL.innerHTML += `<li>
             <img src="music.svg" alt="">
             <div class="info">
                 <div class="title">${title}</div>
                 <div class="artist">By: ${artist}</div>
             </div>
             <div class="playnow">
                 <span>Play now</span>
                 <img src="play.svg" alt="">
             </div>
         </li>`;
    }


    // Assuming you want to get the full song name of the first song in the list
    // Load the full song names for all songs in the list
    document.querySelectorAll(".songList ul li ").forEach(firstSongInfo => {
        firstSongInfo.addEventListener("click", e => {
            songFName = firstSongInfo.querySelector(".title").textContent;
            let songLName = firstSongInfo.querySelector(".artist").textContent.replace("By: ", "").trim();
            songName = `${songFirstPart}${songFName}-${songLName}.mp3`;
            songName = songName.replaceAll(" ", "%20")
            // console.log(songName);
            PlaySong(songName)

        })

    });

}


const playBtn = document.querySelector(".playbtn");
let setName = document.querySelector(".songName");
let setTime = document.querySelector(".songtime").innerText = "00:00 / 00:00"

// ==================================

function PlaySong(songname, pause = false) {
    setName.innerText = songname.split(`/${currentFolder}/`)[1].replaceAll("%20", " ").replace(".mp3", "").split("-")[0]

    if (pause) {
        currentSong.src = songname
        playBtn.src = "pause.svg";
        currentSong.play()
    } else {
        playBtn.src = "pause.svg";
        playBtn.innerHTML = `<img src="pause.svg" alt="">`
        currentSong.src = songname
        // setName.innerText=songF
        currentSong.play();
    }


}

function secToMin(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = secs < 10 ? `0${secs}` : `${secs}`;
    return `${formattedMinutes}:${formattedSeconds}`;
}

let card=document.querySelector(".playlists")
let cards

async function displayAlbums() {
        let response = await fetch(`songs/`);
        let textResponse = await response.text();
        
        let div = document.createElement("div");
        div.innerHTML = textResponse;
        
        let as = div.getElementsByTagName("a");
        let albums = [];
        let albumsContainer = document.querySelector(".playlists");
        for (let i = 0; i < as.length; i++) {
            if (as[i].href.match("/songs/")) {
                let folder = as[i].href.split("/songs/")[1];
                albums.push(folder);
                //get meta discription
                    let metaResponse = await fetch(`songs/${folder}/info.json`);
                    let metadata = await metaResponse.json();
                    console.log(metadata);

                      albumsContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="img-container">
                        <img src="songs/${folder}/cover.jpg" alt="">
                        <button class="play-btn"><img src="playBtn.svg" alt="Play Button"></button>
                    </div>
                    <div>
                        <h2>${metadata.title}</h2>
                    </div>
                    <p>${metadata.description}</p>
                </div>
            `;
               
            }
        }

        //add an event listner when the playlist will clicked
        let cards = document.querySelectorAll(".card");
        cards.forEach((card) => {
            card.addEventListener("click", async () => {
                let folder = card.dataset.folder;
                // console.log(`Folder: ${folder}`);
               await getSongs(folder);
              PlaySong(songs[0])
            });
        });
   
}

async function main() {
    songs = await getSongs(`${currentFolder}`);

    //display all the albums
    displayAlbums();

    playBtn.addEventListener("click", () => {

        if (currentSong.paused) {
            // if (currentSong.src == "") {
            //     PlaySong(songs[0], true)
            // }
            // console.log("src:",currentSong.src)
            playBtn.src = "play.svg";
            playBtn.innerHTML = `<img src="pause.svg" alt="">`
            currentSong.play();
        }
        else {
            // console.log("src:",currentSong.src)
            playBtn.src = "pause.svg";
            playBtn.innerHTML = `<img src="play.svg" alt="">`
            currentSong.pause();
        }

    });

    //update time and run seek bar
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration/60)
        document.querySelector(".songtime").innerText = `${secToMin(currentSong.currentTime)} / ${secToMin(currentSong.duration)} `
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    });
    //add an event listner to move seekbar 
    let seekbar = document.querySelector(".seekbar")
    seekbar.addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration / 100) * percent
    })

    //add an event listner to hamburger
    // let hamOpen=false;
    let hamburger = document.querySelector(".hamburger")
    hamburger.addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
        document.querySelector(".right").style.position = "fixed"
        // document.querySelector(".right").style.left="-100%"
        document.querySelector(".right").style.zIndex = "0"
        document.querySelector(".left").style.zIndex = "1"
        document.querySelector(".left").style.position = "relative"
        document.querySelector(".left").style.width = "80vw"


    })
    //add an event listner to close hamburger
    let cross = document.querySelector(".cross")
    cross.addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
        document.querySelector(".left").style.position = "absolute"
        document.querySelector(".left").style.width = "25vw"
        document.querySelector(".right").style.position = "absolute"

    })

    //add an event listner to perv and next
    let next = document.querySelector(".next")
    let prev = document.querySelector(".prev")
    prev.addEventListener("click", () => {
        // console.log("before")
        let currentIndex = songs.indexOf(currentSong.src)
        if (currentIndex === 0) {
            currentIndex = songs.length - 1;
        } else {
            currentIndex--;
        }
        PlaySong(songs[currentIndex]);

    })
    next.addEventListener("click", () => {
        // console.log("next")
        let currentIndex = songs.indexOf(currentSong.src)
        if (currentIndex === songs.length - 1) {
            currentIndex = 0;
        } else {
            currentIndex++;
        }

        PlaySong(songs[currentIndex]);

    })

    //add an event listner to volume
    let volBtn = document.querySelector(".volume img")

    let vol = document.querySelector(".range input");
    vol.addEventListener("change", (e) => {
        let volumeValue = e.target.value;
        // console.log(volumeValue);
        if (currentSong) {
            volBtn.src="volume.svg"
            currentSong.volume = volumeValue / 100;
            if(document.querySelector(".range input").value==0){
                volBtn.src="lowVol.svg"
            }
        }
    });

    //add an eventlistner ro vol btn , when btn click vol mute
    
    volBtn.addEventListener("click", () => {
        if (currentSong) {
            if (currentSong.volume == 0) {
                volBtn.src="volume.svg"
                document.querySelector(".range input").value=10
                currentSong.volume = 1;
            }
            else {
                volBtn.src="lowVol.svg"
                document.querySelector(".range input").value=0
                currentSong.volume = 0;
            }
        }
    })
    
   

}

main();







