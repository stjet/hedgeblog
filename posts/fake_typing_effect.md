Let's make a fake typing effect. When an user types on the keyboard, instead of showing the user the real text they typed, we will instead show them some other text (something similar to [hacker typer](https://hackertyper.net/)).

## HTML

Normally, to get user keyboard input, an element like `<input>`. The problem is, `<input>` actually shows what the user types. Usually, this is good. For us, not good.

So we will instead be using `<textarea>`, with user input disabled (meaning users cannot type into the `<textarea>`), so `<textarea disabled>`. Let's also give it a placeholder so the user knows what to do, and an id, maybe `"ouput"`?

```html
<textarea id="output" placeholder="Type something!" disabled></textarea>
```

## Javascript

This is the bulk of the program.

First of all, we have to detect when the keyboard is pressed. To do this, we just need to add an event listener to the document.

```js
document.addEventListener("keyup", function(_event) {
  //we haven't written this code yet
});
```

The first parameter is the event name we are listening for: `"keyup"`. The `"keyup"` event is emitted whenever a key on the keyboard is released.

The second parameter of the `addEventListener` function is the callback function that is run whenever the `"keyup"` event is emitted. The `_event` parameter of that function is a [KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent), that contains information about the emitted event, like what key was pressed. In this case, we don't need any of that information, so I put an underline in front of the parameter name (`_event`) to indicate we will not use it. In Javascript, we can actually get rid of the `_event` parameter all together, and the code will still work. But I'm keeping it since I like knowing it exists.

Now that we can detect key presses, we want the `<textarea>` element's content to change. Specifically, for every key press, a character from the predetermined text needs to show up. We will have to keep track of the number of keypresses, since the characters have to go in the right order.

To keep track of the number, we can use a global variable which we can increment every key press.

Oh, plus we need a variable to store the text we want to display. 

So, so far we have:

```js
const text = "Lorem ipsum something something blah blah blah...";
let letter_index = 0;
document.addEventListener("keyup", function(_event) {
  //we haven't written this code yet
});
```

Next, let's add the code that does the actual adding of the text:

```js
const text = "Lorem ipsum something something blah blah blah...";
let letter_index = 0;
document.addEventListener("keyup", function(_event) {
  let output = document.getElementById("output");
  if (letter_index === text.length) {
    output.innerHTML = "";
    letter_index = 0;
  } else {
    output.innerHTML += text[letter_index];
    letter_index++;
  }
});
```

Whenever a `"keyup"` event is emitted, we see if `letter_index` is equal to the length of the predetermined text. If it is, that means the user finished typing the fake text. So, we clear the textarea's content, and reset the `letter_index` to `0`.

If `letter_index` is less than the length of the predetermiend text (it will never be greater since we reset it before it gets large than `text.length`), we just add the next character to the textarea, and increment `letter_index`.

That's it.

Now, what if we want to cycle between different fake texts after an user finishes typing one of them, instead of restarting and typing the same fake text over and over? That should be fairly simple - we'll make an array that has all the fake texts we want to cycle through, and add another index variable like `letter_index`:

```js
const texts = ["Lorem ipsum something something blah blah blah...", "She sells seashells by the seashore.", "Si shi si, shi shi shi. Shi si shi shi si, si shi shi si shi.", "So long and thanks for all the fish."];
let text_index = 0;
let letter_index = 0;
document.addEventListener("keyup", function(_event) {
  let output = document.getElementById("output");
  if (letter_index === text.length) {
    output.innerHTML = "";
    text_index++;
    if (text_index === texts.length) {
      text_index = 0;
    }
    letter_index = 0;
  } else {
    output.innerHTML += texts[text_index][letter_index];
    letter_index++;
  }
});
```
## Result

Here's the code put together:

```html
<textarea id="output" placeholder="Type something!" disabled></textarea>
<script>
  const texts = ["Lorem ipsum something something blah blah blah...", "She sells seashells by the seashore.", "Si shi si, shi shi shi. Shi si shi shi si, si shi shi si shi.", "So long and thanks for all the fish."];
  let text_index = 0;
  let letter_index = 0;
  document.addEventListener("keyup", function(_event) {
    let output = document.getElementById("output");
    if (letter_index === texts[text_index].length) {
      output.innerHTML = "";
      text_index++;
      if (text_index === texts.length) {
        text_index = 0;
      }
      letter_index = 0;
    } else {
      output.innerHTML += texts[text_index][letter_index];
      letter_index++;
    }
  });
</script>
```

See a demo of the above [here](https://demos.prussiafan.club/demos/fake-typing-effect).
