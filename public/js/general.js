function createHTML_json(json,host_object)
{
  var root={
    self : null,
    childrens : [],
  };
  
  root['self'] = document.createElement(json['tagname_'] || "div");
  for(var x in json)
  {
    switch(x)
    {
      case "tagname_":
        //ignore 
      break;
      case "childrens_":
        for(var o in json[x])
        {
          var children = createHTML_json(json[x][o],host_object);
          root.self.appendChild(children.self);
          root['childrens'].push(children);
        }
      break;
      case "innerHTML_":
        root.self.innerHTML=json[x];
      break;
      case "event_":
        for(let ev in json[x])
        {
          root['self'].addEventListener(ev,json[x][ev],true);
        }
      break;
      case "export_":
        host_object[json[x]]=root['self'];
      break;
      default :
        root['self'].setAttribute(x,json[x]);
      break;
    }
  }
  return root;
}
function appendCSS(css)
{
  var style = document.createElement('style');
  if (style.styleSheet) {
      style.styleSheet.cssText = css;
  } else {
      style.appendChild(document.createTextNode(css));
  }
  document.getElementsByTagName('head')[0].appendChild(style);
}
function dynamicallyLoadScript(url) {
  var script = document.createElement("script");  // create a script DOM node
  script.src = url;  // set its src to the provided URL
 
  document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}
function preload_image(callback,picture_url)
{

  let img = new Image();
  img.onload=callback;
  img.src = picture_url;
}
function getElBy(obj,text,searchTarget="tagName"){
  let result =[];
  for(let x of obj.childNodes)
  {
    if(x.childNodes!==undefined)
    {
      result = result.concat(getElBy(x,text,searchTarget));
    }
    if(x[searchTarget]!==undefined)
    {
      if((x[searchTarget].toLowerCase()===text))
      {
        result.push(x);
      }
    }
  }
  return result
}
async function raw_get(path,cb,error_handling)
{
  try {
    const res = await fetch(path);
    switch(res.status)
    {
      case 200: cb(await res.json()); break;
      default : error_handling(`Url ${res.status} ${res.statusText}`);
    }
  } catch (error) {
    error_handling(error);
  }
  // var xhttp = new XMLHttpRequest();
  // xhttp.onreadystatechange = function() 
  // {
  //   if (this.readyState == 4 && this.status == 200) {
      
  //     // this.responseText
  //     if(cb) cb(this.responseText);
  //     //process_receive_normal(this.responseText);
  //   }
  //   else if(this.status != 200 & this.status!= 0){
  //     console.log(this.status)
  //     if(fail_cb)fail_cb(this);
  //   }
  // };
  // xhttp.open("GET", path );
  // xhttp.send();
}
function raw_post(data,path,cb)
{
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() 
  {
    if (this.readyState == 4 && this.status == 200) {
      // this.responseText
      if(cb) cb(this.responseText);
      //process_receive_normal(this.responseText);
    }
  };
  xhttp.open("POST", path );
  xhttp.send(JSON.stringify(data));
}
export {
  createHTML_json as cej,
  preload_image as preload_image,
  appendCSS as appendCSS,
  getElBy as getElBy,
  raw_post as raw_post,
  raw_get as raw_get,
  dynamicallyLoadScript as LoadScript,
}; 