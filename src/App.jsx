import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Suspense, useState } from "react"
import Cookies from "js-cookie"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Categories from "./pages/Categories"
import Products from "./pages/Products"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"


function App() {

  // Проверяем, есть ли уже сохраненный токен при первом запуске
  // eslint-disable-next-line no-unused-vars
  const [auth, setAuth] = useState(Cookies.get("token") ? true : false)

  return (
    <BrowserRouter>
      <Suspense fallback={(<div>Loading...</div>)}>
         <Routes>
          {/* ======= PUBLIC ROUTES ======= */}
          <Route path={"/login"}  element={<Login setAuth={setAuth}/>}/>
          <Route path={"/register"}  element={<Register />}/>
          
          {/* ======= PROTECTED ROUTES ======= 
              (Шаг 6 из ТЗ - использование компонента-обертки) */}
          <Route element={<ProtectedRoute><Layout setAuth={setAuth}/></ProtectedRoute>}>
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