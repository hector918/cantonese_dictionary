function createHTML(json)
{
  var root={
    self : document.createElement(json['tagname_'] || "div"),
    export : {}
  };
  
  for(var x in json)
  {
    switch(x)
    {
      case "tagname_":
        //ignore 
      break;
      case "childs_":
        for(var o in json[x])
        {
          var children = createHTML(json[x][o]);
          root.self.appendChild(children.self);
          root.export = {...root.export,...children.export};
        }
      break;
      case "innerHTML":case "innerText":case "textContent":
        root.self[x]=json[x];
      break;
      case "event_":
        for(let ev in json[x])
        {
          root['self'].addEventListener(ev,json[x][ev],true);
        }
      break;
      case "export_":
        root.export[json[x]] = root['self'];
      break;
      default :
        root['self'].setAttribute(x,json[x]);
      break;
    }
  }
  return root;
}

export{
    createHTML
}