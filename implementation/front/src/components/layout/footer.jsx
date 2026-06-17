//import { Github as GitHub, Twitter, Linkedin, Mail } from 'lucide-react';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';
// Ou en version remplie : FaGithub, FaTwitter, FaLinkedin, FaEnvelope (depuis react-icons/fa)
// Si vous utilisez React Router, décommentez la ligne suivante :
import { Link } from 'react-router-dom';

const footerLinks = {
  product: [
    { label: 'Outils', href: '/tools' },
    { label: 'Catégories', href: '/categories' },
    { label: 'Modèles AI', href: '/models' },
    { label: 'Classement', href: '/ranking' },
  ],
  resources: [
    { label: 'Recherche avancée', href: '/search' },
    { label: 'Comparer outils', href: '/compare' },
    { label: 'Comparer modèles', href: '/compare/models' },
    { label: 'Proposer un outil', href: '/propose-tool' },
  ],
  company: [
    { label: 'À propos', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
    { label: 'Carrières', href: '/careers' },
  ],
  legal: [
    { label: 'Conditions', href: '/terms' },
    { label: 'Confidentialité', href: '/privacy' },
    { label: 'Cookies', href: '/cookies' },
  ],
};

const socialLinks = [
  { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: FiGithub, href: 'https://github.com', label: 'GitHub' },
  { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: FiMail, href: 'mailto:contact@aitools.com', label: 'Email' },
];

export function Footer() {
  // Version avec <a> (recharge la page)
  // Pour React Router, remplacez <a> par <Link to={href}> ci-dessous

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">AI</span>
              </div>
              <span className="text-xl font-bold text-foreground">Finder</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Découvrez et comparez les meilleurs outils AI pour booster votre productivité.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Produit</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Ressources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Entreprise</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Légal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Tools. Tous droits réservés.
            </p>
            <p className="text-sm text-muted-foreground">
              Fait avec passion pour la communauté AI
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}