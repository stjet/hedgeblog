Like most people, I like listening to music.

Also like most people, I don't like listening to ads or paying subscriptions^\[0\]^. Spotify's free tier is pretty good, and I can block their ads by using the web player and uBlock Origin.

I'm mostly content with that, but there are still some annoyances - I can't listen offline, the UI is a little frustrating, and even though the ads are blocked, the player still sometimes freezes when an ad is supposed to be playing (so the next song isn't played, have to reload the page). Combined with not morally being a fan of relying on a for-profit third-party service for my music, I decided today to write a few scripts to download all the songs on my favourite Spotify playlist (around 60 songs).

First step is getting all the song and artist names on my playlist from Spotify. I did find an [Spotify API endpoint](https://developer.spotify.com/documentation/web-api/reference/get-playlists-tracks), but it seemed like a pain with OAuth required. Instead, I just opened the playlist in my browser. After scrolling down to load all the playlist tracks, I ran something similar to the following to get all the track names:

```javascript
[...document.querySelectorAll(".iCQtmPqY0QvkumAOuCjr")].map((d) => d.innerText) 
```

After a bit of processing with Javascript, vim find-and-replace commands, and a few manual corrections, I ended up with a `songs.txt` file in this format:

```
1|Alice in Freezer|Orangestar
2|無人駅|n-buna
...and so on
```

Now that we have all the song and artist names, we need to fetch the Youtube urls of the songs, so we can download them with [yt-dlp](https://github.com/yt-dlp/yt-dlp).

It turns out the Youtube search API also needs an API key, so I used the [usetube](https://github.com/valerebron/usetube) npm package, which scrapes the actual web page instead of using the API. Here's the code:

```javascript
const fs = require("fs");
const yt = require("usetube");

async function main() {
  let songs = fs.readFileSync("../songs.txt", "utf-8").split("\n");
  for (let i = 0; i < songs.length; i++) {
    let song_name = songs[i].split("|")[1];
    let artist_name = songs[i].split("|")[2];
    console.log(song_name+" "+artist_name);
    const videos = (await yt.searchVideo(song_name+" "+artist_name)).videos;
    songs[i] = songs[i]+"|https://youtube.com/watch?v="+videos[0].id;
    console.log(songs[i].split("|")[3]);
  }
  fs.writeFileSync("../songs.txt", songs.join("\n"), "utf-8");
}

main();
```

Now `songs.txt` looks a little like this:

```
1|Alice in Freezer|Orangestar|https://youtube.com/watch?v=jQmYZWjLwzw
2|無人駅|n-buna|https://youtube.com/watch?v=G8PFPUCNOg4
...and so on
```

The final step is just writing a bash script to download all the songs. I don't really know much bash, but after a few StackOverflow searches, I got a working script:

```bash
#!/bin/bash

while IFS= read -r line; do
  IFS='|' read -ra ADDR <<< "$line"
  for i in "${!ADDR[@]}"; do
    printf "\n${ADDR[$i]}"
    if [ $i -eq 3 ]; then
      yt_dlp -x --audio-format mp3 "${ADDR[$i]}"
    fi
  done
done < songs.txt
```

Yay!

This was a pretty "boring" project that didn't involve much thinking or code. But being able to automate small, tedious stuff like this is a pretty underrated perk of having even a little programming knowledge.

===
- \[0\]: It's almost like artists are people too, and need to make money to support themselves! In all seriousness though, Spotify pays artists something like $0.003 USD per stream. It makes much more sense to support them through buying albums or going to concerts, instead of wasting time listening to ads. Also, ads just suck.
