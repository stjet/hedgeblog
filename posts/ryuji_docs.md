Ryuji is a templating language written in less than 280 lines of code. There are no dependencies besides the builtin Node.js module `fs`. If that is an issue (eg, running in a browser environment), it should be very straightforward to remove the dependency by deleting the `render_template` function and using the `render` function directory.

# Syntax Docs

Ryuji syntax is typically in the format `[[ something ]]` or `[[ some:thing ]]` (with more `:`s if necessary). The spaces matter! Specifically, Ryuji checks for syntax using the regex statement: `/\[\[ [a-zA-Z0-9.:\-_!]+ \]\]/g`.

## Variables
```html
<p>Hi [[ employee.name ]],</p>
<p>You may recently heard some distressing news about your colleague Dave.</p>
<p>Please rest assured that these reports are <b>false and exaggerated</b>. Although he may be charged with [[ current_manslaughter_count ]] counts of manslaughter, we believe that these charges will be dismissed.</p>
<p>[[ corporate_slogan ]]</p>
```

## Non-HTML Escaped Variables
```html
<div>
  [[ html:biography ]]
</div>
```

## For Loop Statements
```html
<li>
  [[ for:trees ]]
    <li>There is a tree.</li>
  [[ endfor ]]
</li>
```

```html
<ul>
  [[ for:trees:tree ]]
    <li>There is a [[ tree.type ]] tree that is [[ tree.height ]] metres tall.</li>
  [[ endfor ]]
</ul>
```

```html
<ul>
  [[ for:trees:tree:index ]]
    <!--index starts at zero, but you get the point-->
    <li>[[ index ]]. There is a [[ tree.type ]] tree that is [[ tree.height ]] metres tall.</li>
  [[ endfor ]]
</ul>
```

```html
<ul>
  [[ for:trees:tree:index:max ]]
    <!--index starts at zero, and max is length-1 (the max index), but you get the point-->
    <li>[[ index ]]/[[ max ]] There is a [[ tree.type ]] tree that is [[ tree.height ]] metres tall.</li>
  [[ endfor ]]
</ul>
```

## If Truthy Statements
```html
[[ if:trees_are_real ]]
  <ul>
    [[ for:trees:tree ]]
      <li>There is a [[ tree.type ]] tree that is [[ tree.height ]] metres tall. [[ if:tree.old ]]Be warned that this tree is very old and may fall down.[[ endif ]]</li>
    [[ endfor ]]
  </ul>
[[ endif ]]
```

## If Comparison Statements
```html
[[ if:user.lactose_intolerant:user.vegan ]]
  <p>We don't think you should order the cheeseburger.</p>
[[ endif ]]
```

## If Not Comparison Statements
```html
[[ if:user.lactose_intolerant:user.vegan ]]
  <p>We don't think you should order the cheeseburger.</p>
[[ endif ]]
```

## If In List Statements
*Not supported in ryuji-rust*

```html
[[ if:tree:*user.friends ]]
  <p>Trees are friends, not food.</p>
[[ endif ]]
```

## If Not In List Statements
*Not supported in ryuji-rust*

```html
[[ if:tree:*!user.friends ]]
  <p>Trees are food, not friends.</p>
[[ endif ]]
```

## Components
```html
[[ component:nav-bar ]]
<p>Blah blah blah blah.</p>
```

*templates/components/navbar.html*

```html
<div>
  <a href="/">Home</a> - <a id="donate-link" href="/donate">Donate to Dave's Bail Fund</a>
</div>
<style>
  #donate-link {
    color: red;
  }
</style>
```

```html
[[ for trees:tree ]]
  [[ component:tree-info ]]
[[ endfor ]]
```

*templates/components/tree-info.html*

```html
<img src="[[ tree.picture ]]"/>
<h2>[[ tree.type ]], [[ tree.age ]] years old.</h2>
<p>Favourite song: [[ tree.favourite_song ]], Likes Dave: [[ tree.likes_dave ]]</p>
```

## Notes
- For loops can be nested.
- Components can have other components inside them (but there is a depth limit of 4 or 5 or 6 nested within each other, I forgot).

# API/Library Docs

## Class: Renderer

### `constructor`
Creates an instance of the `Renderer` class.

**Parameters:**
- `templates_dir` (`string`): Templates directory.
- `components_dir` (`string`): Components directory.
- `file_extension` (`\`.${string}\``, optional, default is `".html"`): File extension of templates.

### `render`
Render a template given template contents and variables.

**Parameters:**
- `template_contents` (`string`): Content of template.
- `vars` (`any`, optional but highly recommended): Dictionary/object of variables to render template with.
- `recursion_layer` (`number`, optional, defaults to `0`): Used internally to prevent infinite loops when templates circularly refer to each other.

**Returns:** `string` (the rendered template)

### `render_template`
Render a template given the template name. Basically, gets the contents of the template and then calls `render`.

**Parameters:**
- `template_name` (`string`): The name of the template.
- `vars` (`any`, optional but highly recommended): Dictionary/object of variables to render template with.
- `recursion_layer` (`number`, optional, defaults to `0`): Used internally to prevent infinite loops when templates circularly refer to each other.

**Returns:** `string` (the rendered template)

### `remove_empty_lines` (static)
Removes empty lines from text.

**Parameters:**
- `text` (`string`): Text to rid empty lines from.

### `concat_path` (static)
Adds two paths together. Mostly intended for internal use only.

**Parameters:**
- `path1` (`string`): First path.
- `path2` (`string`): Second path.

**Returns:** `string` (`path1` added to `path2`)

### `sanitize` (static)
Sanitizes text to make sure it cannot render as HTML. It replaces "<" with the HTML entity "&\lt;" and ">" with the HTML entity "&\gt;". Automatically done to 

**Parameters:**
- `non_html` (`string`): The text to sanitize.

**Returns:** `string` (the sanitized text)

### `check_var_name_legality` (static)
Checks to make sure a variable name is legal. Intended for internal use.

**Parameters:**
- `var_name` (`string`): The variable name to check.
- `dot_allowed` (`boolean`, optional, default is `true`): Whether "." is allowed in the variable name.

**Returns:** `boolean` (`true` is variable name is legal, `false` otherwise)

### `get_var` (static)
Gets the value of a variable, errors if variable undefined. Intended for internal use.

**Parameters:**
- `var_name` (`string`): Name of variable.
- `vars` (`any`, optional but highly recommended): Dictionary/object of variables to get value from.

**Returns:** `any` (the value of the variable)

### Properties
- `templates_dir`: `string`
- `components_dir`: `string`
- `file_extension`: `\`.${string}\`` (see in Types/Interfaces/Consts `file_extension`)

## Types/Interfaces/Consts
These are exported, but there is no real use for them (outside of the module obviously), with the possible exception of writing an extension to Ryuji. Feel free to skip this section.

- `const SYNTAX_REGEX`: Regex to search for Ryuji syntax.
- `type file_extension`: Typescript type `\`.${string}\``, that represents... file extensions. Shocker.
- `interface ForLoopInfo`: Used internally for Ryuji's for loops.

# Usage Examples
Check Ryuji's [tests](https://github.com/jetstream0/hedgeblog/blob/master/tests.ts) for more examples.

There is a real world example in [hedgeblog's code](https://github.com/jetstream0/hedgeblog). For a syntax example, look in the `templates` [directory](https://github.com/jetstream0/hedgeblog/tree/master/templates), or an API example in `saki.ts` and `index.ts`. [pla-den-tor](https://github.com/stjet/pla-den-tor) is another of my projects where Ryuji is used.
