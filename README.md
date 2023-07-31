# Hedgeblog
My [personal blog](https://www.prussiafan.club), because what the world needs is yet another semi-abandoned blog.

## Technical Goals
- Completely rewrite the blog, and get it working
- Be able to be served statically (so it can be deployed on Github Pages or Cloudflare Pages for no dinero)
- No dependencies - or basically, I want to write every line of code
- No Javascript served to client - the web pages should be pure HTML and CSS

## Non-Technical Goals
- Make two things I can call "Ryuji" and "Saki" to go along with "Makoto" (those are the three main characters of one of the best manga series ever)
- Move over some of the old blog posts (only the stuff I like), after rewriting them
- Start writing stuff on the blog again, at least semi-regularly

## Makoto
Makoto is the markdown-to-html parser, made with no dependencies. It was made around two months before Ryuji and Saki, and is meant to be more of a standalone thing. This is the sole npm dependency of the project (because I published makoto to npm and wanted to make sure it worked).

It also has a very cool warnings feature, that isn't used in this project, but can be seen in action if you use the [Makoto Web Editor](https://makoto.prussia.dev).

## Ryuji
Ryuji is a simple templating system. It's Jinja/Nunjucks inspired but has less features. On the upside, Ryuji is less than 200 lines of code and supports if statements, for loops, components and inserting variables.

I didn't write any docs for it, but you can see the syntax if you look in the `templates` directory or look in `tests.ts`.

## Saki
Saki is the build system that puts it all together and outputs the blog's static html.
