import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/?error=oauth_failed");
      return;
    }

    handleOAuthCallback(token).then((result) => {
      if (result.success) {
        navigate("/dashboard");
      } else {
        navigate("/?error=oauth_failed");
      }
    });
  }, [searchParams, navigate, handleOAuthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
