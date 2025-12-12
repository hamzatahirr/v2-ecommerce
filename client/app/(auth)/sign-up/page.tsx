"use client";
import { useForm } from "react-hook-form";
import Input from "@/app/components/atoms/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import PasswordField from "@/app/components/molecules/PasswordField";
import { z } from "zod";
import MainLayout from "@/app/components/templates/MainLayout";
import { useSignupMutation } from "@/app/store/apis/AuthApi";

interface InputForm {
  name: string;
  email: string;
  password: string;
}

const nameSchema = (value: string) => {
  const result = z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .safeParse(value);
  return result.success || result.error.errors[0].message;
};

const emailSchema = (value: string) => {
  const result = z.string().email("Invalid email address").safeParse(value);
  return result.success || result.error.errors[0].message;
};

const Signup = () => {
  const [signUp, { isLoading, error }] = useSignupMutation();
  const router = useRouter();

  const {
    register,
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InputForm>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: InputForm) => {
    try {
      await signUp(formData).unwrap();
      // Redirect to verification page after successful signup
      router.push("/verification");
    } catch (error) {
      console.log("error: ", error);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <main className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 text-center mb-6">
            Sign Up
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 text-center text-sm p-3 rounded mb-4">
              An unexpected error occurred
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              name="name"
              type="text"
              placeholder="Name"
              control={control}
              validation={{
                required: "Name is required",
                validate: nameSchema,
              }}
              error={errors.name?.message}
              className="py-2.5 text-sm"
            />

            <Input
              name="email"
              type="text"
              placeholder="Email"
              control={control}
              validation={{
                required: "Email is required",
                validate: emailSchema,
              }}
              error={errors.email?.message}
              className="py-2.5 text-sm"
            />

            <PasswordField register={register} watch={watch} errors={errors} />

            <button
              type="submit"
              className={`w-full py-2.5 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors ${
                isLoading ? "cursor-not-allowed bg-gray-400" : ""
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin mx-auto" size={20} />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-indigo-600 hover:underline">
              Sign in
            </Link>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default Signup;
