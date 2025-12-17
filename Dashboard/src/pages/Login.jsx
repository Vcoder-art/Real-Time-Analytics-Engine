import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import DashboardImage from "../assets/dashboard.png";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/slices/authSlice";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const validateForm = () => {
    if (!email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email format";

    if (!password.trim()) return "Password is required";
    if (password.length < 6)
      return "Password must be at least 6 characters";

    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const result = await dispatch(login({ email, password }));

    if (login.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card title="Welcome Back 👋" className="m-16 h-100">
        <form className="space-y-4" onSubmit={handleLogin}>
          <Input
            required
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" text={loading ? "Loading..." : "Login"} />

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>

        <p className="mt-3 text-center text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </Card>

      <img className="img-dashboard" src={DashboardImage} />
    </main>
  );
}
