import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

// ============================================================
// ProtectedRoute.jsx — Защита маршрутов
//
// ЧТО ЭТО:
//   Компонент-обертка, который проверяет наличие токена.
//   Если токен есть — пускает пользователя на страницы (Dashboard, Products и т.д.).
//   Если токена нет — перенаправляет на страницу /login.
//
// ЗАЧЕМ ЭТО НУЖНО:
//   Скрываем страницы только для "своих". Если кто-то попробует ввести в URL
//   `/products`, минуя страницу входа, его выкинет обратно на `/login`.
//
// КУДА ВСТАВЛЯЕМ:
//   В App.jsx оборачиваем все защищенные маршруты (Layout) в этот компонент.
// ============================================================

function ProtectedRoute({ children }) {
  // Достаем токен из cookies (мы его сохранили туда при Login)
  const token = Cookies.get("token");

  // Если токена нет, Navigate перенаправит пользователя на страницу авторизации (replace убирает историю назад)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Если токен есть, отдаем содержимое. (children для <ProtectedRoute>... </ProtectedRoute> или <Outlet/> для вложенных Route)
  // В нашем случае будем использовать children или просто возвращать `<Outlet />`, если используем как Route element.
  return children ? children : <Outlet />;
}

export default ProtectedRoute;
