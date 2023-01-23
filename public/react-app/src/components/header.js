import { Link } from "react-router-dom";
export default function Header() {
  ///////////////////////////////////////////////////////////////////////
  const on_burger_click = (evt)=>{
    if(evt.target.tagName!=="BUTTON") return;
    evt.target.classList.toggle("is-active");
    document.getElementById(evt.target.getAttribute(["data-target"])).classList.toggle("is-active")
  }
  ///////////////////////////////////////////////////////////////////////
  return (
    <nav className="navbar has-shadow" role="navigation" aria-label="main navigation">
       <div className="navbar-brand">
        <Link to="/" className="navbar-item" href="https://bulma.io">
          <img src="/favicon.ico" width="28" height="28" alt="Bulma"/>
          <h1 className="ml-3"> with React frontend version</h1>
        </Link>

        <button className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample" onClick={on_burger_click}>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>

      <div id="navbarBasicExample" className="navbar-menu">
        <div className="navbar-start">
          <Link to="/" className="navbar-item">
            Here is Vanilla version!
          </Link>
          
        </div>
      </div>
    </nav >
  )
}