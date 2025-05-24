import { RegisterForm } from "@/components/auth/RegisterForm";

export function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">
            Start generating quizzes from your video lectures
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
