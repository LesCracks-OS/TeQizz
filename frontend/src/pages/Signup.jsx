import { useState } from "react";
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
} from "react-router-dom";

const Signup = () => {
  const { loginWithOAuth, register, isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleOAuthLogin = (provider) => {
    loginWithOAuth(provider);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await register(formData);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Inscription échouée. Veuillez réessayer.");
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
            {/* Back link */}
            <Link
              to="/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <X className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Link>

            {/* Logo/Brand */}
            <div className="text-center mb-8">
              <Link to="/" className="text-2xl font-black tracking-tighter">
                TeQizz<span className="text-primary">.</span>
              </Link>
              <p className="text-muted-foreground text-sm mt-2">
                Créer votre compte
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* OAuth Buttons */}
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

            {/* Email Signup Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-primary transition-colors"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-primary transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom d'utilisateur</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-primary transition-colors"
                  placeholder="johndoe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 pr-12 text-sm outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
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
                {isLoading ? "Création du compte..." : "S'inscrire"}
              </Button>
            </form>

            {/* Switch Mode */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Se connecter
              </Link>
            </p>

            {/* Terms */}
            <p className="text-center text-xs text-muted-foreground mt-4">
              En continuant, vous acceptez nos{" "}
              <a href="/terms" className="text-primary hover:underline">CGU</a>{" "}
              et notre{" "}
              <a href="/privacy" className="text-primary hover:underline">Politique de confidentialité</a>.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
