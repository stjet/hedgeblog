import { readFileSync, writeFileSync } from 'fs';
import { Renderer } from './ryuji';
import { parse_md_to_html } from 'makoto';

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

//
