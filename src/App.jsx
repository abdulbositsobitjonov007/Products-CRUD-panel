import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Suspense, useState } from "react"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Categories from "./pages/Categories"
import Products from "./pages/Products"
import Layout from "./components/Layout"


function App() {

  const [auth, setAuth] = useState(localStorage.getItem("auth") || false)

  return (
    <BrowserRouter>
      <Suspense fallback={(<div>Loading...</div>)}>
         <Routes>
          <Route path={"/login"}  element={<Login setAuth={setAuth}/>}/>
          <Route element={auth ? <Layout setAuth={setAuth}/> : <Navigate to={"/login"}/>}>
            <Route path={"/"} element={<Dashboard/>}/>
            <Route path={"/categories"} element={<Categories/>}/>
            <Route path={"/products"} element={<Products/>}/>
          </Route>
          <Route path={"*"} element={<div>NOT FOUND</div>}/>
         </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App