In the last six months, the piece of software I have used the most is undoubtably [pla-den-tor](https://github.com/stjet/pla-den-tor). Except for Firefox, that is. Oh, and (neo)vim I guess.

Alright.

In the last six months, the piece of software I have used the third most is undoubtably pla-den-tor.

## What is a pla-den-tor?

Pla-den-tor is one of those word contraction things for "plausible deniability tor" because the original idea was a sort of media server running as a Tor hidden service (a .onion site), password protected^\[0\]^ with [HTTP Basic authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication). The Tor and password part constitute all three of the words in the project title, but 90% of the time, I just run it locally without a password, since I have a USB stick with all the pla-den-tor stuff on it. So the name doesn't really make much sense. There is however, a possibility I run an instance of pla-den-tor as an onion site with the password and everything, for when I don't have that USB on me, at least. Who knows.

Back to what pla-den-tor actually is, it started out as a simple media server with a web interface. It has three categories: anime, manga, and music. For the purposes of this article, let's say everything is completely legally obtained. In each of those three categories, there are arbitrary subcategories. For anime, that would be anime serieses. For manga, it would be... manga serieses. And for music that would be artists. Manga serieses have their own subcategory, chapters, which contain pages.

Essentially, you create a directory for, say, an artist, in the music directory. Drop whatever song files you want in there, and repeat. Then, you run the build script, and it'll generate a bunch of html files linking to them. Every song gets it's own page (and the actual song file is embedded on that page), and each artist gets a page that links to all the song pages. The main page links to all the artists/manga/anime. For manga specifically there is a special viewer that just shows all the pages in the chapter. Oh, and all the song/chapter/episode pages have links back to their artist/manga/anime, as well as links to the next or previous song/chapter/episode. Nothing too fancy at this stage.

This format works well for manga and anime, but not so much for music. I don't want to click a bunch of links to get to the next song when the current song ends. Naturally, a music player was added soon after. After some work, the player got to a point where I'm very satisfied with it. It has a queue (you can only remove or move up items in the queue, no moving down because I was lazy), filters (lots and lots of checkboxes for songs and artists), playlists, history (which I don't really use but might one day in order to make a "spotify wrapped" knockoff), and obviously shuffling.

## Oh yeah, it shows time-synced lyrics too

...of songs that I manually make WebVTT files for. I use a [tool](https://ztmy.prussia.dev/subtitles) from a previous project to make these. It takes some time, especially putting furigana on japanese (and other non-english) songs, but I have *a lot* of tolerance for these kinds of tasks^\[1\]^.

## Why (do I) use pla-den-tor?

All the stuff on there is stuff I already know I like, not new stuff I'm planning to consume. This is for two reasons. The first is that downloading and adding it to pla-den-tor takes some (very little, but yet still non-zero) effort^\[2\]^. The second is that I don't have that much storage space and upgrading it (which I have done several times already) costs money.

This means for anime and manga, where I'm mostly consuming new content, and only ocassionally revisiting old favourites, it isn't used too often. But for music, you usually want to listen to the songs you already like rather than constantly listening to new stuff that on average is not so great. As a result, over 75% of my music listening is now done on either pla-den-tor's player. Another 20% or so is done on a local music player on my phone. All the music there is the same as the pla-den-tor music library. On a bit of a side note, my phone actually can run pla-den-tor, because termux is awesome. But pla-den-tor doesn't show album cover art (well, I haven't bothered to figure out how), so I use a FOSS music player app most of the time. Of course, pla-den-tor will always be missing one part of the streaming experience: discovery. Unfortunately, that will still have to be done on some platform (youtube?), or even worse, asking real people.

## Why not use another FOSS music player?

Specifically regarding local usage of pla-den-tor for music, couldn't I have just used some existing music player app and saved myself some work? You know the answer to that. I like to make my own stuff. Plus, I don't want to spent a few hours poking around some random guy's code and either submit a PR or maintain a fork whenever I want to add some specific feature.

It should be implicit that spotify or similar services are not an option - I am sick of half the listening time being ads (and yes, sick of spending time trying to block them), and even more sick of paying for services with barely functional apps^\[3\]^.

## The code

The code's nothing special. It uses Ryuji for templating and Saki as a build system, same as this blog. The player code is a lot of spaghetti but not excessively so.

===

Footnotes:
- \[0\]: The password actually changes every UTC day. It is derived by hashing a secret master password with the current date
- \[1\]: [See my 1 hour and 18 minutes of concert subtitles](https://github.com/stjet/ztmy/blob/master/static/vtt/cleaning-labo.vtt)
- \[2\]: Besides "legally" downloading it and moving it into the right directory, I also need to manually add some metadata so things look nice when I play music on my phone
- \[3\]: I am mainly basing this comment on my experiences with the official spotify clients, and to a lesser extent apple music. Spotify's clients in particular are absolutely terrible (Why does it have to keep loading and unloading stuff? Just keep it loaded!!! And why does it just randomly stop being responsive? Why are some clients missing the features of other clients?). My understanding is with spotify premium, you can use custom clients, at least

