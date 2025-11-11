import { useState } from "react";
import { Link, useNavigate , Navigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import DashboardImage from "../assets/dashboard.png"
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/slices/authSlice";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const { loading, error } = useSelector((state) => state.auth);

   
  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <main className="flex  min-h-screen items-center justify-center bg-gray-100">
       
      <Card title="Welcome Back 👋" className="m-16 h-100" >
        <form className="space-y-4" onSubmit={handleLogin}>
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" text={loading ? "Loading..." : "Login"}  />
           {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>

        <p className="mt-3 text-center text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </Card>
      <img className="img-dashboard" src={DashboardImage}  />
    </main>
  );
}
