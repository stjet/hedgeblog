Today, I noticed around a hundred failed faucet claims for a client's Discord bot. Wonderful.

I checked the logs. Ah, the errors told me that the [captcha service](https://github.com/jetstream0/Captcha) was down. It looked like Replit, where I hosted the captcha service, had decided to remove all my environmental variables. Annoying.

The fix seemed fairly simple. But Replit was planning to discontinue free non-static hosting after the end of the year, and dealing with Replit's interface has been a generally unpleasant experience for me, so I decided to take the opportunity and migrate hosts. It had to done be sooner or later after all.

We wanted to keep hosting costs at $0, so I decided to move the service to render.com. Render's free tier allows for one free "Web Service", which is basically just any site with a backend that can be run with the resoruces given (512 mb, 0.1 cpu). It does require entering payment information (credit card) in though, which my client didn't particularly want to do.

Luckily, I made my client's Render account before this requirement, so it had a grandfathered-in web service.

Unfortunately, it was already running the project's website. The website used to have the faucet, but since the faucet was moved to Discord (too much abuse otherwise), the site didn't *really* need a backend anymore. It did two database queries to display information like remaining claims for the month, but that was all. It was fairly simple to remove the site's backend, then have the Discord bot host a very simple API that the site's frontend would call to find that information.

> Since I was hosting the Discord bot on Fly.io, which suspends free-tier VMs if there is no traffic to them, the bot already had a webserver that was being pinged to keep it from stopping. So tacking on the very very limited API took <2 minutes.

Alright, since the site is now static, it can be hosted on Github pages, and the captcha can be hosted on our newly available web service. As expected, it isn't that simple. I can change what repo the web service pulls from, which is good, but it's stuck in the [Node.js runtime](https://render.com/docs/native-runtimes), which I can't seem to change. This is a problem because I wrote the captcha service in Ruby, a language that is most definitely not Node.js (to prove it, note that "Ruby" and "Node.js" share no letters *and* are different lengths - therefore they must not be the same).

I was fairly certain that if I deleted the web service, I would need to enter in payment info if I tried to create a new one. So that was not an option. I had to [rewrite the captcha service in Node.js](https://github.com/jetstream0/Captcha-node). It was mostly straightforward, but unluckily, I used a poorly documented cryptography library. There were a few limited examples, but I mostly had to look at the code and tests to figure out how it worked...

And when I switched out salsa20 for xsalsa20 (larger nonce size means that csprngs can be securely used without fear of nonces being repeated), the output turned out to be too large to fit in the [`custom_id` of Discord buttons](https://discord.com/developers/docs/interactions/message-components#button-object-button-structure). I was forced to switch back to salsa20, and just decided to rotate keys every few hours or so (I did not have the energy to make the nonce an incrementing count, which would require storing the count in the database). Kinda stupid, but it's (probably) fine.

Anyways, once I rewrote it in Node.js, I switched the web service to run that instead of the website, and everything started working again. Yay.
