
import { useNavigate } from "react-router-dom";

function Login({ setAuth }) {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    if (email === "adminProducts@gmail.com" && password === "12345") {
      localStorage.setItem("auth", email);

      setAuth(true);
      navigate("/");
    }
  }

  return (
    <div className="flex bg-[gray] items-center justify-center w-full h-screen">

      <form onSubmit={handleSubmit} className="max-w-70 rounded-2xl p-5 bg-[white] w-full mx-auto">
        <div className="mb-5">
          <label htmlFor="email" className="block mb-2.5 text-sm font-medium text-heading">Your email</label>
          <input type="email" id="email" className=" bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-2xl focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" placeholder="name@flowbite.com" required />
        </div>
        <div className="mb-5">
          <label htmlFor="password" className="block mb-2.5 text-sm font-medium text-heading">Your password</label>
          <input type="password" id="password" className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-2xl focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" placeholder="••••••••" required />
        </div>
        <button type="submit" className="text-white cursor-pointer bg-[black] bg-brand box-border border w-full border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-2xl text-sm px-4 py-2.5 focus:outline-none">Submit</button>
      </form>

    </div>
  )
}

export default Login