const db_action = require('./db_action.js');
const [keyword_map,tags_map,record_map] = [new Map(),new Map(),new Map()];
function trim(text)
{
  let regex = /^\s*|\s*$/g;
  return text.replace(regex,"");
}

function search(str,callback){
      
  let tags_regex= /tags:([\w,]+)\s*/g;
  let tags_match = str.match(tags_regex);
  //remove tags match from string
  str = str.replace(tags_regex,"");
  
  //space and " around letter and number
  let keyword_regex = /\"\1\"|\s*(\w+|[\u4e00-\u9fa5]+)\s*/g;
  let keyword_match = str.match(keyword_regex);

  //break down tags and clean space around the str
  if(tags_match){
    let tags_arr = [];
    for(let x of tags_match){

      x.replace(/tags:/,"").split(",").forEach(el=>{
        el=trim(el);
        if(el!="") tags_arr.push(el);
      })
      console.log(tags_arr,x);
    }
    tags_match = tags_arr;
  }  
  if(keyword_match) keyword_match=keyword_match.map(el=>trim(el));

  let search_obj = {tags:tags_match,keyword:keyword_match};

  console.log(search_obj);


  db_action.read_record(search_obj,(error,result,field)=>{
    //fill cache from every query
    console.log(result)


    //bring back the result
    callback(error,result,field);
  });
}

module.exports = {
  search,

}