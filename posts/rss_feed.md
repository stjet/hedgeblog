After 4 ([1](https://github.com/jetstream0/hedgeblog/commit/ccb848a9afdb7405d1cf6018c537aae803fe4199) [2](https://github.com/jetstream0/hedgeblog/commit/500cbd6f0217095541e5462d76282d8a40f116a9) [3](https://github.com/jetstream0/hedgeblog/commit/64889b8fae77199a4bad0c0e7915bc9f7a9f5fa9) [4](https://github.com/jetstream0/hedgeblog/commit/2a1ca739369ff2a364116510c207d5531b915b07)) painful commits, the RSS feed is up and running! And this post should confirm that, hopefully.

I used [Planet KDE's RSS Feed](https://planet.kde.org/global/atom.xml) and W3C's [explanation of Atom](https://validator.w3.org/feed/docs/atom.html) for reference. W3C's [validator](https://validator.w3.org/feed/#validate_by_input) and Firefox's XML parsing thing were helpful in figuring out what exactly was wrong with the RSS feed during my testing and first three miserable commits, since Akregator (my RSS client), just told me it was invalid, with no error explanation or real error message.

Some minor improvements were made to [Ryuji](/posts/ryuji-docs) (my templating "language") as part of this. Unrelated, a Rust version of Ryuji is being worked on. Hopefully, it'll be faster than the typescript implementation, and some cool ideas involving Ryuji will pop up *eventually*. For now, it's just mostly a way to prevent my Rust from getting rusty.

But that's not very interesting to write or read about, so let me wrap it up. RSS is pretty cool. This blog has a RSS feed now. Plus, having to make multiple commits that could've just been one (if I made less mistakes and tested better) is frustrating. Also, I now finally kinda know how to use (neo)vim. Yay.

You can find the feed at [https://www.prussiafan.club/atom.xml](https://www.prussiafan.club/atom.xml).
