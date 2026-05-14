import '../../styles/test.css'


export const Test = () => {
    return (
        <>


                { /* ═══ NAVIGATION ═══════════════════════════════════ */}
                <nav>
                    {/*  Logo --> */}
                    <a href="#" className="nav-logo">
                        <div className="logo-icon">⚡</div>
                        <span>AI<em>Tools</em></span>
                    </a>

                    { /* Center categories */}
                    <div className="nav-cats">
                        <a href="#" className="active">Accueil</a>
                        <a href="#categories">Catégories</a>
                        <a href="#trending">Tendances</a>
                        <a href="#ranking">Classement</a>
                        <a href="#">Blog</a>
                    </div>

                    { /* Auth zone — guest */}
                    <div className="nav-auth nav-auth-guest" id="guestButtons">
                        <button className="btn btn-ghost" onclick="simulateLogin()">Se connecter</button>
                        <button className="btn btn-primary" onclick="simulateLogin()">S'inscrire</button>
                    </div>

                    { /* Auth zone — logged in (hidden by default) */}
                    <div className="nav-user" id="userButtons">
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Bonjour, <strong style={{ color: 'var(--text)' }}>Alex</strong></span>
                        <div className="user-avatar" title="Mon profil">A</div>
                        <button className="btn btn-logout" onclick="simulateLogout()">Déconnexion</button>
                    </div>
                </nav>

                { /* ═══ HERO ═══════════════════════════════════ */}
                <section className="hero">
                    <div className="hero-badge">
                        <span className="dot"></span>
                        +240 outils IA répertoriés
                    </div>

                    <h1>
                        Trouvez <span className="hi">l'outil IA</span><br />
                        qu'il vous <span className="hl2">faut vraiment</span>
                    </h1>

                    <p>
                        Explorez, comparez et découvrez les meilleurs outils d'intelligence artificielle
                        adaptés à vos besoins — image, texte, code, audio et bien plus.
                    </p>

                    { /* Search */}
                    <div className="search-wrap">
                        <span className="search-icon">🔍</span>
                        <input type="text" id="searchInput" placeholder="Ex : générer une image, résumer un texte…" />
                        <button className="search-btn">Rechercher</button>
                    </div>

                    { /* Quick filter tags */}
                    <div className="quick-tags">
                        <span className="tag active" onclick="toggleTag(this)">🖼️ Image</span>
                        <span className="tag" onclick="toggleTag(this)">✍️ Texte & Rédaction</span>
                        <span className="tag" onclick="toggleTag(this)">💻 Code</span>
                        <span className="tag" onclick="toggleTag(this)">🎵 Audio</span>
                        <span className="tag" onclick="toggleTag(this)">🎬 Vidéo</span>
                        <span className="tag" onclick="toggleTag(this)">📊 Données</span>
                        <span className="tag" onclick="toggleTag(this)">🤖 Chatbots</span>
                        <span className="tag" onclick="toggleTag(this)">🔍 Recherche</span>
                    </div>
                </section>

                { /* ═══ STATS STRIP ════════════════════════════════ */}
                <div className="stats-strip">
                    <div className="stat-card">
                        <strong>240+</strong><span>Outils répertoriés</span>
                    </div>
                    <div className="stat-card">
                        <strong>18</strong><span>Catégories</span>
                    </div>
                    <div className="stat-card">
                        <strong>12k</strong><span>Utilisateurs actifs</span>
                    </div>
                    <div className="stat-card">
                        <strong>4.8★</strong><span>Note moyenne</span>
                    </div>
                </div>

                { /* ═══ CATEGORIES ════════════════════════════════ */}
                <section className="section" id="categories">
                    <div className="section-header">
                        <h2>Explorer les catégories</h2>
                        <a href="#" className="see-all">Voir tout →</a>
                    </div>

                    <div className="cat-grid">
                        <a href="#" className="cat-card">
                            <div className="cat-icon" style={{ background: 'rgba(255,107,107,0.15)' }}>🖼️</div>
                            <h3>Génération d'images</h3>
                            <p>48 outils</p>
                        </a>
                        <a href="#" className="cat-card">
                            <div className="cat-icon" style={{ background: 'rgba(108,99,255,0.15)' }}>✍️</div>
                            <h3>Texte & Rédaction</h3>
                            <p>61 outils</p>
                        </a>
                        <a href="#" className="cat-card">
                            <div className="cat-icon" style={{ background: 'rgba(0,217,166,0.15)' }}>💻</div>
                            <h3>Code & Dev</h3>
                            <p>34 outils</p>
                        </a>
                        <a href="#" className="cat-card">
                            <div className="cat-icon" style={{ background: 'rgba(255,196,0,0.15)' }}>🎵</div>
                            <h3>Audio & Musique</h3>
                            <p>22 outils</p>
                        </a>
                        <a href="#" className="cat-card">
                            <div className="cat-icon" style={{ background: 'rgba(255,107,107,0.12)' }}>🎬</div>
                            <h3>Vidéo</h3>
                            <p>19 outils</p>
                        </a>
                        <a href="#" className="cat-card">
                            <div className="cat-icon" style={{ background: 'rgba(108,99,255,0.12)' }}>📊</div>
                            <h3>Analyse de données</h3>
                            <p>27 outils</p>
                        </a>
                    </div>
                </section>

                { /* ═══ TRENDING TOOLS ════════════════════════════ */}
                <section className="section" id="trending">
                    <div className="section-header">
                        <h2>🔥 Outils tendances</h2>
                        <a href="#" className="see-all">Voir tout →</a>
                    </div>

                    <div className="tools-grid">

                        {/* <!-- Tool 1 --> */}
                        <div className="tool-card" style={{ '--card-color': '#6c63ff' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#6c63ff,#a78bfa)' }}></div>
                            <div className="tool-header">
                                <div className="tool-logo" style={{ background: 'rgba(108,99,255,0.15)' }}>🎨</div>
                                <div className="tool-info">
                                    <h3>Midjourney</h3>
                                    <span className="tool-cat">Génération d'images</span>
                                </div>
                            </div>
                            <p className="tool-desc">Génère des images photoréalistes et artistiques à partir de descriptions textuelles en quelques secondes.</p>
                            <div className="tool-footer">
                                <div className="tool-rating">
                                    <span className="stars">★★★★★</span>
                                    <span>4.9 (2.1k avis)</span>
                                </div>
                                <span className="badge-paid">Payant</span>
                            </div>
                        </div>

                        {/* <!-- Tool 2 --> */}
                        <div className="tool-card">
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#00d9a6,#06b6d4)' }}></div>
                            <div className="tool-header">
                                <div className="tool-logo" style={{ background: 'rgba(0,217,166,0.15)' }}>🤖</div>
                                <div className="tool-info">
                                    <h3>ChatGPT</h3>
                                    <span className="tool-cat">Chatbot & Texte</span>
                                </div>
                            </div>
                            <p className="tool-desc">Assistant conversationnel puissant pour rédiger, résumer, coder et répondre à toutes vos questions.</p>
                            <div className="tool-footer">
                                <div className="tool-rating">
                                    <span className="stars">★★★★★</span>
                                    <span>4.8 (5.6k avis)</span>
                                </div>
                                <span className="badge-freemium">Freemium</span>
                            </div>
                        </div>

                        {/* <!-- Tool 3 --> */}
                        <div className="tool-card">
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#f59e0b,#ef4444)' }}></div>
                            <div className="tool-header">
                                <div className="tool-logo" style={{ background: 'rgba(245,158,11,0.15)' }}>🎵</div>
                                <div className="tool-info">
                                    <h3>Suno AI</h3>
                                    <span className="tool-cat">Audio & Musique</span>
                                </div>
                            </div>
                            <p className="tool-desc">Crée des chansons complètes avec paroles et instrumentaux à partir d'une simple description.</p>
                            <div className="tool-footer">
                                <div className="tool-rating">
                                    <span className="stars">★★★★☆</span>
                                    <span>4.6 (980 avis)</span>
                                </div>
                                <span className="badge-freemium">Freemium</span>
                            </div>
                        </div>

                        {/* <!-- Tool 4 --> */}
                        <div className="tool-card">
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#8b5cf6,#ec4899)' }}></div>
                            <div className="tool-header">
                                <div className="tool-logo" style={{ background: 'rgba(139,92,246,0.15)' }}>💻</div>
                                <div className="tool-info">
                                    <h3>GitHub Copilot</h3>
                                    <span className="tool-cat">Code & Dev</span>
                                </div>
                            </div>
                            <p className="tool-desc">Assistant de codage IA intégré directement dans votre éditeur pour accélérer le développement.</p>
                            <div className="tool-footer">
                                <div className="tool-rating">
                                    <span className="stars">★★★★★</span>
                                    <span>4.7 (3.4k avis)</span>
                                </div>
                                <span className="badge-paid">Payant</span>
                            </div>
                        </div>

                        {/* <!-- Tool 5 --> */}
                        <div className="tool-card">
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#06b6d4,#3b82f6)' }}></div>
                            <div className="tool-header">
                                <div className="tool-logo" style={{ background: 'rgba(6,182,212,0.15)' }}>🎬</div>
                                <div className="tool-info">
                                    <h3>RunwayML</h3>
                                    <span className="tool-cat">Vidéo</span>
                                </div>
                            </div>
                            <p className="tool-desc">Génère et édite des vidéos professionnelles grâce à l'IA en quelques clics seulement.</p>
                            <div className="tool-footer">
                                <div className="tool-rating">
                                    <span className="stars">★★★★☆</span>
                                    <span>4.5 (1.2k avis)</span>
                                </div>
                                <span className="badge-freemium">Freemium</span>
                            </div>
                        </div>

                        {/* <!-- Tool 6 --> */}
                        <div className="tool-card">
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#10b981,#84cc16)' }}></div>
                            <div className="tool-header">
                                <div className="tool-logo" style={{ background: 'rgba(16,185,129,0.15)' }}>📝</div>
                                <div className="tool-info">
                                    <h3>Jasper AI</h3>
                                    <span className="tool-cat">Texte & Rédaction</span>
                                </div>
                            </div>
                            <p className="tool-desc">Plateforme de rédaction IA pour le marketing, les blogs et le contenu professionnel longue durée.</p>
                            <div className="tool-footer">
                                <div className="tool-rating">
                                    <span className="stars">★★★★☆</span>
                                    <span>4.4 (876 avis)</span>
                                </div>
                                <span className="badge-free">Gratuit</span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* ═══ RANKING ══════════════════════════════════ */}
                <section className="section" id="ranking">
                    <div className="section-header">
                        <h2>🏆 Classement des outils</h2>
                        <a href="#" className="see-all">Voir tout →</a>
                    </div>

                    <div className="ranking-list">
                        <div className="rank-item">
                            <span className="rank-num gold">#1</span>
                            <div className="rank-logo" style={{ background: 'rgba(0,217,166,0.15)' }}>🤖</div>
                            <div className="rank-info"><h4>ChatGPT</h4><span>Chatbot & Texte • 5.6k avis</span></div>
                            <span className="rank-score">9.8</span>
                        </div>
                        <div className="rank-item">
                            <span className="rank-num silver">#2</span>
                            <div className="rank-logo" style={{ background: 'rgba(108,99,255,0.15)' }}>🎨</div>
                            <div className="rank-info"><h4>Midjourney</h4><span>Génération d'images • 2.1k avis</span></div>
                            <span className="rank-score">9.5</span>
                        </div>
                        <div className="rank-item">
                            <span className="rank-num bronze">#3</span>
                            <div className="rank-logo" style={{ background: 'rgba(139,92,246,0.15)' }}>💻</div>
                            <div className="rank-info"><h4>GitHub Copilot</h4><span>Code & Dev • 3.4k avis</span></div>
                            <span className="rank-score">9.3</span>
                        </div>
                        <div className="rank-item">
                            <span className="rank-num other">#4</span>
                            <div className="rank-logo" style={{ background: 'rgba(245,158,11,0.15)' }}>🎵</div>
                            <div className="rank-info"><h4>Suno AI</h4><span>Audio & Musique • 980 avis</span></div>
                            <span className="rank-score">9.1</span>
                        </div>
                        <div className="rank-item">
                            <span className="rank-num other">#5</span>
                            <div className="rank-logo" style={{ background: 'rgba(6,182,212,0.15)' }}>🎬</div>
                            <div className="rank-info"><h4>RunwayML</h4><span>Vidéo • 1.2k avis</span></div>
                            <span className="rank-score">8.9</span>
                        </div>
                    </div>
                </section>

                {/* ═══ CTA ════════════════════════════════════════ */}
                <div className="cta-section">
                    <h2>Rejoignez la communauté</h2>
                    <p>Créez un compte gratuit pour ajouter des outils, commenter, noter et gérer vos favoris.</p>
                    <div className="cta-btns">
                        <button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }} >
                            Créer un compte gratuit
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '12px 28px', fontSize: '0.95rem' }} >
                            Se connecter
                        </button>
                    </div>
                </div>

                {/* ═══ FOOTER ════════════════════════════════════ */}
                <footer>
                    <span className="foot-logo">AI<em>Tools</em> Directory</span>
                    <p>© 2025 AI Tools Directory. Tous droits réservés.</p>
                    <div className="foot-links">
                        <a href="#">À propos</a>
                        <a href="#">Contact</a>
                        <a href="#">CGU</a>
                        <a href="#">Confidentialité</a>
                    </div>
                </footer>

                {/* ═══ SCRIPTS ═══════════════════════════════════ */}
                {/* <script>
    // Toggle auth state simulation
    function simulateLogin() {
      document.getElementById('guestButtons').classList.add('hidden');
      document.getElementById('userButtons').classList.add('visible');
    }
    function simulateLogout() {
      document.getElementById('guestButtons').classList.remove('hidden');
      document.getElementById('userButtons').classList.remove('visible');
    }

    // Toggle filter tags
    function toggleTag(el) {
      el.classList.toggle('active');
    }

    // Smooth search on Enter
    document.getElementById('searchInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = e.target.value.trim();
        if (q) alert(`Recherche : "${q}" — (Fonctionnalité à connecter au backend)`);
      }
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id], div[id]');
    const navLinks = document.querySelectorAll('.nav-cats a');
    window.addEventListener('scroll', () => {
      let cur = '';
      sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 100) cur = s.id;
      });
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + cur || (cur === '' && a.getAttribute('href') === '#'));
      });
    });
  </script> */}

        </>
    )
}
