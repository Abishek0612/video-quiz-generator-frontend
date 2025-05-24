import { LoginForm } from "@/components/auth/LoginForm";

export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Video Quiz Generator</h1>
          <p className="text-muted-foreground">
            Transform your lectures into interactive quizzes
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
