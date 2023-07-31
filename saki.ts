import * as path from 'path';
import { copyFileSync, existsSync, readdirSync, rmSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import type { Renderer } from './ryuji.js';
import { parse_md_to_html } from 'makoto';

export class Builder {
  build_dir: string;

  constructor(build_dir: string="/build") {
    this.build_dir = path.join(__dirname, build_dir);
    if (existsSync(this.build_dir)) {
      //wipe the build directory
      rmSync(this.build_dir, {
        recursive: true,
      });
    }
    mkdirSync(this.build_dir);
  }

  static copy_folder(folder_path: string, dest_path: string) {
    let children: string[] = readdirSync(folder_path);
    for (let i=0; i < children.length; i++) {
      let child: string = children[i];
      let child_path: string = path.join(folder_path, child);
      let copy_path: string = path.join(dest_path, child);
      if (child.includes(".")) {
        //file
        copyFileSync(child_path, copy_path);
      } else {
        //directory, make directory and recursively copy
        mkdirSync(copy_path);
        Builder.copy_folder(child_path, path.join(dest_path, child));
      }
    }
  }

  serve_static_folder(static_dir: string, serve_from: string="/") {
    let static_path: string = path.join(__dirname, static_dir);
    let dest_path: string = path.join(this.build_dir, serve_from);
    Builder.copy_folder(static_path, dest_path);
  }

  serve_content(content: string, serve_path: string) {
    let dest_path: string = path.join(this.build_dir, serve_path);
    if (!serve_path.includes(".")) {
      //serve as index.html in serve_path directory
      if (dest_path !== this.build_dir && dest_path !== path.join(this.build_dir, "/")) {
        //will not make a new directory if `serve_path` is "/", since the build directory already exists
        mkdirSync(dest_path);
      }
      writeFileSync(path.join(dest_path, "index.html"), content);
    } else {
      //serve as file regularly
      writeFileSync(dest_path, content);
    }
  }

  serve_file(file_path: string, serve_path: string) {
    let file_content: string = readFileSync(path.join(__dirname, file_path), "utf-8");
    this.serve_content(file_content, serve_path);
  }

  _serve_template(renderer: Renderer, serve_path: string, template_name: string, vars: any) {
    let content: string = renderer.render_template(template_name, vars);
    this.serve_content(content, serve_path);
  }
}

//this code is more or less specific to my blog

export interface PostMetadata {
  title: string,
  slug: string,
  filename: string,
  date: string,
  author: string,
  tags: string[],
}

export interface Post extends PostMetadata {
  md: string,
  html: string,
}

export class BlogBuilder extends Builder {
  renderer: Renderer;

  constructor(renderer: Renderer, build_dir: string="/build") {
    super(build_dir);
    this.renderer = renderer;
  }

  serve_template(serve_path: string, template_name: string, vars: any) {
    super._serve_template(this.renderer, serve_path, template_name, vars);
  }

  serve_markdown(serve_path: string, template_name: string, markdown_post: Post, additional_vars: any={}) {
    additional_vars.post = markdown_post;
    this.serve_template(serve_path, template_name, {
      post: markdown_post,
      author_expected: markdown_post.author.toLowerCase().startsWith("jetstream0") || markdown_post.author.toLowerCase().startsWith("prussia"),
    });
  }

  serve_markdowns(serve_path: string, posts_path: string, template_name: string, posts_metadata: PostMetadata[], own_dir: boolean=true) {
    let posts_dir_path: string = path.join(this.build_dir, posts_path);
    if (!existsSync(posts_dir_path)) {
      mkdirSync(posts_dir_path);
    }
    for (let i=0; i < posts_metadata.length; i++) {
      let post_metadata: PostMetadata = posts_metadata[i];
      let post_md_path: string = path.join(__dirname, posts_path, `${post_metadata.slug}.md`);
      let post_md: string = readFileSync(post_md_path, "utf-8");
      let post_html: string = parse_md_to_html(post_md);
      let post: Post = {
        ...post_metadata,
        md: post_md,
        html: post_html,
      };
      if (own_dir) {
        this.serve_markdown(path.join(serve_path, post.slug), template_name, post);
      } else {
        this.serve_markdown(path.join(serve_path, `${post.slug}.html`), template_name, post);
      }
    }
  }
}
