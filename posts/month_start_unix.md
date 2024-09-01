I came across a problem while making a new faucet for Astral Credits. This faucet had a limited amount of claims each month, so once that amount of claims were made, the faucet would stop dispensing coins for the rest of the month. So, an useful feature to have would be a countdown on the page telling users when a new month would begin and faucet claims would be reset.

The beginning of the month would depend on your timezone, but we want the faucet to reset at the same time for everyone. The obvious solution is to make the faucet reset on the beginning of the month in the standard UTC timezone.

Now, for writing the code for the countdown, I could just use Javascript's built in `Date` class. This is a slightly modified version of the code I came up with:

```js
function get_next_month_diff() {
  let current_date = new Date();
  //get Date object set to the beginning of the next month
  //if current month is january, next month will technically give the date of december 31st midnight but that's fine since that's the same time as january 1st 00:00:00
  let next_month = new Date(Date.UTC(current_date.getUTCFullYear(), current_date.getUTCMonth()+1));
  //get difference in seconds between current time and the start of the next month
  return (next_month.getTime() - current_date.getTime()) / 1000;
}

setInterval(function() {
  let seconds_until = get_next_month_diff();
  //... rest of the code omitted
}, 1000);
```

This works perfectly fine, but wouldn't it be cool if we could do this, without using `Date.UTC()`?

Did I hear someone say "Not really"? Get out!

Anyways, Unix time starts on 00:00 UTC on January 1st, 1970. So to find the Unix timestamp at the start of a month, we would see how many years it has been since 1970, and add the number of years times the number of seconds in a year. Then, we would see what number month it is, and add the number of months since the beginning of the year times the number of seconds in a month. We don't need to worry about days or hours or seconds, since we are only calculating the Unix timestamp of the start of the a month (which is the 1st day, 0 hours and 0 minutes and 0 seconds).

Here's the code:

```js
function get_next_month_unix() {
  let current_date = new Date();
  let current_year = current_date.getUTCFullYear();
  let current_month = current_date.getUTCMonth();
  let next_year = current_year;
  let next_month = current_month + 1;
  //this time next month being january needs to be properly handled
  if (current_month == 11) {
    //if december, next year is +1 and month is 0
    next_year = current_year + 1;
    next_month = 0;
  }
  let unix_timestamp = 0;
  //years since 1970 * seconds in a year
  unix_timestamp += (next_year-1970)*(60*60*24*365);
  //months * seconds in a month
  unix_timestamp += next_month*(60*60*24*30);
  return unix_timestamp;
}

function get_next_month_diff() {
  return get_next_month_unix() - (Date.now() / 1000);
}
```

But wait! Months don't always have 30 days. Oops.

That's not too hard to fix. We can just hardcode in a object that stores how many days each month has:

```js
let days_months = {
  "0": 31,
  "1": 28,
  "2": 31,
  "3": 30,
  "4": 31,
  "5": 30,
  "6": 31,
  "7": 31,
  "8": 30,
  "9": 31,
  "10": 30,
  "11": 31
};

function get_next_month_unix() {
  let current_date = new Date();
  let current_year = current_date.getUTCFullYear();
  let current_month = current_date.getUTCMonth();
  let next_year = current_year;
  let next_month = current_month + 1;
  //this time next month being january needs to be properly handled
  if (current_month == 11) {
    //if december, next year is +1 and month is 0
    next_year = current_year + 1;
    next_month = 0;
  }
  let unix_timestamp = 0;
  //years since 1970 * seconds in a year
  unix_timestamp += (next_year-1970)*(60*60*24*365);
  //months * seconds in a month
  for (let i=0; i < next_month; i++) {
    unix_timestamp += 60*60*24*days_months[String(i)];
  }
  return unix_timestamp;
}

function get_next_month_diff() {
  return get_next_month_unix() - (Date.now() / 1000);
}
```

And don't forget leap days...

Leap days are apparently on years that are divisible by 4, with the exception being if they are divisible by 100 but not 400.

```js
let days_months = {
  "0": 31,
  "1": 28,
  "2": 31,
  "3": 30,
  "4": 31,
  "5": 30,
  "6": 31,
  "7": 31,
  "8": 30,
  "9": 31,
  "10": 30,
  "11": 31
};

const is_leap_year = (year) => year%4 == 0 && (year%100 != 0 || year%400 == 0);

function get_next_month_unix() {
  let current_date = new Date();
  let current_year = current_date.getUTCFullYear();
  let current_month = current_date.getUTCMonth();
  let next_year = current_year;
  let next_month = current_month + 1;
  //this time next month being january needs to be properly handled
  if (current_month == 11) {
    //if december, next year is +1 and month is 0
    next_year = current_year + 1;
    next_month = 0;
  }
  let unix_timestamp = 0;
  //years since 1970 * seconds in a year
  unix_timestamp += (next_year-1970)*(60*60*24*365);
  //add leap days
  for (let year=1970; year < next_year; year++) {
    if (is_leap_year(year)) {
      unix_timestamp += 60*60*24;
    }
  }
  //months * seconds in a month
  for (let i=0; i < next_month; i++) {
    unix_timestamp += 60*60*24*days_months[String(i)];
    //if feburary, and is leap year, add another day
    if (i == 1 && is_leap_year(next_year)) {
      unix_timestamp += 60*60*24;
    }
  }
  return unix_timestamp;
}

function get_next_month_diff() {
  return get_next_month_unix() - (Date.now() / 1000);
}
```

At this point, while thinking about leap days, I realized one huge problem: [leap seconds](https://en.wikipedia.org/wiki/Leap_second). It's a pretty bizzare concept.

Time is defined by the rotation of the Earth and Earth's orbit around the sun, which does not take a constant amount of time, because the orbit changes or something like that. Don't ask me, I'm not an astronomer. But since there can only be 24 hours in a day, sometimes the difference between our measured time (aka "precise time") and the real time (aka "solar time") can drift, and it needs to be corrected.

So, similar to how sometimes leap days happen, the international time keeping authorities (known as the "International Earth Rotation and Reference Systems Service"), occassionally issue leap seconds (if a leap second is issued, instead of the second after 23:59:59 being 00:00:00, it wil be 23:59:60). But unlike leap days, the issuance of leap seconds cannot be predicted, and does not follow any pattern, making it a huge pain in the ass to deal with. There would be no practical way to account for leap seconds (hardcoding all the leap seconds in, and update them when new leap seconds are announced is not practical^citation needed^), so I thought I had to give up.

Luckily, I did a quick [search](https://stackoverflow.com/questions/16539436/unix-time-and-leap-seconds), and it turns out Unix time **ignores leap seconds**, so the above code works correctly. Yay!
