Every December, Advent of Code releases a programming puzzle every day until Christmas. To get on the leaderboard, the goal is to solve the puzzle as soon as possible.

I'm not really into that, and I usually don't participate. Still, it's a good way to learn a new language, and it can be pretty fun if some extra challenges are imposed (eg, writing all the solutions in an esolang). This year though, I decided to use it as an excuse to go code golfing, and learn Scheme. I did days 2, 4, 6, 8, and 10.

> It feels like this is too much exposition already, but I guess I should quickly explain what code golfing is. Code golfing is trying to write code that solves a problem in the least amount of characters/bytes. There are some programming languages that are specifically made for code golfing but I feel like that's kinda cheating. 

## Node.js

I initially golfed in Node.js since I thought Javascript's quirky truthy and falsy system would save characters.

My favourite solution was day 4 part 1 ([input](https://gist.github.com/jetstream0/a0381d894eabb36845ca4b587bdb0494#file-4input-txt), 169 chars):

```js
console.log((require("fs").readFileSync("4input.txt")+"").split`
C`.reduce((p,v)=>p+(v+" ").match(/[0-9]+ /g).reduce((w,c,i,a)=>i<=9?a.includes(c,10)?(w*2||1):w:w,0),0))
```

The task is to find the total points in the input. Each line of the input represents a scratchcard, with two lists of numbers separated by a "|". To the left are the winning numbers for that card, and to the right are the numbers we have. The first number we have that is also a winning number is worth one point, and every subsequent match doubles the point value: a card with 5 winning numbers is worth 16 points (`2^(5-1)` or 1,2,4,8,16), a card with 3 matches is worth 4 points, a card with no matches is worth 0.

There is also a *secret* rule! All the numbers we have are unique - there are no repeats. This means that if 4 is a winning number for a card, there will be no more than one 4 in the numbers we have. This will be important for later.

The code first reads the file, splits it into lines, then for each line, finds **all** the numbers (both the winning numbers and the numbers we have) with regex. For each number, if it is a winning number (`i<=9`, because the winning numbers are the first 10 numbers on the card), it checks if the numbers we have contain that winning number, and if so, appropriately changes the point total for that line. Finally, all the point totals for each line are added up, and the answer is logged.

Notice that **instead of checking whether the numbers we have are in the winning numbers, we do the opposite - check that the winning numbers are in the numbers we have**. This is *only* possible because of the secret rule mentioned earlier. Or well, the logic would be significantly longer if we couldn't assume only one of the winning number was present.

Some explanations about tricks in the code:

- Some functions can be called with backticks instead of parentheses; essentially, `split("a")` can be rewritten as `split\`a\``. I don't know what this is called, and it doesn't always work, but it does save two characters
- The `C` in the `split` is to make sure the last empty line of the file is ignored when splitting the file into lines (as you can see in the input, every line with a card starts with "Card ")
- The `(w,c,i,a)` in the reduce function are the accumulator, current value, current index, and array being iterated over. See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#syntax)
- `(require("fs").readFileSync("4input.txt")+"")` converts the return type to a string (it's shorter than `String(require("fs").readFileSync("4input.txt"))` and `require("fs").readFileSync("4input.txt","utf8")`)
- The regex that has a space at the end (`/[0-9]+ /g`) is to ensure that the card number is not counted as one of the numbers, since the card number is always followed by a colon. I found that to take up less characters than doing the `/[0-9]+/g` regex and `shift()`ing or otherwise ignoring the card number. This does create a problem, however. The last number of the line does not end with a space! The `v+" "` fixes that, by adding a space to the end of the line
- The question marks and colons are [ternary operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator) (a shorthand for if-else statements)
- The `a.includes(c,10)` is my favourite part of this. The second parameter of the includes function is actually the index of `a` to start searching from. So, we are ignoring the first 10 elements of the `a` array (remember? we are checking to see if the winning numbers are in the numbers we have). See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes#syntax)
- `w*2||1` handles increasing the points if the winning number is present in the numbers we have. If `w` (the current count of points in the card) is 0, `w*2||1` will return `1`, while if `w` is non-zero, `w*2` will be returned

## Python

Surprisingly, Python was actually better for code golfing than Node.js, even though indentation is required and some standard library utils need to be imported. Python makes up for that by providing shorter function names (`len()` instead of `.length`), as well as stuff like `[1:]` instead of `.slice(1)`.

Here's day 8 ([input](https://gist.github.com/jetstream0/b9d93e734c48c06544380903fb914b8f#file-8input-txt), 181 chars):

```python
import re;a,*b=re.findall("\w+.",open("8input.txt").read());c="AAA";i=d=0
while 1:
 i+=1;c=b[b.index(c+" ")+(2,1)[a[d]=="L"]][:3]
 d=(d+1,0)[d==len(a)-1]
 if c=="ZZZ":print(i);break
```

And here's day 10 ([input](https://gist.github.com/jetstream0/d302d53b5159265021b5c30923bdf4f7#file-10input-txt), 294 chars):

```python
f=list(open("10input.txt").read());q=[f.index("S")];v=[];n=141
while len(q)>0:
 c=q[0];d=f[c];s=d=="S";a=["|LJ","|7F"];b=["-7J","-LF"];q=q[1:];v=[*v,c]
 for o,w in[[-n,a],[n,a[::-1]],[-1,b],[1,b[::-1]]]:
  if 0<c+o<len(f):
   if([d,f[c+o]][s]in w[s])&((c+o in v)^1):q.append(c+o)
print(len(v)//2)
```

Eaz later pointed out to me that `c=q[0];q=q[1:];` could be rewritten as `c=q.pop(0);`, saving some more characters. After some more tweaking, he trimmed his version of my solution to 271 characters (!).

With help from Eaz, here's a 253 char version that somehow works on Python 3.11:

```python
f=open("10input.txt").read();q=v=[f.find("S")];n=141
while q:d=f[c:=q.pop(0)];a=["|LJ","|7F"];b=["-7J","-LF"];v+=[c];q=[c+o for o,w in[[-n,a],[n,a[::-1]],[-1,b],[1,b[::-1]]]if 0<c+o<len(f)if([d,f[c+o]][s:=d=="S"]in w[s])&((c+o in v)^1)]
print(len(v)//2)
```

In day 8, we're using regex to find all the words, storing the first word (the instructions to go left and right) into `a` and the rest into the list `b`. We set the current location as "AAA" and go into a loop. In every iteration of the loop, we look for the position of the current location with `index` (which should be replaced with `find` to save 1 character). The `+" "` takes advantage of the fact that the input is formatted as `SVN = (JGN, FSL)`. The two connected locations end with `,` and `)`, while what we want, the actual location, ends with a space. Based on whether the current instruction is a left or a right, we make either the left or right connection the current location. We increment the instruction location, wrapping back to the beginning if we reached the last instruction. If the current location is "ZZZ", we have reached the end!

If you read the problems, and know that `[1,2][False] == 1` and `[1,2][True] == 2` (basically, a ternary operator), the code for day 8 should be reasonably understandable. At least for a code golf.

In day 10, we start at "S", and need to find the length of the connecting pipes (which are in one continuous loop). With that, we can do `//2` to find the distance the pipe furthest from the start is. To do this, we are setting up a queue list (`q`) of locations (of connecting pipes) to visit, and a visited (`v`) list of pipe locations we have already visited. In the loop, we are checking the current pipe's surrounding pipes, adding those that connect to our current pipe and have not already been visited to the queue.

Some notes about day 10:

- `v=[*v,c]` is a shortcut for `v.append(c)`\
- 141 is the length of the lines in the input. Since we store locations not as a x,y coord, but rather just a char position in the entire file, this is important
- `a=["|LJ","|7F"];b=["-7J","-LF"];` and `[[-n,a],[n,a[::-1]],[-1,b],[1,b[::-1]]]` help the logic figure out which pipes connect to which. I don't really want to explain more deeply, just read the code
- The `^1` is a "not"

## Scheme Lisp

Here's my Scheme solution for day 6 part 1:

```scheme
;extract a list of numbers from the line
(define extract-numbers (lambda (line)
  (define extract-numbers-tail (lambda (line index current-number-string number-list)
    ;string->number list->string
    (if (< index (string-length line))
      (begin
        (if (char-numeric? (string-ref line index))
          (extract-numbers-tail line (+ index 1) (string-append current-number-string (list->string (cons (string-ref line index) '()))) number-list)
          (begin
            (if (string=? current-number-string "")
              (extract-numbers-tail line (+ index 1) "" number-list)
              (extract-numbers-tail line (+ index 1) "" (cons (string->number current-number-string) number-list))
            )
          )
        )
      )
      (begin
        (if (string=? current-number-string "")
          number-list
          (cons (string->number current-number-string) number-list)
        )
      )
    )
  ))
  (reverse (extract-numbers-tail line 0 "" '()))
))
(define count-and-mul-wins (lambda (time-list distance-list wins-mul)
  (define count-wins (lambda (time distance secs wins)
    (if (< secs time)
      (if (> (* secs (- time secs)) distance)
        (count-wins time distance (+ secs 1) (+ wins 1))
        (count-wins time distance (+ secs 1) wins)
      )
      wins
    )
  ))
  ;check to make sure lists aren't empty
  (if (= (length time-list) 0)
    wins-mul
    (let ([wins (count-wins (car time-list) (car distance-list) 0 0)])
      (if (= wins-mul 0)
        (count-and-mul-wins (cdr time-list) (cdr distance-list) wins)
        (count-and-mul-wins (cdr time-list) (cdr distance-list) (* wins wins-mul))
      )
    )
  )
))
(define file (open-input-file "6input.txt"))
(let* ([line1 (get-line file)] [line2 (get-line file)])
  (display (count-and-mul-wins (extract-numbers line1) (extract-numbers line2) 0))
)
```

In comparison, here's my Node.js solution ([input](https://gist.github.com/jetstream0/9241c005d12c039f296a5c53a66236e6#file-6input-txt), 149 chars):

```js
console.log((require("fs").readFileSync("6input.txt")+"").match(/\d+/g).reduce((p,c,i,a)=>{for(o=j=0;j<+c;)j*(c-j++)>+a[i+4]&&o++;return o?p*o:p},1))
```

Yeah, Scheme isn't ideal for code golfing (maybe with macros?). That's fine, since with Scheme, I was just trying to learn the language, not golf.

It's a bit of a mess since I had no Scheme (or Lisp) experience before I wrote that, unless you count <5 minutes of fiddling around with [try.scheme.org](https://try.scheme.org).

With the help of [The Scheme Programming Language, 4th Edition](https://www.scheme.com/tspl4/) (a wonderful book), and [Scheme Programming](https://en.wikibooks.org/wiki/Scheme_Programming) to figure out where to get started, everything went smoother than expected.

I was initially disappointed to see Scheme missing many "basic" utility functions (eg, a string split function), and considered switching to something like Racket instead. But after just a few minutes I fell deep in love. The syntax was clean and beautiful, and rewriting "basic" functions was incredibly fun. Scheme gives enough of a base to be useful (managing memory, records, lists, some string operations...), but leaves the joy of most everything else up to the programmer. As y'all know, I like implementing things from close to scratch, and hate bloat. It's a perfect match.

It's been a while since I had so much fun programming. To further learn Scheme, I then wrote my first project in Scheme, [rescli](https://github.com/jetstream0/rescli), a CLI interface for [Reservoir](https://github.com/jetstream0/reservoir), a bookmark organizer app I made. I'll talk about those in a different post.

## Why Learn Scheme?

But anyways, how did I end up learning scheme?

After writing [Mingde](https://github.com/stjet/mingde), and a few Rust projects, I was thinking a lot about types. Specifically, how much I loved them (hint: a lot). I was also curious about functional programming.

Naturally, I looked for languages that combined both. Idris I simply could not wrap my head around (and might just be too obscure, even for me), and I found it too difficult to get into OCaml. I will probably try OCaml again later, maybe with ReasonML for more familiar syntax instead. Haskell is also on my "try later" list.

Lisp Scheme is dynamically, not statically, typed (Typed Racket, a similar language, can be statically typed though), which was a bummer and initially discouraged me from trying it. But it's simplicity and lack of bloat was compelling enough for me to give it a try. I'm glad I did. Again, writing in Scheme has been the most fun I've had programming in months, possibly years. Functional programming really is a different, more fun, and arguably better way to think about programming. Avoiding variable mutation and recursing instead of iterating is just... fun. Having the entire language reference as a 3.3 mb PDF is pretty neat too. And I haven't even written a macro yet!

S-expressions (the name for all those parentheses) are really simple to understand, and everything in general is pretty simple to understand. Do a brief read of Scheme Programming, then TSPL4 for reference.

You should learn Scheme too. It's simple. It's fun. Do it now.
