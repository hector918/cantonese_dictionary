function fetch_search(search_text,cb) {
  let v_base64 = btoa(encodeURIComponent(search_text));
  // raw_get(`api/v1/readrecord?text=${v_base64}`,
  let options ={
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  fetch(`http://127.0.0.1:8080/api/v1/readrecord?text=${v_base64}`, options)
  .then( response => response.json())
  .then( data  => {cb(data);})
  .catch(error => {cb(error);});
}
export {
  fetch_search
}