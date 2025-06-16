
// On attend que toute la structure HTML soit chargée avant d'exécuter le code (fonction englobant tout le ficher JS)
window.addEventListener("DOMContentLoaded", function () {

    // ####################### CACHER LE HEADER AU SCROLL ########################

    let lastScrollTop = 0; // Position de scroll précédente
    const header = document.getElementById("le-header"); // Sélection du header

    if (header) {
        window.addEventListener("scroll", function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;

            if (scrollTop > lastScrollTop) {
                // si scrolltop est supérieur à 0, on dit
                header.classList.add("header-hidden"); /* (on applique la classe qui fait remonter le header de -120px) */
            } else {
                // Si on monte on l’enlève
                header.classList.remove("header-hidden");
            }

            // Mise à jour de la position de scroll précédente
            lastScrollTop = Math.max(scrollTop, 0);
        });
    }

    // ####################### MODE PLEIN ÉCRAN (images) ########################

    // Sélection des éléments utiles
    const image = document.getElementById("grosse-image");
    const thumbnails = Array.from(document.querySelectorAll(".img-thumbnail"));

    let currentIndex = 0; // Index de l'image actuellement affichée

    // Vérifie que l'image existe (utile si la page ne l’a pas)
    if (image) {
        // Trouve l'index de l'image affichée au départ
        currentIndex = thumbnails.findIndex(img => img.src === image.src);

        // === Entrée en plein écran sur clic ou toucher ===
        image.addEventListener("click", function () {
            if (!document.fullscreenElement) {
                if (image.requestFullscreen) {
                    image.requestFullscreen();
                } else if (image.webkitRequestFullscreen) {
                    image.webkitRequestFullscreen();
                } else if (image.msRequestFullscreen) {
                    image.msRequestFullscreen();
                }
            }
        });

        // === Sortie du plein écran quand on clique sur l'image ===
        image.addEventListener("click", function () {
            const isFullscreen =
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement;

            if (isFullscreen === image) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        });

        // === Navigation clavier : flèches gauche/droite pendant le plein écran ===
        document.addEventListener("keydown", function (e) {
            if (!document.fullscreenElement) return;

            if (e.key === "ArrowRight") {
                currentIndex = (currentIndex + 1) % thumbnails.length;
                image.src = thumbnails[currentIndex].src;
            } else if (e.key === "ArrowLeft") {
                currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
                image.src = thumbnails[currentIndex].src;
            }
        });

        // === Clic sur une miniature : met à jour l'image principale ===
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener("click", () => {
                image.src = thumb.src;
                currentIndex = index;
            });
        });

        // === GESTION DU SWIPE TACTILE ===

        let touchStartX = 0;
        let touchEndX = 0;

        // Enregistre la position de départ du toucher
        image.addEventListener("touchstart", function (e) {
            if (document.fullscreenElement === image) {
                touchStartX = e.changedTouches[0].screenX;
            }
        }, false);

        // Enregistre la position de fin du toucher et traite le geste
        image.addEventListener("touchend", function (e) {
            if (document.fullscreenElement === image) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipeGesture(); // Appelle la fonction juste en dessous
            }
        }, false);

        // Fonction pour détecter si on a fait un "swipe gauche" ou "swipe droite"
        function handleSwipeGesture() {
            const swipeMin = 50; // distance minimale en pixels pour valider un swipe

            if (touchEndX < touchStartX - swipeMin) {
                // Swipe vers la gauche → image suivante
                currentIndex = (currentIndex + 1) % thumbnails.length;
                image.src = thumbnails[currentIndex].src;
            } else if (touchEndX > touchStartX + swipeMin) {
                // Swipe vers la droite → image précédente
                currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
                image.src = thumbnails[currentIndex].src;
            }
        }
    }

    // ####################### OPTIONS D’ACCESSIBILITÉ (contraste & texte) ########################

    // === ACCESSIBILITÉ : CONTRASTE & TAILLE DE TEXTE ===

    // 1. On regarde si l'utilisateur a déjà activé ces options auparavant.
    // On lit les données enregistrées dans le navigateur local (localStorage).
    const contrast = localStorage.getItem('highContrast') === 'true'; // Si c'est 'true', on l'interprète comme vrai
    const largeText = localStorage.getItem('fontLarge') === 'true';   // Idem pour la taille du texte

    // 2. Si l'utilisateur avait activé ces options, on les applique au chargement de la page.
    if (contrast) {
        document.body.classList.add('high-contrast'); // On applique la classe CSS qui augmente le contraste
    }
    if (largeText) {
        document.body.classList.add('font-large');    // On applique la classe CSS pour du texte plus gros
    }

    // 3. On récupère les boutons "interrupteurs" dans le HTML (les cases à cocher)
    const contrastToggle = document.getElementById('contrastToggle');
    const fontSizeToggle = document.getElementById('fontSizeToggle');

    // 4. Si les boutons existent sur la page, on les synchronise avec l'état stocké
    if (contrastToggle) {
        contrastToggle.checked = contrast; // on coche ou décoche selon l'état précédent
    }
    if (fontSizeToggle) {
        fontSizeToggle.checked = largeText; // idem pour la taille du texte
    }

    // 5. Si l'utilisateur clique sur le bouton contraste :
    if (contrastToggle) {
        contrastToggle.addEventListener('change', function () {
            // Si activé, on ajoute la classe high-contrast (sinon on l'enlève)
            document.body.classList.toggle('high-contrast', this.checked);

            // Et on enregistre cette nouvelle préférence dans le navigateur
            localStorage.setItem('highContrast', this.checked);
        });
    }

    // 6. Si l'utilisateur clique sur le bouton taille de texte :
    if (fontSizeToggle) {
        fontSizeToggle.addEventListener('change', function () {
            // On ajoute ou enlève la classe qui rend le texte plus grand
            document.body.classList.toggle('font-large', this.checked);

            // Et on enregistre cette préférence aussi
            localStorage.setItem('fontLarge', this.checked);
        });
    }


    // #######################  MODEL VIEWER ######################

    // === Étape 1 : récupérer le nom du fichier HTML affiché ===

    // On récupère le chemin complet de l'URL (par exemple "/visualiser-gaétan.html")
    let cheminComplet = window.location.pathname;

    // On coupe ce chemin en morceaux à chaque "/" (ex: ["", "visualiser-gaétan.html"])
    let morceauxChemin = cheminComplet.split("/");

    // On prend le dernier morceau du tableau, c’est le nom du fichier
    let nomDeLaPage = morceauxChemin[morceauxChemin.length - 1];

    // On peut afficher pour vérifier
    console.log("Page actuelle :", nomDeLaPage);

    // === Étape 2 : associer chaque page à ses modèles 3D ===

    let modelMap = {
        "visualiser-allan.html": [
            "images_et_modeles/Allan/Batiment1.glb",
            "images_et_modeles/Allan/Batiment2.glb"
        ],

        "visualiser-gaetan.html": [
            "images_et_modeles/Gaétan/Vaisseau.glb",
            "images_et_modeles/Gaétan/Vaisseau_parasite.glb"
        ],

        "visualiser-thomas.html": [
            "images_et_modeles/Thomas/Batiment1.glb",
            "images_et_modeles/Thomas/Batiment2.glb",
            "images_et_modeles/Thomas/Batiment3.glb",
            "images_et_modeles/Thomas/Batiment4.glb",
            "images_et_modeles/Thomas/Batiment5.glb",
            "images_et_modeles/Thomas/Batiment6.glb",
            "images_et_modeles/Thomas/Batiment7.glb",
            "images_et_modeles/Thomas/Batiment7_parasite.glb",
            "images_et_modeles/Thomas/Batiment8.glb",
            "images_et_modeles/Thomas/Batiment9.glb",
            "images_et_modeles/Thomas/Batiment10.glb",
            "images_et_modeles/Thomas/Batiment11.glb",
            "images_et_modeles/Thomas/Batiment12.glb",
            "images_et_modeles/Thomas/Batiment13.glb",
            "images_et_modeles/Thomas/Batiment14.glb",
            "images_et_modeles/Thomas/Batiment15.glb"
        ],

        "visualiser-justine.html": [
            "images_et_modeles/Justine/Flyer1.glb"
        ],
        "visualiser-maëlle.html": [
            "images_et_modeles/Maëlle/Illustration1.glb"
        ],
        "visualiser-antoine.html": [
            "images_et_modeles/Antoine/ObjetSonore.glb"
        ]
    };

    // === Étape 3 : récupérer les modèles liés à la page actuelle ===

    // On utilise le nom de la page pour aller chercher la bonne liste
    let models = modelMap[nomDeLaPage];

    // On récupère le model-viewer
    let viewer = document.querySelector("#vue3D");

    // On démarre toujours avec le premier modèle (index 0)
    let modelIndex = 0;

    // === Étape 4 : si tout est bien en place, on active les boutons et l'affichage ===
    if (viewer && models && models.length > 0) {

        // Fonction pour afficher le bon modèle dans le viewer
        function updateModel(index) {

            viewer.setAttribute("src", models[index]);
        }

        // Quand on clique sur le bouton "suivant"
        let boutonSuivant = document.getElementById("nextModel");
        if (boutonSuivant) {
            boutonSuivant.addEventListener("click", function () {
                modelIndex = (modelIndex + 1) % models.length;
                updateModel(modelIndex);
            });
        }

        // Quand on clique sur le bouton "précédent"
        let boutonPrecedent = document.getElementById("prevModel");
        if (boutonPrecedent) {
            boutonPrecedent.addEventListener("click", function () {
                modelIndex = (modelIndex - 1 + models.length) % models.length;
                updateModel(modelIndex);
            });
        }

        // On affiche le premier modèle tout de suite
        updateModel(modelIndex);
    }

    const fullscreenBtn = document.getElementById("fullscreen-btn");

    if (viewer && fullscreenBtn) {
        fullscreenBtn.addEventListener("click", () => {
            if (!document.fullscreenElement) {
                viewer.requestFullscreen?.();
                viewer.webkitRequestFullscreen?.();
                viewer.msRequestFullscreen?.();
            } else {
                document.exitFullscreen?.();
                document.webkitExitFullscreen?.();
                document.msExitFullscreen?.();
            }
        });
    }

    let startX = 0;
    let startY = 0;

    if (viewer) {
        viewer.addEventListener("touchstart", function (e) {
            if (e.touches.length > 1) {
                // Si on pince à 2 doigts → probablement zoom
                document.body.style.overflow = "hidden";
            } else {
                // Enregistre la position de départ
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
        }, { passive: false });

        viewer.addEventListener("touchmove", function (e) {
            if (e.touches.length > 1) {
                // Toujours en mode zoom
                e.preventDefault();
                return;
            }

            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;

            if (Math.abs(dx) > Math.abs(dy)) {
                // Si le geste est plutôt horizontal → rotation du modèle
                e.preventDefault(); // bloque le scroll vertical
                document.body.style.overflow = "hidden";
            } else {
                // Geste vertical → on laisse scroller
                document.body.style.overflow = "";
            }
        }, { passive: false });

        viewer.addEventListener("touchend", function () {
            document.body.style.overflow = "";
        });
        viewer.addEventListener("touchcancel", function () {
            document.body.style.overflow = "";
        });
    }
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

    if (isFirefox && isMobile) {
        const toastEl = document.getElementById("toastFirefox");
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }

})
