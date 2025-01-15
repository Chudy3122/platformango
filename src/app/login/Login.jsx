import { useRef } from "react";
import { useSignIn } from "@clerk/clerk-react";
import CircularProgress from '@mui/material/CircularProgress';

export default function Login() {
  const email = useRef();
  const password = useRef();
  const { signIn, isLoading } = useSignIn();

  const handleClick = async (e) => {
    e.preventDefault();
    if (email.current && password.current) {
      try {
        await signIn.create({
          identifier: email.current.value,
          password: password.current.value,
        });
      } catch (error) {
        console.error("Error signing in:", error);
      }
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-[70%] h-[70%] flex">
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-5xl font-bold text-blue-500 mb-2">NGO-Platform</h3>
          <span className="text-2xl">
            Connect with your organization on NGO-Platform.
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <form className="h-[300px] p-5 bg-white rounded-lg flex flex-col justify-between" onSubmit={handleClick}>
            <input
              placeholder="Email"
              type="email"
              required
              className="h-12 rounded-lg border border-gray-300 text-lg px-5 focus:outline-none"
              ref={email}
            />
            <input
              placeholder="Password"
              type="password"
              required
              minLength={6}
              className="h-12 rounded-lg border border-gray-300 text-lg px-5 focus:outline-none"
              ref={password}
            />
            <button 
              className="h-12 rounded-lg border-none bg-blue-500 text-white text-xl font-medium cursor-pointer disabled:opacity-50" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : (
                "Log In"
              )}
            </button>
            <span className="text-center text-blue-500">Forgot Password?</span>
            <button 
              className="h-12 rounded-lg border-none bg-green-500 text-white text-xl font-medium cursor-pointer w-3/5 self-center"
              type="button"
            >
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : (
                "Create a New Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}