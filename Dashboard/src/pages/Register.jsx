import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import DashboardImage from "../assets/dashboard.png"
import { useDispatch, useSelector } from "react-redux";
import { register } from "../features/slices/authSlice";
import toast from "react-hot-toast";

export default function Register() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [address, setAddress] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const validateForm = () => {
    if (!companyName.trim()) return "Company name is required";
    if (companyName.length < 3) return "Company name must be at least 3 characters";

    if (!email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email";

    if (!address.trim()) return "Address is required";
    if (address.length < 5) return "Address too short";

    if (!phoneNo.trim()) return "Phone number is required";
    if (!/^[6-9]\d{9}$/.test(phoneNo)) return "Phone must be a valid 10-digit Indian number";

    if (!password.trim()) return "Password is required";
    if (password.length < 6) return "Password must be minimum 6 characters";

    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const result = await dispatch(
      register({
        name: companyName,
        email,
        password,
        phone: phoneNo,
        address,
      })
    );

    if (register.fulfilled.match(result)) {
      navigate("/login");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card title="Create Account 🏗️" className="m-16">
        <form className="space-y-4" onSubmit={handleRegister}>

          <Input
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="Phone No"
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" text={loading ? "Loading..." : "Register"} />

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>

        <p className="mt-3 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </Card>

      <img className="img-dashboard" src={DashboardImage} />
    </main>
  );
}
