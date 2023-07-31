import { Renderer } from './ryuji.js';
import { test_assert_equal, log_test_results } from './endosulfan.js';

//tests for ryuji

let renderer = new Renderer("./templates", "/components");

test_assert_equal(
  renderer.render(
    "<h1>[[ a ]]</h1>\n<p>lorem ipsum <a href=\"/[[ d.dd ]]\">dolorum</a></p>\n<div>\n  <span>c: [[ html:c ]] ff: [[ d.ee.ff ]]</span>\n</div>",
    {
      a: "yee haw",
      b: 1,
      c: "<b>yee haw</b>",
      d: {
        dd: "cheeseburgers",
        ee: {
          ff: "<i>a</i>"
        },
      },
    }
  ),
  "<h1>yee haw</h1>\n<p>lorem ipsum <a href=\"/cheeseburgers\">dolorum</a></p>\n<div>\n  <span>c: <b>yee haw</b> ff: &lt;i&gt;a&lt;/i&gt;</span>\n</div>",
  "simple variable test"
);

test_assert_equal(
  renderer.render(
    "<div>\n  <p [[ if:editable_paragraph ]]contenteditable=\"true\"[[ endif ]]>abcd</p>\n  <span>extra text: [[ if:extra_text ]]<b>[[ extra_text ]]</b>[[ endif ]]</span>\n  <i>[[ if:extra_text2 ]][[ extra_text2 ]][[ endif ]]</i>\n</div>",
    {
      editable_paragraph: true,
      extra_text: "",
      extra_text2: "this is extra text",
    }
  ),
  "<div>\n  <p contenteditable=\"true\">abcd</p>\n  <span>extra text: </span>\n  <i>this is extra text</i>\n</div>",
  "if statement test"
);

test_assert_equal(
  renderer.render(
    "[[ if:a ]][[ if:b ]]a and b are true[[ endif ]][[ endif ]], yay![[ if:c ]][[ if:d.a ]]but this will not show up[[ endif ]][[ endif ]]",
    {
      a: true,
      b: true,
      c: false,
      d: {
        a: false,
      },
    }
  ),
  "a and b are true, yay!",
  "nested if statement test"
);

test_assert_equal(
  renderer.render(
    "<ul>\n  [[ for:loop_over ]][[ endfor ]]\n</ul>\n<p>[[ for:loop_over:item ]][[ endfor ]]</p>",
    {
      loop_over: [],
    }
  ),
  "<ul>\n  \n</ul>\n<p></p>",
  "empty for loop test"
);

test_assert_equal(
  renderer.render(
    "[[ for:letters:letter ]][[ if:letter.show ]]<p>[[ letter.letter ]]</p>[[ endif ]][[ endfor ]]",
    {
      letters: [
        {
          letter: "a",
          show: true,
        },
        {
          letter: "b",
          show: false,
        },
        {
          letter: "c",
          show: true,
        },
        {
          letter: "d",
          show: false,
        },
      ],
    }
  ),
  "<p>a</p><p>c</p>",
  "nested for loop with if statement test"
);

//for loop and template
test_assert_equal(
  Renderer.remove_empty_lines(
    renderer.render(
      "<div>\n  <ul>\n    [[ for:posts:post ]]\n      [[ component:post-listing ]]\n      <li>[[ for:numbers ]]abc[[ endfor ]]</li>\n    [[ endfor ]]\n  </ul>\n</div>",
      {
        numbers: [1, 2, 3],
        posts: [
          {
            slug: "abc",
            title: "Abc!",
          },
          {
            slug: "san-shi-san",
            title: "San Shi San",
          }
        ]
      }
    )
  ),
  "<div>\n  <ul>\n      <li><a href=\"/posts/abc\">Abc!</a></li>\n      <li>abcabcabc</li>\n      <li><a href=\"/posts/san-shi-san\">San Shi San</a></li>\n      <li>abcabcabc</li>\n  </ul>\n</div>",
  "for loop with template test"
);

log_test_results();
