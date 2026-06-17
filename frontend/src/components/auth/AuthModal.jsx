import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ isOpen, onClose, initialMode = "login" }) => {
  const { loginWithOAuth, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  // Update mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
    setShowEmailForm(false);
    setError("");
  }, [initialMode]);

  // Blocage du scroll en arrière plan en cas d'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleOAuthLogin = (provider) => {
    loginWithOAuth(provider);
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setShowEmailForm(false);
    setError("");
    // Reset form fields when switching modes
    setLoginEmail("");
    setLoginPassword("");
    setSignupData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
    });
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(loginEmail, loginPassword);

    if (result.success) {
      onClose();
      navigate("/dashboard");
    } else {
      setError(result.error || "Connexion échouée. Vérifiez vos identifiants.");
    }

    setIsLoading(false);
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await register(signupData);

    if (result.success) {
      onClose();
      navigate("/dashboard");
    } else {
      setError(result.error || "Inscription échouée. Veuillez réessayer.");
    }

    setIsLoading(false);
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md px-4"
        >
          <Card className="bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl shadow-primary/10">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <CardContent className="pt-6 pb-8 px-8">
              {/* Logo/Brand */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black tracking-tighter">
                  TeQizz<span className="text-primary">.</span>
                </h2>
                <p className="text-muted-foreground text-sm mt-2">
                  {mode === "login" ? "Bon retour !" : "Créer votre compte"}
                </p>
              </div>

              {/* Email Form */}
              <AnimatePresence mode="wait">
                {showEmailForm ? (
                  <motion.div
                    key="email-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {/* Back button */}
                    <button
                      onClick={() => setShowEmailForm(false)}
                      className="text-muted-foreground hover:text-foreground text-sm mb-4 transition-colors"
                    >
                      ← Retour
                    </button>

                    {error && (
                      <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    {mode === "login" ? (
                      // Login Form
                      <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-primary transition-colors"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Mot de passe</label>
                          <input
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-primary transition-colors"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          variant="default"
                          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                          disabled={isLoading}
                        >
                          {isLoading ? "Connexion en cours..." : "Se connecter"}
                        </Button>
                      </form>
                    ) : (
                      // Signup Form
                      <form onSubmit={handleEmailSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Prénom</label>
                            <input
                              type="text"
                              name="firstName"
                              value={signupData.firstName}
                              onChange={handleSignupChange}
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
                              value={signupData.lastName}
                              onChange={handleSignupChange}
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
                            value={signupData.username}
                            onChange={handleSignupChange}
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
                            value={signupData.email}
                            onChange={handleSignupChange}
                            className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-primary transition-colors"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Mot de passe</label>
                          <input
                            type="password"
                            name="password"
                            value={signupData.password}
                            onChange={handleSignupChange}
                            className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-primary transition-colors"
                            placeholder="••••••••"
                            minLength={6}
                            required
                          />
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
                    )}
                  </motion.div>
                ) : (
                  // OAuth Section
                  <motion.div
                    key="oauth-section"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {/* OAuth Buttons */}
                    <div className="space-y-3">
                      {/* Google Button */}
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

                      {/* GitHub Button */}
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

                    {/* Email Login Button */}
                    <div className="space-y-4">
                      <Button
                        variant="default"
                        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        onClick={() => setShowEmailForm(true)}
                      >
                        {mode === "login"
                          ? "Se connecter par email"
                          : "S'inscrire par email"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Switch Mode */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                {mode === "login" ? (
                  <>
                    Pas encore de compte ?{" "}
                    <button
                      onClick={() => handleSwitchMode("signup")}
                      className="text-primary font-medium hover:underline"
                    >
                      S'inscrire
                    </button>
                  </>
                ) : (
                  <>
                    Déjà un compte ?{" "}
                    <button
                      onClick={() => handleSwitchMode("login")}
                      className="text-primary font-medium hover:underline"
                    >
                      Se connecter
                    </button>
                  </>
                )}
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
    </AnimatePresence>
  );
};

export default AuthModal;
