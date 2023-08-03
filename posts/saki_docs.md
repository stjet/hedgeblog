Saki is a very simple static build system, written in Typescript. There are no dependencies besides the builtin Node.js modules `fs` and `path`.

# Class: Builder

## `constructor`
Creates an instance of the `Builder` class.

**Parameters:**
- `build_dir` (`string`, optional, default is `"/build"`): The directory to output the build to.

## `copy_folder` (static)
Copies a directory to another directory. Used internally in `serve_static_folder`, there is probably no need to use this.

**Parameters:**
- `folder_path` (`string`): Path to directory that should be copied.
- `dest_path` (`string`): Path to directory to copy to.

## `serve_static_folder`
Adds a static folder to the build directory, meaning that it will be served.

**Parameters:**
- `static_dir` (`string`): The path to the static directory to serve
- `dest_path` (`string`, optional, default is `"/"`): The path that the static directory should be served under. For example, if the static directory has a file "example.png", if the `dest_path` is `"/"`, the file will be written to `"/<build dir>/example.png"`, and the url for the file will be `/example.png`. If the `dest_path` is `"/files"`, the file will be written to `"/<build dir>/files/example.png"`, and the url for the file will be `/files/example.png`.

## `serve_content`
Write HTML to a file in the build directory. In most cases, it is probably more convenient to use `serve_file`, `serve_template` or `serve_templates` instead.

**Parameters:**
- `content` (`string`): The HTML content.
- `serve_path` (`string`): The path to serve the file under, inside the build directory. If the `serve_path` does **not** end with ".html", the content will be written to an `index.html` file inside the path as a directory, ensuring that the HTML will be served under that url. For example, if `serve_path` is `"/burgers"`, the HTML will be written to `"/<build dir>/burgers/index.html"`, and can be accessed at the url `/burgers`.

## `serve_file`
Write a (non-HTML) file to the build directory. If serving multiple non-HTML files, putting those files into one directory and using `serve_static_folder` is probably a good idea.

**Parameters:**
- `file_path` (`string`): Path to the file.
- `serve_path` (`string`): The path to serve the file under, inside the build directory.

## `serve_template`
Render a (probably [Ryuji](/posts/ryuji-docs)) template, and write the result to the build directory.

**Parameters:**
- `renderer` (`Renderer`): Most likely the Ryuji renderer.
- `serve_path` (`string`): The path to serve the file under, inside the build directory.
- `template_name` (`string`): Name of the template to render (see Ryuji docs for more information).
- `vars` (`any`): The variables as a dictionary/object to render the template with (see Ryuji docs for more information).

## `serve_templates`
Render multiple templates, and write the results to the build directory.

**Parameters:**
- `renderer` (`Renderer`): Most likely the Ryuji renderer.
- `serve_paths` (`string[]`): The paths to serve the files under, inside the build directory.
- `template_name` (`string`): Name of the template to render (see Ryuji docs for more information).
- `vars_array` (`any[]`): An array of variables as a dictionary/object to render the templates with (see Ryuji docs for more information).

`serve_paths` and `vars_array` need to have the same length, since the first item of `serve_paths` is rendered with the first item of `vars_array` as the variable, and so on.

# Usage Examples
```ts
import { Renderer } from './ryuji.js';
import { Builder } from './saki.js';

let renderer: Renderer = new Renderer("templates", "components");
let builder: Builder = new Builder();

builder.serve_static_folder("static");

builder.serve_template(renderer, "/", "index.html", {
  notices: [
    "Dave got drunk again and fed the chipmunks. As a result, they are more brazen than usual. Be on your guard!",
    "Please stop anthropomorphizing the rocks. They WILL come alive.",
    "Oxygen has decided to retire. Until we find a replacement for him, there will be oxygen and water shortages.",
  ],
});

builder.serve_templates(renderer, [
  "/departments/water",
  "/departments/energy",
  "/departments/sanitation",
  "/departments/permitting",
  "/departments/human_rights_abuses",
], "post.html", [
  {
    "name": "Department of Water",
    "employees": 79,
    "sanctioned_by_ICC": false,
  },
  {
    "name": "Department of Energy",
    "employees": 140,
    "sanctioned_by_ICC": false,
  },
  {
    "name": "Department of Sanitation",
    "employees": 217,
    "sanctioned_by_ICC": false,
  },
  {
    "name": "Department of Permitting",
    "employees": 1,
    "sanctioned_by_ICC": false,
  },
  {
    "name": "Department of Human Rights Abuses",
    "employees": 9000,
    "sanctioned_by_ICC": true,
  },
]);
```

If a real world example is preferable, [this blog uses Saki](https://github.com/jetstream0/hedgeblog/blob/master/index.ts) to build as a static site.
