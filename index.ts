import * as path from 'path';
import { readFileSync } from 'fs';
import { parse_md_to_html } from 'makoto';
import { Renderer } from './ryuji.js';
import { Builder } from './saki.js';
import _posts_metadata from './posts/_metadata.json';

export interface PostMetadata {
  title: string,
  slug: string,
  filename: string,
  date: string,
  author: string,
  tags: string[],
}

export interface Post extends PostMetadata {
  md_lines: string[],
  html: string,
  tags_exist: boolean,
}

let renderer: Renderer = new Renderer("templates", "components");
let builder: Builder = new Builder();

let posts_metadata: PostMetadata[] = Object.values(_posts_metadata);

builder.serve_static_folder("static");

//home page
builder.serve_template(renderer, "/", "index.html", {
  posts: posts_metadata,
});

//blog posts

//if two tags reduce down to the same slug, oh well, not my problem
function slugify(tag: string) {
  let allowed_chars: string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "_"];
  return tag.replaceAll(" ", "_").split("").filter((char) => allowed_chars.includes(char.toLowerCase())).join("");
}

//slugify all the tags
posts_metadata.forEach((post_metadata) => post_metadata.tags = post_metadata.tags.map((tag) => slugify(tag)));

let posts_serve_paths: string[] = [];
let posts_vars: any[] = [];
let tags: string[] = []; //also get all the tags since we are iterating through all the posts

for (let i=0; i < posts_metadata.length; i++) {
  let post_metadata: PostMetadata = posts_metadata[i];
  posts_serve_paths.push(`/posts/${post_metadata.slug}`);
  let post_md_path: string = path.join(__dirname, `/posts/${post_metadata.filename}.md`);
  let md: string = readFileSync(post_md_path, "utf-8").replaceAll("\r", "");
  let html: string = parse_md_to_html(md);
  for (let j=0; j < post_metadata.tags.length; j++) {
    let tag: string = post_metadata.tags[j];
    if (!tags.includes(tag)) {
      tags.push(post_metadata.tags[j])
    }
  }
  let post: Post = {
    ...post_metadata,
    md_lines: md.split("\n"),
    html,
    tags_exist: post_metadata.tags.length !== 0,
  }
  let next_post: PostMetadata = posts_metadata[i+1] ? posts_metadata[i+1] : posts_metadata[0];
  posts_vars.push(
    {
      post,
      next_post,
      author_expected: post.author.toLowerCase().startsWith("jetstream0") || post.author.toLowerCase().startsWith("prussia"),
    }
  );
}

builder.serve_templates(renderer, posts_serve_paths, "post.html", posts_vars);

//tags

let tags_serve_paths: string[] = [];
let tags_vars: any[] = [];

for (let i=0; i < tags.length; i++) {
  let tag: string = tags[i];
  tags_serve_paths.push(`/tags/${slugify(tag)}`);
  tags_vars.push({
    tag,
    posts: posts_metadata.filter((post) => post.tags.includes(tag)),
  });
}

builder.serve_templates(renderer, tags_serve_paths, "tags.html", tags_vars);
