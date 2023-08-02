My Banano faucet, [faucet.prussia.dev](https://faucet.prussia.dev) recently reached an incredible 190k claims. I want to thank everyone who donated to the faucet or used it, and of course the people who contributed to the code: HalfBakedBread, SaltyWalty and KaffinPX.

![190k, yay!](/images/190kyay.png)

## Version 1
Around 2 and a half years ago (wow...), I first launched my Banano faucet. It was my first experience programming in cryptocurrency. After struggling with the libraries for Banano on Python (a problem I fixed a few months ago by writing [bananopie](https://github.com/jetstream0/bananopie)), I switched to using Node.js and Banano.js.

The original faucet... I was not very good at CSS back then:

![Picture of the original faucet](/images/og_faucet.png)

I launched the faucet sometime in October, and it was a great success thanks to everyone in the Banano community. Soon after, SaltyWalty opened an awesome PR that got the faucet looking a lot better. Later, Nano and xDai support was also added to the faucet.
For the next 2 years or so, the faucet was sustained by the generosity of many donors, and I was able to help dozens of others to launch their own Banano faucet, or faucets for other currencies.

It's great to see the Banano faucet scene now thriving, and along the way I've also been commissioned to make faucets to help first time users with gas fees on other chains, like Polygon and Arbitrum Nova.

## Version 2
A couple months ago, I decided I was not satisfied with the code quality of the [original faucet](https://github.com/jetstream0/Banano-Faucet), and started rewriting the code from scratch. The new goal was not just better code, but also a config file that people with just a little, or no technical experience, could modify and easily, quickly start their own faucets.

HalfBakedBread and I finally finished Faucet v2, and the current version of faucet.prussia.dev is using it! I also added Vite support with the help of KaffinPX. Of course, it is open source on [Github](https://github.com/jetstream0/Faucet-v2).

Since the faucet was having problems with Replit (specifically connecting to the mongodb database), the host was also migrated from Replit to Render, which will hopefully work better.

## Future Plans
Currently, there are plans to add Algorand support, and also change the xDai faucet to support any EVM chain.
