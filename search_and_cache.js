const db_action = require('./db_action.js');
const [keyword_map,tags_map,record_map] = [new Map(),new Map(),new Map()];

function trim(text)
{
  let regex = /^\s*|\s*$/g;
  return text.replace(regex,"");
}

function remove_cache(json){
  /*
  {
    username: 'hector',
    data: {
      dbId: 35,
      english: '111h222',
      chinese: '333344',
      phonics: '5354',
      'chinese sentence example': 'llll',
      'english sentence example': '',
      tags: { hector: 'hector' }
    },
    action: 'updaterecord',
    random: 0.9005674323400639
  }
  */

  let dbId = json['dbId'];
  let new_keyword = ['english','chinese'];
  let old_record = record_map.get(dbId);
  new_keyword.forEach(el=>{
    if(old_record&&old_record[el]) keyword_map.delete(old_record[el]);
    if(json[el]) keyword_map.delete(json[el]);
  });
  if(json['tags']!=undefined)
  {
    for(let x in json["tags"])
    {
      tags_map.delete(x);
    }
  }
}
function update_cache(search_obj,db_records){
  //fill cache from every query
  
  //clean the tags_map by search tag, acumulate down below
  //set empty if search result = 0
  if(search_obj['tags']!=undefined)
    for(let x of search_obj.tags)
      tags_map.set(x,{});

  if(search_obj['keyword']!=undefined)
    for(let x of search_obj['keyword'])
      keyword_map.set(x,[]);
  //fill all result to cache
  db_records.forEach(el=>{
    record_map.set(el.dbId,el);
    const rm_pointer = record_map.get(el.dbId);
    
    if(search_obj['keyword']!=undefined)
      for(let x of search_obj.keyword){
        if(el.english.toLowerCase()===x||el.chinese===x)
        {
          let y = keyword_map.get(x);
          y.push(el.dbId);
        }
      }

    // keyword_map.set(el.english,el.dbId);
    // keyword_map.set(el.chinese,el.dbId);

    if(search_obj['tags']!=undefined){
      for(let x of search_obj.tags){
        if(el['tags']===undefined||el['tags'][x]===undefined) continue;
        //if result record has this tag
        
        let tag_pointer = tags_map.get(x);
        tag_pointer[el.dbId]=el.dbId;
      }
    }
  })
}

function search(str,callback){
      
  if(trim(str)==="")
  {
    //if search text is empty function 
    db_action.read_lastest_record((error,result,field)=>{

      if(error===null) update_cache({},result);
      callback(error,result,field);
    });
    return;
  }

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
    }
    tags_match = tags_arr;
  }  
  if(keyword_match) keyword_match=keyword_match.map(el=>trim(el)).slice(0,10);
  //10 keyword search limit

  let search_obj = {"tags":tags_match,"keyword":keyword_match};

  //read from cache
  let [tags_rst,keyword_rst] = [[],[]];
  let missing_flag =false;
  for(let x in search_obj)
  {
    if(missing_flag) break;
    switch(x)
    {
      case "tags":
        if (Array.isArray(search_obj["tags"])){
          for(let tag of search_obj[x])
          {
            if(tags_map.has(tag))
            {
              Object.values(tags_map.get(tag)).forEach(el=>{
                tags_rst.push(record_map.get(el));
              })
            }
            else 
              missing_flag = true;
          }
        }
        
      break;
      case "keyword":
        if (Array.isArray(search_obj["keyword"]))
        {
          for(let word of search_obj[x])
          {
            if(keyword_map.has(word))
            {
              let rd = keyword_map.get(word);
              rd.forEach(el=>keyword_rst.push(record_map.get(el)));
              // keyword_rst.push(record_map.get(keyword_map.get(word)));
            }
            else
              missing_flag=true;
          }
        }
      break;
    }
  }
  if(missing_flag===false){
    callback(undefined,[...tags_rst,...keyword_rst],[]);
    return;
  }
  //

  //if cache dont has the record then read db
  db_action.read_record(search_obj,(error,result,field)=>{
    if(error===null) update_cache(search_obj,result);
    //bring back the result
    callback(error,result,field);
  });
}

module.exports = {
  search,
  remove_cache,
}