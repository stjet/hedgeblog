import { Renderer } from './ryuji.js';
import { BlogBuilder, PostMetadata } from './saki.js';
import _posts_metadata from './posts/_metadata.json';

let renderer: Renderer = new Renderer("templates", "components");
let builder: BlogBuilder = new BlogBuilder(renderer);

let posts_metadata: PostMetadata[] = Object.values(_posts_metadata);

builder.serve_static_folder("static");

//home page
builder.serve_template("/", "index.html", {
  posts: posts_metadata,
});

//blog posts
builder.serve_markdowns("/posts", "/posts", "post.html", posts_metadata, true);
