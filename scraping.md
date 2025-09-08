How to scrape Threads by Meta using Python (2025 Update)



🚀 We are hiring! [See open positions](/jobs "/jobs")

[![Scrapfly](https://cdn.scrapfly.io/static/blog/media/logo-light.svg?v=e4c2e8ed)
![Scrapfly](https://cdn.scrapfly.io/static/blog/media/logo.svg?v=e4c2e8ed)

![Scrapfly](https://cdn.scrapfly.io/static/blog/media/logo-dark.svg?v=e4c2e8ed)
![Scrapfly](https://cdn.scrapfly.io/static/blog/media/logo.svg?v=e4c2e8ed)](/ "/")

[Products](# "#")

[![API](https://cdn.scrapfly.io/static/blog/media/web-scraping-api-icon.svg?v=e4c2e8ed)
Web Scraping API

scrape any website](/web-scraping-api "/web-scraping-api")
[![API](https://cdn.scrapfly.io/static/blog/media/ai-web-scraping-api-icon.svg?v=e4c2e8ed)
AI Web Scraping API

hands-off web scraping](/web-scraping-api "/web-scraping-api")
[![API](https://cdn.scrapfly.io/static/blog/media/extraction-api-icon.svg?v=e4c2e8ed)
Extraction API

parse your documents](/extraction-api "/extraction-api")
[![API](https://cdn.scrapfly.io/static/blog/media/screenshot-api-icon.svg?v=e4c2e8ed)
Screenshot API

capture the visual web](/screenshot-api "/screenshot-api")

[Why Us?](/why-choose-scrapfly "/why-choose-scrapfly")
[Pricing](/pricing "/pricing")
[Docs](/docs "/docs")
[Blog](https://scrapfly.io/blog/ "https://scrapfly.io/blog/")
[Knowledgebase](https://scrapfly.io/blog/answers "https://scrapfly.io/blog/answers")

[Login](/login "/login")
[Sign Up](/signup "/signup")


[Products](# "#")

[![API](https://cdn.scrapfly.io/static/blog/media/web-scraping-api-icon.svg?v=e4c2e8ed)
Web Scraping API

scrape any website](/web-scraping-api "/web-scraping-api")
[![API](https://cdn.scrapfly.io/static/blog/media/ai-web-scraping-api-icon.svg?v=e4c2e8ed)
AI Web Scraping API

hands-off web scraping](/web-scraping-api "/web-scraping-api")
[![API](https://cdn.scrapfly.io/static/blog/media/extraction-api-icon.svg?v=e4c2e8ed)
Extraction API

parse your documents](/extraction-api "/extraction-api")
[![API](https://cdn.scrapfly.io/static/blog/media/screenshot-api-icon.svg?v=e4c2e8ed)
Screenshot API

capture the visual web](/screenshot-api "/screenshot-api")

[Why Us?](/why-choose-scrapfly "/why-choose-scrapfly")
[Pricing](/pricing "/pricing")
[Docs](/docs "/docs")
[Blog](https://scrapfly.io/blog/ "https://scrapfly.io/blog/")
[Knowledgebase](https://scrapfly.io/blog/answers "https://scrapfly.io/blog/answers")



How to scrape Threads by Meta using Python (2025 Update)
========================================================

by [Bernardas Ališauskas](https://scrapfly.io/blog/authors/scrapecrow "https://scrapfly.io/blog/authors/scrapecrow")
Jan 21, 2025

[#scrapeguide](https://scrapfly.io/blog/tags/scrapeguide "https://scrapfly.io/blog/tags/scrapeguide")
[#python](https://scrapfly.io/blog/tags/python "https://scrapfly.io/blog/tags/python")

AI

×

Explore this Article with AI
----------------------------

[ChatGPT](https://chat.openai.com/?q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads "https://chat.openai.com/?q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads")
[Gemini](https://www.google.com/search?udm=50&aep=11&q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads "https://www.google.com/search?udm=50&aep=11&q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads")
[Grok](https://x.com/i/grok?text=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads "https://x.com/i/grok?text=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads")
[Perplexity](https://www.perplexity.ai/search/new?q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads "https://www.perplexity.ai/search/new?q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads")
[Claude](https://claude.ai/new?q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads "https://claude.ai/new?q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads")

![How to scrape Threads by Meta using Python (2025 Update)](https://cdn.scrapfly.io/static/blog/posts/how-to-scrape-threads/feature-light.svg?v=e16b6c08)
![How to scrape Threads by Meta using Python (2025 Update)](https://cdn.scrapfly.io/static/blog/posts/how-to-scrape-threads/feature-dark.svg?v=e16b6c08)

Meta has just launched a Twitter alternative called [Threads](https://www.threads.net/ "https://www.threads.net/"). Today, we'll take a look at how to scrape it using Python.

Threads is very similar to Twitter, a microblogging platform containing valuable public data used in sentiment analysis, market research and brand awareness.

To scrape Threads, we'll be using Python with [hidden web data scraping technique](https://scrapfly.io/blog/posts/how-to-scrape-hidden-web-data "https://scrapfly.io/blog/posts/how-to-scrape-hidden-web-data") and a few popular community packages. So, let's dive in and see how to write a Threads scraper in Python from ground up!

[Latest Threads.net Scraper Code
-------------------------------

https://github.com/scrapfly/scrapfly-scrapers/](https://github.com/scrapfly/scrapfly-scrapers/tree/main/threads-scraper "https://github.com/scrapfly/scrapfly-scrapers/tree/main/threads-scraper")

Legal Disclaimer and Precautions
This tutorial covers popular web scraping techniques for education. Interacting with public servers requires diligence and respect and here's a good summary of what not to do:

* Do not scrape at rates that could damage the website.
* Do not scrape data that's not available publicly.
* Do not store PII of EU citizens who are protected by GDPR.
* Do not repurpose the *entire* public datasets which can be illegal in some countries.

Scrapfly does not offer legal advice but these are good general rules to follow in web scraping
and for more you should consult a lawyer.

Why Scrape Threads?
-------------------

Threads contain a vast amount of public data that can be used in a variety of ways. A popular case of scraping Threads is sentiment analysis. Researchers can use Machine Learning techniques to analyze the users' threads. This allows for understanding the trends and opinions on a given subject.

Moreover, scraping Threads can be beneficial for individuals, where they can utilize its data for brand awareness and finding new leads, keeping track of public figures or data archiving.

Project Setup
-------------

Threads is a JavaScript application. In fact, [threads.net](https://www.threads.net/ "https://www.threads.net/") doesn't even load without JavaScript enabled. So, we'll be using a headless browser to scrape its complex pages. This will help our Threads scraper bypass and blocking techniques the website may be using.

To scrape Threads, we'll be using:

* [Playwright](https://scrapfly.io/blog/posts/web-scraping-with-playwright-and-python "https://scrapfly.io/blog/posts/web-scraping-with-playwright-and-python") (or [scrapfly-sdk](https://scrapfly.io/docs/sdk/python "https://scrapfly.io/docs/sdk/python")) to scrape threads pages.
* [Jmespath json parsing library](https://scrapfly.io/blog/posts/parse-json-jmespath-python "https://scrapfly.io/blog/posts/parse-json-jmespath-python") and `nested_lookup` to parse JSON datasets.

All of which can be installed using the `pip install` command:

```
$ pip install playwright nested_lookup jmespath "scrapfly-sdk[all]"
```

Scraping Threads (Posts)
------------------------

To start, let's take a look at how to scrape a Thread - that's what Threads call a post.

Threads is using [hidden web data](https://scrapfly.io/blog/posts/how-to-scrape-hidden-web-data "https://scrapfly.io/blog/posts/how-to-scrape-hidden-web-data") to load post information. In other words, it hides the data in a `<script>` element as JSON and when the page loads, it expands it to the visible HTML part of the page.

To reverse engineer this we can use [Browser Developer Tools](https://scrapfly.io/blog/answers/browser-developer-tools-in-web-scraping "https://scrapfly.io/blog/answers/browser-developer-tools-in-web-scraping"), which allows us to inspect the whole page using the `Elements` explorer.

For example, a thread data like [threads.net/t/C8H5FiCtESk/](https://www.threads.net/@natgeo/post/C8H5FiCtESk "https://www.threads.net/@natgeo/post/C8H5FiCtESk") is loaded through similar background requests:

[![

Your browser does not support the video tag. This would show: Threads.net post page loading as seen in chrome devtools suite
](https://cdn.scrapfly.io/static/blog/posts/how-to-scrape-threads/threads-post-loading.webp?v=e16b6c08)](https://cdn.scrapfly.io/static/blog/posts/how-to-scrape-threads/threads-post-loading.mp4?v=e16b6c08)


Threads post page hidden data as seen in Chrome devtools

Above, we used a text from the visible part of the page and searched it through the elements explorer of Chrome devtools. We can see that the data is hidden in a `<script>` element:

```
<script type="application/json" data-content-len="71122" data-sjs>
{"require":[["ScheduledServerJS","handle", ...
</script>
```

To scrape this data, we'll have to:

1. Load threads page using a headless browser (`Playwright`).
2. Load page HTML using `parsel` html parser.
3. Find the correct `<script>` element with hidden data.
4. Load hidden JSON dataset.
5. Parse JSON dataset using `nested_lookup` and `jmespath`.

In Python and Playwright or Scrapfly-SDK this is as simple as this short snippet:

Python

ScrapFly

```
import json
from typing import Dict

import jmespath
from parsel import Selector
from nested_lookup import nested_lookup
from playwright.sync_api import sync_playwright


def parse_thread(data: Dict) -> Dict:
    """Parse Twitter tweet JSON dataset for the most important fields"""
    result = jmespath.search(
        """{
        text: post.caption.text,
        published_on: post.taken_at,
        id: post.id,
        pk: post.pk,
        code: post.code,
        username: post.user.username,
        user_pic: post.user.profile_pic_url,
        user_verified: post.user.is_verified,
        user_pk: post.user.pk,
        user_id: post.user.id,
        has_audio: post.has_audio,
        reply_count: view_replies_cta_string,
        like_count: post.like_count,
        images: post.carousel_media[].image_versions2.candidates[1].url,
        image_count: post.carousel_media_count,
        videos: post.video_versions[].url
    }""",
        data,
    )
    result["videos"] = list(set(result["videos"] or []))
    if result["reply_count"] and type(result["reply_count"]) != int:
        result["reply_count"] = int(result["reply_count"].split(" ")[0])
    result[
        "url"
    ] = f"https://www.threads.net/@{result['username']}/post/{result['code']}"
    return result


def scrape_thread(url: str) -> dict:
    """Scrape Threads post and replies from a given URL"""
    with sync_playwright() as pw:
        # start Playwright browser
        browser = pw.chromium.launch()
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        # go to url and wait for the page to load
        page.goto(url)
        # wait for page to finish loading
        page.wait_for_selector("[data-pressable-container=true]")
        # find all hidden datasets
        selector = Selector(page.content())
        hidden_datasets = selector.css('script[type="application/json"][data-sjs]::text').getall()
        # find datasets that contain threads data
        for hidden_dataset in hidden_datasets:
            # skip loading datasets that clearly don't contain threads data
            if '"ScheduledServerJS"' not in hidden_dataset:
                continue
            if "thread_items" not in hidden_dataset:
                continue
            data = json.loads(hidden_dataset)
            # datasets are heavily nested, use nested_lookup to find 
            # the thread_items key for thread data
            thread_items = nested_lookup("thread_items", data)
            if not thread_items:
                continue
            # use our jmespath parser to reduce the dataset to the most important fields
            threads = [parse_thread(t) for thread in thread_items for t in thread]
            return {
                # the first parsed thread is the main post:
                "thread": threads[0],
                # other threads are replies:
                "replies": threads[1:],
            }
        raise ValueError("could not find thread data in page")


if __name__ == "__main__":
    print(scrape_thread("https://www.threads.net/t/C8H5FiCtESk/"))
```

```
import json
from typing import Dict

import jmespath
from nested_lookup import nested_lookup
from scrapfly import ScrapflyClient, ScrapeConfig

SCRAPFLY = ScrapflyClient(key="YOUR SCRAPFLY KEY")


def parse_thread(data: Dict) -> Dict:
    """Parse Twitter tweet JSON dataset for the most important fields"""
    result = jmespath.search(
        """{
        text: post.caption.text,
        published_on: post.taken_at,
        id: post.id,
        pk: post.pk,
        code: post.code,
        username: post.user.username,
        user_pic: post.user.profile_pic_url,
        user_verified: post.user.is_verified,
        user_pk: post.user.pk,
        user_id: post.user.id,
        has_audio: post.has_audio,
        reply_count: post.text_post_app_info.direct_reply_count,
        like_count: post.like_count,
        images: post.carousel_media[].image_versions2.candidates[1].url,
        image_count: post.carousel_media_count,
        videos: post.video_versions[].url
    }""",
        data,
    )
    result["videos"] = list(set(result["videos"] or []))
    if result["reply_count"] and type(result["reply_count"]) != int:
        result["reply_count"] = int(result["reply_count"].split(" ")[0])
    result[
        "url"
    ] = f"https://www.threads.net/@{result['username']}/post/{result['code']}"
    return result


async def scrape_thread(url: str) -> dict:
    """Scrape Threads post and replies from a given URL"""
    _xhr_calls = []
    result = await SCRAPFLY.async_scrape(
        ScrapeConfig(
            url,
            asp=True,  # enables scraper blocking bypass if any
            country="US",  # use US IP address as threads is only available in select countries
        )
    )
    hidden_datasets = result.selector.css(
        'script[type="application/json"][data-sjs]::text'
    ).getall()
    # find datasets that contain threads data
    for hidden_dataset in hidden_datasets:
        # skip loading datasets that clearly don't contain threads data
        if '"ScheduledServerJS"' not in hidden_dataset:
            continue
        if "thread_items" not in hidden_dataset:
            continue
        data = json.loads(hidden_dataset)
        # datasets are heavily nested, use nested_lookup to find
        # the thread_items key for thread data
        thread_items = nested_lookup("thread_items", data)
        if not thread_items:
            continue
        # use our jmespath parser to reduce the dataset to the most important fields
        threads = [parse_thread(t) for thread in thread_items for t in thread]
        return {
            "thread": threads[0],
            "replies": threads[1:],
        }
    raise ValueError("could not find thread data in page")


# Example use:
if __name__ == "__main__":
    import asyncio
    print(asyncio.run(scrape_thread("https://www.threads.net/t/C8H5FiCtESk")))
```

Example Output

```
{
  "thread": {
    "text": "No one loves a drop-in dinner guest… especially if you’re the dinner 😮‍💨😳 The Flood is streaming on Disney+",
    "published_on": 1718211770,
    "id": "3388928313420694692_787132",
    "pk": "3388928313420694692",
    "code": "C8H5FiCtESk",
    "username": "natgeo",
    "user_pic": "https://scontent.cdninstagram.com/v/t51.2885-19/445315924_1179476269899767_3812682513517013106_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent.cdninstagram.com&_nc_cat=1&_nc_ohc=A-euq3qhzYsQ7kNvgHDVuk2&edm=APs17CUBAAAA&ccb=7-5&oh=00_AYCO45XWNd6ezTYczMRan64-1lXnqRDOcnb5dngNDLUu8Q&oe=66729144&_nc_sid=10d13b",
    "user_verified": true,
    "user_pk": "787132",
    "user_id": null,
    "has_audio": true,
    "reply_count": 15,
    "like_count": 1401,
    "images": null,
    "image_count": null,
    "videos": [
      "https://scontent.cdninstagram.com/o1/v/t16/f2/m69/An_0DAta0xzS30UE2VmywTHuEsCdooQ36-399rjc5R8NwrHhSwKMIlrhGZbqtK1YKBqfc_ZzwwXbVQ9fHfp94jVc.mp4?efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uZmVlZC5jMi4xMDgwLmhpZ2gifQ&_nc_ht=scontent.cdninstagram.com&_nc_cat=106&vs=788544609927205_192864873&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HR0dNU0FmS09hX3YyaWtFQU10THpLQVFPZ2Q0YnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dPeHh0aHBJcHctREJ2WURBR3I1MUhtMEFaWTZia1lMQUFBRhUCAsgBACgAGAAbABUAACaA7%2BHXyJCBQBUCKAJDMywXQCwzMzMzMzMYEmRhc2hfaGlnaF8xMDgwcF92MREAdeoHAA%3D%3D&_nc_rid=f7b0276fad&ccb=9-4&oh=00_AYDgcLzuR3S2bpjZMXTmzOfQxXgpHUmSdxHk1kUbvwisOw&oe=666E81FA&_nc_sid=10d13b"
    ],
    "url": "https://www.threads.net/@natgeo/post/C8H5FiCtESk"
  },
  "replies": [
    {
      "text": "Crazy height",
      "published_on": 1718269599,
      "id": "3389413516270515095_16006994536",
      "pk": "3389413516270515095",
      "code": "C8JnaKaNjOX",
      "username": "adreanliegel",
      "user_pic": "https://scontent.cdninstagram.com/v/t51.2885-19/447952512_957142459229378_6965625641748334900_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent.cdninstagram.com&_nc_cat=102&_nc_ohc=sfaQIM7z2ZUQ7kNvgHiUoGh&edm=APs17CUBAAAA&ccb=7-5&oh=00_AYBlF_YHf_5s43deVUY-bNScjRf6LdbAoCDhYKCw416TOg&oe=667290B7&_nc_sid=10d13b",
      "user_verified": false,
      "user_pk": "16006994536",
      "user_id": null,
      "has_audio": null,
      "reply_count": 0,
      "like_count": 0,
      "images": null,
      "image_count": null,
      "videos": [],
      "url": "https://www.threads.net/@adreanliegel/post/C8JnaKaNjOX"
    },
    ....
  ]
}
```

Let's break down the above code.

We first define our parser `parse_thread` function, which takes the Threads object and uses a simple `jmespath` key remapping function to reduce the dataset to the most important fields. To scrape the Threads posts, we're using Playwright - we start a browser in headless mode, navigate to the post URL and wait for it to load. Then, we select all hidden web data elements, find the ones that contain post data and extract them.

Next, let's take a look at how to scrape Threads user profiles.

Scraping Profiles
-----------------

To scrape Threads profiles we'll use the same approach we used in scraping Threads posts - scraping the hidden page data. The only difference here is that we'll be scraping a different dataset.

For example, we have this Threads profile: [threads.net/@natgeo](https://www.threads.net/@natgeo "https://www.threads.net/@natgeo").

Just like with post pages, user data is located in a `<script>` element:

```
<script type="application/json" data-content-len="71122" data-sjs>
{"require":[["ScheduledServerJS","handle", ...
</script>
```

We can use the same Chrome developer tools approach to figure this out as well:

[![

Your browser does not support the video tag. This would show: Threads.net profile page loading as seen in chrome devtools suite
](https://cdn.scrapfly.io/static/blog/posts/how-to-scrape-threads/threads-profile-loading.webp?v=e16b6c08)](https://cdn.scrapfly.io/static/blog/posts/how-to-scrape-threads/threads-profile-loading.mp4?v=e16b6c08)


Threads profile page hidden data as seen in Chrome devtools

To parse the hidden datasets of user profiles, we'll filter the data we get using any user field, such as the follower count. Then, we'll use `nested_lookup` to get the actual user data object.

So, our scraping Threads profiles process will be:

1. Load threads page using a headless browser (`Playwright`).
2. Load page HTML using `parsel` html parser.
3. Find the correct `<script>` element with hidden data.
4. Load hidden JSON dataset.
5. Parse JSON `userData` dataset using `nested_lookup` and `jmespath`.

Let's apply this within our code:

Python

ScrapFly

```
import json
from typing import Dict

import jmespath
from parsel import Selector
from playwright.sync_api import sync_playwright
from nested_lookup import nested_lookup

# Note: we'll also be using parse_thread function we wrote earlier:
from scrapethread import parse_thread


def parse_profile(data: Dict) -> Dict:
    """Parse Threads profile JSON dataset for the most important fields"""
    result = jmespath.search(
        """{
        is_private: text_post_app_is_private,
        is_verified: is_verified,
        profile_pic: hd_profile_pic_versions[-1].url,
        username: username,
        full_name: full_name,
        bio: biography,
        bio_links: bio_links[].url,
        followers: follower_count
    }""",
        data,
    )
    result["url"] = f"https://www.threads.net/@{result['username']}"
    return result



def scrape_profile(url: str) -> dict:
    """Scrape Threads profile and their recent posts from a given URL"""
    with sync_playwright() as pw:
        # start Playwright browser
        browser = pw.chromium.launch()
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        page.goto(url)
        # wait for page to finish loading
        page.wait_for_selector("[data-pressable-container=true]")
        selector = Selector(page.content())
    parsed = {
        "user": {},
        "threads": [],
    }
    # find all hidden datasets
    hidden_datasets = selector.css('script[type="application/json"][data-sjs]::text').getall()
    for hidden_dataset in hidden_datasets:
        # skip loading datasets that clearly don't contain threads data
        if '"ScheduledServerJS"' not in hidden_dataset:
            continue
        is_profile = 'follower_count' in hidden_dataset
        is_threads = 'thread_items' in hidden_dataset
        if not is_profile and not is_threads:
            continue
        data = json.loads(hidden_dataset)
        if is_profile:
            user_data = nested_lookup('user', data)
            parsed['user'] = parse_profile(user_data[0])
        if is_threads:
            thread_items = nested_lookup('thread_items', data)
            threads = [
                parse_thread(t) for thread in thread_items for t in thread
            ]
            parsed['threads'].extend(threads)
    return parsed

if __name__ == "__main__":
    data = scrape_profile("https://www.threads.net/@natgeo")
    print(json.dumps(data, indent=2, ensure_ascii=False))
```

```
import json
from typing import Dict

import jmespath
from nested_lookup import nested_lookup

# Note: we'll also be using parse_thread function we wrote earlier:
from scrapethread import parse_thread
from scrapfly import ScrapflyClient, ScrapeConfig

SCRAPFLY = ScrapflyClient(key="YOUR SCRAPFLY KEY")


def parse_profile(data: Dict) -> Dict:
    """Parse Threads profile JSON dataset for the most important fields"""
    result = jmespath.search(
        """{
        is_private: text_post_app_is_private,
        is_verified: is_verified,
        profile_pic: hd_profile_pic_versions[-1].url,
        username: username,
        full_name: full_name,
        bio: biography,
        bio_links: bio_links[].url,
        followers: follower_count
    }""",
        data,
    )
    result["url"] = f"https://www.threads.net/@{result['username']}"
    return result


async def scrape_profile(url: str) -> Dict:
    """Scrape Threads profile and their recent posts from a given URL"""
    result = await SCRAPFLY.async_scrape(
        ScrapeConfig(
            url,
            asp=True,  # enables scraper blocking bypass if any
            country="US",  # Threads is available only in select countries
        )
    )
    parsed = {
        "user": {},
        "threads": [],
    }
    # find all hidden datasets
    hidden_datasets = result.selector.css('script[type="application/json"][data-sjs]::text').getall()
    for hidden_dataset in hidden_datasets:
        # skip loading datasets that clearly don't contain threads data
        if '"ScheduledServerJS"' not in hidden_dataset:
            continue
        is_profile = 'follower_count' in hidden_dataset
        is_threads = 'thread_items' in hidden_dataset
        if not is_profile and not is_threads:
            continue
        data = json.loads(hidden_dataset)
        if is_profile:
            user_data = nested_lookup('user', data)
            parsed['user'] = parse_profile(user_data[0])
        if is_threads:
            thread_items = nested_lookup('thread_items', data)
            threads = [
                parse_thread(t) for thread in thread_items for t in thread
            ]
            parsed['threads'].extend(threads)
    return parsed

# Example use:
if __name__ == "__main__":
    import asyncio
    data = asyncio.run(scrape_profile("https://www.threads.net/@natgeo"))
    print(json.dumps(data, indent=2, ensure_ascii=False))
```

Example Output

```
{
  "user": {
    "is_private": false,
    "is_verified": true,
    "profile_pic": "https://scontent.cdninstagram.com/v/t51.2885-19/445315924_1179476269899767_3812682513517013106_n.jpg?stp=dst-jpg_s320x320&_nc_ht=scontent.cdninstagram.com&_nc_cat=1&_nc_ohc=A-euq3qhzYsQ7kNvgGYZvOK&edm=APs17CUBAAAA&ccb=7-5&oh=00_AYBVHh27Dh9ld5wj8As0Rhx14r975TaKdq4Teant-K5Atg&oe=66729144&_nc_sid=10d13b",
    "username": "natgeo",
    "full_name": "National Geographic",
    "bio": "Taking our understanding and awareness of the world further for more than 135 years.",
    "bio_links": [
      "https://on.natgeo.com/instagram"
    ],
    "followers": 12298144,
    "url": "https://www.threads.net/@natgeo"
  },
  "threads": [
    {
      "text": "You know them. You've heard them. But have you really seen them? 👀 Take an up-close look at cicadas with @ladzinski and about the double emergence that's making history: https://on.natgeo.com/NGETH061324",
      "published_on": 1718310826,
      "id": "3389759055070364028_787132",
      "pk": "3389759055070364028",
      "code": "C8K1-afogF8",
      "username": "natgeo",
      "user_pic": "https://scontent.cdninstagram.com/v/t51.2885-19/445315924_1179476269899767_3812682513517013106_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent.cdninstagram.com&_nc_cat=1&_nc_ohc=A-euq3qhzYsQ7kNvgGYZvOK&edm=APs17CUBAAAA&ccb=7-5&oh=00_AYDPdaqE9mgpXeB543Pz76iMvCXFIRf7m1SWcREkuBTgsw&oe=66729144&_nc_sid=10d13b",
      "user_verified": true,
      "user_pk": "787132",
      "user_id": null,
      "has_audio": true,
      "reply_count": null,
      "like_count": 293,
      "images": null,
      "image_count": null,
      "videos": [
        "https://scontent.cdninstagram.com/o1/v/t16/f2/m69/An_Cz_xzJGkAFJtnErOtj2bc8XZmu3m_DNEL3H7W-VdNxkefpB04O3XKREi279AS25tLUGqgxtCphrGZs_Kd9yAc.mp4?efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uZmVlZC5jMi4xMDgwLmhpZ2gifQ&_nc_ht=scontent.cdninstagram.com&_nc_cat=104&vs=1005488174425989_290455396&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HSmVveXdKcldXOHRnUndFQUlGcFY1UnZzbXRSYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dOeER0eHJraGxzUVlLRUJBRUhaWHFZNnpFUklia1lMQUFBRhUCAsgBACgAGAAbABUAACak3NrIwtC0PxUCKAJDMywXQEPqn752yLQYEmRhc2hfaGlnaF8xMDgwcF92MREAdeoHAA%3D%3D&_nc_rid=6726eb828d&ccb=9-4&oh=00_AYB_EIPIWIbxqAEPwmzegLQCusCckCm_bXdkSDPcNM5LaQ&oe=666E9223&_nc_sid=10d13b"
      ],
      "url": "https://www.threads.net/@natgeo/post/C8K1-afogF8"
    },
    ....
  ]
}
```

The above code is very similar to the one for scraping Threads posts. We started by initializing a playwright browser and requesting the page URL. Next, we parse the profile data, it contains the user information and their recent posts that we reduced to a single JSON object using `jmespath`.

FAQ
---

To wrap up our Threads scraper let's take a look at some frequently asked questions about web scraping Threads.

#### Is it legal to scrape Threads?

Yes, data on Thread are publicly available and it's legal to scrape them. However, this only applies if the scraping rate is reasonable and doesn't cause any damage to the website.

#### Can I scrape Threads without login?

Yes. Threads posts and profile pages are accessible through threads.net without having to login. However, some details like search results and some metadata fields (like follower/following usernames) require login in which is not advisable when web scraping.

#### Is there Threads API?

No. Currently, Threads.net doesn't offer public API access though it's easy to scrape as described in this tutorial. That being said, it's likely that Threads will offer public API access as it has promised Federation support in the future which is a public data protocol.

#### Can I scrape Threads without using a headless browser?

Kinda. Threads is a very complex JavaScipt application. So, to scrape it using traditional HTTP requests like Python requests and Beautifulsoup requires a lot of reverse engineering and is not recommended. However, using headless browsers like described in this blog is really easy!

#### How to discover posts and users on Threads?

Since search and user discovery is only available on Threads mobile apps and through login we can't safely scrape them using Python. However since Threads is integrated with Instagram we can scrape Instagram to discover Threads content. For that see [our guide for scraping Instagram](https://scrapfly.io/blog/posts/how-to-scrape-instagram#scraping-instagram-user-data "https://scrapfly.io/blog/posts/how-to-scrape-instagram#scraping-instagram-user-data")

[Latest Threads.com Scraper Code

https://github.com/scrapfly/scrapfly-scrapers/](https://github.com/scrapfly/scrapfly-scrapers/tree/main/threads-scraper "https://github.com/scrapfly/scrapfly-scrapers/tree/main/threads-scraper")

Threads Scraping Summary
------------------------

In this Threads web scraping tutorial we have taken a look at how to scrape Threads posts and user profiles using Python and Playwright.

We used a technique called background request capture which is a prime fit for complex javascript applications such as Meta's Threads.

Finally, we processed the captured data using `jmespath` JSON parsing library which makes dataset reshaping a breeze which concluded our Python Threads scraper.

As Threads is a new social network we'll continue to monitor the ways to scrape it and update this guide, so stay tuned!

* [Latest Threads.net Scraper Code](#latest-twittercom-scraper-code "#latest-twittercom-scraper-code")
* [Why Scrape Threads?](#why-scrape-threads "#why-scrape-threads")
* [Project Setup](#project-setup "#project-setup")
* [Scraping Threads (Posts)](#scraping-threads-posts "#scraping-threads-posts")
* [Scraping Profiles](#scraping-profiles "#scraping-profiles")
* [FAQ](#faq "#faq")
* [Threads Scraping Summary](#threads-scraping-summary "#threads-scraping-summary")

JOIN THE NEWSLETTER

Get monthly web scraping insights 👆

[Learn at ScrapFly Academy](https://scrapfly.io/academy "https://scrapfly.io/academy")

[Check out Python SDK](https://scrapfly.io/docs/onboarding "https://scrapfly.io/docs/onboarding")
[Try Scrapfly for FREE!](https://scrapfly.io/register "https://scrapfly.io/register")

Explore this Article with AI
----------------------------

[ChatGPT](https://chat.openai.com/?q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads "https://chat.openai.com/?q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads")
[Gemini](https://www.google.com/search?udm=50&aep=11&q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads "https://www.google.com/search?udm=50&aep=11&q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads")
[Grok](https://x.com/i/grok?text=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads "https://x.com/i/grok?text=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads")
[Perplexity](https://www.perplexity.ai/search/new?q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads "https://www.perplexity.ai/search/new?q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads")
[Claude](https://claude.ai/new?q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads "https://claude.ai/new?q=Summarize%20this%20page%3A%20https%3A//scrapfly.io/blog/posts/how-to-scrape-threads")

Related Knowledgebase
---------------------

[### Python httpx vs requests vs aiohttp - key differences](https://scrapfly.io/blog/answers/httpx-vs-requests-vs-aiohttp "https://scrapfly.io/blog/answers/httpx-vs-requests-vs-aiohttp")
[### How to scrape HTML table to Excel Spreadsheet (.xlsx)?](https://scrapfly.io/blog/answers/html-table-to-xlsx-python-beautifulsoup "https://scrapfly.io/blog/answers/html-table-to-xlsx-python-beautifulsoup")
[### What Python libraries support HTTP2?](https://scrapfly.io/blog/answers/what-python-libraries-support-http2 "https://scrapfly.io/blog/answers/what-python-libraries-support-http2")
[### How to handle popup dialogs in Playwright?](https://scrapfly.io/blog/answers/how-to-click-on-alert-dialog-in-playwright "https://scrapfly.io/blog/answers/how-to-click-on-alert-dialog-in-playwright")
[### How to use proxies with Python httpx?](https://scrapfly.io/blog/answers/how-to-use-proxies-python-httpx "https://scrapfly.io/blog/answers/how-to-use-proxies-python-httpx")
[### How to scrape images from a website?](https://scrapfly.io/blog/answers/how-to-scrape-images-from-website "https://scrapfly.io/blog/answers/how-to-scrape-images-from-website")

[### What are some ways to parse JSON datasets in Python?](https://scrapfly.io/blog/answers/what-are-some-ways-to-parse-json-datasets-in-python "https://scrapfly.io/blog/answers/what-are-some-ways-to-parse-json-datasets-in-python")
[### How to use cURL in Python?](https://scrapfly.io/blog/answers/how-to-use-curl-in-python "https://scrapfly.io/blog/answers/how-to-use-curl-in-python")
[### Selenium: geckodriver executable needs to be in PATH?](https://scrapfly.io/blog/answers/selenium-geckodriver-in-path "https://scrapfly.io/blog/answers/selenium-geckodriver-in-path")
[### How to fix Python requests SSLError?](https://scrapfly.io/blog/answers/python-requests-exception-sllerror "https://scrapfly.io/blog/answers/python-requests-exception-sllerror")
[### Selenium: chromedriver executable needs to be in PATH?](https://scrapfly.io/blog/answers/selenium-chromedriver-in-path "https://scrapfly.io/blog/answers/selenium-chromedriver-in-path")
[### How to open Python http responses in a web browser?](https://scrapfly.io/blog/answers/how-to-open-python-responses-in-browser "https://scrapfly.io/blog/answers/how-to-open-python-responses-in-browser")

Related Articles
----------------

[How to Scrape Naver.com
-----------------------

Master web scraping techniques for Naver.com, South Korea's dominant search engine.

SCRAPEGUIDE

PYTHON

BEAUTIFULSOUP

REQUESTS

![How to Scrape Naver.com](https://cdn.scrapfly.io/static/blog/posts/how-to-scrape-naver/feature-dark.png?v=78307957)](https://scrapfly.io/blog/posts/how-to-scrape-naver "https://scrapfly.io/blog/posts/how-to-scrape-naver")
[How to Scrape Imovelweb.com
---------------------------

Scrape Imovelweb with Python - extract listings and details, handle pagination and JSON-LD, and use Scrapfly for anti-bot reliability.

PYTHON

SCRAPEGUIDE

BEAUTIFULSOUP

REQUESTS

SCRAPFLY

![How to Scrape Imovelweb.com](https://cdn.scrapfly.io/static/blog/posts/how-to-scrape-imovelweb/feature-dark.png?v=2a1d8315)](https://scrapfly.io/blog/posts/how-to-scrape-imovelweb "https://scrapfly.io/blog/posts/how-to-scrape-imovelweb")
[How to Scrape AutoScout24
-------------------------

Learn how to scrape AutoScout24 for car listings, prices, specifications, and detailed vehicle information using Python. Complete guide with code examples and anti-blocking techniques.

PYTHON

SCRAPEGUIDE

BEAUTIFULSOUP

REQUESTS

![How to Scrape AutoScout24](https://cdn.scrapfly.io/static/blog/posts/how-to-scrape-autoscout24/feature-dark.png?v=d342aa60)](https://scrapfly.io/blog/posts/how-to-scrape-autoscout24 "https://scrapfly.io/blog/posts/how-to-scrape-autoscout24")
[How to Scrape Allegro.pl
------------------------

Learn how to scrape Allegro.pl for product listings and individual product details using Python with requests and BeautifulSoup4

PYTHON

SCRAPEGUIDE

BEAUTIFULSOUP

REQUESTS

![How to Scrape Allegro.pl](https://cdn.scrapfly.io/static/blog/posts/how-to-scrape-allegro/feature-dark.png?v=350368e6)](https://scrapfly.io/blog/posts/how-to-scrape-allegro "https://scrapfly.io/blog/posts/how-to-scrape-allegro")
[How to Scrape Ticketmaster
--------------------------

Learn how to scrape Ticketmaster for event data including concerts, venues, dates, and ticket information using Python. Complete guide with code examples and anti-blocking techniques.

PYTHON

SCRAPEGUIDE

BEAUTIFULSOUP

REQUESTS

![How to Scrape Ticketmaster](https://cdn.scrapfly.io/static/blog/posts/how-to-scrape-ticketmaster/feature-dark.png?v=ade8d2f5)](https://scrapfly.io/blog/posts/how-to-scrape-ticketmaster "https://scrapfly.io/blog/posts/how-to-scrape-ticketmaster")
[How to Scrape Mouser.com
------------------------

Learn how to scrape Mouser.com electronic component data including prices, specifications, and inventory using Python. Complete guide with code examples and anti-blocking techniques.

PYTHON

SCRAPEGUIDE

BEAUTIFULSOUP

REQUESTS

![How to Scrape Mouser.com](https://cdn.scrapfly.io/static/blog/posts/how-to-scrape-mouser/feature-dark.png?v=56a887c7)](https://scrapfly.io/blog/posts/how-to-scrape-mouser "https://scrapfly.io/blog/posts/how-to-scrape-mouser")

### Company

* [Careers](/jobs "/jobs")
* [Terms of service](/terms-of-service "/terms-of-service")
* [Privacy Policy](/privacy-policy "/privacy-policy")
* [Data Processing Agreement](/data-processing-agreement "/data-processing-agreement")
* [KYC Compliance](/kyc-and-safety "/kyc-and-safety")
* [Status](https://scrapfly.statuspage.io/ "https://scrapfly.statuspage.io/")

[Integrations](/integration "/integration")

* [Zapier](/integration/zapier "/integration/zapier")
* [Make](/integration/make "/integration/make")
* [N8n](/integration/n8n "/integration/n8n")
* [LlamaIndex](/integration/llamaindex "/integration/llamaindex")
* [LangChain](/integration/langchain "/integration/langchain")

### Social

### Tools

* [Convert cURL commands to Python](/web-scraping-tools/curl-python "/web-scraping-tools/curl-python")
* [JA3/TLS Fingerprint](/web-scraping-tools/ja3-fingerprint "/web-scraping-tools/ja3-fingerprint")
* [HTTP2 Fingerprint](/web-scraping-tools/http2-fingerprint "/web-scraping-tools/http2-fingerprint")
* [Xpath/CSS Selector Tester](/web-scraping-tools/css-xpath-tester "/web-scraping-tools/css-xpath-tester")

### Resources

* [API Documentation](/web-scraping-tools/ja3-fingerprint "/web-scraping-tools/ja3-fingerprint")
* [Web Scraping Academy](/academy "/academy")
* [Is Web Scraping Legal?](/is-web-scraping-legal "/is-web-scraping-legal")
* [Web Scraping Tools](/web-scraping-tools "/web-scraping-tools")
* [FAQ](/faq "/faq")

### Learn Web Scraping

* [Web Scraping with Python](https://scrapfly.io/blog/everything-to-know-about-web-scraping-python "https://scrapfly.io/blog/everything-to-know-about-web-scraping-python")
* [Web Scraping with PHP](https://scrapfly.io/blog/web-scraping-with-php-101 "https://scrapfly.io/blog/web-scraping-with-php-101")
* [Web Scraping with Ruby](https://scrapfly.io/blog/web-scraping-with-ruby "https://scrapfly.io/blog/web-scraping-with-ruby")
* [Web Scraping with R](https://scrapfly.io/blog/web-scraping-with-r "https://scrapfly.io/blog/web-scraping-with-r")
* [Web Scraping with NodeJS](https://scrapfly.io/blog/web-scraping-with-nodejs "https://scrapfly.io/blog/web-scraping-with-nodejs")
* [Web Scraping with Python Scrapy](https://scrapfly.io/blog/web-scraping-with-scrapy "https://scrapfly.io/blog/web-scraping-with-scrapy")
* [How to Scrape without getting blocked tutorial](https://scrapfly.io/blog/how-to-scrape-without-getting-blocked-tutorial "https://scrapfly.io/blog/how-to-scrape-without-getting-blocked-tutorial")
* [Web Scraping with Python and BeautifulSoup](https://scrapfly.io/blog/web-scraping-with-python-beautifulsoup "https://scrapfly.io/blog/web-scraping-with-python-beautifulsoup")
* [Web Scraping with Nodejs and Puppeteer](https://scrapfly.io/blog/web-scraping-with-puppeteer-and-nodejs "https://scrapfly.io/blog/web-scraping-with-puppeteer-and-nodejs")
* [How To Scrape Graphql](https://scrapfly.io/blog/web-scraping-graphql-with-python "https://scrapfly.io/blog/web-scraping-graphql-with-python")
* [Best Proxies for Web Scraping](https://scrapfly.io/blog/best-proxy-providers-for-web-scraping "https://scrapfly.io/blog/best-proxy-providers-for-web-scraping")
* [Top 5 Best Residential Proxies](https://scrapfly.io/blog/top-5-residential-proxy-providers "https://scrapfly.io/blog/top-5-residential-proxy-providers")
* [RSS Feed](https://scrapfly.io/blog/feed.xml "https://scrapfly.io/blog/feed.xml")

### Usage

* [What is Web Scraping used for?](/use-case/web-scraping "/use-case/web-scraping")
* [Web Scraping for AI Training](/use-case/ai-training-web-scraping "/use-case/ai-training-web-scraping")
* [Web Scraping for Compliance](/use-case/compliance-web-scraping "/use-case/compliance-web-scraping")
* [Web Scraping for eCommerce](/use-case/ecommerce-web-scraping "/use-case/ecommerce-web-scraping")
* [Web Scraping for Finance](/use-case/finance-web-scraping "/use-case/finance-web-scraping")
* [Web Scraping for Fraud Detection](/use-case/fraud-detection-web-scraping "/use-case/fraud-detection-web-scraping")
* [Web Scraping for Jobs](/use-case/jobs-web-scraping "/use-case/jobs-web-scraping")
* [Web Scraping for Lead Generation](/use-case/web-scraping-leads "/use-case/web-scraping-leads")
* [Web Scraping for News & Media](/use-case/media-and-news-web-scraping "/use-case/media-and-news-web-scraping")
* [Web Scraping for Real Estate](/use-case/real-estate-web-scraping "/use-case/real-estate-web-scraping")
* [Web Scraping for SERP & SEO](/use-case/seo-and-serp-web-scraping "/use-case/seo-and-serp-web-scraping")
* [Web Scraping for Social Media](/use-case/social-media-web-scraping "/use-case/social-media-web-scraping")
* [Web Scraping for Travel](/use-case/travel-web-scraping "/use-case/travel-web-scraping")

© 2025 Scrapfly - The Best Web Scraping API For Developers

This article is licensed under CC BY-SA 4.0. Attribution with a link to https://scrapfly.io/blog/... is required for any use.

×

Copied to clipboard
