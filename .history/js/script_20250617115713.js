
// On attend que toute la structure HTML soit chargée avant d'exécuter le code (fonction englobant tout le ficher JS)
window.addEventListener("DOMContentLoaded", function () {

    // ####################### CACHER LE HEADER AU SCROLL ########################

    let lastScrollTop = 0; // On stocke ici la position de scroll précédente

    const header = document.getElementById("le-header"); // On récupère le header dans le HTML

    // Si le header existe bien (par sécurité)
    if (header) {
        // On ajoute un écouteur d'événement : il va se déclencher à chaque fois qu'on scrolle
        window.addEventListener("scroll", function () {
            // On récupère la position actuelle du scroll
            const scrollTop = window.scrollY || document.documentElement.scrollTop;

            // Si on descend dans la page
            if (scrollTop > lastScrollTop) {
                header.classList.add("header-hidden"); // on cache le header en lui ajoutant une classe CSS spéciale
            } else {
                header.classList.remove("header-hidden"); // si on remonte, on l’affiche à nouveau
            }

            // On met à jour la position du scroll pour la prochaine comparaison
            lastScrollTop = Math.max(scrollTop, 0); // on s’assure qu’on ne descend pas en-dessous de 0
        });
    }

    // ####################### MODE PLEIN ÉCRAN (images) ########################

    // On récupère l’image principale affichée en grand
    const image = document.getElementById("grosse-image");

    // On récupère toutes les miniatures (vignettes en bas) dans un tableau
    const thumbnails = Array.from(document.querySelectorAll(".img-thumbnail"));

    // Variable pour savoir quelle image est actuellement affichée
    let currentIndex = 0;

    // Vérifie que l’image principale existe (utile si le script est utilisé sur plusieurs pages)
    if (image) {

        // Trouve l’index de l’image affichée au départ (par rapport à la liste des miniatures)
        currentIndex = thumbnails.findIndex(function (img) {
            return img.src === image.src;
        });

        // === Entrée en plein écran quand on clique sur l’image ===
        image.addEventListener("click", function () {
            // Si aucun élément n’est déjà en plein écran
            if (!document.fullscreenElement) {
                // Demande de passer l’image en plein écran (norme standard)
                if (image.requestFullscreen) {
                    image.requestFullscreen();
                }
                // Compatibilité avec les navigateurs WebKit (Safari)
                else if (image.webkitRequestFullscreen) {
                    image.webkitRequestFullscreen();
                }
                // Compatibilité avec les navigateurs Microsoft (IE, Edge legacy)
                else if (image.msRequestFullscreen) {
                    image.msRequestFullscreen();
                }
            }
        });

        // === Sortie du plein écran si on re-clique sur l’image ===
        image.addEventListener("click", function () {
            // Vérifie si l’image est actuellement en plein écran
            const isFullscreen =
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement;

            // Si c’est bien l’image affichée en plein écran
            if (isFullscreen === image) {
                // Quitte le plein écran (standard)
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                // Version WebKit
                else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
                // Version Microsoft
                else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        });

        // === Navigation clavier quand on est en plein écran ===

        document.addEventListener("keydown", function (e) {
            // Si on n’est pas en plein écran → on ne fait rien
            if (!document.fullscreenElement) return;

            // Flèche droite → image suivante
            if (e.key === "ArrowRight") {
                currentIndex = (currentIndex + 1) % thumbnails.length;
                image.src = thumbnails[currentIndex].src;
            }

            // Flèche gauche → image précédente
            else if (e.key === "ArrowLeft") {
                currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
                image.src = thumbnails[currentIndex].src;
            }
        });

        // === Quand on clique sur une miniature, on met à jour l’image principale ===
        thumbnails.forEach(function (thumb, index) {
            thumb.addEventListener("click", function () {
                image.src = thumb.src;        // on change la grande image
                currentIndex = index;         // on mémorise la position pour flèches/clavier
            });
        });

        // === GESTION DU SWIPE TACTILE pendant le plein écran ===

        // Position de départ du doigt (touchstart)
        let touchStartX = 0;

        // Position de fin du doigt (touchend)
        let touchEndX = 0;

        // Quand on touche l’écran au début du geste
        image.addEventListener("touchstart", function (e) {
            // On vérifie qu’on est bien en plein écran sur l’image
            if (document.fullscreenElement === image) {
                // On récupère la position horizontale du doigt
                touchStartX = e.changedTouches[0].screenX;
            }
        }, false);

        // Quand on lève le doigt (fin du geste)
        image.addEventListener("touchend", function (e) {
            if (document.fullscreenElement === image) {
                // On récupère la nouvelle position du doigt
                touchEndX = e.changedTouches[0].screenX;

                // On appelle la fonction qui va analyser le swipe
                handleSwipeGesture();
            }
        }, false);

        // Fonction qui détecte si le swipe est vers la gauche ou la droite
        function handleSwipeGesture() {
            const swipeMin = 50; // distance minimale pour valider un vrai geste de swipe

            // Si le doigt est allé vers la gauche (on a glissé vers la gauche)
            if (touchEndX < touchStartX - swipeMin) {
                // Image suivante
                currentIndex = (currentIndex + 1) % thumbnails.length;
                image.src = thumbnails[currentIndex].src;
            }

            // Si le doigt est allé vers la droite (on a glissé vers la droite)
            else if (touchEndX > touchStartX + swipeMin) {
                // Image précédente
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

    // On récupère le chemin complet du fichier en cours (ex : /visualiser-gaetan.html)
    let cheminComplet = window.location.pathname;

    // On coupe le chemin en morceaux avec "/" pour isoler le nom du fichier
    let morceauxChemin = cheminComplet.split("/");

    // Le dernier morceau du tableau est le nom du fichier HTML (page actuelle)
    let nomDeLaPage = morceauxChemin[morceauxChemin.length - 1];

    // On affiche dans la console pour vérifier (utile en debug)
    console.log("Page actuelle :", nomDeLaPage);

    // === Étape 2 : associer chaque page à ses modèles 3D ===

    // On crée un objet (un "dictionnaire") qui associe chaque fichier HTML à ses modèles
    let modelMap = {
        "visualiser-gaetan.html": [
            "images_et_modeles/Gaétan/Vaisseau.glb",
            "images_et_modeles/Gaétan/Vaisseau_parasite.glb"
        ],

        "visualiser-thomas.html": [
            "images_et_modeles/Thomas/Batiment1.glb",
            "images_et_modeles/Thomas/Batiment2.glb",
            // … (liste coupée pour l'exemple)
            "images_et_modeles/Thomas/Batiment15.glb"
        ]
    };

    // === Étape 3 : récupérer la liste de modèles correspondant à la page ===
    let models = modelMap[nomDeLaPage]; // récupère la liste à partir du nom de page

    // On sélectionne la balise <model-viewer> avec l’id "vue3D"
    let viewer = document.querySelector("#vue3D");

    // On initialise à 0 pour afficher le premier modèle de la liste
    let modelIndex = 0;

    // === Étape 4 : si tout est bien présent, on affiche et active les boutons ===
    if (viewer && models && models.length > 0) {

        // Fonction pour changer de modèle affiché
        function updateModel(index) {
            viewer.setAttribute("src", models[index]); // met à jour le modèle 3D affiché
        }

        // Bouton "Suivant"
        let boutonSuivant = document.getElementById("nextModel");
        if (boutonSuivant) {
            boutonSuivant.addEventListener("click", function () {
                modelIndex = (modelIndex + 1) % models.length; // passe au suivant (boucle)
                updateModel(modelIndex);
            });
        }

        // Bouton "Précédent"
        let boutonPrecedent = document.getElementById("prevModel");
        if (boutonPrecedent) {
            boutonPrecedent.addEventListener("click", function () {
                modelIndex = (modelIndex - 1 + models.length) % models.length; // va au précédent (boucle)
                updateModel(modelIndex);
            });
        }

        // Affiche le premier modèle dès le chargement
        updateModel(modelIndex);
    }

    // === Plein écran sur le viewer ===
    const fullscreenBtn = document.getElementById("fullscreen-btn");

    // Si on a bien le bouton et le viewer
    if (viewer && fullscreenBtn) {
        fullscreenBtn.addEventListener("click", () => {
            // Si on n'est pas déjà en plein écran → on demande le fullscreen
            if (!document.fullscreenElement) {
                viewer.requestFullscreen?.();         // norme standard
                viewer.webkitRequestFullscreen?.();   // Safari
                viewer.msRequestFullscreen?.();       // Microsoft
            } else {
                // Sinon on quitte le plein écran
                document.exitFullscreen?.();
                document.webkitExitFullscreen?.();
                document.msExitFullscreen?.();
            }
        });
    }

    // // === Gestes tactiles pour éviter conflits entre rotation et scroll ===
    // let startX = 0;
    // let startY = 0;

    // if (viewer) {
    //     // Quand on commence à toucher l’écran
    //     viewer.addEventListener("touchstart", function (e) {
    //         if (e.touches.length > 1) {
    //             // Si deux doigts → probablement zoom, on bloque le scroll
    //             document.body.style.overflow = "hidden";
    //         } else {
    //             // Sinon on enregistre la position de départ du doigt
    //             startX = e.touches[0].clientX;
    //             startY = e.touches[0].clientY;
    //         }
    //     }, { passive: false }); // passive:false pour pouvoir utiliser preventDefault

    //     // Quand le doigt bouge
    //     viewer.addEventListener("touchmove", function (e) {
    //         if (e.touches.length > 1) {
    //             e.preventDefault(); // empêche le zoom de scroller la page
    //             return;
    //         }

    //         // Calcul du mouvement
    //         const dx = e.touches[0].clientX - startX;
    //         const dy = e.touches[0].clientY - startY;

    //         // Si le mouvement est surtout horizontal
    //         if (Math.abs(dx) > Math.abs(dy)) {
    //             e.preventDefault(); // empêche le scroll vertical de la page
    //             document.body.style.overflow = "hidden";
    //         } else {
    //             document.body.style.overflow = ""; // on réactive le scroll normal
    //         }
    //     }, { passive: false });

    //     // Fin du geste
    //     viewer.addEventListener("touchend", function () {
    //         document.body.style.overflow = "";
    //     });
    //     viewer.addEventListener("touchcancel", function () {
    //         document.body.style.overflow = "";
    //     });
    // }

    // === Alerte spéciale pour Firefox Mobile ===
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox'); // détecte Firefox
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);  // détecte mobile

    // Si on est sur Firefox mobile → on affiche un message (toast Bootstrap)
    if (isFirefox && isMobile) {
        const toastEl = document.getElementById("toastFirefox"); // l’élément du message
        const toast = new bootstrap.Toast(toastEl);              // création du toast Bootstrap
        toast.show();                                             // affichage automatique
    }

})
