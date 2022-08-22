# Cantonese dictionary with english phonics

Live instance is on [cd.binserv.us](cd.binserv.us) 


about source code 
files in /public folder is frond end,
every files at the root is back end.

Take minimum framework because it will be less maintenance.

---


## Feature
- Navive Javascript both back end and front end, 
  - minimum framework([Bulma](bulma.io) Only, it's a HTML CSS framework)
  - single page app with html dom encapsula as a object, entrance at public/js/general.js -> createHTML_json( public/components/input_page.js -> near line 300 look for structure() )  

- independent encrytion, apply on input data.
  - front end entrance at public/components/input_page.js -> raw_post_c()
  - back end entrance at handling_post.js -> handle_POST()

- Cached search result, can be switch on and off easily.
  - entrance at search_and_cache.js -> search()

- generate qrcode and access by it.
  - building in progrsss

---

## Diagram 
![Mammals Raccoon square!](https://raw.githubusercontent.com/hector918/cantonese_dictionary/main/cd.drawio.png "Mammals Raccoon square")
