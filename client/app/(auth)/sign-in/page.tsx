"use client";
import { useForm } from "react-hook-form";
import Input from "@/app/components/atoms/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MainLayout from "@/app/components/templates/MainLayout";
import { Loader2 } from "lucide-react";
import { useSignInMutation } from "@/app/store/apis/AuthApi";
import { useAuth } from "@/app/hooks/useAuth";
import { useEffect } from "react";

interface InputForm {
  email: string;
  password: string;
}

const SignIn = () => {
  const [signIn, { error, isLoading }] = useSignInMutation();
  const router = useRouter();
  const { user, availableRoles } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InputForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect after successful login
  useEffect(() => {
    if (user && !isLoading) {;
      if (user.role === "ADMIN") {
        router.push("/dashboard");
      } else if (user.isSeller) {
        router.push("/seller");
      } else {
        router.push("/");
      }
    }
  }, [user, availableRoles, router, isLoading]);

  const onSubmit = async (formData: InputForm) => {
    try {
      await signIn(formData).unwrap();
    } catch (err) {
      console.log("error: ", err);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <main className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 text-center mb-6">
            Sign In
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 text-center text-sm p-3 rounded mb-4">
              An unexpected error occurred
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              name="email"
              type="text"
              placeholder="Email"
              control={control}
              validation={{ required: "Email is required" }}
              error={errors.email?.message}
              className="py-2.5 text-sm"
            />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              control={control}
              validation={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              }}
              error={errors.password?.message}
              className="py-2.5 text-sm"
            />

            <Link
              href="/password-reset"
              className="block text-sm text-indigo-600 hover:underline mb-4"
            >
              Forgot password?
            </Link>

            <button
              type="submit"
              className={`w-full py-2.5 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors ${
                isLoading ? "cursor-not-allowed bg-gray-400" : ""
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin mx-auto" size={20} />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-indigo-600 hover:underline">
              Sign up
            </Link>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default SignIn;
