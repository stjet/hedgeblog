I've written a lot of Javascript over the past few years. How much? I'm not sure, but 100 thousand lines is probably a good estimate^\[0\]^^\[1\]^. The two functions  that I've written the most, over and over, are no doubt the function to turn hexadecimals to bytes, and vice versa.

Part of this is because I do a lot of stuff related to cryptography and cryptocurrency (which, no surprise, is basically just *more* cryptography), which involves tons of work with bytes and often, converting them to hex for storage or display. The other part is because Javascript doesn't have a builtin way to convert hex to bytes or the other way around (Node.js apparently has `Buffer.from` but I never use that), and also because I just like writing things from scratch, which you may notice is a common theme in this blog. In addition to my trademark unnecessarily long sentences, of course.

## Bytes

I assume you already know what bytes and hexadecimals are, but in case you don't, here's a brief overview.

Bits have two states. Bytes are made out of eight bits, so one byte can have 256 (`2^8=256`) states.

Now, there are a couple ways you can represent bytes. One way could be representing them in binary, with 1s and 0s. Another would be just using our normal decimal (base 10 numbers), where a byte could be represented by a number from 0 to 255. But the best way (in my opinion) is to use hexadecimals (base 16 numbers) which uses the digits 0-9 and A-F. `A` represents 10, `B` represents 11, and so on. `FF` would represent 255 in decimal (`15*16+15=255`), `10` would represent 16 (`1*16+0`), and `32` would represent 50 (`3*16+2=50`).

Why base 16? If you remember, one byte can have 256 states, meaning that two hexadecimal digits can perfectly represent one byte (`16^2=256`) which is a lot more elegant than decimal, and a lot more concise than binary. With decimal, it isn't exactly clear how many bytes 2402655566 is, while it is very clear how many bytes 8F359D4E is (8 hex digits, so 4 bytes).

## Uint8Array

Anyways, back on topic. In Javascript, bytes are often represented by [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), which are shockingly an array of Uint8s. What are Uint8s? Uint means "unsigned integer", or basically a non-negative whole number. The 8 stands for the 8 bits, so a Uint8 is an array of one byte unsigned integers^\[2\]^. Basically, it's a way to represent bytes in Javascript by storing in as an array of decimal numbers from 0-255.

## Converting Bytes to Hexadecimal

```js
function uint8_to_hex(uint8) {
  const hex_chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
  let hex = "";
  for (let i=0; i < uint8.length; i++) {
    hex += hex_chars[Math.floor(uint8[i]/16)];
    hex += hex_chars[uint8[i] % 16];
  }
  return hex;
}
```

The loop iterates through through the `Uint8Array`, first dividing it by 16 and rounding down, to find the first hex character. Then, it divides by 16 and takes the remainder for the second hex character.

## Converting Hexadecimal to Bytes

```js
function hex_to_uint8(hex) {
  const hex_chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
  hex = hex.toUpperCase();
  let uint8 = new Uint8Array(Math.floor(hex.length/2));
  for (let i=0; i < Math.floor(hex.length/2); i++) {
    uint8[i] = hex_chars.indexOf(hex[i*2])*16;
    uint8[i] += hex_chars.indexOf(hex[i*2+1]);
  }
  return uint8;
}
```

Here, we determine how many whole bytes^\[4\]^ are in the hex string, by diving it by two. We then loop that many times, each time convering the two hex characters into a number by finding the value of the first hex character (`indexOf`), multiplying it by 16, then finding the value of the second of the second hex character, and adding it.

By the way, doing, for example, `new Uint8Array(5)`, will initialize an `Uint8Array` of all 0s, of length 5.

This function, as written, isn't designed to take in invalid input, so make sure to validate any inputs. In fact, I would encourage you to go and write your own conversion functions, instead of copy pasting these examples. You'll (hopefully) understand the concepts much faster that way.

===
- \[0\]: ±50 thousand lines (estimating skills are not my strong suit).
- \[1\]: [my 6000 lines of unfinished code in one horrific file](https://github.com/jetstream0/Muskets-and-Bayonets/blob/main/script.js).
- \[2\]: Signed integers have "signs", ie, they can represent negative numbers.
- \[3\]: In case you were wondering, I do write the `hex_chars` array out every time... slightly painful, but it's too much work to copy paste it from somewhere
- \[4\]: Note that the `Math.floor` means that this function only works with an even hex string length, since an odd hex string length would mean there's half of a byte (aka a nybble) being used, which is rare-ish.
