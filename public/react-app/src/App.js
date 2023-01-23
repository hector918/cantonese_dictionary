import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from './components/main';
import Header from './components/header';

function App() {
  return (
    <div className='app'>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css"></link>
      <BrowserRouter>
        
          
          <Header/>
          <Routes>
            <Route path='/' element={<Main/>}/>
          </Routes>
          
          {/* footer */}
          <footer className="footer">
            <div className="content has-text-centered">
              <p>
                <strong>Bulma</strong> by <a href="https://jgthms.com">Jeremy Thomas</a>. The source code is licensed
                <a href="http://opensource.org/licenses/mit-license.php">MIT</a>. The website content
                is licensed <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY NC SA 4.0</a>.
              </p>
            </div>
          </footer>
        
      </BrowserRouter>
    </div>
  );
}

export default App;
