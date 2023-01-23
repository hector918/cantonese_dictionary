export default function SearchBar({searchText,setSearchText,on_search_button_click,tags}) {
  const on_tag_click = (evt)=>{
    //
    setSearchText(evt.currentTarget.getAttribute("search_word"));
    on_search_button_click();
  }
  return (
    <div className="container is-fullhd mb-2">
      <div className="field has-addons has-addons-left m-1">
        <p className="control">
        <button className="button is-primary">
            QRcode
          </button>
        </p>
        <p className="control">
          <input className="input" type="text" placeholder="press Enter to search" value={searchText} onChange={(e)=>{setSearchText(e.currentTarget.value)}}/>
        </p>
        <p className="control">
          <button className="button is-link" onClick={on_search_button_click}>
            Search
          </button>
        </p>
      </div>
      <div>
      <div className="box cta">
        <div className="columns is-mobile">
          <div className="field is-grouped is-grouped-multiline">
            {tags.map((el,idx)=><div key={idx} className="control"><span className="tag is-info is-light is-medium is-clickable" onClick={on_tag_click} search_word={el[0]}>{el[0]}</span></div>)}
            
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}