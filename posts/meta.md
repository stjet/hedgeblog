There used to be a different blog here. But it wasn't very good, [code](https://github.com/jetstream0/Markup-to-HTML) *and* writing-wise. So I decided to rewrite everything.

The old blog was an express server that looked for `.md` files in a directory, converted them to HTML, and served it. That worked mostly fine. However, the converter didn't support many Markdown features, and was pretty buggy. Using an express server also meant that the site wasn't static, and had limited options for hosting.

Replit's free tier was pretty unreliable, and Render only allowed one free web service per account, which I was already using to run my [faucet](https://faucet.prussia.dev). I could've created a new Render account, but they recently started requiring credit card verification, which I didn't really want to do.

Besides, making the blog static instead of relying on an express server wouldn't be that hard. A month before, I had already wrote a better (?) or at least more fully featured Markdown to HTML parser, [Makoto](https://github.com/jetstream0/Makoto-Markdown-to-HTML), so that was already one of the problems with the old blog solved.

Anyways, once I decided to start completely rewriting the blog, I established some goals that I wanted the new blog to accomplish.

## Technical Goals
- Static, so it can be deployed by eg, Github Pages or Cloudflare Pages
- Built from scratch with no third-party dependencies (builtin modules like `path` and `fs` are ok of course, `makoto` is not third party, also doesn't count)
- Use Typescript
- No Javascript running client side - the web pages should be pure HTML and CSS
- Style-wise, should be minimalistic, nothing fancy
- Load quickly and be small in size

## Non-Technical Goals
- Make two things I can call "Ryuji" and "Saki" to go along with "Makoto" (those are the three main characters of one of the best manga series ever)
- Move over some of the old blog posts (only the stuff I like), after rewriting them
- Start writing stuff on the blog again, at least semi-regularly

## Code
Hedgeblog (oh, that's what I'm calling it by the way) is made of three components: Makoto (Markdown to HTML parser), Ryuji (templating language), and Saki (build system).

You can find the code on [Github](https://github.com/jetstream0/hedgeblog).

### Makoto
Makoto is the Markdown-to-HTML parser, made with no dependencies. It was made around two months before Ryuji and Saki, and is meant to be more of a standalone thing. This is the sole npm dependency of the project. I `npm install`ed it instead of just copying the file over mostly because I published Makoto to npm and wanted to make sure it worked. Also, it has a different license, documentation and stuff.

All the standard Markdown are supported (headers, bolds, italics, images, links, blockquotes, unordered lists, ordered lists, code, code blocks...), as well as superscripts and tables (although tables are probably buggy). Makoto also does some pretty neat stuff like passing on the language of the code block (if given) as a class in the resulting div: `code-<language>`, or automatically add ids to headers, so they can have anchor links.

It also has a very cool warnings feature, which isn't used in this project, but can be seen in action if you use the [Makoto Web Editor](https://makoto.prussia.dev).

### Ryuji
Ryuji is a simple templating system that supports `if` statements, `for` loops, components, and inserting variables. It isn't quite as fully featured as Jinja/Nunjucks, but on the upside, Ryuji is less than 280 lines of code, and worked very well for my usecase. I think it's pretty cool.

Here's a quick overview of the syntax:

```html
[[ component:navbar ]] <!--this looks for templates/components/navbar.html and displays it here-->
<p>You can insert variables. My favourite food is: [[ favourite_food ]]</p>
<p>And make sure the variable is truthy then do something.</p>
[[ if:show_secrets ]]
  <ul>
    <li>Secret 1: lorem ipsum</li>
    <li>Secret 2: My favourite is not actually [[ favourite_food ]]</li>
  </ul>
[[ endif ]]
<div>
  <p>Variables are by default sanitized so HTML/CSS/JS can't actually be executed, but you can disable this.</p>
  [[ html:html_from_database ]]
</div>
[[ for:members:member ]]
  <p><b>[[ member ]]</b> is a proud member of our group!</p>
[[ endfor ]]
```

After finishing writing Ryuji, and writing some tests to make sure it all worked, I realized that I needed a few features that were missing.

There was no way to see the current index in a for loop, or the max index (length-1) of whatever variable we were looping over. This was needed for the tag links in the post.

In addition, if statements only checked if the variable was truthy (not `false` or `0` or `""`), but I needed if statements making sure two variables were equal, as well as if statements making sure two variables were *not* equal. You can see this being used in the post's tags along with the new for loop features, as well as the "Next Post" link at the bottom of the post.

So, I added those features. Let's take a look of these new features being used to show and link post tags.

Formatting the code a little nicer, this is what it looks like:

```
[[ for:post.tags:tag:index:max ]]
  <a href="/tags/[[ tag ]]">[[ tag ]]</a>[[ if:index:!max ]], [[ endif ]]
[[ endfor ]]
```

Ok, in the first line (`for:post.tags:tag:index:max`), we are looping over the variable `post.tags`, and assigning each item in `post.tags` as the variable `tag`. That's nothing new, what's new is the `:index:max` portion. `index` is the index variable, starting at 0 and incrementing every loop, while `max` is the maximum index (the length of the variable to loop over - 1).

If you look at the Ryuji code, now you can see that it is looping over the tags of the post, and creating a link for each tag. If the tag is *not* the last tag (`index` is not equal to `max`), we will also add a comma (and a space).

Here's the equivalent python code, if it helps:

```python
html = ""
max = len(post.tags)-1
index = 0
for tag in post.tags:
  html += "<a href=\"/tags/"+tag+"\">"+tag+"</a>"
  if index != max:
    html += ","
  index += 1
```

While Ryuji is meant for HTML, there is no reason it can't be used for other formats.

Take a look at the [docs](/posts/ryuji-docs) for Ryuji.

### Saki
Saki is the build system that uses Ryuji templates to generate all the HTML files, and then outputs everything (including static files, of course) to the `build` directory. Even more simple than Ryuji, it is just around 70 lines of code.

Here are the very short [docs](/posts/saki-docs) for Saki.

## Putting It All Together
When building, the program (`index.ts`) reads `/posts/_metadata.json` and passes all the post metadata information to the `templates/index.html` template, which is the home page! Then, it renders all the posts with the `templates/post.html` template and outputs to `/posts/*`. Next, it looks again at the post metadata and gets all the tags used. Once it has all the tags, pages for the tags are generated at `/tags/*`. That page lists all the posts with that tag. Scroll up and try it! It also outputs the `static` directory, as well, static files.

> ### Tip: Serve Without The `.html`
> Say we want to serve a HTML file at `/posts/example` instead of `/posts/example.html`. Just create a directory called `example` and put `example.html` inside it, renaming it `index.html`.
> Basically, `/posts/example.html` becomes `/posts/example/index.html`, and now the HTML file is served at `/posts/example`. You probably already knew that, but if you didn't now you know ^\[citation needed]^.

## Buttons Without Javascript
If you think back to around 950 words ago, you may recall that this site has zero frontend Javascript (or WebAssembly, as cool as it is). If you didn't recall that, I just reminded you. I will be sending an invoice later.

So how does the "Show MD", "Fancy Title", and Dark/Light theme toggle work? The key thing here is that all three of these are checkboxes. Yes, even the Dark/Light theme toggle is a checkbox. That toggle hides its checkbox and takes advantage of the fact you can click on a `<label>` with an appropriate `for` attribute to toggle a checkbox, and uses the `::after` psuedo-element to change the content between the moon emoji and the sun emoji, depending on the state of the checkbox.

What's so special about checkboxes? The `:checked` ([see MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:checked)) property, that's what! With the `:checked` property, we can apply styles depending on whether a checkbox is checked. See the following, which scales the checkbox by 3x when the checkbox is checked:

```css
input[type="checkbox"] {
  display: inline-block;
  transform: scale(1);
}

input[type="checkbox"]:checked {
  transform: scale(3);
}
```

And because of the `a ~ b` (select selector b *after* selector a) and `a + b` (select selector b *immediately after* selector a) CSS selectors, we can change the properties of other elements. Unfortunately, there doesn't seem to be a pure CSS way to change the style of elements *before* the checkbox. There are ways around this, like putting the checkbox before the desired element in the code, but using `position: relative`, `position: absolute`, and other ways to make the checkbox visually look like it is after the desired element. I didn't really want to do that though, so you can notice that all the checkboxes on this website are before the element whose style they change.

Here's a real example. The following CSS makes the "Show MD" checkbox functional:

```css
#post-md {
  margin-top: 7px;
  display: none;
}

#show-md:checked ~ #post-md {
  display: block;
}

#show-md:checked ~ #post-html {
  display: none;
}
```

## Other Style Notes
I used Verdana for headers, Courier New for code, and Times New Roman for everything else. These fonts were chosen mostly because they are websafe, ie included in most OSes. You cannot stop me from using Times New Roman. I like the look.

The colour for visited links is `orchid`, and the colour for non-visited links is `forestgreen`.

Since this blog is basically for my own "enjoyment", and doesn't need to look "sleek" or "professional", this site's design philosophy is moreso a rejection of those overdesigned corporate sites with too many popups, as well as certain React (or other framework) sites that don't even load with Javascript disabled, than a specific set of tenets. Combined with the fact that choosing colour schemes makes me angry, don't expect very consistent or aesthetic designs.

But I'll try my best.

## Running

After `git clone`ing the repo, `cd` into the directory and install the (sole) dependency:

```bash
npm install
```

To build:

```bash
npm run build
```

To build and preview locally at `http://localhost:8042`:

```bash
npm run preview
```

To run tests for Ryuji:

```bash
npm run test
```

## Todo
In the future, I would love to have those fun box gifs you used to see on geocities and other websites (like the ones on the bottom of the [pensquid](https://pensquid.net/) website), plus also something similar to [Wikipedia Userboxes](https://en.wikipedia.org/wiki/Wikipedia:Userboxes).

And I'll keep improving the site and fixing bugs, and occasionally write articles for the roughly four readers of this blog.
