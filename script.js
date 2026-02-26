// récupèrer les votes déjà sauvegardés dans le navigateur
let votes = JSON.parse(localStorage.getItem("votes")) || {};

// garder en mémoire l'audio en cours de lecture
let audioEnCours = null;

// cliquer sur "Rechercher"
function searchMusic() {
  let query = document.getElementById("query").value;
  if (!query) return;

  let url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`;

  fetch(url)
    .then(response => response.json())
    .then(data => afficherResultats(data.results))
    .catch(error => console.log("Erreur :", error));
}

// afficher les musiques trouvées
function afficherResultats(musiques) {
  let conteneur = document.getElementById("resultats");
  conteneur.innerHTML = "";

  if (musiques.length === 0) {
    conteneur.innerHTML = "<p>Aucune musique trouvée.</p>";
    return;
  }

  musiques.forEach(musique => {
    let id = musique.trackId;
    let nbVotes = votes[id] ? votes[id].count : 0;
    // previewUrl est le lien vers l'extrait 30s fourni par iTunes
    let preview = musique.previewUrl;

    let carte = document.createElement("div");
    carte.className = "carte-musique";
    carte.innerHTML = `
      <img src="${musique.artworkUrl100}" alt="pochette" />
      <div class="info-musique">
        <strong>${musique.trackName}</strong>
        <span>${musique.artistName}</span>
      </div>
      <div class="vote-section">
        <span id="count-${id}">${nbVotes} vote${nbVotes > 1 ? "s" : ""}</span>
        ${preview ? `<button class="btn-play" id="play-${id}" onclick="jouerMusique('${preview}', ${id})">▶ Ecouter</button>` : ""}
        <button class="btn-vote" onclick="voter(${id}, '${musique.trackName}', '${musique.artistName}')"> Voter</button>
      </div>
    `;
    conteneur.appendChild(carte);
  });
}

// jouer ou met en pause l'extrait
function jouerMusique(url, id) {
  let bouton = document.getElementById("play-" + id);

  // Si une musique est déjà en cours, on l'arrête
  if (audioEnCours) {
    audioEnCours.pause();
    // remettre tous les boutons à ▶ Ecouter
    document.querySelectorAll(".btn-play").forEach(b => b.textContent = "▶ Ecouter");
  }

  // Si on reclique sur le même bouton on arrête 
  if (audioEnCours && audioEnCours.src === url) {
    audioEnCours = null;
    return;
  }

  // Sinon on lance la nouvelle musique
  audioEnCours = new Audio(url);
  audioEnCours.play();
  bouton.textContent = "⏸ Pause";

  // quand extrait est terminé on remet le bouton à play
  audioEnCours.onended = () => {
    bouton.textContent = "▶ Ecouter";
    audioEnCours = null;
  };
}

// clique sur Voter
function voter(id, titre, artiste) {
  if (!votes[id]) {
    votes[id] = { titre: titre, artiste: artiste, count: 0 };
  }

  votes[id].count += 1;
  localStorage.setItem("votes", JSON.stringify(votes));

  let nb = votes[id].count;
  document.getElementById("count-" + id).textContent = nb + " vote" + (nb > 1 ? "s" : "");
}

// Lancer la recherche avec la touche Entrée
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("query").addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchMusic();
  });
});