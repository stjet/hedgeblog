# Hedgeblog
My [personal blog](https://www.prussiafan.club), because what the world needs is yet another semi-abandoned blog. All the code in this repo is licensed under the AGPL license, with the exception of Makoto, which is licensed under the MIT license.

## Technical Goals
- Completely rewrite the blog, and get it working
- Be able to be served statically (so it can be deployed on Github Pages or Cloudflare Pages for no dinero)
- No dependencies - or basically, I want to write every line of code (builtin modules like `path`, `fs` are ok of course)
- No Javascript served to client - the web pages should be pure HTML and CSS

These goals are accomplished!

## Non-Technical Goals
- Make two things I can call "Ryuji" and "Saki" to go along with "Makoto" (those are the three main characters of one of the best manga series ever)
- Move over some of the old blog posts (only the stuff I like), after rewriting them
- Start writing stuff on the blog again, at least semi-regularly

The third goal may never be accomplished.

## Makoto
Makoto is the markdown-to-html parser, made with no dependencies. It was made around two months before Ryuji and Saki, and is meant to be more of a standalone thing. This is the sole npm dependency of the project. I `npm install`ed it instead of just copying the file over mostly because I published Makoto to npm and wanted to make sure it worked. Also it has different license, documentation and stuff.

It also has a very cool warnings feature, that isn't used in this project, but can be seen in action if you use the [Makoto Web Editor](https://makoto.prussia.dev).

## Ryuji
Ryuji is a simple, Jinja/Nunjucks inspired templating system that supports `if` statements, `for` loops, components, and inserting variables. It isn't quite as fully featured as Jinja/Nunjucks, but on the upside, Ryuji is around just 200 lines of code, and worked very well for my usecase. I think it's pretty cool.

I didn't write any docs for it (yet), but you can see the syntax if you look in the `templates` directory or look in `tests.ts`.

## Saki
Saki is the build system that puts it all together and outputs the blog's static html. Even more simple than Ryuji, it is just around 70 lines of code.

## Running
First, install the dependencies (well, dependency, since Makoto is the only one).

```bash
npm install
```

## Building
```bash
npm run build
```

## Previewing
```bash
npm run preview
```

This builds the project and then serves the `build` folder at [http://localhost:8042](http://localhost:8042). As you can see in `preview.ts`, this part also relies on no dependencies - only builtin module `http` is used.

## Tests for Ryuji (templating)
```bash
npm run test
```

Uses Endosulfan, my very basic <40 LOC test assertion thingy.
