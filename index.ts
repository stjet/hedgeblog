import * as path from "path";
import { readFileSync } from "fs";
import { parse_md_to_html } from "makoto";
import { Renderer } from "./ryuji.js";
import { Builder } from "./saki.js";
import _posts_metadata from "./posts/_metadata.json";
import _site_info from "./site_info.json";

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

export interface RSSPost extends PostMetadata {
  url: string,
  last_updated: string,
  html: string,
}

export interface SiteInfo {
  title: string,
  url: string,
  icon: string,
}

let renderer: Renderer = new Renderer("templates", "components");
let builder: Builder = new Builder();

let posts_metadata: PostMetadata[] = Object.values(_posts_metadata);

builder.serve_static_folder("static");

//home page
builder.serve_template(renderer, "/", "index", {
  posts: posts_metadata,
});

//404 page (github pages)
builder.serve_template(renderer, "/404.html", "404", {});

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

builder.serve_templates(renderer, posts_serve_paths, "post", posts_vars);

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

builder.serve_templates(renderer, tags_serve_paths, "tags", tags_vars);

//build rss feed
let first_posts: PostMetadata[] = posts_metadata.slice(0, 5); //not truly the recents, actually the first 5 posts in the json file, which is decided by me and usually the most recent posts

const site_info: SiteInfo = _site_info;

let posts_rss: RSSPost[] = first_posts.map((post) => {
  //get url
  let url: string = `${site_info.url}/posts/${post.slug}`;
  //get last_updated
  let date_parts: number[] = post.date.split("/").map((p) => Number(p)); // dd/mm/yyyy
  let date: Date = new Date();
  date.setUTCFullYear(date_parts[2]);
  date.setUTCMonth(date_parts[1]-1, date_parts[0]);
  date.setUTCHours(0, 0, 0, 0);
  let iso_string: string = date.toISOString();
  let last_updated: string = iso_string.slice(0, iso_string.length-1)+"+00:00"; //remove the "Z" in iso string
  //get html
  let post_md_path: string = path.join(__dirname, `/posts/${post.filename}.md`);
  let md: string = readFileSync(post_md_path, "utf-8").replaceAll("\r", "");
  let html: string = parse_md_to_html(md);
  //turn into rsspost
  return {
    ...post,
    url,
    last_updated,
    html,
  }
});

//might leak what side of the planet youre on
let now: Date = new Date();
now.setUTCHours(0, 0, 0, 0);
let global_iso_string: string = now.toISOString();
let global_last_updated: string = global_iso_string.slice(0, global_iso_string.length-1)+"+00:00"; //remove the "Z" in iso string

builder.serve_template(renderer, "/atom.xml", "atom.xml", {
  site_info,
  recent_posts: posts_rss,
  last_updated: global_last_updated,
});

