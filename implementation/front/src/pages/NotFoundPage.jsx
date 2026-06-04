import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          {/* Animation / illustration simple */}
          <div className="relative mb-8">
            <div className="text-9xl font-bold text-muted-foreground/20">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-12 w-12 text-primary" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Page non trouvée
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Button>
            </Link>
            <Link to="/tools">
              <Button variant="outline" className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                Explorer les outils
              </Button>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </button>
          </div>

          {/* Suggestions */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Vous pourriez aussi consulter nos{' '}
              <Link to="/categories" className="text-primary hover:underline">
                catégories populaires
              </Link>{' '}
              ou{' '}
              <Link to="/ranking" className="text-primary hover:underline">
                le classement des outils
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}   