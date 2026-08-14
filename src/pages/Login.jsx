import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";

function Login({ setAuth }) {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    // Эмуляция базы данных:
    // Проверяем пользователей из локальной базы-заглушки (тех, кто зарегистрировался через Register)
    const existingUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
    const isMockUser = existingUsers.some(user => user.email === email && user.password === password);

    if (isMockUser) {
      // Генерируем рандомный токен при каждом входе — как настоящий JWT!
      // crypto.randomUUID() — это встроенная в браузер функция, не требует библиотек.
      // Она генерирует строку вида: "3b12f1df-5232-4804-897e-638b90f8d9a0"
      const mockToken = crypto.randomUUID();
      
      // При успешном логине сервер вернет токен. Сохраните его: Cookies.set('token', ...)
      Cookies.set("token", mockToken, { expires: 1 }); // expires: 1 — значит удалить через 1 день
      
      setAuth(true); 
      navigate("/");
    } else {
      alert("Неверные данные! Email или пароль не совпадают. Пожалуйста, зарегистрируйтесь, если у вас еще нет аккаунта.");
    }
  }

  return (
    <div className="flex bg-[gray] items-center justify-center w-full h-screen">

      <form onSubmit={handleSubmit} className="max-w-70 rounded-2xl p-5 bg-[white] w-full mx-auto">
        <h2 className="text-center text-xl font-bold mb-5">Вход</h2>
        
        <div className="mb-5">
          <label htmlFor="email" className="block mb-2.5 text-sm font-medium text-heading">Ваш email</label>
          <input type="email" id="email" className=" bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-2xl focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" placeholder="name@domain.com" required />
        </div>
        <div className="mb-5">
          <label htmlFor="password" className="block mb-2.5 text-sm font-medium text-heading">Ваш пароль</label>
          <input type="password" id="password" className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-2xl focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" placeholder="••••••••" required />
        </div>
        
        <button type="submit" className="text-white cursor-pointer bg-[black] bg-brand box-border border w-full border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-2xl text-sm px-4 py-2.5 focus:outline-none mb-3">Войти (Submit)</button>
        
        <div className="text-center text-sm">
          Нет аккаунта? <Link to="/register" className="text-blue-600 hover:underline">Регистрация</Link>
        </div>
      </form>

    </div>
  )
}

export default Login