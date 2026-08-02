import { FcGoogle } from "react-icons/fc";

const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111827] px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-center text-3xl font-bold text-white">
          Welcome Back
        </h1>

        <p className="mt-3 text-center text-gray-400">
          Continue with your Google account to access your whiteboards.
        </p>

        <button
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3 font-semibold text-black transition hover:scale-[1.02]"
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-500">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;