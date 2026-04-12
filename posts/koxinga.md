Recently, [Koxinga](https://git.elintra.net/stjet/koxinga), the text-based browser for [ming-wm](https://git.elintra.net/stjet/ming-wm) was bumped to version 1.0.0!

The big new thing is support for forms with text inputs that send a GET request on submit. For me, this primarily means Wikipedia's search box is now supported. Yay!

The interface and UX has been overhauled to be more similar to Malvim, the Vim-like text editor bundled with ming-wm. Some bugs and annoying things were fixed. The usual. Here are some fun images, the same ones in the README.md:

![Stallman.org](/images/koxinga_within.png)
![en.wikipedia.org](/images/koxinga_wiki.png)
![news.ycombinator.com](/images/koxinga_hn.png)

I plan to mostly use it to browse Wikipedia and HN, so I'm not too worried about the browser becoming useless^\[0\]^. It's quite unfortunate that so many sites cannot be simply rendered, or even don't work without Javascript. I really miss the many sites that basically only used the `<p>` tag, and maybe some `<b>` and `<img>` if the economy was good.

You can still find a decent amount of these simpler sites, especially on university subdomains, where older professors (rightfully) simply don't see the point in going beyond basic readability, but there's obviously more of these sites going down every year than coming up. Though, things like neocities seem to be "cool" again, in certain circles. Most neocities sites wouldn't really be readable on Koxinga, but another recently popular site, bearblog.dev is perfectly usable with Koxinga.

What is interesting is that unlike the other obstacles that anyone trying to use a simple browser (eg, the Cloudflare challenges, Javascript loading the content instead of it being in the static HTML, etc), there's no one to really blame. Modern web development is awful, but having only text-based sites (like in the Gemini protocol) is too restricting.

So I don't think Koxinga is the ideal browser in an ideal world. I would have loved for it to support more complex formatting, I just don't really want to work that hard on it, and I'm not really sure how I would do all this complicated rendering anyways. It does what I want.

...By the way, the ideal browser, in my opinion, would be [Lynx](https://lynx.invisible-island.net).

===

\[0\]: It is a great POC app for ming-wm, anyhow. Plus, the development process for Koxinga led me to add several things to ming-wm itself that I realised were kinda important, like font data caching for faster text rendering.
