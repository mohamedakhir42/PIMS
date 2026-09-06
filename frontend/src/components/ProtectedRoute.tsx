import { useEffect, useState } from 'react';
import { authService } from '../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const user = await authService.getCurrentUser();

        if (!user) {
          setHasPermission(false);
          return;
        }

        // ADMIN peut accéder à toutes les pages
        if (user.role_name === 'ADMIN') {
          setHasPermission(true);
          return;
        }

        // Si aucune permission particulière n'est requise
        if (!requiredPermission) {
          setHasPermission(true);
          return;
        }

        // Vérification de la permission pour les autres rôles
        const hasRequiredPermission =
          await authService.hasPermission(requiredPermission);

        setHasPermission(hasRequiredPermission);

      } catch (error) {
        console.error('Permission check failed:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [requiredPermission]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}
      >
        <div className="text-center">
          <h3 className="text-danger">
            Access Denied
          </h3>

          <p className="text-muted">
            You don't have permission to access this page.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;