Recently, I've been working on a discord bot game for Beer Goggles NFT on Algorand.

The specifics aren't too important, but essentially the game works like this: A game is started by an admin, and a secret number of hp is specified. Then, players can click a button, and depending on the amount of NFTs they hold, they will do "damage". All the damage is added up, and the person who crosses the secret number of hp wins. Like a pinata. Or in the case of our bar themed game, a huge opaque mug of beer that is passed around, with the goal being the one to finish the drink.

Now, onto the more technical details. Whenever a user clicks the button, the callback for the button interaction event is run. 

First, the program reads the database (MongoDB) and sees the current hp left for the current game. If the current hp is less than zero, or a game over flag is set, the user is notified that the game is over, and the click does nothing. If that isn't the case, it then calculates the damage done by the player (a combination of luck, the amount of NFTs they hold, and powerups they bought). The damage done is subtracted from the hp (new hp is written to the db). Finally, the program checks if the user has won (hp at or under 0). If so, it ends the game and announces the winner.

However if one player clicks, then another player clicks milliseconds after, in some cases there just hasn't been enough time for the db writes to take place, and so there can be multiple winners. This is **bad**!!!

![This is kinda bad, a screenshot of two winners](/images/screenshot_double_win.png)

The main problem is, the two functions being run at the same time aren't aware of the existence of the other, and can't communicate to ensure only one winner. I tried a variety of methods, like adding another check to make sure the game didn't end already. None of it worked, unfortunately.

What did work though, is adding a random delay using `setTimeout` and `Math.random`, if the program thought the user won (`hp <= 0`). After the random delay, a global array variable would be looked at. If the array was empty, then the winner would be announced, and something (doesn't matter what) would be added to the array. I'm not sure why I made it an array, and not an dictionary, but it worked^tm^ (only one game can be run at a time, but if the bot had multiple games running, a dictionary with the keys as game ids set when the winner was found would work better). I probably had a good reason at the time, or at least fooled myself into thinking I did. Anyways, so if there was another winner about to be announced, the program would see the array was not empty, and not announce the extra winner(s).

Technically, if the random delay was the same or only a few milliseconds different, the global variable could be looked at the same time, and two winners (or more) could still be announced.

... let's not worry about that

> (A quick update: in several dozen games, after the fix, the two winner situation never happened again. It wasn't elegant and it was a dumb solution, but it worked! Maybe there was a better solution by fiddling with the database settings, like making database calls queue one at a time?)
