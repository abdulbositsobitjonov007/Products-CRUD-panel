import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

// ============================================================
// Register.jsx — Страница регистрации
// 
// ЧТО ЭТО:
//   Публичный маршрут, где пользователь может создать аккаунт.
// 
// ЗАЧЕМ:
//   Мы должны добавить запись в базу данных на бэкенде.
// 
// ЧТО ПРОИСХОДИТ:
//   При сабмите формы мы отправляем POST запрос на бэнд (например, /api/register).
//   Если ответ успешен (2xx статус) - перенаправляем на /login.
// ============================================================

function Register() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    // В будущем здесь должен быть запрос через axios (api.post) на ваш /register маршрут
    
    // Эмуляция базы данных пользователей через localStorage (для демонстрации)
    const existingUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
    
    // Проверяем, нет ли уже такого email
    if (existingUsers.some(user => user.email === email)) {
      alert("Пользователь с таким email уже существует!");
      return;
    }
    
    // Сохраняем нового пользователя локально
    const newUser = { name, email, password };
    existingUsers.push(newUser);
    localStorage.setItem("mock_users", JSON.stringify(existingUsers));

    console.log("Registering user:", newUser);
    alert("Регистрация успешна! Теперь вы можете войти с вашим email и паролем.");
    navigate("/login");
  };

  return (
    <div className="flex bg-[gray] items-center justify-center w-full h-screen">
      <form onSubmit={handleSubmit} className="max-w-70 rounded-2xl p-5 bg-[white] w-full mx-auto">
        <h2 className="text-center text-xl font-bold mb-5">Регистрация</h2>
        
        <div className="mb-5">
          <label htmlFor="name" className="block mb-2.5 text-sm font-medium text-heading">Ваше имя</label>
          <input type="text" id="name" className=" bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-2xl focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" placeholder="Иван Иванов" required />
        </div>
        <div className="mb-5">
          <label htmlFor="email" className="block mb-2.5 text-sm font-medium text-heading">Ваш email</label>
          <input type="email" id="email" className=" bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-2xl focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" placeholder="name@domain.com" required />
        </div>
        <div className="mb-5">
          <label htmlFor="password" className="block mb-2.5 text-sm font-medium text-heading">Ваш пароль</label>
          <input type="password" id="password" className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-2xl focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" placeholder="••••••••" required />
        </div>
        <button type="submit" className="text-white cursor-pointer bg-[black] bg-brand box-border border w-full border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-2xl text-sm px-4 py-2.5 focus:outline-none mb-3">Зарегистрироваться</button>
        
        <div className="text-center text-sm">
          Уже есть аккаунт? <Link to="/login" className="text-blue-600 hover:underline">Войти</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
