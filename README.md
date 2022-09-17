# Cantonese dictionary with english romanization

- Live instance is on 
  - with Bulma css framework: [http://binserv.us](http://binserv.us) 
  - with no css framework: [http://binserv.us/index_with_buildin_css.html](http://binserv.us/index_with_buildin_css.html) 



about source code 
files in /public folder is frond end,
every files at the root is back end.

Take minimum framework because it will be less maintenance.

---


## Feature
- Navive Javascript both back end and front end, 
  - minimum framework([Bulma](bulma.io) Only, it's a HTML CSS framework)
  - index_with_buildin_css.html is without Bulma.
  - single page app with html dom encapsula as a object, entrance at public/js/general.js -> createHTML_json( public/components/input_page.js -> near line 300 look for structure() )  

- Independent encrytion, apply on upload input data.
  - front end entrance at public/components/input_page.js -> raw_post_c()
  - back end entrance at handling_post.js -> handle_POST()

- Cached search result, improve performance, can be switch on and off easily.
  - entrance at search_and_cache.js -> search()

- Generate qrcode and access by it.
  - entrance at public/search_bar.js -> on_qrcode_button_click()

- Embed(iframe) Bing translate for Pronunciation demonstration


---

## Diagram 
![haha!](https://raw.githubusercontent.com/hector918/cantonese_dictionary/main/cd.drawio.png "ha ha ha")
