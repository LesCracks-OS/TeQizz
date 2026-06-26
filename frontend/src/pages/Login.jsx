import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Github,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  Link,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";

const OAUTH_ERROR_MESSAGES = {
  oauth_failed:
    "L'authentification OAuth a échoué. Réessayez ou utilisez votre email.",
};

const Login = () => {
  const { loginWithOAuth, login, isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorCode = params.get("error");

    if (errorCode) {
      setError(
        OAUTH_ERROR_MESSAGES[errorCode] ||
          "Une erreur est survenue lors de la connexion."
      );
    }
  }, [location.search]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleOAuthLogin = (provider) => {
    loginWithOAuth(provider);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Connexion impossible.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl shadow-primary/10">
          <CardContent className="pt-6 pb-8 px-8">
            {/* Back */}
            <Link
              to="/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <X className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Link>

            {/* Logo */}
            <div className="text-center mb-8">
              <Link
                to="/"
                className="text-2xl font-black tracking-tighter"
              >
                TeQizz<span className="text-primary">.</span>
              </Link>

              <p className="text-muted-foreground text-sm mt-2">
                Bon retour !
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* OAuth */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                onClick={() => handleOAuthLogin("google")}
              >
                <Mail className="w-5 h-5 mr-3" />
                <span className="font-medium">
                  Continuer avec Google
                </span>
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                onClick={() => handleOAuthLogin("github")}
              >
                <Github className="w-5 h-5 mr-3" />
                <span className="font-medium">
                  Continuer avec GitHub
                </span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>

              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  ou continuer avec
                </span>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleEmailLogin}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-primary transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Mot de passe
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 pr-12 text-sm outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-200 transition-colors"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading
                  ? "Connexion en cours..."
                  : "Se connecter"}
              </Button>
            </form>

            {/* Signup */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Pas encore de compte ?{" "}
              <Link
                to="/signup"
                className="text-primary font-medium hover:underline"
              >
                S'inscrire
              </Link>
            </p>

            {/* Terms */}
            <p className="text-center text-xs text-muted-foreground mt-4">
              En continuant, vous acceptez nos{" "}
              <a
                href="/terms"
                className="text-primary hover:underline"
              >
                CGU
              </a>{" "}
              et notre{" "}
              <a
                href="/privacy"
                className="text-primary hover:underline"
              >
                Politique de confidentialité
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;