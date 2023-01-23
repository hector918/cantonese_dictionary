import { useEffect, useState } from "react";
import SearchBar from "./sub/searchbar";
import { fetch_search } from "../fetch";
import Card from "./sub/card";
///////////////////////////////////////////////////////////////////////////
export default function Main() {
  let [searchText, setSearchText] = useState("");
  let [cardList, setCardList] = useState([]);
  // let [msgBoard, setMsgBoard] = useState([]);
  let [tags, setTags] = useState([]);
  useEffect(()=>{
    console.log(searchText);
    
  },[searchText]);
  useEffect(()=>{
    setTags([
      ["tags:hector","tags:hector"],
      ["tags:test","tags:test","success"],
      ["continue","continue","black"],
      ["warning","warning","warning"],
      ["danger","danger","danger"],
      ["info","info","info"],
    ])
  },[])
  ///event///////////////////////////////////////////////////////////////////
  const on_search_button_click = (evt) => {
    fetch_search(searchText, (data) => {
      try {
        console.log(cardList ,data.result);
        setCardList(data.result);
        
      } catch (error) {
        console.log(error)
      }
      
    });
  }
  ///////////////////////////////////////////////////////////////////////////
  return (
    <div>
      <SearchBar searchText={searchText} setSearchText={setSearchText} on_search_button_click={on_search_button_click} tags={tags}/>
      <div className="columns is-multiline">
        {cardList.map((el,idx)=><Card key={`card-${idx}`} data={el}/>)}
      </div>
    </div>
  )
}