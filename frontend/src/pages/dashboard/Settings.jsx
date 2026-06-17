import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services";
import qcmGameService from "@/services/qcmGame.service";
import {
  User, Lock, Trash2, RefreshCw, ExternalLink, Loader2,
  Globe, Github, Linkedin, Twitter, FileText, Camera,
} from "lucide-react";

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();

  // Account
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Profile
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");

  // Social links
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setCountry(user.country || "");
      setGithubUrl(user.githubUrl || "");
      setLinkedinUrl(user.linkedinUrl || "");
      setTwitterUrl(user.twitterUrl || "");
      setWebsiteUrl(user.websiteUrl || "");
    }
  }, [user]);

  const isOAuthUser = user?.provider && user.provider !== "LOCAL" && user.provider !== "local";

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const result = await userService.updateProfile(user.id, {
        firstName,
        lastName,
        username,
        bio,
        country: country.toUpperCase() || undefined,
        githubUrl: githubUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        twitterUrl: twitterUrl || undefined,
        websiteUrl: websiteUrl || undefined,
      });
      if (result.success) updateUser(result.data);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setIsUploadingAvatar(true);
    try {
      const result = await userService.uploadAvatar(file);
      if (result.success) updateUser(result.data);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleResetStats = async () => {
    if (!window.confirm("Réinitialiser toutes vos statistiques QCM ? Cette action est irréversible.")) return;
    setIsResetting(true);
    try {
      await qcmGameService.resetUserStats();
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      setIsDeleting(true);
      try {
        const result = await userService.deleteAccount(user.id);
        if (result.success) await logout();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getProviderLabel = (provider) => {
    switch (provider?.toUpperCase()) {
      case "GOOGLE": return "Google";
      case "GITHUB": return "GitHub";
      default: return provider;
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 text-sm rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors";
  const labelClass =
    "block text-[10px] font-black uppercase tracking-[0.18em] text-white/30 mb-1.5";
  const cardClass =
    "rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-5";

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">

      {/* Page header */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">Compte</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Paramètres</h1>
      </div>

      {/* ── Avatar ── */}
      <div className={cardClass}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-black text-white/80">Photo de profil</span>
          </div>
          <p className="text-xs text-white/25 ml-6">JPG, PNG ou GIF · max 5 MB</p>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/[0.07] bg-white/4">
              {(avatarPreview || user?.avatarUrl) ? (
                <img
                  src={avatarPreview || user.avatarUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-black text-primary/60">
                  {user?.firstName?.[0] || user?.username?.[0] || "?"}
                </div>
              )}
            </div>
            {isUploadingAvatar && (
              <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.07] bg-white/2.5 text-sm font-semibold text-white/60 hover:text-white/90 hover:border-white/20 transition-all disabled:opacity-40"
            >
              <Camera className="w-3.5 h-3.5" />
              Changer la photo
            </button>
            {avatarPreview && (
              <p className="text-[10px] text-primary/70">Photo envoyée avec succès</p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveAccount} className="space-y-4">

        {/* ── Account ── */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-black text-white/80">Compte</span>
            </div>
            <p className="text-xs text-white/25 ml-6">Informations de connexion</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="firstName">Prénom</label>
              <input id="firstName" className={inputClass} value={firstName}
                onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" />
            </div>
            <div>
              <label className={labelClass} htmlFor="lastName">Nom</label>
              <input id="lastName" className={inputClass} value={lastName}
                onChange={(e) => setLastName(e.target.value)} placeholder="Nom" />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="username">Nom d'utilisateur</label>
            <input id="username" className={inputClass} value={username}
              onChange={(e) => setUsername(e.target.value)} placeholder="@username" />
          </div>

          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <input id="email" type="email"
              className={`${inputClass} ${isOAuthUser ? "opacity-40 cursor-not-allowed" : ""}`}
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com" disabled={isOAuthUser} />
            {isOAuthUser && (
              <p className="text-xs text-white/25 mt-1.5 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {`Email géré par ${getProviderLabel(user.provider)}`}
              </p>
            )}
          </div>
        </div>

        {/* ── Profile ── */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-black text-white/80">Profil</span>
            </div>
            <p className="text-xs text-white/25 ml-6">Informations visibles sur votre profil public</p>
          </div>

          <div>
            <label className={labelClass} htmlFor="bio">Bio</label>
            <textarea id="bio" rows={3}
              className={`${inputClass} resize-none`}
              value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="Décrivez-vous en quelques mots…" />
            <p className="text-[10px] text-white/20 mt-1">{bio.length}/500</p>
          </div>

          <div>
            <label className={labelClass} htmlFor="country">Pays</label>
            <input id="country" className={inputClass} value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="FR" maxLength={2} />
            <p className="text-[10px] text-white/20 mt-1">Code ISO alpha-2 (ex. FR, US, CM)</p>
          </div>
        </div>

        {/* ── Social links ── */}
        <div className={cardClass}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-black text-white/80">Réseaux sociaux</span>
            </div>
            <p className="text-xs text-white/25 ml-6">Liens vers vos profils en ligne</p>
          </div>

          {[
            { id: "github",   label: "GitHub",   Icon: Github,   value: githubUrl,   set: setGithubUrl,   placeholder: "https://github.com/username" },
            { id: "linkedin", label: "LinkedIn",  Icon: Linkedin, value: linkedinUrl, set: setLinkedinUrl, placeholder: "https://linkedin.com/in/username" },
            { id: "twitter",  label: "Twitter / X", Icon: Twitter, value: twitterUrl, set: setTwitterUrl,  placeholder: "https://x.com/username" },
            { id: "website",  label: "Site web",  Icon: Globe,    value: websiteUrl,  set: setWebsiteUrl,  placeholder: "https://monsite.com" },
          ].map(({ id, label, Icon, value, set, placeholder }) => (
            <div key={id}>
              <label className={labelClass} htmlFor={id}>{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
                <input id={id} type="url" className={`${inputClass} pl-9`}
                  value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} />
              </div>
            </div>
          ))}
        </div>

        {/* Save button */}
        <button type="submit" disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-white text-sm font-black hover:brightness-110 transition-all shadow-xl shadow-primary/20 disabled:opacity-40">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Enregistrer les modifications
        </button>

      </form>

      {/* ── OAuth security ── */}
      {isOAuthUser && (
        <div className={cardClass}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-black text-white/80">Sécurité</span>
            </div>
            <p className="text-xs text-white/25 ml-6">Compte OAuth</p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 flex items-start gap-3">
            <ExternalLink className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white/70">
                {`Connecté avec ${getProviderLabel(user.provider)}`}
              </p>
              <p className="text-xs text-white/30 mt-0.5">
                {`Votre mot de passe est géré par ${getProviderLabel(user.provider)}.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Danger zone ── */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Trash2 className="w-4 h-4 text-red-400" />
            <span className="text-sm font-black text-red-400">Données</span>
          </div>
          <p className="text-xs text-white/25 ml-6">Gérez les données de votre compte</p>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div>
            <p className="text-sm font-semibold text-white/70">Réinitialiser les statistiques</p>
            <p className="text-xs text-white/30 mt-0.5">Remettre toutes vos statistiques de jeu à zéro</p>
          </div>
          <button onClick={handleResetStats} disabled={isResetting}
            className="px-4 py-2 rounded-xl border border-white/[0.07] bg-white/[0.025] text-sm font-bold text-white/50 hover:text-white/80 hover:border-white/20 transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50">
            {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Réinitialiser
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-white/[0.02] p-4">
          <div>
            <p className="text-sm font-semibold text-red-400">Supprimer le compte</p>
            <p className="text-xs text-white/30 mt-0.5">Supprimer définitivement votre compte et toutes vos données</p>
          </div>
          <button onClick={handleDeleteAccount} disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50">
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Supprimer
          </button>
        </div>
      </div>

    </div>
  );
};

export default SettingsPage;
