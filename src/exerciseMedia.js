// Imagens locais ilustrativas e vídeos individuais selecionados. Links só quando conferidos.
const items={
  "Puxada alta ou barra fixa": {
    "image": "/exercise-images/puxada-alta.svg",
    "videoId": null,
    "group": "Costas",
    "equipment": "polia"
  },
  "Remada apoiada": {
    "image": "/exercise-images/remada-apoiada.svg",
    "videoId": null,
    "group": "Costas",
    "equipment": "remada"
  },
  "Supino inclinado": {
    "image": "/exercise-images/supino-inclinado.svg",
    "videoId": "d5XTN6a9MxQ",
    "group": "Peito",
    "equipment": "banco"
  },
  "Elevação lateral": {
    "image": "/exercise-images/elevacao-lateral.svg",
    "videoId": null,
    "group": "Ombros",
    "equipment": "halter"
  },
  "Encolhimento com halteres": {
    "image": "/exercise-images/encolhimento-halteres.svg",
    "videoId": null,
    "group": "Trapézio",
    "equipment": "halter"
  },
  "Rosca direta": {
    "image": "/exercise-images/rosca-direta.svg",
    "videoId": null,
    "group": "Bíceps",
    "equipment": "barra"
  },
  "Tríceps na polia": {
    "image": "/exercise-images/triceps-polia.svg",
    "videoId": "5wcvT0PH1_g",
    "group": "Tríceps",
    "equipment": "polia"
  },
  "Agachamento ou hack": {
    "image": "/exercise-images/agachamento.svg",
    "videoId": null,
    "group": "Pernas",
    "equipment": "barra"
  },
  "Leg press": {
    "image": "/exercise-images/leg-press.svg",
    "videoId": "waAxlYvtCcI",
    "group": "Pernas",
    "equipment": "maquina"
  },
  "Terra romeno": {
    "image": "/exercise-images/terra-romeno.svg",
    "videoId": null,
    "group": "Posterior",
    "equipment": "barra"
  },
  "Mesa flexora": {
    "image": "/exercise-images/mesa-flexora.svg",
    "videoId": null,
    "group": "Posterior",
    "equipment": "maquina"
  },
  "Panturrilha": {
    "image": "/exercise-images/panturrilha.svg",
    "videoId": null,
    "group": "Panturrilhas",
    "equipment": "halter"
  },
  "Desenvolvimento com halteres": {
    "image": "/exercise-images/desenvolvimento-halteres.svg",
    "videoId": "kf4KgsDDASk",
    "group": "Ombros",
    "equipment": "halter"
  },
  "Crucifixo invertido": {
    "image": "/exercise-images/crucifixo-invertido.svg",
    "videoId": null,
    "group": "Ombro posterior",
    "equipment": "halter"
  },
  "Abdômen": {
    "image": "/exercise-images/abdomen.svg",
    "videoId": null,
    "group": "Core",
    "equipment": "solo"
  },
  "Puxada neutra": {
    "image": "/exercise-images/puxada-neutra.svg",
    "videoId": null,
    "group": "Costas",
    "equipment": "polia"
  },
  "Remada unilateral": {
    "image": "/exercise-images/remada-unilateral.svg",
    "videoId": null,
    "group": "Costas",
    "equipment": "halter"
  },
  "Supino reto": {
    "image": "/exercise-images/supino-reto.svg",
    "videoId": null,
    "group": "Peito",
    "equipment": "banco"
  },
  "Encolhimento com barra": {
    "image": "/exercise-images/encolhimento-barra.svg",
    "videoId": null,
    "group": "Trapézio",
    "equipment": "barra"
  },
  "Rosca martelo": {
    "image": "/exercise-images/rosca-martelo.svg",
    "videoId": null,
    "group": "Bíceps",
    "equipment": "halter"
  },
  "Tríceps francês": {
    "image": "/exercise-images/triceps-frances.svg",
    "videoId": null,
    "group": "Tríceps",
    "equipment": "halter"
  },
  "Cadeira extensora": {
    "image": "/exercise-images/cadeira-extensora.svg",
    "videoId": "T7Q56tpeonA",
    "group": "Pernas",
    "equipment": "maquina"
  }
};
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
export function getExerciseMedia(name){const key=Object.keys(items).find(k=>normalize(k)===normalize(name));return key?items[key]:null;}
