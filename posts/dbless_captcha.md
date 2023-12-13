Google's Recaptcha costs money for large customers, and is biased towards those who are using Chrome or are logged in with a Google account. Hcaptcha can be easily bypassed with an accessibility cookie.

Seeing these problems, and since it seemed interesting, I decided to make my own text captcha.

It wouldn't a (good) replacement, since text captchas can be cracked trivially with a ML model. I'm sure most Recaptchas and hCaptchas can also be broken with machine learning, but those can be bypassed a lot easier by paying fractions of a cent per solve to a captcha solving service like 2captcha (which iirc just turns around and pays real people to do them). Still, just needing to run a model or pay someone discourages would-be botters, as they may decide it's not worth the effort.

Back on topic, while my text captcha wouldn't be a replacement for stuff like Recaptcha, there are other uses. For example, on platforms like Discord, if someone wanted to have a bot with a captcha (usually to prevent bots spamming members with scammy DMs), the only way they could use Recaptcha or hCaptcha would be by directing users to their own website, where they have the captcha. That's pretty annoying for the user and adds complexity to the bot. Ideally, users should be able to complete the captcha without leaving Discord.

In that case, a text captcha with a good API would mean that all the bot has to do is send a message with the image of the captcha (image URL provided by the API, of course), then wait for the user to respond, and check if it is correct. Having an API would mean the captcha wouldn't be restricted to just Discord - it could be used on any service with a backend.

Additionally, I didn't feel like using a database, as it would mean more setup, so I tried using cryptography to make a database unnecessary.

I don't think this was a terribly interesting project, code or concept wise, but I just felt like writing this. Oh, learning about Salsa20 was cool though.

## Implementation

The server has a 32 byte secret key. When it is asked for a captcha, it generates a 8 byte nonce, and a 6 character code (the alphanumeric thing the user needs to be into the captcha). The code is encrypted with the secret key and nonce by Salsa20.

> Nonces in cryptographically, are random numbers that are one-time use to improve security. If the same nonce is used more than once though, security may be compromised.

Then, once the server gets a request to generate the captcha image (the request provides it with the nonce and encrypted code), it decrypts the encrypted code with the given nonce and the secret key, then generates the image of that decrypted text.

Finally, once the server gets a request to verify that the user's answer to the captcha is correct. It is given the user's guess, encrypted code, and nonce. Again, it decrypts the encrypted code with nonce and secret key. If the decrypted code matches the user's guess, it is correct. If not, the user is wrong.

Since the client does not know the server's secret key, they cannot know the code, unless they read the captcha image. All that cryptography also allows the server to create and verify the captcha without storing information anywhere (no database needed!).

There is also a timestmap that is appended to the code before it is encrypted, that allows captchas to expire (eg, after 5 minutes, you need to ask for a new captcha if you haven't successfully solved this one).

## API

### GET `/captcha`
Returns `image`, `code`, and `nonce`. Here, the `code` is the encrypted 6 character alpha-numeric code that the user is supposed to read the captcha and solve for. I don't know why I called both the encrypted and unencrypted codes "code". Sorry if it's confusing. Here's an example response:

```json
{
  "image": "20ee1a711f77e7aba151eb66584ed8e374.png",
  "code": "20ee1a711f77e7aba151eb66584ed8e374",
  "nonce": "40ae72c55dda39fb"
}
```

### GET `/encrypted/<encrypted>.png?nonce=<nonce>`
Decrypt encrypted with the nonce and the secret key, extracting the code from the decrypted text. Create a 210x70 png with the code text. Draw dots and lines and blurs and whatnot to make it a little bit harder to automate.

![the generated image](/images/captcha.png)

### POST `/captcha`
This endpoint is to verify whether a user successfully solved a captcha. The encrypted `code`, `nonce`, and user's `guess` must be sent in a payload. The ruby captcha wants the payload to be sent as form data, while the Node.js captcha wants it as JSON.

The response will be JSON with either `"success": true` or `"success": false`. Success means the user successfully solved the captcha. In the Node.js version, there may be an `"error"` (in addition to the `"success": false`) key if the request sent is invalid.

Example response:

```json
{
  "success": true,
}
```

> I thought I could streamline the process and remove the need for the POST request to `/captcha` by returning the [hashed and salted](/posts/hashing) answer, so the service that uses the captcha could validate the result for itself. But then I remembered why I went for symmetric encryption instead of hashing in the first place: the captcha service needed to know the image's text content to generate the image, and hashing would obviously make that impossible.
> It could still be done if I stored a map of image URL to the answer in the database, but the entire point of this project was to **not** use a database. Also, if I was storing stuff into the database, there was no point in hashing, as I could associate any key with the answer. Plus, hashing it without a salt would be terribly insecure, since anyone could easily pre-compute the hashes of all possible 6 character alpha-numeric strings and match them to instantly solve the captcha.

## How To Use The API

Here's how you would probably do it:

1. Send GET request to `/captcha`. Send the image and nonce to the user. 
2. Get the user to submit an answer, along with the code (the image url without the ".png") and nonce.
3. Make POST request to `/captcha` with the code, nonce, and user's guess.
4. Let them through if the request gives a successful response. Do not if it doesn't.

Try the captcha out at [captcha.prussia.dev](https://captcha.prussia.dev), and see the code on [Github](https://github.com/jetstream0/Captcha).
